import { NextRequest, NextResponse } from 'next/server';
import { textToSpeech } from '@/lib/elevenlabs';
import { translateText, speechToText } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const targetLang = formData.get('target') as string;

    if (!audioFile || !targetLang) {
      return NextResponse.json(
        { error: 'Missing required fields: audio and target' },
        { status: 400 }
      );
    }

    // Step 1: Speech to Text
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    const sourceText = await speechToText(audioBuffer);

    // Step 2: Translate
    const translatedText = await translateText(sourceText, targetLang);

    // Step 3: Text to Speech
    const audioOutput = await textToSpeech(translatedText, targetLang);

    return NextResponse.json({
      sourceText,
      translatedText,
      audioUrl: `data:audio/mpeg;base64,${audioOutput.toString('base64')}`,
    });
  } catch (error) {
    console.error('Voice translation error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Voice translation failed',
      },
      { status: 500 }
    );
  }
}
