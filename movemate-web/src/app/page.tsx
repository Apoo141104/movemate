'use client';

import React, { useState } from 'react';
import { RoutineType } from '@/types/pose';
import RoutineSelector from '@/components/RoutineSelector';
import WorkoutSession from '@/components/WorkoutSession';
import { Activity, ShieldCheck, Smartphone, Monitor, Zap } from 'lucide-react';

type AppScreen = 'home' | 'workout';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home');
  const [selectedRoutine, setSelectedRoutine] = useState<RoutineType | null>(null);

  const handleSelectRoutine = (routine: RoutineType) => {
    setSelectedRoutine(routine);
    setCurrentScreen('workout');
  };

  const handleBackToHome = () => {
    setCurrentScreen('home');
    setSelectedRoutine(null);
  };

  if (currentScreen === 'workout' && selectedRoutine) {
    return <WorkoutSession routineId={selectedRoutine} onBack={handleBackToHome} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
          <div className="text-center">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                MoveMate Web
              </h1>
            </div>

            {/* Tagline */}
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
              Your AI-powered fitness coach that runs entirely in your browser. 
              Get real-time posture feedback with zero data uploads.
            </p>

            {/* Privacy badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full mb-12">
              <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                100% Private • Processed in your browser • No uploads required
              </span>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl -z-10" />
      </header>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
              <Monitor className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">
              Webcam Powered
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Uses your laptop webcam with MediaPipe AI for accurate pose detection
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">
              Real-time Feedback
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Instant corrections and a friendly coach to guide your form
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4">
              <Smartphone className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">
              Record & Share
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Record 10-20 second clips with skeleton overlay and download locally
            </p>
          </div>
        </div>
      </section>

      {/* Routine Selection */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Choose Your Routine
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Select a workout to get started with real-time pose analysis
          </p>
        </div>

        <RoutineSelector
          selectedRoutine={selectedRoutine}
          onSelectRoutine={handleSelectRoutine}
        />
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Activity className="w-5 h-5" />
              <span className="font-medium">MoveMate Web</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Built with Next.js, MediaPipe, and ❤️ • All processing happens locally
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
