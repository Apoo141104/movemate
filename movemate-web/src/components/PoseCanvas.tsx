'use client';

import React, { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Landmark, Correction } from '@/types/pose';
import { drawSkeleton, getJointsToHighlight, clearCanvas } from '@/utils/skeletonDrawing';

interface PoseCanvasProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  landmarks: Landmark[] | null;
  corrections: Correction[];
  width?: number;
  height?: number;
  mirrored?: boolean;
}

export interface PoseCanvasHandle {
  getCanvas: () => HTMLCanvasElement | null;
}

export const PoseCanvas = forwardRef<PoseCanvasHandle, PoseCanvasProps>(({
  videoRef,
  landmarks,
  corrections,
  width = 1280,
  height = 720,
  mirrored = true,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
  }));

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas?.getContext('2d');

    if (!canvas || !ctx || !video) {
      animationRef.current = requestAnimationFrame(draw);
      return;
    }

    // Clear canvas
    clearCanvas(ctx, canvas.width, canvas.height);

    // Draw video frame (mirrored)
    ctx.save();
    if (mirrored) {
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    } else {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
    ctx.restore();

    // Draw skeleton overlay
    if (landmarks && landmarks.length > 0) {
      // Mirror landmarks if needed
      const processedLandmarks = mirrored
        ? landmarks.map(l => ({ ...l, x: 1 - l.x }))
        : landmarks;

      // Get joints to highlight based on corrections
      const highlightJoints = corrections.flatMap(c => getJointsToHighlight(c.bodyPart));

      drawSkeleton(ctx, processedLandmarks, canvas.width, canvas.height, {
        lineColor: '#00FF88',
        lineWidth: 4,
        pointColor: '#FFFFFF',
        pointRadius: 8,
        highlightJoints,
        highlightColor: '#FF6B6B',
      });
    }

    animationRef.current = requestAnimationFrame(draw);
  }, [videoRef, landmarks, corrections, mirrored]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="w-full h-full object-contain rounded-xl"
    />
  );
});

PoseCanvas.displayName = 'PoseCanvas';

export default PoseCanvas;
