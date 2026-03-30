import { RoutineConfig, AngleData, Correction, Landmark, POSE_LANDMARKS } from '@/types/pose';
import { calculateAllAngles, isAngleWithinTolerance, getAngleDeviation } from './angleCalculations';

export const ROUTINES: RoutineConfig[] = [
  {
    id: 'squat',
    name: 'Squat Form Check',
    description: 'Perfect your squat form with real-time feedback on knee and hip angles',
    icon: '🏋️',
    targetAngles: {
      leftKnee: 90,
      rightKnee: 90,
      leftHip: 90,
      rightHip: 90,
      spineAngle: 0,
    },
    tolerances: {
      leftKnee: 15,
      rightKnee: 15,
      leftHip: 20,
      rightHip: 20,
      spineAngle: 15,
    },
    checkpoints: [
      'Knees bent at 90°',
      'Back straight',
      'Knees over toes',
      'Hips back',
    ],
  },
  {
    id: 'warrior',
    name: 'Warrior Pose',
    description: 'Master the Warrior II yoga pose with alignment guidance',
    icon: '🧘',
    targetAngles: {
      leftKnee: 90,
      rightKnee: 170,
      leftShoulder: 90,
      rightShoulder: 90,
      spineAngle: 0,
    },
    tolerances: {
      leftKnee: 15,
      rightKnee: 15,
      leftShoulder: 20,
      rightShoulder: 20,
      spineAngle: 10,
    },
    checkpoints: [
      'Front knee at 90°',
      'Back leg straight',
      'Arms parallel to ground',
      'Torso upright',
    ],
  },
  {
    id: 'dance',
    name: 'Group Dance Party',
    description: 'Dance with friends! Each person gets their own virtual dance partner.',
    icon: '👯',
    targetAngles: {},
    tolerances: {},
    checkpoints: [
      'Supports up to 5 dancers!',
      'Each person gets a partner',
      'Different colors for each',
      'Record your dance party!',
    ],
  },
];

/**
 * Analyze squat form and return corrections
 */
function analyzeSquat(angles: AngleData, config: RoutineConfig): Correction[] {
  const corrections: Correction[] = [];
  const { targetAngles, tolerances } = config;

  // Check knee angles
  const avgKneeAngle = (angles.leftKnee + angles.rightKnee) / 2;
  if (avgKneeAngle > (targetAngles.leftKnee || 90) + (tolerances.leftKnee || 15)) {
    corrections.push({
      message: 'Go lower! Bend your knees more',
      priority: 'high',
      bodyPart: 'knees',
    });
  } else if (avgKneeAngle < (targetAngles.leftKnee || 90) - (tolerances.leftKnee || 15)) {
    corrections.push({
      message: 'Too deep! Come up a bit',
      priority: 'medium',
      bodyPart: 'knees',
    });
  }

  // Check spine alignment
  if (angles.spineAngle > (tolerances.spineAngle || 15)) {
    corrections.push({
      message: 'Keep your back straight',
      priority: 'high',
      bodyPart: 'spine',
    });
  }

  // Check hip angles
  const avgHipAngle = (angles.leftHip + angles.rightHip) / 2;
  if (avgHipAngle > 120) {
    corrections.push({
      message: 'Push your hips back more',
      priority: 'medium',
      bodyPart: 'hips',
    });
  }

  return corrections;
}

/**
 * Analyze warrior pose and return corrections
 */
function analyzeWarrior(angles: AngleData, config: RoutineConfig): Correction[] {
  const corrections: Correction[] = [];
  const { targetAngles, tolerances } = config;

  // Check front knee (assuming left leg forward)
  if (!isAngleWithinTolerance(angles.leftKnee, targetAngles.leftKnee || 90, tolerances.leftKnee || 15)) {
    const deviation = getAngleDeviation(angles.leftKnee, targetAngles.leftKnee || 90);
    if (deviation > 0) {
      corrections.push({
        message: 'Bend your front knee more',
        priority: 'high',
        bodyPart: 'leftKnee',
      });
    } else {
      corrections.push({
        message: 'Straighten your front knee slightly',
        priority: 'medium',
        bodyPart: 'leftKnee',
      });
    }
  }

  // Check back leg
  if (angles.rightKnee < 150) {
    corrections.push({
      message: 'Straighten your back leg',
      priority: 'high',
      bodyPart: 'rightKnee',
    });
  }

  // Check arms
  const avgShoulderAngle = (angles.leftShoulder + angles.rightShoulder) / 2;
  if (Math.abs(avgShoulderAngle - 90) > 25) {
    corrections.push({
      message: 'Extend arms parallel to the ground',
      priority: 'medium',
      bodyPart: 'shoulders',
    });
  }

  // Check spine
  if (angles.spineAngle > (tolerances.spineAngle || 10)) {
    corrections.push({
      message: 'Keep your torso upright',
      priority: 'medium',
      bodyPart: 'spine',
    });
  }

  return corrections;
}

/**
 * Analyze dance mirroring - simplified scoring based on movement
 */
function analyzeDance(angles: AngleData, targetPose: AngleData | null): Correction[] {
  const corrections: Correction[] = [];
  
  if (!targetPose) {
    return [{
      message: 'Follow the coach!',
      priority: 'low',
      bodyPart: 'general',
    }];
  }

  // Compare arm positions
  const armDiff = Math.abs(angles.leftShoulder - targetPose.leftShoulder) + 
                  Math.abs(angles.rightShoulder - targetPose.rightShoulder);
  
  if (armDiff > 60) {
    corrections.push({
      message: 'Match the arm position!',
      priority: 'high',
      bodyPart: 'arms',
    });
  }

  return corrections;
}

/**
 * Main analysis function that routes to specific routine analyzers
 */
export function analyzeRoutine(
  routineId: string,
  landmarks: Landmark[],
  targetPose?: AngleData | null
): { corrections: Correction[]; angles: AngleData; score: number } {
  const angles = calculateAllAngles(landmarks);
  const config = ROUTINES.find(r => r.id === routineId);
  
  if (!config) {
    return { corrections: [], angles, score: 0 };
  }

  let corrections: Correction[] = [];

  switch (routineId) {
    case 'squat':
      corrections = analyzeSquat(angles, config);
      break;
    case 'warrior':
      corrections = analyzeWarrior(angles, config);
      break;
    case 'dance':
      corrections = analyzeDance(angles, targetPose || null);
      break;
  }

  // Sort by priority and limit to top 2
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  corrections.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  corrections = corrections.slice(0, 2);

  // Calculate score (0-100)
  const score = Math.max(0, 100 - corrections.length * 25 - 
    corrections.filter(c => c.priority === 'high').length * 15);

  return { corrections, angles, score };
}

/**
 * Get routine by ID
 */
export function getRoutineById(id: string): RoutineConfig | undefined {
  return ROUTINES.find(r => r.id === id);
}
