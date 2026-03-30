'use client';

import React from 'react';
import { RoutineType } from '@/types/pose';
import { ROUTINES } from '@/utils/routineConfigs';
import { ChevronRight } from 'lucide-react';

interface RoutineSelectorProps {
  selectedRoutine: RoutineType | null;
  onSelectRoutine: (routine: RoutineType) => void;
}

export const RoutineSelector: React.FC<RoutineSelectorProps> = ({
  selectedRoutine,
  onSelectRoutine,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {ROUTINES.map((routine) => (
        <button
          key={routine.id}
          onClick={() => onSelectRoutine(routine.id)}
          className={`relative p-6 rounded-2xl border-2 transition-all duration-200 text-left group hover:scale-[1.02] ${
            selectedRoutine === routine.id
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600'
          }`}
        >
          {/* Icon */}
          <div className="text-4xl mb-3">{routine.icon}</div>
          
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {routine.name}
          </h3>
          
          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {routine.description}
          </p>
          
          {/* Checkpoints preview */}
          <div className="flex flex-wrap gap-1">
            {routine.checkpoints.slice(0, 2).map((checkpoint, idx) => (
              <span
                key={idx}
                className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400"
              >
                {checkpoint}
              </span>
            ))}
          </div>

          {/* Selected indicator */}
          {selectedRoutine === routine.id && (
            <div className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-white" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

export default RoutineSelector;
