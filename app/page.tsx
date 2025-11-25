'use client';

import {
  FormEvent,
  useMemo,
  useState,
  useTransition,
  type CSSProperties
} from 'react';

type JobResponse = {
  jobId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  videoUrl?: string;
  logs: string[];
  error?: string;
};

const defaultRegion = 'US';
const defaultCount = 3;

export default function HomePage() {
  const [regionCode, setRegionCode] = useState(defaultRegion);
  const [topicCount, setTopicCount] = useState(defaultCount);
  const [voiceModel, setVoiceModel] = useState('gpt-4o-mini-tts');
  const [imageModel, setImageModel] = useState('gpt-image-1');
  const [job, setJob] = useState<JobResponse | null>(null);
  const [isPending, startTransition] = useTransition();

  const submitReady = useMemo(() => {
    return Boolean(regionCode) && topicCount > 0 && topicCount <= 5;
  }, [regionCode, topicCount]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!submitReady) return;

    const payload = {
      regionCode: regionCode.toUpperCase(),
      topicCount,
      voiceModel,
      imageModel
    };

    startTransition(async () => {
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json: JobResponse = await res.json();
      setJob(json);
      if (!res.ok) return;

      if (json.jobId) {
        pollJob(json.jobId);
      }
    });
  };

  const pollJob = async (jobId: string) => {
    let attempts = 0;
    while (attempts < 150) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const res = await fetch(`/api/run?jobId=${jobId}`);
      const json: JobResponse = await res.json();
      setJob(json);
      if (json.status === 'completed' || json.status === 'failed') {
        break;
      }
      attempts += 1;
    }
  };

  return (
    <main
      style={{
        width: '100%',
        maxWidth: 1100,
        margin: '0 auto',
        padding: '64px 24px 120px'
      }}
    >
      <header
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          marginBottom: 48
        }}
      >
        <div>
          <h1 style={{ fontSize: 42, margin: 0 }}>Agentic TubeLab</h1>
          <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)' }}>
            Fully automate faceless YouTube production with trending topic
            research, AI asset generation, video assembly, and publishing.
          </p>
        </div>
      </header>

      <section
        style={{
          background: 'rgba(10, 20, 38, 0.8)',
          border: '1px solid var(--border)',
          borderRadius: 18,
          padding: 28,
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 350px) 1fr',
          gap: 28,
          boxShadow: '0 30px 120px rgba(0,0,0,0.35)'
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
        >
          <FormField label="Region Code" description="ISO 3166-1 alpha-2">
            <input
              value={regionCode}
              onChange={(e) => setRegionCode(e.target.value)}
              placeholder="US"
              maxLength={2}
              style={inputStyle}
            />
          </FormField>

          <FormField
            label="Topic Count"
            description="How many trending topics to adapt"
          >
            <input
              type="number"
              value={topicCount}
              min={1}
              max={5}
              onChange={(e) => setTopicCount(Number(e.target.value))}
              style={inputStyle}
            />
          </FormField>

          <FormField
            label="Voice Model"
            description="OpenAI TTS model for narration"
          >
            <select
              value={voiceModel}
              onChange={(e) => setVoiceModel(e.target.value)}
              style={inputStyle}
            >
              <option value="gpt-4o-mini-tts">gpt-4o-mini-tts</option>
              <option value="gpt-4o-mini-tts-hd">gpt-4o-mini-tts-hd</option>
            </select>
          </FormField>

          <FormField
            label="Image Model"
            description="OpenAI image engine for visuals"
          >
            <select
              value={imageModel}
              onChange={(e) => setImageModel(e.target.value)}
              style={inputStyle}
            >
              <option value="gpt-image-1">gpt-image-1</option>
              <option value="gpt-image-1-large">gpt-image-1-large</option>
            </select>
          </FormField>

          <button
            type="submit"
            disabled={!submitReady || isPending}
            style={{
              ...inputStyle,
              background:
                'linear-gradient(120deg, rgba(42, 111, 255, 0.9), rgba(87, 210, 255, 0.85))',
              color: 'var(--text-primary)',
              fontWeight: 600,
              cursor: submitReady && !isPending ? 'pointer' : 'not-allowed',
              border: 'none',
              transition: 'transform 0.2s ease',
              transform: submitReady && !isPending ? 'translateY(0)' : '',
              opacity: submitReady ? 1 : 0.6
            }}
          >
            {isPending ? 'Running...' : 'Launch Automation'}
          </button>
        </form>

        <div
          style={{
            background: 'rgba(8, 17, 30, 0.7)',
            borderRadius: 16,
            border: '1px solid rgba(75, 155, 255, 0.15)',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            minHeight: 420
          }}
        >
          <div>
            <h2 style={{ margin: '0 0 8px', fontSize: 22 }}>Job Console</h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              Real-time agent telemetry, logs, and publishing output.
            </p>
          </div>

          <div
            style={{
              flex: 1,
              overflow: 'auto',
              background: 'rgba(4, 9, 15, 0.8)',
              borderRadius: 12,
              padding: 16,
              border: '1px solid rgba(255,255,255,0.05)',
              fontFamily: 'IBM Plex Mono, SFMono-Regular, Menlo, monospace',
              fontSize: 13,
              lineHeight: 1.5,
              color: '#e3ecff'
            }}
          >
            {job ? (
              <Console job={job} />
            ) : (
              <span style={{ color: 'var(--text-secondary)' }}>
                Awaiting launch command…
              </span>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function Console({ job }: { job: JobResponse }) {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div>
        <strong>Status:</strong> {job.status.toUpperCase()}
      </div>
      {job.videoUrl && (
        <div>
          <strong>Upload URL:</strong>{' '}
          <a href={job.videoUrl} target="_blank" rel="noreferrer">
            {job.videoUrl}
          </a>
        </div>
      )}
      {job.error && (
        <div style={{ color: '#ff8c98' }}>
          <strong>Failure:</strong> {job.error}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {job.logs.map((line, idx) => (
          <span key={idx}>→ {line}</span>
        ))}
      </div>
    </div>
  );
}

function FormField({
  label,
  description,
  children
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span style={{ fontWeight: 600, letterSpacing: 0.2 }}>{label}</span>
      {description && (
        <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
          {description}
        </span>
      )}
      {children}
    </label>
  );
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 12,
  border: '1px solid rgba(75, 155, 255, 0.35)',
  background: 'rgba(6, 13, 22, 0.8)',
  color: 'var(--text-primary)',
  fontSize: 15
};
