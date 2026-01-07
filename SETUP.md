# 🚀 Setup Guide - AI Voice Translator

## Step-by-Step Setup

### 1. Get Your API Keys

#### OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-...`)
5. **Important**: Add payment method and set usage limits

#### ElevenLabs API Key

1. Go to https://elevenlabs.io/
2. Sign up for an account
3. Navigate to Profile → API Keys
4. Copy your API key
5. **Note**: Free tier gives 10,000 characters/month

### 2. Find ElevenLabs Voice IDs

#### Option A: Browse Voice Library

1. Go to https://elevenlabs.io/voice-library
2. Use filters:
   - ✅ Multilingual support
   - Search by language (French, Spanish, etc.)
3. Click on a voice you like
4. Copy the Voice ID from the URL or voice settings
5. Repeat for each language

#### Option B: Use Default Voices

Use these proven multilingual voices:

**French:**

- Charlotte: `XB0fDUnXU5powFXDhCwa`
- Antoine: `ErXwobaYiN019PkySvjV`

**Spanish:**

- Matias: `EXAVITQu4vr4xnSDxMaL`
- Valentina: `THI4CfSHl4GZJE2CdP1P`

**Yoruba & Kinyarwanda:**

- Search for "multilingual" voices in the library
- Test voices with sample text before committing
- Consider creating custom voice clones for better results

### 3. Configure Environment

1. **Copy the template:**

   ```bash
   cp .env.local.example .env.local
   ```

2. **Edit `.env.local`:**

   ```env
   # OpenAI Configuration
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx

   # ElevenLabs Configuration
   ELEVENLABS_API_KEY=xxxxxxxxxxxxx

   # Voice IDs (replace with your selected voices)
   ELEVENLABS_VOICE_ID_FR=XB0fDUnXU5powFXDhCwa
   ELEVENLABS_VOICE_ID_ES=EXAVITQu4vr4xnSDxMaL
   ELEVENLABS_VOICE_ID_YO=your_yoruba_voice_id
   ELEVENLABS_VOICE_ID_RW=your_kinyarwanda_voice_id
   ```

3. **Save the file** (it's in `.gitignore`, won't be committed)

### 4. Install Dependencies

```bash
pnpm install
```

**Installed packages:**

- `@elevenlabs/elevenlabs-js` - ElevenLabs SDK
- `openai` - OpenAI SDK
- `@chakra-ui/react` - UI components
- `wav-decoder`, `wav-encoder`, `lamejs` - Audio utilities

### 5. Test the Application

```bash
pnpm dev
```

Open http://localhost:3000

#### Quick Test Checklist

**Text Translation:**

1. ✅ Select French as target language
2. ✅ Type "Hello, how are you?" in text input
3. ✅ Click "Translate"
4. ✅ Should see French translation
5. ✅ Click "Play" to hear audio

**Voice Translation:**

1. ✅ Click microphone button
2. ✅ Allow microphone permissions
3. ✅ Speak clearly: "Hello, how are you?"
4. ✅ Click stop
5. ✅ Wait for processing
6. ✅ See transcript and translation
7. ✅ Hear translated audio

### 6. Troubleshooting

#### "API key not found" error

- Check `.env.local` exists in project root
- Verify no extra spaces in API keys
- Restart dev server after adding keys

#### No audio playback

- Open browser console (F12)
- Check for CORS or API errors
- Verify voice IDs are correct
- Test voice in ElevenLabs dashboard first

#### Microphone not working

- Grant microphone permissions in browser
- Check browser settings → Privacy → Microphone
- Try HTTPS (localhost is OK for testing)

#### Translation fails

- Check OpenAI API quota
- Verify billing is set up
- Review console for error messages

### 7. Production Deployment (Vercel)

1. **Push to GitHub:**

   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel:**

   - Go to https://vercel.com
   - Import your repository
   - Add environment variables:
     - `OPENAI_API_KEY`
     - `ELEVENLABS_API_KEY`
     - `ELEVENLABS_VOICE_ID_FR`
     - `ELEVENLABS_VOICE_ID_ES`
     - `ELEVENLABS_VOICE_ID_YO`
     - `ELEVENLABS_VOICE_ID_RW`
   - Deploy!

3. **Test production:**
   - Visit your Vercel URL
   - Test both text and voice translation
   - Monitor usage in API dashboards

### 8. Cost Management

**Set OpenAI Limits:**

1. Go to https://platform.openai.com/settings/organization/limits
2. Set monthly budget (e.g., $10)
3. Enable email alerts

**Monitor ElevenLabs:**

1. Dashboard → Usage
2. Track character count
3. Upgrade plan if needed

**Estimated Monthly Costs (100 translations/month):**

- OpenAI: ~$5
- ElevenLabs: ~$10
- **Total: ~$15/month**

## Next Steps

1. ✅ Customize UI colors and branding
2. ✅ Add more languages
3. ✅ Implement user authentication
4. ✅ Add translation history
5. ✅ Create mobile app version

## Support

- 📧 Check console logs for errors
- 📖 Review [tasks.md](tasks.md) for architecture
- 🐛 Open GitHub issue for bugs
- 💬 Join community discussions

---

**You're all set! Start translating! 🎉**
