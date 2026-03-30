'use client';

import React from 'react';
import { Correction, AngleData } from '@/types/pose';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface FeedbackDisplayProps {
  corrections: Correction[];
  score: number;
  angles?: AngleData;
  showAngles?: boolean;
}

export const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({
  corrections,
  score,
  angles,
  showAngles = false,
}) => {
  const getScoreColor = () => {
    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLabel = () => {
    if (score >= 80) return 'Great form!';
    if (score >= 50) return 'Getting there!';
    return 'Keep trying!';
  };

  const getPriorityIcon = (priority: Correction['priority']) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <Info className="w-4 h-4 text-yellow-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getPriorityBg = (priority: Correction['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'medium':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <div className="space-y-3">
      {/* Score Display */}
      <div className="flex items-center justify-between bg-white/90 dark:bg-gray-800/90 rounded-xl p-3 shadow-lg">
        <div className="flex items-center gap-2">
          {score >= 80 ? (
            <CheckCircle className="w-6 h-6 text-green-500" />
          ) : (
            <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center">
              <span className="text-xs font-bold">{score}</span>
            </div>
          )}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {getScoreLabel()}
          </span>
        </div>
        <div className={`text-2xl font-bold ${getScoreColor()}`}>
          {score}%
        </div>
      </div>

      {/* Corrections */}
      {corrections.length > 0 && (
        <div className="space-y-2">
          {corrections.map((correction, index) => (
            <div
              key={index}
              className={`flex items-start gap-2 p-3 rounded-lg border ${getPriorityBg(correction.priority)}`}
            >
              {getPriorityIcon(correction.priority)}
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {correction.message}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Perfect form message */}
      {corrections.length === 0 && score >= 80 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            Perfect! Keep holding this position!
          </p>
        </div>
      )}

      {/* Debug: Show angles */}
      {showAngles && angles && (
        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-mono">
          <p className="font-bold mb-1">Angles (debug):</p>
          <div className="grid grid-cols-2 gap-1">
            <span>L Knee: {angles.leftKnee.toFixed(1)}°</span>
            <span>R Knee: {angles.rightKnee.toFixed(1)}°</span>
            <span>L Hip: {angles.leftHip.toFixed(1)}°</span>
            <span>R Hip: {angles.rightHip.toFixed(1)}°</span>
            <span>Spine: {angles.spineAngle.toFixed(1)}°</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackDisplay;
