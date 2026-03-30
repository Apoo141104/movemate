# MoveMate Web

A browser-based fitness coaching app that uses your webcam to detect body posture in real-time using MediaPipe Pose. Features a friendly 2D coach character, skeleton overlay, and the ability to record clips.

## Features

- **Real-time Pose Detection**: Uses MediaPipe Pose for in-browser AI inference
- **3 Workout Routines**:
  - 🏋️ **Squat Form Check**: Monitors knee/hip angles and spine alignment
  - 🧘 **Warrior Pose**: Yoga pose with arm and leg alignment guidance
  - 💃 **Dance Mirroring**: Follow the coach's movements
- **Skeleton Overlay**: Visual feedback with highlighted problem areas
- **2D Coach Character**: Animated SVG coach that reacts to your performance
- **Recording**: Capture 10-20 second clips with overlays and download locally
- **100% Private**: All processing happens in your browser - no data uploads

## Pose Angle Heuristics

### Squat Form Check
| Angle | Target | Tolerance | Description |
|-------|--------|-----------|-------------|
| Knee (L/R) | 90° | ±15° | Hip-Knee-Ankle angle at bottom of squat |
| Hip (L/R) | 90° | ±20° | Shoulder-Hip-Knee angle |
| Spine | 0° | ±15° | Vertical alignment from hips to shoulders |

### Warrior Pose
| Angle | Target | Tolerance | Description |
|-------|--------|-----------|-------------|
| Front Knee | 90° | ±15° | Bent leg at 90 degrees |
| Back Knee | 170° | ±15° | Back leg nearly straight |
| Shoulders | 90° | ±20° | Arms parallel to ground |
| Spine | 0° | ±10° | Torso upright |

### Dance Mirroring
- Compares arm positions to coach's target pose
- Tolerance: 60° combined arm deviation

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: TailwindCSS
- **Pose Detection**: MediaPipe Pose (via CDN)
- **Icons**: Lucide React
- **Recording**: MediaRecorder API

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Performance Optimization

Target: **≥15 FPS** on modern laptops

Strategies implemented:
1. **Model Complexity**: Using `modelComplexity: 1` (balanced)
2. **Canvas Optimization**: `image-rendering: optimizeSpeed`
3. **Smooth Landmarks**: Enabled for temporal smoothing
4. **Segmentation Disabled**: Reduces computation
5. **RequestAnimationFrame**: Efficient render loop
6. **Confidence Thresholds**: 0.5 for detection/tracking

## Browser Compatibility

| Browser | Status | Notes |
|---------|--------|-------|
| Chrome 90+ | ✅ Fully Supported | Best performance |
| Safari 15+ | ✅ Supported | May need camera permission reset |
| Firefox 90+ | ✅ Supported | WebM recording |
| Edge 90+ | ✅ Supported | Chromium-based |

### Testing Checklist

- [ ] Camera permission flow works
- [ ] Calibration guide appears and completes
- [ ] Skeleton overlay renders correctly
- [ ] Pose angles calculate accurately
- [ ] Coach character animates based on score
- [ ] Corrections display (max 2 at a time)
- [ ] Recording starts/stops correctly
- [ ] Video downloads as .webm
- [ ] FPS stays above 15
- [ ] Mobile responsive layout works

## Privacy

- **No server uploads**: All pose detection runs locally via WebAssembly
- **No cookies**: No tracking or analytics
- **Local storage only**: Recordings stay on your device
- Clear messaging throughout the app

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Home page with routine selection
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   ├── CalibrationGuide.tsx
│   ├── CameraPermission.tsx
│   ├── CoachCharacter.tsx
│   ├── FeedbackDisplay.tsx
│   ├── PoseCanvas.tsx
│   ├── RecordingControls.tsx
│   ├── RoutineSelector.tsx
│   └── WorkoutSession.tsx
├── hooks/
│   ├── usePoseDetection.ts
│   ├── useRecording.ts
│   └── useWebcam.ts
├── types/
│   └── pose.ts
└── utils/
    ├── angleCalculations.ts
    ├── routineConfigs.ts
    └── skeletonDrawing.ts
```

## License

MIT
