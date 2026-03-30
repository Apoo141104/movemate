'use client';

import React from 'react';
import { RecordingState } from '@/types/pose';
import { Circle, Square, Download, Clock } from 'lucide-react';

interface RecordingControlsProps {
  recordingState: RecordingState;
  hasRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onDownload: () => void;
}

export const RecordingControls: React.FC<RecordingControlsProps> = ({
  recordingState,
  hasRecording,
  onStartRecording,
  onStopRecording,
  onDownload,
}) => {
  const { isRecording, duration, maxDuration } = recordingState;
  const progress = (duration / maxDuration) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3">
      {/* Recording button */}
      {!isRecording ? (
        <button
          onClick={onStartRecording}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium transition-colors shadow-lg"
        >
          <Circle className="w-4 h-4 fill-current" />
          <span>Record</span>
        </button>
      ) : (
        <button
          onClick={onStopRecording}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-full font-medium transition-colors shadow-lg"
        >
          <Square className="w-4 h-4 fill-current" />
          <span>Stop</span>
        </button>
      )}

      {/* Recording timer */}
      {isRecording && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900/30 rounded-full">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <Clock className="w-4 h-4 text-red-600 dark:text-red-400" />
          <span className="text-sm font-mono text-red-600 dark:text-red-400">
            {formatTime(duration)} / {formatTime(maxDuration)}
          </span>
          {/* Progress bar */}
          <div className="w-16 h-1.5 bg-red-200 dark:bg-red-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-red-500 transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Download button */}
      {hasRecording && !isRecording && (
        <button
          onClick={onDownload}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full font-medium transition-colors shadow-lg"
        >
          <Download className="w-4 h-4" />
          <span>Download</span>
        </button>
      )}
    </div>
  );
};

export default RecordingControls;
