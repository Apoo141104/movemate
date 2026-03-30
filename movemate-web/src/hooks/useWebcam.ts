'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export type CameraPermissionState = 'prompt' | 'granted' | 'denied' | 'error';

interface UseWebcamOptions {
  width?: number;
  height?: number;
  facingMode?: 'user' | 'environment';
}

interface UseWebcamReturn {
  videoRef: (node: HTMLVideoElement | null) => void;
  stream: MediaStream | null;
  permissionState: CameraPermissionState;
  isReady: boolean;
  error: string | null;
  requestPermission: () => Promise<void>;
  stopCamera: () => void;
}

export function useWebcam(options: UseWebcamOptions = {}): UseWebcamReturn {
  const { width = 1280, height = 720, facingMode = 'user' } = options;
  
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionState, setPermissionState] = useState<CameraPermissionState>('prompt');
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Callback ref to connect video element when it mounts
  const videoRef = useCallback((node: HTMLVideoElement | null) => {
    videoElementRef.current = node;
    
    // If we already have a stream and the video element just mounted, connect them
    if (node && streamRef.current && !node.srcObject) {
      node.srcObject = streamRef.current;
      node.onloadedmetadata = () => {
        node.play();
        setIsReady(true);
      };
    }
  }, [stream]); // Re-create callback when stream changes so it can connect

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setStream(null);
    }
    setIsReady(false);
  }, []);

  const requestPermission = useCallback(async () => {
    try {
      setError(null);
      setPermissionState('prompt');

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: width },
          height: { ideal: height },
          facingMode,
        },
        audio: false,
      });

      streamRef.current = mediaStream;
      setStream(mediaStream);
      setPermissionState('granted');
      
      // If video element already exists, connect stream to it
      if (videoElementRef.current && !videoElementRef.current.srcObject) {
        videoElementRef.current.srcObject = mediaStream;
        videoElementRef.current.onloadedmetadata = () => {
          videoElementRef.current?.play();
          setIsReady(true);
        };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      if (errorMessage.includes('Permission denied') || errorMessage.includes('NotAllowedError')) {
        setPermissionState('denied');
        setError('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (errorMessage.includes('NotFoundError')) {
        setPermissionState('error');
        setError('No camera found. Please connect a webcam and try again.');
      } else {
        setPermissionState('error');
        setError(`Camera error: ${errorMessage}`);
      }
    }
  }, [width, height, facingMode]);

  // Check initial permission state
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
        if (result.state === 'granted') {
          requestPermission();
        } else if (result.state === 'denied') {
          setPermissionState('denied');
        }
      } catch {
        // Permissions API not supported, will prompt on request
      }
    };

    checkPermission();
  }, [requestPermission]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return {
    videoRef,
    stream,
    permissionState,
    isReady,
    error,
    requestPermission,
    stopCamera,
  };
}
