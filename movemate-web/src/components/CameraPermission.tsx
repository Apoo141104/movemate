'use client';

import React from 'react';
import { Camera, ShieldCheck, AlertTriangle, RefreshCw } from 'lucide-react';
import { CameraPermissionState } from '@/hooks/useWebcam';

interface CameraPermissionProps {
  permissionState: CameraPermissionState;
  error: string | null;
  onRequestPermission: () => void;
}

export const CameraPermission: React.FC<CameraPermissionProps> = ({
  permissionState,
  error,
  onRequestPermission,
}) => {
  if (permissionState === 'granted') return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl">
      {/* Icon */}
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
        permissionState === 'denied' || permissionState === 'error'
          ? 'bg-red-100 dark:bg-red-900/30'
          : 'bg-blue-100 dark:bg-blue-900/30'
      }`}>
        {permissionState === 'denied' || permissionState === 'error' ? (
          <AlertTriangle className="w-10 h-10 text-red-500" />
        ) : (
          <Camera className="w-10 h-10 text-blue-500" />
        )}
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
        {permissionState === 'denied' 
          ? 'Camera Access Denied'
          : permissionState === 'error'
          ? 'Camera Error'
          : 'Camera Access Required'}
      </h2>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
        {error || 'MoveMate needs access to your camera to detect your poses and provide real-time feedback.'}
      </p>

      {/* Privacy notice */}
      <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-full mb-6">
        <ShieldCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
        <span className="text-sm text-green-700 dark:text-green-300 font-medium">
          Processed in your browser • No uploads
        </span>
      </div>

      {/* Action button */}
      <button
        onClick={onRequestPermission}
        className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors shadow-lg hover:shadow-xl"
      >
        {permissionState === 'denied' || permissionState === 'error' ? (
          <>
            <RefreshCw className="w-5 h-5" />
            <span>Try Again</span>
          </>
        ) : (
          <>
            <Camera className="w-5 h-5" />
            <span>Enable Camera</span>
          </>
        )}
      </button>

      {/* Help text for denied state */}
      {permissionState === 'denied' && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
          If the button doesn&apos;t work, please check your browser settings and allow camera access for this site.
        </p>
      )}
    </div>
  );
};

export default CameraPermission;
