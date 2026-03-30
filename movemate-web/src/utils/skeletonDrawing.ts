import { Landmark, POSE_LANDMARKS } from '@/types/pose';

// Skeleton connections for drawing
const POSE_CONNECTIONS: [number, number][] = [
  // Face
  [POSE_LANDMARKS.LEFT_EAR, POSE_LANDMARKS.LEFT_EYE],
  [POSE_LANDMARKS.LEFT_EYE, POSE_LANDMARKS.NOSE],
  [POSE_LANDMARKS.NOSE, POSE_LANDMARKS.RIGHT_EYE],
  [POSE_LANDMARKS.RIGHT_EYE, POSE_LANDMARKS.RIGHT_EAR],
  
  // Torso
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER],
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_HIP],
  [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_HIP],
  [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP],
  
  // Left arm
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW],
  [POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST],
  
  // Right arm
  [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW],
  [POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST],
  
  // Left leg
  [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE],
  [POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.LEFT_ANKLE],
  
  // Right leg
  [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE],
  [POSE_LANDMARKS.RIGHT_KNEE, POSE_LANDMARKS.RIGHT_ANKLE],
];

interface DrawOptions {
  lineColor?: string;
  lineWidth?: number;
  pointColor?: string;
  pointRadius?: number;
  highlightJoints?: number[];
  highlightColor?: string;
}

/**
 * Draw skeleton overlay on canvas
 */
export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  width: number,
  height: number,
  options: DrawOptions = {}
): void {
  const {
    lineColor = '#00FF88',
    lineWidth = 3,
    pointColor = '#FFFFFF',
    pointRadius = 6,
    highlightJoints = [],
    highlightColor = '#FF6B6B',
  } = options;

  // Draw connections
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';

  for (const [startIdx, endIdx] of POSE_CONNECTIONS) {
    const start = landmarks[startIdx];
    const end = landmarks[endIdx];

    if (start && end && (start.visibility || 0) > 0.5 && (end.visibility || 0) > 0.5) {
      ctx.beginPath();
      ctx.moveTo(start.x * width, start.y * height);
      ctx.lineTo(end.x * width, end.y * height);
      ctx.stroke();
    }
  }

  // Draw joints
  for (let i = 0; i < landmarks.length; i++) {
    const landmark = landmarks[i];
    if (landmark && (landmark.visibility || 0) > 0.5) {
      const x = landmark.x * width;
      const y = landmark.y * height;

      // Check if this joint should be highlighted
      const isHighlighted = highlightJoints.includes(i);

      ctx.beginPath();
      ctx.arc(x, y, isHighlighted ? pointRadius * 1.5 : pointRadius, 0, 2 * Math.PI);
      ctx.fillStyle = isHighlighted ? highlightColor : pointColor;
      ctx.fill();

      if (isHighlighted) {
        ctx.strokeStyle = highlightColor;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }
}

/**
 * Draw angle arc at a joint
 */
export function drawAngleArc(
  ctx: CanvasRenderingContext2D,
  vertex: Landmark,
  angle: number,
  width: number,
  height: number,
  color: string = '#FFD700'
): void {
  const x = vertex.x * width;
  const y = vertex.y * height;
  const radius = 30;

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, (angle * Math.PI) / 180);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw angle text
  ctx.font = '14px Arial';
  ctx.fillStyle = color;
  ctx.fillText(`${Math.round(angle)}°`, x + radius + 5, y);
}

/**
 * Get joints to highlight based on correction body part
 */
export function getJointsToHighlight(bodyPart: string): number[] {
  const jointMap: Record<string, number[]> = {
    knees: [POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.RIGHT_KNEE],
    leftKnee: [POSE_LANDMARKS.LEFT_KNEE],
    rightKnee: [POSE_LANDMARKS.RIGHT_KNEE],
    hips: [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP],
    spine: [
      POSE_LANDMARKS.LEFT_SHOULDER,
      POSE_LANDMARKS.RIGHT_SHOULDER,
      POSE_LANDMARKS.LEFT_HIP,
      POSE_LANDMARKS.RIGHT_HIP,
    ],
    shoulders: [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER],
    arms: [
      POSE_LANDMARKS.LEFT_SHOULDER,
      POSE_LANDMARKS.RIGHT_SHOULDER,
      POSE_LANDMARKS.LEFT_ELBOW,
      POSE_LANDMARKS.RIGHT_ELBOW,
      POSE_LANDMARKS.LEFT_WRIST,
      POSE_LANDMARKS.RIGHT_WRIST,
    ],
  };

  return jointMap[bodyPart] || [];
}

/**
 * Clear canvas
 */
export function clearCanvas(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.clearRect(0, 0, width, height);
}
