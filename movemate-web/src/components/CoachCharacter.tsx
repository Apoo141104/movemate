'use client';

import React, { useEffect, useState } from 'react';
import { CoachMood } from '@/types/pose';

interface CoachCharacterProps {
  mood: CoachMood;
  message?: string;
  routineId?: string;
  danceFrame?: number;
}

// Simple SVG-based coach character with different expressions
const CoachSVG: React.FC<{ mood: CoachMood; danceFrame?: number }> = ({ mood, danceFrame = 0 }) => {
  const getMouthPath = () => {
    switch (mood) {
      case 'happy':
        return 'M 35 55 Q 50 70 65 55'; // Big smile
      case 'encouraging':
        return 'M 38 55 Q 50 62 62 55'; // Small smile
      case 'correcting':
        return 'M 38 58 Q 50 52 62 58'; // Slight frown
      default:
        return 'M 40 55 L 60 55'; // Neutral
    }
  };

  const getEyeStyle = () => {
    if (mood === 'happy') {
      return { cy: 38, rx: 4, ry: 2 }; // Happy squint
    }
    return { cy: 40, rx: 4, ry: 5 }; // Normal eyes
  };

  const getArmRotation = () => {
    if (danceFrame !== undefined && danceFrame > 0) {
      // Dance animation frames
      const frame = danceFrame % 4;
      switch (frame) {
        case 0: return { left: -30, right: 30 };
        case 1: return { left: -60, right: 60 };
        case 2: return { left: -30, right: 30 };
        case 3: return { left: 0, right: 0 };
      }
    }
    
    switch (mood) {
      case 'happy':
        return { left: -45, right: 45 }; // Arms up celebrating
      case 'encouraging':
        return { left: -20, right: 20 }; // Arms slightly raised
      case 'correcting':
        return { left: 10, right: -10 }; // Arms pointing
      default:
        return { left: 0, right: 0 }; // Arms down
    }
  };

  const eyeStyle = getEyeStyle();
  const armRotation = getArmRotation();
  const bodyColor = mood === 'happy' ? '#4ADE80' : mood === 'correcting' ? '#FCD34D' : '#60A5FA';

  return (
    <svg viewBox="0 0 100 140" className="w-full h-full">
      {/* Body */}
      <ellipse cx="50" cy="95" rx="25" ry="30" fill={bodyColor} />
      
      {/* Head */}
      <circle cx="50" cy="40" r="28" fill="#FBBF24" />
      
      {/* Eyes */}
      <ellipse cx="40" cy={eyeStyle.cy} rx={eyeStyle.rx} ry={eyeStyle.ry} fill="#1F2937" />
      <ellipse cx="60" cy={eyeStyle.cy} rx={eyeStyle.rx} ry={eyeStyle.ry} fill="#1F2937" />
      
      {/* Eye shine */}
      <circle cx="41" cy={eyeStyle.cy - 2} r="1.5" fill="white" />
      <circle cx="61" cy={eyeStyle.cy - 2} r="1.5" fill="white" />
      
      {/* Eyebrows */}
      {mood === 'correcting' && (
        <>
          <line x1="34" y1="30" x2="44" y2="33" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
          <line x1="56" y1="33" x2="66" y2="30" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      
      {/* Mouth */}
      <path d={getMouthPath()} stroke="#1F2937" strokeWidth="3" fill="none" strokeLinecap="round" />
      
      {/* Blush for happy */}
      {mood === 'happy' && (
        <>
          <ellipse cx="30" cy="48" rx="6" ry="3" fill="#FDA4AF" opacity="0.6" />
          <ellipse cx="70" cy="48" rx="6" ry="3" fill="#FDA4AF" opacity="0.6" />
        </>
      )}
      
      {/* Left Arm */}
      <g transform={`rotate(${armRotation.left}, 30, 80)`}>
        <rect x="15" y="75" width="12" height="35" rx="6" fill={bodyColor} />
        <circle cx="21" cy="112" r="8" fill="#FBBF24" />
      </g>
      
      {/* Right Arm */}
      <g transform={`rotate(${armRotation.right}, 70, 80)`}>
        <rect x="73" y="75" width="12" height="35" rx="6" fill={bodyColor} />
        <circle cx="79" cy="112" r="8" fill="#FBBF24" />
      </g>
      
      {/* Legs */}
      <rect x="35" y="115" width="10" height="20" rx="5" fill={bodyColor} />
      <rect x="55" y="115" width="10" height="20" rx="5" fill={bodyColor} />
      
      {/* Feet */}
      <ellipse cx="40" cy="137" rx="8" ry="4" fill="#1F2937" />
      <ellipse cx="60" cy="137" rx="8" ry="4" fill="#1F2937" />
    </svg>
  );
};

export const CoachCharacter: React.FC<CoachCharacterProps> = ({
  mood,
  message,
  routineId,
  danceFrame,
}) => {
  const [animatedMood, setAnimatedMood] = useState<CoachMood>(mood);
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    setAnimatedMood(mood);
    if (mood === 'happy') {
      setBounce(true);
      const timer = setTimeout(() => setBounce(false), 500);
      return () => clearTimeout(timer);
    }
  }, [mood]);

  const getMoodEmoji = () => {
    switch (mood) {
      case 'happy': return '🎉';
      case 'encouraging': return '💪';
      case 'correcting': return '👀';
      default: return '😊';
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        className={`w-24 h-32 md:w-32 md:h-44 transition-transform duration-300 ${
          bounce ? 'animate-bounce' : ''
        }`}
      >
        <CoachSVG mood={animatedMood} danceFrame={danceFrame} />
      </div>
      
      {message && (
        <div className="mt-2 px-4 py-2 bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-lg max-w-[200px]">
          <p className="text-sm font-medium text-center text-gray-800 dark:text-gray-200">
            {getMoodEmoji()} {message}
          </p>
        </div>
      )}
    </div>
  );
};

export default CoachCharacter;
