'use client';

import React, { useMemo } from 'react';
import { Landmark, POSE_LANDMARKS, PersonPose } from '@/types/pose';

interface DancePartnerProps {
  landmarks: Landmark[] | null;
  width?: number;
  height?: number;
  mirrored?: boolean;
  color?: string;
  partnerName?: string;
}

interface MultiDancePartnersProps {
  poses: PersonPose[];
  width?: number;
  height?: number;
}

// Connections for drawing the stick figure
const BODY_CONNECTIONS: [number, number][] = [
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

export const DancePartner: React.FC<DancePartnerProps> = ({
  landmarks,
  width = 300,
  height = 400,
  mirrored = true,
  color = '#FF6B9D',
  partnerName = 'Dance Partner',
}) => {
  // Process landmarks to fit the partner view
  const processedLandmarks = useMemo(() => {
    if (!landmarks || landmarks.length === 0) return null;

    // Find bounding box of the pose
    let minX = 1, maxX = 0, minY = 1, maxY = 0;
    const visibleLandmarks = landmarks.filter(l => (l.visibility || 0) > 0.5);
    
    if (visibleLandmarks.length === 0) return null;

    visibleLandmarks.forEach(l => {
      minX = Math.min(minX, l.x);
      maxX = Math.max(maxX, l.x);
      minY = Math.min(minY, l.y);
      maxY = Math.max(maxY, l.y);
    });

    // Add padding
    const padding = 0.1;
    minX = Math.max(0, minX - padding);
    maxX = Math.min(1, maxX + padding);
    minY = Math.max(0, minY - padding);
    maxY = Math.min(1, maxY + padding);

    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;

    // Normalize and optionally mirror
    return landmarks.map(l => {
      let x = (l.x - minX) / rangeX;
      if (mirrored) x = 1 - x;
      
      return {
        ...l,
        x: x * width,
        y: ((l.y - minY) / rangeY) * height,
      };
    });
  }, [landmarks, width, height, mirrored]);

  // Get head position (average of ears and nose)
  const headPosition = useMemo(() => {
    if (!processedLandmarks) return null;
    
    const nose = processedLandmarks[POSE_LANDMARKS.NOSE];
    const leftEar = processedLandmarks[POSE_LANDMARKS.LEFT_EAR];
    const rightEar = processedLandmarks[POSE_LANDMARKS.RIGHT_EAR];
    
    if (!nose || (nose.visibility || 0) < 0.5) return null;
    
    return {
      x: nose.x,
      y: nose.y - 20, // Offset head above nose
    };
  }, [processedLandmarks]);

  if (!processedLandmarks || !headPosition) {
    // Show idle partner when no pose detected
    return (
      <div className="flex flex-col items-center">
        <div 
          className="relative rounded-2xl overflow-hidden"
          style={{ width, height, background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}
        >
          {/* Idle state - simple figure */}
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
            {/* Head */}
            <circle cx={width/2} cy={80} r={30} fill={color} opacity={0.6} />
            {/* Body */}
            <line x1={width/2} y1={110} x2={width/2} y2={220} stroke={color} strokeWidth={4} opacity={0.6} />
            {/* Arms */}
            <line x1={width/2} y1={140} x2={width/2-50} y2={180} stroke={color} strokeWidth={4} opacity={0.6} />
            <line x1={width/2} y1={140} x2={width/2+50} y2={180} stroke={color} strokeWidth={4} opacity={0.6} />
            {/* Legs */}
            <line x1={width/2} y1={220} x2={width/2-40} y2={320} stroke={color} strokeWidth={4} opacity={0.6} />
            <line x1={width/2} y1={220} x2={width/2+40} y2={320} stroke={color} strokeWidth={4} opacity={0.6} />
            
            {/* Waiting text */}
            <text x={width/2} y={height - 30} textAnchor="middle" fill="white" fontSize="14" opacity={0.7}>
              Waiting for you...
            </text>
          </svg>
        </div>
        <p className="mt-2 text-sm font-medium text-gray-400">{partnerName}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div 
        className="relative rounded-2xl overflow-hidden shadow-xl"
        style={{ width, height, background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}
      >
        {/* Glow effect behind partner */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at ${headPosition.x}px ${headPosition.y}px, ${color}40 0%, transparent 50%)`,
          }}
        />
        
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          {/* Draw body connections */}
          {BODY_CONNECTIONS.map(([startIdx, endIdx], idx) => {
            const start = processedLandmarks[startIdx];
            const end = processedLandmarks[endIdx];
            
            if (!start || !end) return null;
            if ((start.visibility || 0) < 0.5 || (end.visibility || 0) < 0.5) return null;
            
            return (
              <line
                key={idx}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke={color}
                strokeWidth={6}
                strokeLinecap="round"
                style={{
                  filter: `drop-shadow(0 0 8px ${color})`,
                }}
              />
            );
          })}
          
          {/* Draw joints */}
          {[
            POSE_LANDMARKS.LEFT_SHOULDER,
            POSE_LANDMARKS.RIGHT_SHOULDER,
            POSE_LANDMARKS.LEFT_ELBOW,
            POSE_LANDMARKS.RIGHT_ELBOW,
            POSE_LANDMARKS.LEFT_WRIST,
            POSE_LANDMARKS.RIGHT_WRIST,
            POSE_LANDMARKS.LEFT_HIP,
            POSE_LANDMARKS.RIGHT_HIP,
            POSE_LANDMARKS.LEFT_KNEE,
            POSE_LANDMARKS.RIGHT_KNEE,
            POSE_LANDMARKS.LEFT_ANKLE,
            POSE_LANDMARKS.RIGHT_ANKLE,
          ].map((idx) => {
            const landmark = processedLandmarks[idx];
            if (!landmark || (landmark.visibility || 0) < 0.5) return null;
            
            return (
              <circle
                key={idx}
                cx={landmark.x}
                cy={landmark.y}
                r={8}
                fill={color}
                style={{
                  filter: `drop-shadow(0 0 6px ${color})`,
                }}
              />
            );
          })}
          
          {/* Draw head */}
          <circle
            cx={headPosition.x}
            cy={headPosition.y}
            r={35}
            fill={color}
            style={{
              filter: `drop-shadow(0 0 12px ${color})`,
            }}
          />
          
          {/* Face features */}
          <circle cx={headPosition.x - 10} cy={headPosition.y - 5} r={5} fill="#1a1a2e" />
          <circle cx={headPosition.x + 10} cy={headPosition.y - 5} r={5} fill="#1a1a2e" />
          <path
            d={`M ${headPosition.x - 12} ${headPosition.y + 10} Q ${headPosition.x} ${headPosition.y + 20} ${headPosition.x + 12} ${headPosition.y + 10}`}
            stroke="#1a1a2e"
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Hands */}
          {[POSE_LANDMARKS.LEFT_WRIST, POSE_LANDMARKS.RIGHT_WRIST].map((idx) => {
            const wrist = processedLandmarks[idx];
            if (!wrist || (wrist.visibility || 0) < 0.5) return null;
            
            return (
              <circle
                key={`hand-${idx}`}
                cx={wrist.x}
                cy={wrist.y}
                r={12}
                fill={color}
                style={{
                  filter: `drop-shadow(0 0 8px ${color})`,
                }}
              />
            );
          })}
        </svg>
        
        {/* Dance particles effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-pulse"
              style={{
                backgroundColor: color,
                opacity: 0.4,
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
      <p className="mt-2 text-sm font-medium text-pink-400">{partnerName} 💃</p>
    </div>
  );
};

// Multi-person dance partners component
export const MultiDancePartners: React.FC<MultiDancePartnersProps> = ({
  poses,
  width = 600,
  height = 400,
}) => {
  if (poses.length === 0) {
    return (
      <div 
        className="relative rounded-2xl overflow-hidden"
        style={{ width, height, background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-6xl mb-4">👯‍♀️</div>
          <p className="text-white/70 text-center px-4">
            Waiting for dancers...<br />
            <span className="text-sm">Get in frame to start the party!</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative rounded-2xl overflow-hidden shadow-xl"
      style={{ width, height, background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}
    >
      {/* Background glow effects for each person */}
      {poses.map((pose, idx) => {
        const centerX = (idx + 1) / (poses.length + 1);
        return (
          <div
            key={`glow-${pose.id}`}
            className="absolute inset-0 opacity-20"
            style={{
              background: `radial-gradient(circle at ${centerX * 100}% 50%, ${pose.color}60 0%, transparent 40%)`,
            }}
          />
        );
      })}

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        {poses.map((pose, poseIdx) => {
          const landmarks = pose.landmarks;
          if (!landmarks || landmarks.length === 0) return null;

          // Calculate position offset for each person
          const sectionWidth = width / poses.length;
          const offsetX = sectionWidth * poseIdx + sectionWidth / 2;

          // Find bounding box
          let minX = 1, maxX = 0, minY = 1, maxY = 0;
          const visibleLandmarks = landmarks.filter(l => (l.visibility || 0) > 0.3);
          
          if (visibleLandmarks.length < 5) return null;

          visibleLandmarks.forEach(l => {
            minX = Math.min(minX, l.x);
            maxX = Math.max(maxX, l.x);
            minY = Math.min(minY, l.y);
            maxY = Math.max(maxY, l.y);
          });

          const padding = 0.1;
          minX = Math.max(0, minX - padding);
          maxX = Math.min(1, maxX + padding);
          minY = Math.max(0, minY - padding);
          maxY = Math.min(1, maxY + padding);

          const rangeX = maxX - minX || 1;
          const rangeY = maxY - minY || 1;
          const scale = Math.min(sectionWidth * 0.8, height * 0.8);

          // Process landmarks for this person
          const processed = landmarks.map(l => {
            const x = ((1 - ((l.x - minX) / rangeX)) - 0.5) * scale + offsetX; // Mirrored
            const y = ((l.y - minY) / rangeY) * scale + (height - scale) / 2;
            return { ...l, x, y };
          });

          const nose = processed[POSE_LANDMARKS.NOSE];
          const headPos = nose && (nose.visibility || 0) > 0.3 
            ? { x: nose.x, y: nose.y - 15 } 
            : null;

          return (
            <g key={`person-${pose.id}`}>
              {/* Body connections */}
              {BODY_CONNECTIONS.map(([startIdx, endIdx], idx) => {
                const start = processed[startIdx];
                const end = processed[endIdx];
                
                if (!start || !end) return null;
                if ((start.visibility || 0) < 0.3 || (end.visibility || 0) < 0.3) return null;
                
                return (
                  <line
                    key={`line-${pose.id}-${idx}`}
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke={pose.color}
                    strokeWidth={5}
                    strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 6px ${pose.color})` }}
                  />
                );
              })}

              {/* Joints */}
              {[
                POSE_LANDMARKS.LEFT_SHOULDER,
                POSE_LANDMARKS.RIGHT_SHOULDER,
                POSE_LANDMARKS.LEFT_ELBOW,
                POSE_LANDMARKS.RIGHT_ELBOW,
                POSE_LANDMARKS.LEFT_WRIST,
                POSE_LANDMARKS.RIGHT_WRIST,
                POSE_LANDMARKS.LEFT_HIP,
                POSE_LANDMARKS.RIGHT_HIP,
                POSE_LANDMARKS.LEFT_KNEE,
                POSE_LANDMARKS.RIGHT_KNEE,
                POSE_LANDMARKS.LEFT_ANKLE,
                POSE_LANDMARKS.RIGHT_ANKLE,
              ].map((jointIdx) => {
                const joint = processed[jointIdx];
                if (!joint || (joint.visibility || 0) < 0.3) return null;
                
                return (
                  <circle
                    key={`joint-${pose.id}-${jointIdx}`}
                    cx={joint.x}
                    cy={joint.y}
                    r={6}
                    fill={pose.color}
                    style={{ filter: `drop-shadow(0 0 4px ${pose.color})` }}
                  />
                );
              })}

              {/* Head */}
              {headPos && (
                <>
                  <circle
                    cx={headPos.x}
                    cy={headPos.y}
                    r={25}
                    fill={pose.color}
                    style={{ filter: `drop-shadow(0 0 10px ${pose.color})` }}
                  />
                  {/* Face */}
                  <circle cx={headPos.x - 7} cy={headPos.y - 3} r={4} fill="#1a1a2e" />
                  <circle cx={headPos.x + 7} cy={headPos.y - 3} r={4} fill="#1a1a2e" />
                  <path
                    d={`M ${headPos.x - 8} ${headPos.y + 8} Q ${headPos.x} ${headPos.y + 15} ${headPos.x + 8} ${headPos.y + 8}`}
                    stroke="#1a1a2e"
                    strokeWidth={2}
                    fill="none"
                    strokeLinecap="round"
                  />
                </>
              )}

              {/* Name label */}
              <text
                x={offsetX}
                y={height - 15}
                textAnchor="middle"
                fill={pose.color}
                fontSize="12"
                fontWeight="bold"
                style={{ filter: `drop-shadow(0 0 4px ${pose.color})` }}
              >
                {pose.partnerName}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Particle effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {poses.flatMap((pose, poseIdx) => 
          [...Array(3)].map((_, i) => (
            <div
              key={`particle-${poseIdx}-${i}`}
              className="absolute w-2 h-2 rounded-full animate-pulse"
              style={{
                backgroundColor: pose.color,
                opacity: 0.5,
                left: `${(poseIdx / poses.length) * 80 + 10 + Math.random() * 15}%`,
                top: `${20 + Math.random() * 60}%`,
                animationDelay: `${(poseIdx * 3 + i) * 0.15}s`,
              }}
            />
          ))
        )}
      </div>

      {/* People count badge */}
      <div className="absolute top-3 right-3 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full">
        <span className="text-white text-sm font-medium">
          {poses.length} dancer{poses.length !== 1 ? 's' : ''} 🎉
        </span>
      </div>
    </div>
  );
};

export default DancePartner;
