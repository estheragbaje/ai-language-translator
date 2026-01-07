# AI Voice Translator — Tasks & Process

Target: Real‑time English → French, Spanish, Yoruba, Kinyarwanda. Primary: voice translation; Secondary: text translation. Preferred TTS/STT: ElevenLabs; Translation: choose provider (see Decisions).

## 1) Scope & Goals

- Near real‑time voice → voice translation with minimal latency.
- Reliable text → text translation as a fallback/secondary path.
- Accessible, responsive UI using Next.js + Chakra UI.
- Simple, secure setup and deployment (Vercel-friendly).

## 2) Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        🖥️  CLIENT (Browser)                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  🎤 Microphone ──► Audio Recorder Hook                                      │
│         │                   │                                               │
│         │                   │ audio chunks                                  │
│         │                   ▼                                               │
│         │         ┌─────────────────────┐                                   │
│         │         │  Chakra UI Display  │◄─── transcripts/translations      │
│         │         │   - Source text     │                                   │
│         │         │   - Translated text │                                   │
│         │         └─────────────────────┘                                   │
│         │                   │                                               │
│         │                   │ auto-trigger                                  │
│         │                   ▼                                               │
│         │         🔊 Audio Player ◄─── audio stream                         │
│         │                                                                   │
│  📝 Text Input ───────────────┐ (secondary path)                            │
│                               │                                             │
└───────────────────────────────┼─────────────────────────────────────────────┘
                                │
                                │ HTTP requests
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      ⚡ NEXT.JS API ROUTES                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐  │
│  │ /api/stt/stream  │      │ /api/translate   │      │ /api/tts/stream  │  │
│  │ Speech-to-Text   │─────►│ Text Translation │─────►│ Text-to-Speech   │  │
│  └────────┬─────────┘      └────────┬─────────┘      └────────┬─────────┘  │
│           │                         │                         │            │
│           │ audio chunks            │ text (EN)               │ text       │
│           │                         │                         │ (FR/ES/    │
│           ▼                         ▼                         │  YO/RW)    │
│  ┌─────────────────────────────────────────────────────────┐  │            │
│  │         /api/voice-translate (E2E Pipeline)             │  │            │
│  │         Orchestrates: STT → Translate → TTS             │  │            │
│  └─────────────────────────────────────────────────────────┘  │            │
│                                                                │            │
└────────────────────────────────────────────────────────────────┼────────────┘
                                                                 │
                                        HTTP/streaming requests  │
                                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      🌐 EXTERNAL SERVICES                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────────────┐   ┌─────────────────┐   ┌───────────────────────┐  │
│  │ ElevenLabs STT API │   │   OpenAI API    │   │ ElevenLabs TTS API    │  │
│  │  (audio → text)    │   │  (translation)  │   │ (text → audio)        │  │
│  │                    │   │                 │   │ • French voices       │  │
│  │  Returns:          │   │  EN → FR/ES/    │   │ • Spanish voices      │  │
│  │  English text      │   │       YO/RW     │   │ • Yoruba voices       │  │
│  │                    │   │                 │   │ • Kinyarwanda voices  │  │
│  └────────────────────┘   └─────────────────┘   └───────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

PRIMARY FLOW (Voice Translation):
  🎤 Mic → Audio Recorder → /api/stt/stream → ElevenLabs STT
                              ↓
                          English Text → Display
                              ↓
                          /api/translate → OpenAI
                              ↓
                      Translated Text (FR/ES/YO/RW) → Display
                              ↓
                          /api/tts/stream → ElevenLabs TTS
                              ↓
                          Audio Stream → Player → 🔊 Speaker

SECONDARY FLOW (Text Translation):
  📝 Text Input → /api/translate → OpenAI → Display → (optional) → /api/tts/stream
