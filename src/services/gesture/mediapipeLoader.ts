import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { GESTURE_CONFIG } from '../../config/constants';

let handLandmarker: HandLandmarker | null = null;
let isLoading = false;
let loadError: Error | null = null;

/**
 * Load MediaPipe Hand Landmarker from CDN
 * Only loads once (singleton pattern)
 */
export async function loadMediaPipe(): Promise<HandLandmarker> {
  // Return cached instance if already loaded
  if (handLandmarker) {
    return handLandmarker;
  }

  // If currently loading, wait for it
  if (isLoading) {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (handLandmarker) {
          clearInterval(checkInterval);
          resolve(handLandmarker);
        } else if (loadError) {
          clearInterval(checkInterval);
          reject(loadError);
        }
      }, 100);
    });
  }

  isLoading = true;
  loadError = null;

  try {
    // Load WASM files from CDN
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );

    // Create HandLandmarker with optimized config
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
        delegate: 'GPU', // Enable GPU acceleration
      },
      runningMode: 'VIDEO',
      numHands: 1, // Only track single hand for performance
      minHandDetectionConfidence: GESTURE_CONFIG.MIN_DETECTION_CONFIDENCE,
      minHandPresenceConfidence: GESTURE_CONFIG.MIN_TRACKING_CONFIDENCE,
      minTrackingConfidence: GESTURE_CONFIG.MIN_TRACKING_CONFIDENCE,
    });

    console.log('✅ MediaPipe HandLandmarker loaded successfully');
    isLoading = false;
    return handLandmarker;
  } catch (error) {
    loadError = error instanceof Error ? error : new Error('Unknown error loading MediaPipe');
    isLoading = false;
    console.error('❌ Failed to load MediaPipe:', loadError);
    throw loadError;
  }
}

/**
 * Get the current HandLandmarker instance (if loaded)
 */
export function getHandLandmarker(): HandLandmarker | null {
  return handLandmarker;
}

/**
 * Cleanup MediaPipe resources
 */
export function cleanupMediaPipe(): void {
  if (handLandmarker) {
    handLandmarker.close();
    handLandmarker = null;
    console.log('🧹 MediaPipe HandLandmarker cleaned up');
  }
}

/**
 * Check if MediaPipe is currently loaded
 */
export function isMediaPipeLoaded(): boolean {
  return handLandmarker !== null;
}
