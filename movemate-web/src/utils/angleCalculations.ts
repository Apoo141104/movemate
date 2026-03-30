import { Landmark, POSE_LANDMARKS, AngleData } from '@/types/pose';

/**
 * Calculate angle between three points (in degrees)
 * Point B is the vertex of the angle
 */
export function calculateAngle(
  pointA: Landmark,
  pointB: Landmark,
  pointC: Landmark
): number {
  const radians =
    Math.atan2(pointC.y - pointB.y, pointC.x - pointB.x) -
    Math.atan2(pointA.y - pointB.y, pointA.x - pointB.x);
  
  let angle = Math.abs((radians * 180) / Math.PI);
  
  if (angle > 180) {
    angle = 360 - angle;
  }
  
  return angle;
}

/**
 * Calculate the angle of a line relative to vertical (spine alignment)
 */
export function calculateVerticalAngle(
  pointA: Landmark,
  pointB: Landmark
): number {
  const dx = pointB.x - pointA.x;
  const dy = pointB.y - pointA.y;
  const angle = Math.atan2(dx, -dy) * (180 / Math.PI);
  return Math.abs(angle);
}

/**
 * Get midpoint between two landmarks
 */
export function getMidpoint(pointA: Landmark, pointB: Landmark): Landmark {
  return {
    x: (pointA.x + pointB.x) / 2,
    y: (pointA.y + pointB.y) / 2,
    z: (pointA.z + pointB.z) / 2,
  };
}

/**
 * Calculate all relevant angles from pose landmarks
 */
export function calculateAllAngles(landmarks: Landmark[]): AngleData {
  const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
  const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
  const leftElbow = landmarks[POSE_LANDMARKS.LEFT_ELBOW];
  const rightElbow = landmarks[POSE_LANDMARKS.RIGHT_ELBOW];
  const leftWrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];
  const rightWrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST];
  const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
  const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
  const leftKnee = landmarks[POSE_LANDMARKS.LEFT_KNEE];
  const rightKnee = landmarks[POSE_LANDMARKS.RIGHT_KNEE];
  const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];
  const rightAnkle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE];

  // Knee angles (hip-knee-ankle)
  const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
  const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

  // Hip angles (shoulder-hip-knee)
  const leftHipAngle = calculateAngle(leftShoulder, leftHip, leftKnee);
  const rightHipAngle = calculateAngle(rightShoulder, rightHip, rightKnee);

  // Shoulder angles (elbow-shoulder-hip)
  const leftShoulderAngle = calculateAngle(leftElbow, leftShoulder, leftHip);
  const rightShoulderAngle = calculateAngle(rightElbow, rightShoulder, rightHip);

  // Elbow angles (shoulder-elbow-wrist)
  const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
  const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);

  // Spine angle (vertical alignment from hip midpoint to shoulder midpoint)
  const hipMidpoint = getMidpoint(leftHip, rightHip);
  const shoulderMidpoint = getMidpoint(leftShoulder, rightShoulder);
  const spineAngle = calculateVerticalAngle(hipMidpoint, shoulderMidpoint);

  return {
    leftKnee: leftKneeAngle,
    rightKnee: rightKneeAngle,
    leftHip: leftHipAngle,
    rightHip: rightHipAngle,
    leftShoulder: leftShoulderAngle,
    rightShoulder: rightShoulderAngle,
    leftElbow: leftElbowAngle,
    rightElbow: rightElbowAngle,
    spineAngle,
  };
}

/**
 * Check if an angle is within tolerance of target
 */
export function isAngleWithinTolerance(
  actual: number,
  target: number,
  tolerance: number
): boolean {
  return Math.abs(actual - target) <= tolerance;
}

/**
 * Get the deviation from target angle
 */
export function getAngleDeviation(actual: number, target: number): number {
  return actual - target;
}
