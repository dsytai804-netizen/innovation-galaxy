import React, { useEffect, useRef, useState } from 'react';
import { X, Minimize2, Maximize2 } from 'lucide-react';
import { useGestureStore, type GestureType } from '../../stores/useGestureStore';
import { getHandLandmarker, cleanupMediaPipe } from '../../services/gesture/mediapipeLoader';
import { GestureRecognizer, calculatePalmCenter } from '../../services/gesture/gestureRecognizer';
import { SmoothingFilter } from '../../services/gesture/smoothingFilter';
import { GESTURE_CONFIG } from '../../config/constants';

const GESTURE_LABELS: Record<GestureType, string> = {
  none: '无手势',
  open_palm: '摊开手掌 (旋转)',
  pinch: '捏合 (缩放)',
  fist: '握拳 (平移)',
};

export const GestureCameraView: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const handLostFramesRef = useRef<number>(0);

  const recognizerRef = useRef<GestureRecognizer>(new GestureRecognizer());
  const smoothingFilterRef = useRef<SmoothingFilter>(new SmoothingFilter());

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isActive, setActive, setGesture, updateHandPosition, setError: setStoreError, setHandLost, currentGesture } = useGestureStore();

  // Initialize camera
  useEffect(() => {
    if (!isActive) return;

    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: GESTURE_CONFIG.CAMERA_WIDTH,
            height: GESTURE_CONFIG.CAMERA_HEIGHT,
            facingMode: 'user',
          },
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          console.log('✅ Camera initialized');
          startDetectionLoop();
        }
      } catch (err) {
        console.error('Failed to initialize camera:', err);
        const errorMsg = err instanceof Error ? err.message : '摄像头初始化失败';
        setError(errorMsg);
        setStoreError(errorMsg);
      }
    };

    initCamera();

    return () => {
      // Cleanup
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      cleanupMediaPipe();
    };
  }, [isActive]);

  // Detection loop at 30fps
  const startDetectionLoop = () => {
    const targetFPS = GESTURE_CONFIG.DETECTION_FPS;
    const frameInterval = 1000 / targetFPS;

    const detect = (timestamp: number) => {
      if (!isActive) return;

      const elapsed = timestamp - lastFrameTimeRef.current;

      if (elapsed >= frameInterval) {
        lastFrameTimeRef.current = timestamp;
        processFrame();
      }

      animationFrameRef.current = requestAnimationFrame(detect);
    };

    animationFrameRef.current = requestAnimationFrame(detect);
  };

  // Process single frame
  const processFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const handLandmarker = getHandLandmarker();

    if (!video || !canvas || !handLandmarker || video.readyState < 2) {
      return;
    }

    try {
      // Detect hand landmarks
      const results = handLandmarker.detectForVideo(video, performance.now());

      if (results.landmarks && results.landmarks.length > 0) {
        // Hand detected
        handLostFramesRef.current = 0;
        const landmarks = results.landmarks[0];

        // Calculate palm center
        const palmCenter = calculatePalmCenter(landmarks);

        // Apply smoothing
        const smoothed = smoothingFilterRef.current.smooth(palmCenter);

        // Update store
        updateHandPosition(palmCenter, smoothed);

        // Recognize gesture
        const gesture = recognizerRef.current.recognize(landmarks);
        if (gesture !== currentGesture) {
          setGesture(gesture);
          // Reset smoothing filter when gesture changes
          smoothingFilterRef.current.reset();
        }

        // Draw visualization
        drawLandmarks(canvas, landmarks);
      } else {
        // Hand lost
        handLostFramesRef.current++;

        if (handLostFramesRef.current >= GESTURE_CONFIG.HAND_LOST_FRAMES) {
          // Reset after timeout
          setHandLost(true);
          updateHandPosition(null, null);
          setGesture('none');
          recognizerRef.current.reset();
          smoothingFilterRef.current.reset();
        }

        // Clear canvas
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    } catch (err) {
      console.error('Detection error:', err);
    }
  };

  // Draw hand landmarks
  const drawLandmarks = (
    canvas: HTMLCanvasElement,
    landmarks: any[]
  ) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw landmarks
    ctx.fillStyle = 'rgba(129, 140, 248, 0.8)';
    landmarks.forEach((landmark) => {
      const x = landmark.x * canvas.width;
      const y = landmark.y * canvas.height;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw connections (simplified)
    ctx.strokeStyle = 'rgba(129, 140, 248, 0.5)';
    ctx.lineWidth = 2;

    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8], // Index
      [0, 9], [9, 10], [10, 11], [11, 12], // Middle
      [0, 13], [13, 14], [14, 15], [15, 16], // Ring
      [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
      [5, 9], [9, 13], [13, 17], // Palm
    ];

    connections.forEach(([i, j]) => {
      const start = landmarks[i];
      const end = landmarks[j];
      ctx.beginPath();
      ctx.moveTo(start.x * canvas.width, start.y * canvas.height);
      ctx.lineTo(end.x * canvas.width, end.y * canvas.height);
      ctx.stroke();
    });
  };

  const handleClose = () => {
    setActive(false);
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (!isActive) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '80px', // 紧贴底部控制栏上方
        left: '24px', // 左侧边距
        zIndex: 1000,
        width: `${GESTURE_CONFIG.PREVIEW_WIDTH}px`,
        background: 'rgba(30, 36, 51, 0.95)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Title Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderBottom: isCollapsed ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(99, 102, 241, 0.1)',
        }}
      >
        <span style={{ fontSize: '12px', color: 'rgb(203 213 225)', fontWeight: 500 }}>
          手势控制
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleToggleCollapse}
            style={{
              padding: '4px',
              background: 'transparent',
              border: 'none',
              color: 'rgb(203 213 225)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {isCollapsed ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
          </button>
          <button
            onClick={handleClose}
            style={{
              padding: '4px',
              background: 'transparent',
              border: 'none',
              color: 'rgb(248 113 113)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Video & Canvas (collapsible) */}
      {!isCollapsed && (
        <>
          <div style={{ position: 'relative', width: '100%', height: `${GESTURE_CONFIG.PREVIEW_HEIGHT}px` }}>
            <video
              ref={videoRef}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)', // Mirror for natural feel
              }}
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              width={GESTURE_CONFIG.PREVIEW_WIDTH}
              height={GESTURE_CONFIG.PREVIEW_HEIGHT}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                transform: 'scaleX(-1)', // Mirror to match video
              }}
            />
          </div>

          {/* Status Bar */}
          <div
            style={{
              padding: '8px 12px',
              fontSize: '11px',
              color: 'rgb(203 213 225)',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(30, 36, 51, 0.5)',
            }}
          >
            {error ? (
              <span style={{ color: 'rgb(248 113 113)' }}>错误: {error}</span>
            ) : (
              <span>
                状态: <span style={{ color: 'rgb(134 239 172)' }}>{GESTURE_LABELS[currentGesture]}</span>
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
};
