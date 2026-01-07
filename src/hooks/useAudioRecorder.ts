'use client';

import { useState, useRef, useCallback } from 'react';
import { RecordingState } from '@/types/translator';

interface UseAudioRecorderOptions {
  onDataAvailable?: (chunk: Blob) => void;
  onRecordingComplete?: (audioBlob: Blob) => void;
  maxDuration?: number;
}

export function useAudioRecorder({
  onDataAvailable,
  onRecordingComplete,
  maxDuration = 60000,
}: UseAudioRecorderOptions = {}) {
  const [state, setState] = useState<RecordingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop();
      setState('processing');

      // Clear timers
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      chunksRef.current = [];
      setDuration(0);

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      streamRef.current = stream;

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorderRef.current = mediaRecorder;

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
          onDataAvailable?.(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecordingComplete?.(audioBlob);

        // Cleanup stream
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };

      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      setState('recording');

      // Track duration
      const startTime = Date.now();
      durationIntervalRef.current = setInterval(() => {
        setDuration(Date.now() - startTime);
      }, 100);

      // Auto-stop after max duration
      timerRef.current = setTimeout(() => {
        stopRecording();
      }, maxDuration);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to start recording';
      setError(message);
      setState('idle');
      console.error('Recording error:', err);
    }
  }, [maxDuration, onDataAvailable, onRecordingComplete, stopRecording]);

  const reset = useCallback(() => {
    stopRecording();
    setState('idle');
    setError(null);
    setDuration(0);
    chunksRef.current = [];
  }, [stopRecording]);

  return {
    state,
    error,
    duration,
    startRecording,
    stopRecording,
    reset,
    isRecording: state === 'recording',
    isProcessing: state === 'processing',
  };
}
