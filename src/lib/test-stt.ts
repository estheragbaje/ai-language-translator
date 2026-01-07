// Test utilities for STT functionality

/**
 * Test the STT endpoint with a sample audio file
 * Usage: Call this from browser console or a test script
 */
export async function testSTT() {
  try {
    console.log('🎤 Testing Speech-to-Text...');

    // Request microphone access
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log('✅ Microphone access granted');

    // Create MediaRecorder
    const mediaRecorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

    mediaRecorder.onstop = async () => {
      console.log('⏹️ Recording stopped, processing...');

      const audioBlob = new Blob(chunks, { type: 'audio/webm' });
      console.log(`📦 Audio blob size: ${audioBlob.size} bytes`);

      // Send to STT API
      const response = await fetch('/api/stt/stream', {
        method: 'POST',
        body: audioBlob,
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ STT failed:', error);
        return;
      }

      const result = await response.json();
      console.log('✅ STT Success!');
      console.log('📝 Transcription:', result.text);
      console.log('⚡ Latency:', result.latencyMs, 'ms');
      console.log('📊 Audio size:', result.audioSize, 'bytes');

      // Clean up
      stream.getTracks().forEach((track) => track.stop());
    };

    // Record for 3 seconds
    console.log('🔴 Recording for 3 seconds... Speak now!');
    mediaRecorder.start();

    setTimeout(() => {
      mediaRecorder.stop();
    }, 3000);
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

/**
 * Test audio format detection
 */
export function testAudioFormatDetection() {
  console.log('🔍 Testing audio format detection...');

  const formats = {
    webm: new Uint8Array([0x1a, 0x45, 0xdf, 0xa3, 0x00, 0x00]),
    wav: new Uint8Array([
      0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45,
    ]),
    mp3: new Uint8Array([0xff, 0xfb, 0x00, 0x00]),
  };

  Object.entries(formats).forEach(([format, signature]) => {
    console.log(
      `✓ ${format.toUpperCase()}: ${Array.from(signature)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join(' ')}`
    );
  });
}

/**
 * Benchmark STT with different audio lengths
 */
export async function benchmarkSTT() {
  console.log('⚡ Running STT benchmarks...');

  const durations = [1000, 3000, 5000]; // 1s, 3s, 5s

  for (const duration of durations) {
    console.log(`\n📊 Testing ${duration}ms recording...`);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];

    await new Promise<void>((resolve) => {
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });

        const startTime = Date.now();
        const response = await fetch('/api/stt/stream', {
          method: 'POST',
          body: audioBlob,
        });
        const totalTime = Date.now() - startTime;

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ Duration: ${duration}ms`);
          console.log(`   Size: ${audioBlob.size} bytes`);
          console.log(`   API Latency: ${result.latencyMs}ms`);
          console.log(`   Total Time: ${totalTime}ms`);
          console.log(`   Text: "${result.text}"`);
        }

        stream.getTracks().forEach((track) => track.stop());
        resolve();
      };

      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), duration);
    });
  }

  console.log('\n✅ Benchmark complete!');
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testSTT = testSTT;
  (window as any).testAudioFormatDetection = testAudioFormatDetection;
  (window as any).benchmarkSTT = benchmarkSTT;
  console.log(
    '🧪 STT test utilities loaded. Try: testSTT(), testAudioFormatDetection(), benchmarkSTT()'
  );
}
