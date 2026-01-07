# 🌍 AI Voice Translator

Real-time voice translation powered by ElevenLabs and OpenAI. Translate English speech to French, Spanish, Yoruba, or Kinyarwanda with natural-sounding voices.

## ✨ Features

- 🎤 **Voice-first Translation**: Record your voice and get instant translations
- 📝 **Text Translation**: Alternative text input for manual translation
- 🔊 **High-Quality TTS**: Natural-sounding voices powered by ElevenLabs
- ⚡ **Real-time Processing**: Fast STT, translation, and TTS pipeline
- 🎨 **Beautiful UI**: Built with Next.js and Chakra UI
- 🌐 **4 Languages**: French, Spanish, Yoruba, and Kinyarwanda

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: Chakra UI v3
- **STT**: OpenAI Whisper
- **Translation**: OpenAI GPT-4o
- **TTS**: ElevenLabs Multilingual v2
- **Language**: TypeScript

## 📋 Prerequisites

1. **Node.js** 18+ and **pnpm**
2. **OpenAI API Key** - [Get here](https://platform.openai.com/api-keys)
3. **ElevenLabs API Key** - [Get here](https://elevenlabs.io/)
4. **ElevenLabs Voice IDs** - [Browse voices](https://elevenlabs.io/voice-library)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

Copy the example file and add your API keys:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# Required: OpenAI API Key
OPENAI_API_KEY=sk-...

# Required: ElevenLabs API Key
ELEVENLABS_API_KEY=...

# Required: ElevenLabs Voice IDs (one per language)
ELEVENLABS_VOICE_ID_FR=...  # French voice
ELEVENLABS_VOICE_ID_ES=...  # Spanish voice
ELEVENLABS_VOICE_ID_YO=...  # Yoruba voice
ELEVENLABS_VOICE_ID_RW=...  # Kinyarwanda voice
```

### 3. Find Voice IDs

1. Go to [ElevenLabs Voice Library](https://elevenlabs.io/voice-library)
2. Search for multilingual voices in your target languages
3. Click on a voice and copy the Voice ID
4. Paste into `.env.local`

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### Voice Translation

1. Select target language (French, Spanish, Yoruba, or Kinyarwanda)
2. Click the microphone button
3. Speak in English
4. Click stop when done
5. View transcript, translation, and play audio

### Text Translation

1. Select target language
2. Type or paste English text
3. Click "Translate"
4. View translation and play audio

## 🔌 API Endpoints

### POST /api/translate

**Request:**

```json
{
  "text": "Hello, how are you?",
  "source": "en",
  "target": "fr",
  "style": "formal"
}
```

### POST /api/tts/stream

**Request:**

```json
{
  "text": "Bonjour",
  "language": "fr"
}
```

### POST /api/stt/stream

Send audio file, receive transcript.

## 💰 Cost Estimates

- **OpenAI Whisper**: ~$0.006/minute
- **OpenAI GPT-4o**: ~$0.01 per translation
- **ElevenLabs TTS**: ~$0.18/1K characters

**Example:** 1 minute of voice translation ≈ $0.03

## 🐛 Troubleshooting

- **No audio**: Check ElevenLabs voice IDs are set
- **STT fails**: Verify microphone permissions
- **Translation errors**: Check OpenAI API key and quota

## 📝 License

MIT

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