```

### Component Details

- **Client (Next.js App Router + Chakra UI)**
  - Audio capture via Web Audio API (`MediaRecorder` or `AudioWorklet`).
  - Streaming to server for STT; playback streaming audio from TTS.
  - Text input for secondary text translation; transcript display & controls.
- **Server (Next.js API routes / Edge runtime where possible)**
  - STT: ElevenLabs Speech-to-Text (or alternative, see Decisions).
  - Translate: LLM or MT provider (OpenAI/Google/DeepL/NLLB) for EN→FR/ES/YOR/RW.
  - TTS: ElevenLabs multilingual voices; stream back audio to client.
- **Orchestration endpoints (proposed):**
  - `POST /api/stt/stream` — streaming STT from mic.
  - `POST /api/translate` — translate text payload.
  - `POST /api/tts/stream` — streaming TTS for translated text.
  - `POST /api/voice-translate` — end-to-end (audio→text→translate→audio) pipeline.

## 3) Key Decisions (choose during Phase 0)

- STT provider:
  - ElevenLabs STT: tight integration with ElevenLabs, good latency.
  - OpenAI Whisper (realtime or batch): high quality, may require relays and higher latency.
- Translation provider:
  - OpenAI (GPT-4o family): strong contextual translation; configurable style/tone.
  - Google Cloud Translate: fast, cost-effective, broad language support.
  - DeepL: strong EU language quality; limited language coverage.
  - Meta NLLB/Marian (hosted): open models; more infra overhead.
- Streaming strategy:
  - True streaming (websocket or chunked POST) vs short chunks (low-latency polling).

## 4) Milestones (Suggested Order)

1. Skeleton app + UI shell
2. Audio capture + basic recording controls
3. STT prototype (short audio → transcript)
4. Translation prototype (text → translated text)
5. TTS prototype (text → audio playback)
6. E2E voice→voice translation (non-streaming)
7. Streaming path, latency optimizations, VAD/silence handling
8. Settings (languages, voices, style), accessibility
9. QA, observability, deploy

## 5) Detailed Task Checklist

### Phase 0 — Project Setup

- [ ] Create `.env.local` with secrets (see Env Vars).
- [ ] Install SDKs/clients for chosen providers.
- [ ] Confirm Chakra UI provider and color mode are configured.
- [ ] Add shared types: language codes, message events, stream frames.

### Phase 1 — UI Shell (Next.js + Chakra UI)

- [ ] Add top-level layout: language selectors (source EN, target FR/ES/YOR/RW).
- [ ] Add mic button with states: idle/recording/processing.
- [ ] Add transcript panes: source and translated text.
- [ ] Add text input section for secondary text translation.
- [ ] Add audio player for TTS output; show buffering/streaming state.

### Phase 2 — Audio Capture (Client)

- [ ] Implement `useAudioRecorder` (start/stop, errors, permissions).
- [ ] Decide encoding: PCM16/16kHz mono (ideal for STT) or Opus chunks.
- [ ] Optional: client VAD (silence detection) to segment utterances.
- [ ] Stream chunks to `/api/stt/stream` (fetch streaming or websocket fallback).

### Phase 3 — STT (Server)

- [ ] Implement `/api/stt/stream` to accept audio chunks.
- [ ] Integrate ElevenLabs STT (or chosen provider) with streaming/partial transcripts.
- [ ] Normalize transcript events; return partial + final results to client.
- [ ] Add error handling, timeouts, size limits.

### Phase 4 — Translation (Server)

- [ ] Implement `/api/translate` for text payloads.
- [ ] Provider integration (OpenAI/Google/DeepL/etc.).
- [ ] Support target languages: FR, ES, YO, RW; style knobs (formal/informal).
- [ ] Add glossary/phrase exceptions if needed (names, proper nouns).

### Phase 5 — TTS (Server + Client)

- [ ] Implement `/api/tts/stream` with ElevenLabs.
- [ ] Choose voices per target language; expose in UI.
- [ ] Stream audio back; implement client streaming playback.
- [ ] Cache frequent phrases; handle retries.

### Phase 6 — E2E Voice→Voice

- [ ] Implement `/api/voice-translate` orchestrator: STT → Translate → TTS.
- [ ] Non-streaming MVP (batch per utterance), then move to streaming pipeline.
- [ ] Display live source transcript and translated text.
- [ ] Provide download/share of final audio.

### Phase 7 — Streaming & Latency

- [ ] Chunk sizes, buffering strategy, and backpressure.
- [ ] VAD thresholds; end-of-utterance detection.
- [ ] Pre-warm TTS voices; reduce synthesis startup time.
- [ ] Parallelize translate + early TTS (speculative) when safe.

### Phase 8 — Settings, UX & Accessibility

- [ ] Language dropdown presets and persistence (localStorage).
- [ ] Voice selection per language; preview sample.
- [ ] Text translation mode: paste/enter → translate → play (optional).
- [ ] Keyboard shortcuts; WCAG color contrast; focus states.

### Phase 9 — Quality, Testing & Observability

- [ ] Add unit tests for utility functions (formatting, mapping, codecs).
- [ ] Add integration tests for API routes (mocks for providers).
- [ ] Latency telemetry (server timings, client marks), error logging.
- [ ] Phrasebook test set for EN→FR/ES/YO/RW evaluation.

### Phase 10 — Deploy

- [ ] Add rate limiting on API routes; request size limits.
- [ ] Configure env on Vercel; validate secrets.
- [ ] Smoke test E2E on production; monitor quotas and costs.
- [ ] Documentation: quick start, privacy notes, limitations.

## 6) Environment Variables

Create `.env.local` (never commit real keys):

```
# ElevenLabs
ELEVENLABS_API_KEY=...
ELEVENLABS_VOICE_ID_FR=...
ELEVENLABS_VOICE_ID_ES=...
ELEVENLABS_VOICE_ID_YO=...
ELEVENLABS_VOICE_ID_RW=...

