'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Landmark, PersonPose, PARTNER_CONFIGS } from '@/types/pose';

interface UseMultiPoseDetectionOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onResults?: (poses: PersonPose[]) => void;
  enabled?: boolean;
  maxPeople?: number;
}

interface UseMultiPoseDetectionReturn {
  poses: PersonPose[];
  isLoading: boolean;
  error: string | null;
  fps: number;
  peopleCount: number;
}

// MoveNet keypoint indices
const MOVENET_KEYPOINTS = {
  NOSE: 0,
  LEFT_EYE: 1,
  RIGHT_EYE: 2,
  LEFT_EAR: 3,
  RIGHT_EAR: 4,
  LEFT_SHOULDER: 5,
  RIGHT_SHOULDER: 6,
  LEFT_ELBOW: 7,
  RIGHT_ELBOW: 8,
  LEFT_WRIST: 9,
  RIGHT_WRIST: 10,
  LEFT_HIP: 11,
  RIGHT_HIP: 12,
  LEFT_KNEE: 13,
  RIGHT_KNEE: 14,
  LEFT_ANKLE: 15,
  RIGHT_ANKLE: 16,
};

// Map MoveNet 17 keypoints to MediaPipe 33 landmark format
function mapMoveNetToLandmarks(keypoints: any[], videoWidth: number, videoHeight: number): Landmark[] {
  const landmarks: Landmark[] = new Array(33).fill(null).map(() => ({
    x: 0,
    y: 0,
    z: 0,
    visibility: 0,
  }));

  // Map MoveNet keypoints to MediaPipe indices
  const mapping: Record<number, number> = {
    [MOVENET_KEYPOINTS.NOSE]: 0,
    [MOVENET_KEYPOINTS.LEFT_EYE]: 2,
    [MOVENET_KEYPOINTS.RIGHT_EYE]: 5,
    [MOVENET_KEYPOINTS.LEFT_EAR]: 7,
    [MOVENET_KEYPOINTS.RIGHT_EAR]: 8,
    [MOVENET_KEYPOINTS.LEFT_SHOULDER]: 11,
    [MOVENET_KEYPOINTS.RIGHT_SHOULDER]: 12,
    [MOVENET_KEYPOINTS.LEFT_ELBOW]: 13,
    [MOVENET_KEYPOINTS.RIGHT_ELBOW]: 14,
    [MOVENET_KEYPOINTS.LEFT_WRIST]: 15,
    [MOVENET_KEYPOINTS.RIGHT_WRIST]: 16,
    [MOVENET_KEYPOINTS.LEFT_HIP]: 23,
    [MOVENET_KEYPOINTS.RIGHT_HIP]: 24,
    [MOVENET_KEYPOINTS.LEFT_KNEE]: 25,
    [MOVENET_KEYPOINTS.RIGHT_KNEE]: 26,
    [MOVENET_KEYPOINTS.LEFT_ANKLE]: 27,
    [MOVENET_KEYPOINTS.RIGHT_ANKLE]: 28,
  };

  keypoints.forEach((kp, idx) => {
    const targetIdx = mapping[idx];
    if (targetIdx !== undefined) {
      landmarks[targetIdx] = {
        x: kp.x / videoWidth,
        y: kp.y / videoHeight,
        z: 0,
        visibility: kp.score || 0,
      };
    }
  });

  return landmarks;
}

// Load script dynamically
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

export function useMultiPoseDetection(
  options: UseMultiPoseDetectionOptions
): UseMultiPoseDetectionReturn {
  const { videoRef, onResults, enabled = true, maxPeople = 5 } = options;

  const detectorRef = useRef<any>(null);
  const animationRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const mountedRef = useRef(true);
  const initializingRef = useRef(false);

  const [poses, setPoses] = useState<PersonPose[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fps, setFps] = useState(0);

  const processFrame = useCallback(async () => {
    if (!mountedRef.current) return;
    
    if (!videoRef.current || !detectorRef.current || !enabled) {
      animationRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const video = videoRef.current;

    if (video.readyState >= 2) {
      try {
        const detectedPoses = await detectorRef.current.estimatePoses(video, {
          maxPoses: maxPeople,
          flipHorizontal: false,
        });

        if (detectedPoses && detectedPoses.length > 0 && mountedRef.current) {
          const convertedPoses: PersonPose[] = detectedPoses
            .filter((pose: any) => pose.score > 0.2)
            .map((pose: any, idx: number) => {
              const config = PARTNER_CONFIGS[idx % PARTNER_CONFIGS.length];
              const landmarks = mapMoveNetToLandmarks(
                pose.keypoints,
                video.videoWidth,
                video.videoHeight
              );

              return {
                id: idx,
                landmarks,
                color: config.color,
                partnerName: config.name,
              };
            });

          setPoses(convertedPoses);
          onResults?.(convertedPoses);
        } else if (mountedRef.current) {
          setPoses([]);
          onResults?.([]);
        }
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
  }, [enabled, videoRef, maxPeople, onResults]);

  useEffect(() => {
    mountedRef.current = true;

    const initDetector = async () => {
      if (initializingRef.current || !enabled) return;
      initializingRef.current = true;

      try {
        setIsLoading(true);
        setError(null);

        // Load TensorFlow.js via CDN scripts to avoid SSR bundling issues
        await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core');
        await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-converter');
        await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl');
        await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection');

        // Access from window
        const tf = (window as any).tf;
        const poseDetection = (window as any).poseDetection;

        if (!tf || !poseDetection) {
          throw new Error('TensorFlow.js libraries not loaded');
        }

        // Wait for backend to be ready
        await tf.ready();

        // Create MoveNet MultiPose detector
        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          {
            modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
            enableSmoothing: true,
            minPoseScore: 0.2,
          }
        );

        if (!mountedRef.current) {
          detector.dispose();
          return;
        }

        detectorRef.current = detector;
        setIsLoading(false);
        lastFrameTimeRef.current = performance.now();
        animationRef.current = requestAnimationFrame(processFrame);
      } catch (err) {
        console.error('Failed to initialize multi-pose detector:', err);
        if (mountedRef.current) {
          setError('Failed to load pose detection. Please refresh the page.');
          setIsLoading(false);
        }
      } finally {
        initializingRef.current = false;
      }
    };

    if (enabled && typeof window !== 'undefined') {
      initDetector();
    }

    return () => {
      mountedRef.current = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (detectorRef.current?.dispose) {
        detectorRef.current.dispose();
        detectorRef.current = null;
      }
    };
  }, [enabled, processFrame]);

  return {
    poses,
    isLoading,
    error,
    fps,
    peopleCount: poses.length,
  };
}
