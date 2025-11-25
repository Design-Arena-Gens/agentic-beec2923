# Agentic TubeLab

Agentic TubeLab is a full-stack Next.js automation console that produces faceless YouTube videos end-to-end. The agent orchestrates trending topic discovery, AI-made storytelling assets, cinematic video assembly, and hands-free publishing to a configured YouTube channel.

## Core Capabilities

- Trending topic mining via the YouTube Data API
- Script authoring with OpenAI Responses API (structured narrative sections)
- AI voiceover synthesis using OpenAI Audio Speech models
- High-fidelity image generation per scene with OpenAI Image models
- Automated FFmpeg-driven video assembly (1280x720, 30fps, MP4)
- Direct YouTube upload with OAuth2 refresh token flow
- Realtime job telemetry surfaced in a rich UI console

## Getting Started

### Prerequisites

- Node.js 18+
- ffmpeg binary is bundled via `ffmpeg-static` (no manual install needed)
- OpenAI API access with image + TTS entitlements
- YouTube Data API quota with OAuth2 client + refresh token

### Environment

Create a `.env.local` file with the following secrets:

```
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...
YOUTUBE_CLIENT_ID=...
YOUTUBE_CLIENT_SECRET=...
YOUTUBE_REFRESH_TOKEN=...
# Optional: specific upload channel
YOUTUBE_CHANNEL_ID=UC...
# Optional: override asset staging directory
AUTOMATION_TMP_DIR=/tmp/automation-agent
```

### Install & Run

```bash
npm install
npm run dev
# open http://localhost:3000
```

### Production Build

```bash
npm run build
npm start
```

## How It Works

1. **Trend Harvesting** – pulls top `n` trending stories for the selected region.
2. **Story Engineering** – crafts a JSON-structured script with narration + visual beats.
3. **Voice Lab** – generates a cohesive narration track and estimates beat timings.
4. **Visual Forge** – renders cinematic widescreen scenes aligned with each beat.
5. **Video Foundry** – stitches everything into a ready-to-upload MP4 via FFmpeg.
6. **Publisher** – uploads privately to YouTube, returning the canonical video URL.

The UI continuously polls job state, showing timestamped logs, failure context, and final delivery metadata.

## Deployment

This project targets Vercel (Next.js App Router). Provide the same environment variables in the Vercel dashboard or project secrets before deploying.

To deploy manually from the CLI:

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-beec2923
```

After DNS propagation, confirm with:

```bash
curl https://agentic-beec2923.vercel.app
```

## Caveats

- Image, script, and audio generation consume OpenAI quota; monitor usage.
- YouTube uploads require project verification; respect platform policies.
- Long-running automations are executed server-side and tracked in-memory; use a persistent job store for multi-instance deployments.

## License

MIT © 2024 Agentic TubeLab Contributors
