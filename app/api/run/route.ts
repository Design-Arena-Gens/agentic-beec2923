import { NextResponse } from 'next/server';
import { AutomationAgent } from '@/lib/automationAgent';
import { getJob } from '@/lib/jobStore';

export const dynamic = 'force-dynamic';

const agent = new AutomationAgent();

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      regionCode?: string;
      topicCount?: number;
      voiceModel?: string;
      imageModel?: string;
    };

    const regionCode = body.regionCode?.slice(0, 2).toUpperCase() ?? 'US';
    const topicCount = Math.min(Math.max(body.topicCount ?? 3, 1), 5);
    const voiceModel = body.voiceModel ?? 'gpt-4o-mini-tts';
    const imageModel = body.imageModel ?? 'gpt-image-1';

    const { jobId } = await agent.launch({
      regionCode,
      topicCount,
      voiceModel,
      imageModel
    });

    const job = getJob(jobId);
    return NextResponse.json(job, { status: 202 });
  } catch (error) {
    const jobId = (error as { jobId?: string }).jobId;
    const job = jobId ? getJob(jobId) : null;
    return NextResponse.json(
      job ?? {
        jobId,
        status: 'failed',
        logs: [],
        error:
          error instanceof Error ? error.message : 'Automation pipeline failed.'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');
  if (!jobId) {
    return NextResponse.json(
      {
        status: 'error',
        error: 'jobId param required',
        logs: []
      },
      { status: 400 }
    );
  }
  const job = getJob(jobId);
  if (!job) {
    return NextResponse.json(
      {
        status: 'error',
        error: `job ${jobId} not found`,
        logs: []
      },
      { status: 404 }
    );
  }
  return NextResponse.json(job);
}
