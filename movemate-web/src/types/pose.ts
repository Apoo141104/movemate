// MediaPipe Pose landmark indices
export const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
} as const;

export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface PoseResults {
  poseLandmarks?: Landmark[];
}

export interface AngleData {
  leftKnee: number;
  rightKnee: number;
  leftHip: number;
  rightHip: number;
  leftShoulder: number;
  rightShoulder: number;
  leftElbow: number;
  rightElbow: number;
  spineAngle: number;
}

export interface Correction {
  message: string;
  priority: 'high' | 'medium' | 'low';
  bodyPart: string;
}

export type RoutineType = 'squat' | 'warrior' | 'dance';

export interface RoutineConfig {
  id: RoutineType;
  name: string;
  description: string;
  icon: string;
  targetAngles: Partial<AngleData>;
  tolerances: Partial<AngleData>;
  checkpoints: string[];
}

export type CoachMood = 'idle' | 'happy' | 'encouraging' | 'correcting';

export interface RecordingState {
  isRecording: boolean;
  duration: number;
  maxDuration: number;
}

// Multi-person pose detection
export interface PersonPose {
  id: number;
  landmarks: Landmark[];
  color: string;
  partnerName: string;
}

export const PARTNER_CONFIGS = [
  { color: '#FF6B9D', name: 'Luna' },
  { color: '#6B9DFF', name: 'Nova' },
  { color: '#9DFF6B', name: 'Zara' },
  { color: '#FFD93D', name: 'Stella' },
  { color: '#FF9D6B', name: 'Maya' },
] as const;
