'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Landmark, RoutineType, Correction, AngleData, CoachMood, PersonPose, PARTNER_CONFIGS } from '@/types/pose';
import { useWebcam } from '@/hooks/useWebcam';
import { usePoseDetection } from '@/hooks/usePoseDetection';
import { useMultiPoseDetection } from '@/hooks/useMultiPoseDetection';
import { useRecording } from '@/hooks/useRecording';
import { analyzeRoutine, getRoutineById } from '@/utils/routineConfigs';
import CameraPermission from './CameraPermission';
import CalibrationGuide from './CalibrationGuide';
import PoseCanvas, { PoseCanvasHandle } from './PoseCanvas';
import CoachCharacter from './CoachCharacter';
import FeedbackDisplay from './FeedbackDisplay';
import RecordingControls from './RecordingControls';
import DancePartner, { MultiDancePartners } from './DancePartner';
import { ArrowLeft, Activity, ShieldCheck, Users } from 'lucide-react';

interface WorkoutSessionProps {
  routineId: RoutineType;
  onBack: () => void;
}

export const WorkoutSession: React.FC<WorkoutSessionProps> = ({
  routineId,
  onBack,
}) => {
  const routine = getRoutineById(routineId);
  const poseCanvasRef = useRef<PoseCanvasHandle>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  
  // State
  const [isCalibrating, setIsCalibrating] = useState(true);
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [angles, setAngles] = useState<AngleData | null>(null);
  const [score, setScore] = useState(0);
  const [coachMood, setCoachMood] = useState<CoachMood>('idle');
  const [coachMessage, setCoachMessage] = useState('');
  const [danceFrame, setDanceFrame] = useState(0);
  const [multiPoses, setMultiPoses] = useState<PersonPose[]>([]);

  // Hooks
  const {
    videoRef: setVideoRef,
    permissionState,
    isReady: isCameraReady,
    error: cameraError,
    requestPermission,
  } = useWebcam({ width: 1280, height: 720 });

  // Combined ref callback to store element and pass to useWebcam
  const videoRefCallback = useCallback((node: HTMLVideoElement | null) => {
    videoElementRef.current = node;
    setVideoRef(node);
  }, [setVideoRef]);

  const handlePoseResults = useCallback((landmarks: Landmark[]) => {
    if (isCalibrating) return;

    const result = analyzeRoutine(routineId, landmarks);
    setCorrections(result.corrections);
    setAngles(result.angles);
    setScore(result.score);

    // Update coach mood based on score
    if (result.score >= 80) {
      setCoachMood('happy');
      setCoachMessage('Perfect form! Keep it up!');
    } else if (result.score >= 50) {
      setCoachMood('encouraging');
      setCoachMessage(result.corrections[0]?.message || 'You\'re doing great!');
    } else {
      setCoachMood('correcting');
      setCoachMessage(result.corrections[0]?.message || 'Let\'s adjust your form');
    }
  }, [routineId, isCalibrating]);

  // Use single-person pose detection for non-dance modes
  const {
    landmarks,
    isLoading: isPoseLoading,
    error: poseError,
    fps,
  } = usePoseDetection({
    videoRef: videoElementRef,
    onResults: handlePoseResults,
    enabled: isCameraReady && permissionState === 'granted' && routineId !== 'dance',
  });

  // Use multi-person pose detection for dance mode
  const handleMultiPoseResults = useCallback((poses: PersonPose[]) => {
    if (isCalibrating) return;
    setMultiPoses(poses);
  }, [isCalibrating]);

  const {
    poses: detectedPoses,
    isLoading: isMultiPoseLoading,
    error: multiPoseError,
    fps: multiFps,
    peopleCount,
  } = useMultiPoseDetection({
    videoRef: videoElementRef,
    onResults: handleMultiPoseResults,
    enabled: isCameraReady && permissionState === 'granted' && routineId === 'dance',
    maxPeople: 5,
  });

  // Combine loading/error/fps states based on mode
  const isDetectionLoading = routineId === 'dance' ? isMultiPoseLoading : isPoseLoading;
  const detectionError = routineId === 'dance' ? multiPoseError : poseError;
  const currentFps = routineId === 'dance' ? multiFps : fps;
  
  // For calibration, check detection based on mode
  const hasDetection = routineId === 'dance' 
    ? (detectedPoses && detectedPoses.length > 0)
    : (landmarks && landmarks.length > 0);

  const {
    recordingState,
    startRecording,
    stopRecording,
    downloadRecording,
    recordedBlob,
  } = useRecording({ maxDuration: 20 });

  // Dance mode animation
  useEffect(() => {
    if (routineId === 'dance' && !isCalibrating) {
      const interval = setInterval(() => {
        setDanceFrame(prev => prev + 1);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [routineId, isCalibrating]);

  // Handle recording start
  const handleStartRecording = () => {
    const canvas = poseCanvasRef.current?.getCanvas();
    if (canvas) {
      startRecording(canvas);
    }
  };

  // Show camera permission screen if needed
  if (permissionState !== 'granted') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to routines</span>
        </button>
        <CameraPermission
          permissionState={permissionState}
          error={cameraError}
          onRequestPermission={requestPermission}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{routine?.icon}</span>
              <h1 className="font-bold text-lg">{routine?.name}</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* FPS indicator */}
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <Activity className="w-4 h-4" />
              <span>{currentFps} FPS</span>
            </div>
            
            {/* People count for dance mode */}
            {routineId === 'dance' && !isCalibrating && (
              <div className="flex items-center gap-1 px-2 py-1 bg-pink-900/30 rounded-full text-xs text-pink-400">
                <Users className="w-3 h-3" />
                <span>{peopleCount} dancer{peopleCount !== 1 ? 's' : ''}</span>
              </div>
            )}
            
            {/* Privacy badge */}
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-green-900/30 rounded-full text-xs text-green-400">
              <ShieldCheck className="w-3 h-3" />
              <span>Local only</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-16 pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4">
            {/* Video/Canvas area */}
            <div className="lg:col-span-3 relative">
              <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
                {/* Hidden video element */}
                <video
                  ref={videoRefCallback}
                  autoPlay
                  playsInline
                  muted
                  className="hidden"
                />
                
                {/* Pose canvas with overlay */}
                <PoseCanvas
                  ref={poseCanvasRef}
                  videoRef={videoElementRef}
                  landmarks={landmarks}
                  corrections={corrections}
                  width={1280}
                  height={720}
                  mirrored={true}
                />

                {/* Loading overlay */}
                {(isDetectionLoading || !isCameraReady) && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-gray-300">
                        {!isCameraReady ? 'Starting camera...' : 'Loading pose detection...'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Calibration guide */}
                <CalibrationGuide
                  isVisible={isCalibrating && isCameraReady && !isDetectionLoading}
                  hasLandmarks={!!hasDetection}
                  onComplete={() => setIsCalibrating(false)}
                />

                {/* Recording indicator */}
                {recordingState.isRecording && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-red-600 rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-sm font-medium">REC</span>
                  </div>
                )}

                {/* Error display */}
                {detectionError && (
                  <div className="absolute bottom-4 left-4 right-4 p-3 bg-red-900/80 rounded-lg text-sm">
                    {detectionError}
                  </div>
                )}
              </div>

              {/* Recording controls */}
              <div className="mt-4 flex justify-center">
                <RecordingControls
                  recordingState={recordingState}
                  hasRecording={!!recordedBlob}
                  onStartRecording={handleStartRecording}
                  onStopRecording={stopRecording}
                  onDownload={downloadRecording}
                />
              </div>
            </div>

            {/* Sidebar - Coach/Partner and Feedback */}
            <div className="lg:col-span-1 space-y-4">
              {/* Multi Dance Partners - only shown in dance mode */}
              {routineId === 'dance' && !isCalibrating && (
                <div className="bg-gray-800 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-pink-400" />
                    <h3 className="text-sm font-medium text-gray-400">
                      Dance Crew {peopleCount > 0 && `(${peopleCount})`}
                    </h3>
                  </div>
                  <MultiDancePartners
                    poses={multiPoses}
                    width={280}
                    height={380}
                  />
                </div>
              )}

              {/* Coach character - shown for non-dance modes or during calibration */}
              {(routineId !== 'dance' || isCalibrating) && (
                <div className="bg-gray-800 rounded-2xl p-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Your Coach</h3>
                  <CoachCharacter
                    mood={coachMood}
                    message={coachMessage}
                    routineId={routineId}
                    danceFrame={routineId === 'dance' ? danceFrame : undefined}
                  />
                </div>
              )}

              {/* Feedback display */}
              {!isCalibrating && (
                <div className="bg-gray-800 rounded-2xl p-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">
                    {routineId === 'dance' ? 'Dance Party' : 'Feedback'}
                  </h3>
                  {routineId === 'dance' ? (
                    <div className="text-center">
                      <div className="text-4xl mb-2">🎉</div>
                      <p className="text-sm text-gray-300">
                        {peopleCount === 0 && 'Get in frame to start!'}
                        {peopleCount === 1 && 'Dancing solo! Invite friends!'}
                        {peopleCount === 2 && 'Duo dance! 💃🕺'}
                        {peopleCount >= 3 && `Party of ${peopleCount}! 🎊`}
                      </p>
                      <div className="mt-3 flex justify-center gap-1">
                        {[...Array(Math.max(5, peopleCount * 2))].map((_, i) => (
                          <div
                            key={i}
                            className="w-2 rounded-full animate-pulse"
                            style={{
                              height: `${20 + Math.random() * 30}px`,
                              backgroundColor: multiPoses[i % multiPoses.length]?.color || '#FF6B9D',
                              animationDelay: `${i * 0.1}s`,
                            }}
                          />
                        ))}
                      </div>
                      {peopleCount > 1 && (
                        <p className="mt-3 text-xs text-pink-400">
                          Each dancer has their own partner!
                        </p>
                      )}
                    </div>
                  ) : (
                    <FeedbackDisplay
                      corrections={corrections}
                      score={score}
                      angles={angles || undefined}
                      showAngles={false}
                    />
                  )}
                </div>
              )}

              {/* Routine checkpoints */}
              <div className="bg-gray-800 rounded-2xl p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-3">
                  {routineId === 'dance' ? 'Dance Tips' : 'Checkpoints'}
                </h3>
                <ul className="space-y-2">
                  {routine?.checkpoints.map((checkpoint, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <div className={`w-2 h-2 rounded-full ${
                        routineId === 'dance' ? 'bg-pink-500' : (score >= 80 ? 'bg-green-500' : 'bg-gray-600')
                      }`} />
                      <span className="text-gray-300">{checkpoint}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WorkoutSession;