# If using OpenAI for translation/STT
OPENAI_API_KEY=...

# If using Google Cloud Translate
GOOGLE_PROJECT_ID=...
GOOGLE_CLIENT_EMAIL=...
GOOGLE_PRIVATE_KEY="..."
```

## 7) Dependencies (install as needed)

Use pnpm (already present):

```bash
# ElevenLabs SDK
pnpm add elevenlabs

# If using OpenAI for translation/STT
pnpm add openai

# If using Google Translate (server-side)
pnpm add @google-cloud/translate

# Audio utils (optional)
pnpm add wav-decoder wav-encoder lamejs
```

## 8) API Shapes (Proposed)

- `POST /api/translate`
  - body: `{ text: string, source: 'en', target: 'fr'|'es'|'yo'|'rw', style?: 'formal'|'informal' }`
  - resp: `{ translated: string, provider: string, latencyMs: number }`
- `POST /api/tts/stream`
  - body: `{ text: string, voiceId?: string, language: 'fr'|'es'|'yo'|'rw' }`
  - resp: `audio/mpeg` or chunked stream
- `POST /api/stt/stream`
  - body: `audio/*` chunks
  - resp: server-sent events or NDJSON: `{ type: 'partial'|'final', text: string }`
- `POST /api/voice-translate`
  - body: streaming audio; server returns streaming translated audio

## 9) Testing Plan

- Unit tests for text normalization, language mapping, chunk framing.
- Mock provider SDKs for stable integration tests.
- Latency benchmarks: capture E2E time budget (< 1.5–2.5s target).
- Regression suite with phrasebook covering idioms and named entities.

## 10) Risks & Mitigations

- Latency too high → adopt smaller chunks, server locality, pre-warm voices.
- Translation accuracy (YO/RW) → choose provider with best coverage; add glossary.
- Quotas/costs → local caching; truncate long inputs; rate limits.
- Browser permissions/audio device issues → robust error states, retries, help text.

## 11) Next Actions (Day 1)

- [ ] Decide STT + translation providers and record in this file.
- [ ] Implement `useAudioRecorder` and a minimal mic UI.
- [ ] Add `/api/translate` and `/api/tts/stream` basic versions.
- [ ] Hardcode one voice per language and ship a text→audio demo.

---

Maintainer Notes: Keep this file updated as decisions solidify; mark completed tasks and append implementation links (files/PRs).
