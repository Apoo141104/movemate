'use client';

import React, { useState, useEffect } from 'react';
import { Camera, CheckCircle, AlertCircle, User, Lightbulb } from 'lucide-react';

interface CalibrationGuideProps {
  isVisible: boolean;
  hasLandmarks: boolean;
  onComplete: () => void;
}

const CALIBRATION_TIPS = [
  'Stand about 6-8 feet from your camera',
  'Make sure your full body is visible',
  'Ensure good lighting (avoid backlight)',
  'Wear fitted clothing for better detection',
];

export const CalibrationGuide: React.FC<CalibrationGuideProps> = ({
  isVisible,
  hasLandmarks,
  onComplete,
}) => {
  const [currentTip, setCurrentTip] = useState(0);
  const [calibrationProgress, setCalibrationProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % CALIBRATION_TIPS.length);
    }, 3000);

    return () => clearInterval(tipInterval);
  }, [isVisible]);

  useEffect(() => {
    if (hasLandmarks && isVisible) {
      const progressInterval = setInterval(() => {
        setCalibrationProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setTimeout(onComplete, 500);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      return () => clearInterval(progressInterval);
    } else {
      setCalibrationProgress(0);
    }
  }, [hasLandmarks, isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <Camera className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Camera Calibration
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Position yourself for best results
            </p>
          </div>
        </div>

        {/* Body outline guide */}
        <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-xl mb-6 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Silhouette outline */}
              <User className="w-32 h-32 text-gray-300 dark:text-gray-600" strokeWidth={1} />
              
              {/* Detection status indicator */}
              <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center ${
                hasLandmarks 
                  ? 'bg-green-500' 
                  : 'bg-yellow-500 animate-pulse'
              }`}>
                {hasLandmarks ? (
                  <CheckCircle className="w-5 h-5 text-white" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-white" />
                )}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          {hasLandmarks && (
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-200 dark:bg-gray-600">
              <div 
                className="h-full bg-green-500 transition-all duration-200"
                style={{ width: `${calibrationProgress}%` }}
              />
            </div>
          )}
        </div>

        {/* Status message */}
        <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${
          hasLandmarks 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
            : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
        }`}>
          {hasLandmarks ? (
            <>
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">
                {calibrationProgress < 100 
                  ? 'Hold still... Calibrating...' 
                  : 'Calibration complete!'}
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Looking for you...</span>
            </>
          )}
        </div>

        {/* Tips carousel */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Lightbulb className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Tip {currentTip + 1}/{CALIBRATION_TIPS.length}
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              {CALIBRATION_TIPS[currentTip]}
            </p>
          </div>
        </div>

        {/* Skip button */}
        {hasLandmarks && (
          <button
            onClick={onComplete}
            className="w-full mt-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors"
          >
            Start Workout
          </button>
        )}
      </div>
    </div>
  );
};

export default CalibrationGuide;
