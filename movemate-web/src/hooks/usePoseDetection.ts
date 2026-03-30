'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Landmark, PoseResults } from '@/types/pose';

interface UsePoseDetectionOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onResults?: (landmarks: Landmark[]) => void;
  enabled?: boolean;
}

interface UsePoseDetectionReturn {
  landmarks: Landmark[] | null;
  isLoading: boolean;
  error: string | null;
  fps: number;
}

export function usePoseDetection(
  options: UsePoseDetectionOptions
): UsePoseDetectionReturn {
  const { videoRef, onResults, enabled = true } = options;
  
  const poseRef = useRef<any>(null);
  const animationRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  
  const [landmarks, setLandmarks] = useState<Landmark[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fps, setFps] = useState(0);

  const processFrame = useCallback(async () => {
    if (!videoRef.current || !poseRef.current || !enabled) {
      animationRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const video = videoRef.current;
    
    if (video.readyState >= 2) {
      try {
        await poseRef.current.send({ image: video });
      } catch (err) {
        console.error('Pose detection error:', err);
      }
    }

    // Calculate FPS
    frameCountRef.current++;
    const now = performance.now();
    if (now - lastFrameTimeRef.current >= 1000) {
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
      lastFrameTimeRef.current = now;
    }

    animationRef.current = requestAnimationFrame(processFrame);
  }, [enabled, videoRef]);

  useEffect(() => {
    let mounted = true;

    const initPose = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Dynamically import MediaPipe Pose
        const { Pose } = await import('@mediapipe/pose');

        const pose = new Pose({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
          },
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        pose.onResults((results: PoseResults) => {
          if (!mounted) return;
          
          if (results.poseLandmarks) {
            setLandmarks(results.poseLandmarks);
            onResults?.(results.poseLandmarks);
          }
        });

        await pose.initialize();
        poseRef.current = pose;

        if (mounted) {
          setIsLoading(false);
          lastFrameTimeRef.current = performance.now();
          animationRef.current = requestAnimationFrame(processFrame);
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to initialize pose detection');
          setIsLoading(false);
          console.error('Pose init error:', err);
        }
      }
    };

    if (enabled) {
      initPose();
    }

    return () => {
      mounted = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (poseRef.current) {
        poseRef.current.close();
      }
    };
  }, [enabled, onResults, processFrame]);

  return {
    landmarks,
    isLoading,
    error,
    fps,
  };
}
