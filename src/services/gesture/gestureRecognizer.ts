import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { GestureType } from '../../stores/useGestureStore';
import { GESTURE_CONFIG } from '../../config/constants';

/**
 * MediaPipe Hand Landmarks indices
 * https://developers.google.com/mediapipe/solutions/vision/hand_landmarker
 */
const LANDMARKS = {
  WRIST: 0,
  THUMB_TIP: 4,
  INDEX_TIP: 8,
  INDEX_PIP: 6,
  MIDDLE_TIP: 12,
  MIDDLE_PIP: 10,
  RING_TIP: 16,
  RING_PIP: 14,
  PINKY_TIP: 20,
  PINKY_PIP: 18,
};

/**
 * Calculate Euclidean distance between two landmarks
 */
function distance(a: NormalizedLandmark, b: NormalizedLandmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = (a.z || 0) - (b.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Detect if a finger is extended
 * Finger is extended if tip is significantly above (lower y value) the PIP joint
 */
function isFingerExtended(
  landmarks: NormalizedLandmark[],
  tipIndex: number,
  pipIndex: number
): boolean {
  const tip = landmarks[tipIndex];
  const pip = landmarks[pipIndex];
  const threshold = GESTURE_CONFIG.FINGER_EXTEND_THRESHOLD;

  // In image coordinates, lower y = higher position
  return pip.y - tip.y > threshold;
}

/**
 * Detect open palm gesture
 * 3+ fingers extended
 */
export function detectOpenPalm(landmarks: NormalizedLandmark[]): boolean {
  let extendedCount = 0;

  // Check index finger
  if (isFingerExtended(landmarks, LANDMARKS.INDEX_TIP, LANDMARKS.INDEX_PIP)) {
    extendedCount++;
  }

  // Check middle finger
  if (isFingerExtended(landmarks, LANDMARKS.MIDDLE_TIP, LANDMARKS.MIDDLE_PIP)) {
    extendedCount++;
  }

  // Check ring finger
  if (isFingerExtended(landmarks, LANDMARKS.RING_TIP, LANDMARKS.RING_PIP)) {
    extendedCount++;
  }

  // Check pinky
  if (isFingerExtended(landmarks, LANDMARKS.PINKY_TIP, LANDMARKS.PINKY_PIP)) {
    extendedCount++;
  }

  return extendedCount >= 3;
}

/**
 * Detect pinch gesture
 * Thumb tip and index tip are close together, AND other fingers are NOT all curled
 */
export function detectPinch(landmarks: NormalizedLandmark[]): boolean {
  const thumbTip = landmarks[LANDMARKS.THUMB_TIP];
  const indexTip = landmarks[LANDMARKS.INDEX_TIP];
  const dist = distance(thumbTip, indexTip);

  // 拇指和食指必须靠近
  if (dist >= GESTURE_CONFIG.PINCH_THRESHOLD) {
    return false;
  }

  // 排除握拳：检查其他手指（中指、无名指、小指）是否都卷曲
  const wrist = landmarks[LANDMARKS.WRIST];
  const otherFingers = [
    LANDMARKS.MIDDLE_TIP,
    LANDMARKS.RING_TIP,
    LANDMARKS.PINKY_TIP,
  ];

  let allCurled = true;
  for (const tipIndex of otherFingers) {
    const tip = landmarks[tipIndex];
    const distToWrist = distance(tip, wrist);
    // 如果有手指离手腕较远（伸展），则不是握拳
    if (distToWrist >= GESTURE_CONFIG.FIST_DISTANCE_THRESHOLD * 0.8) {
      allCurled = false;
      break;
    }
  }

  // 如果其他手指都卷曲了，这不是捏合，可能是握拳
  return !allCurled;
}

/**
 * Detect fist gesture
 * 所有四指都卷曲（指尖不向上伸展）
 */
export function detectFist(landmarks: NormalizedLandmark[]): boolean {
  const wrist = landmarks[LANDMARKS.WRIST];

  // 检查四根手指（食指、中指、无名指、小指）是否都卷曲
  const fingerPairs = [
    { tip: LANDMARKS.INDEX_TIP, pip: LANDMARKS.INDEX_PIP },
    { tip: LANDMARKS.MIDDLE_TIP, pip: LANDMARKS.MIDDLE_PIP },
    { tip: LANDMARKS.RING_TIP, pip: LANDMARKS.RING_PIP },
    { tip: LANDMARKS.PINKY_TIP, pip: LANDMARKS.PINKY_PIP },
  ];

  let curledCount = 0;

  for (const { tip, pip } of fingerPairs) {
    const tipLandmark = landmarks[tip];
    const pipLandmark = landmarks[pip];

    // 方法1: 指尖的Y坐标应该大于或接近PIP关节（没有向上伸展）
    const notExtended = tipLandmark.y >= pipLandmark.y - 0.02;

    // 方法2: 指尖距离手腕不能太远
    const distToWrist = distance(tipLandmark, wrist);
    const reasonablyClose = distToWrist < GESTURE_CONFIG.FIST_DISTANCE_THRESHOLD;

    // 两个条件都满足才算卷曲
    if (notExtended && reasonablyClose) {
      curledCount++;
    }
  }

  // 至少3根手指卷曲才算握拳
  return curledCount >= 3;
}

/**
 * Gesture recognizer with hysteresis for stability
 */
export class GestureRecognizer {
  private gestureHistory: GestureType[] = [];
  private currentGesture: GestureType = 'none';

  /**
   * Recognize gesture with stability check
   * Gesture must be consistent for GESTURE_STABLE_FRAMES frames
   */
  recognize(landmarks: NormalizedLandmark[] | null): GestureType {
    if (!landmarks || landmarks.length === 0) {
      // Hand lost - add 'none' to history
      this.gestureHistory.push('none');
    } else {
      // Detect gesture with priority: fist > pinch > open_palm
      // 握拳优先，避免被误识别为捏合
      let detected: GestureType = 'none';

      if (detectFist(landmarks)) {
        detected = 'fist';
      } else if (detectPinch(landmarks)) {
        detected = 'pinch';
      } else if (detectOpenPalm(landmarks)) {
        detected = 'open_palm';
      }

      this.gestureHistory.push(detected);
    }

    // Keep only recent history
    const maxHistory = GESTURE_CONFIG.GESTURE_STABLE_FRAMES + 2;
    if (this.gestureHistory.length > maxHistory) {
      this.gestureHistory = this.gestureHistory.slice(-maxHistory);
    }

    // Check if gesture is stable (consistent for N frames)
    const stableFrames = GESTURE_CONFIG.GESTURE_STABLE_FRAMES;
    if (this.gestureHistory.length >= stableFrames) {
      const recentGestures = this.gestureHistory.slice(-stableFrames);
      const allSame = recentGestures.every((g) => g === recentGestures[0]);

      if (allSame && recentGestures[0] !== this.currentGesture) {
        // Gesture changed and is stable
        this.currentGesture = recentGestures[0];
      }
    }

    return this.currentGesture;
  }

  /**
   * Get current stable gesture
   */
  getCurrentGesture(): GestureType {
    return this.currentGesture;
  }

  /**
   * Reset recognizer state
   */
  reset(): void {
    this.gestureHistory = [];
    this.currentGesture = 'none';
  }
}

/**
 * Calculate palm center from landmarks
 * Use wrist + base of middle finger as reference points
 */
export function calculatePalmCenter(landmarks: NormalizedLandmark[]): {
  x: number;
  y: number;
  z: number;
} {
  const wrist = landmarks[LANDMARKS.WRIST];
  const middleBase = landmarks[9]; // Middle finger MCP joint

  return {
    x: (wrist.x + middleBase.x) / 2,
    y: (wrist.y + middleBase.y) / 2,
    z: ((wrist.z || 0) + (middleBase.z || 0)) / 2,
  };
}
