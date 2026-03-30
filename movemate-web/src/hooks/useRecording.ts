'use client';

import { useRef, useState, useCallback } from 'react';
import { RecordingState } from '@/types/pose';

interface UseRecordingOptions {
  maxDuration?: number; // in seconds
  onRecordingComplete?: (blob: Blob) => void;
}

interface UseRecordingReturn {
  recordingState: RecordingState;
  startRecording: (canvas: HTMLCanvasElement) => void;
  stopRecording: () => void;
  downloadRecording: () => void;
  recordedBlob: Blob | null;
}

export function useRecording(options: UseRecordingOptions = {}): UseRecordingReturn {
  const { maxDuration = 20, onRecordingComplete } = options;
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    duration: 0,
    maxDuration,
  });
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  const startRecording = useCallback((canvas: HTMLCanvasElement) => {
    try {
      chunksRef.current = [];
      setRecordedBlob(null);

      // Get canvas stream at 30fps
      const stream = canvas.captureStream(30);
      
      // Check for supported MIME types
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : 'video/mp4';

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 2500000,
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setRecordedBlob(blob);
        onRecordingComplete?.(blob);
        
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // Collect data every 100ms

      setRecordingState({
        isRecording: true,
        duration: 0,
        maxDuration,
      });

      // Start duration timer
      timerRef.current = setInterval(() => {
        setRecordingState((prev) => {
          const newDuration = prev.duration + 1;
          if (newDuration >= maxDuration) {
            // Auto-stop at max duration
            mediaRecorderRef.current?.stop();
            return { ...prev, isRecording: false, duration: newDuration };
          }
          return { ...prev, duration: newDuration };
        });
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  }, [maxDuration, onRecordingComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState.isRecording) {
      mediaRecorderRef.current.stop();
      setRecordingState((prev) => ({ ...prev, isRecording: false }));
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [recordingState.isRecording]);

  const downloadRecording = useCallback(() => {
    if (!recordedBlob) return;

    const url = URL.createObjectURL(recordedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `movemate-recording-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [recordedBlob]);

  return {
    recordingState,
    startRecording,
    stopRecording,
    downloadRecording,
    recordedBlob,
  };
}
