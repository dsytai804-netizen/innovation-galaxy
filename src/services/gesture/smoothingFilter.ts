import { GESTURE_CONFIG } from '../../config/constants';
import type { HandPosition } from '../../stores/useGestureStore';

/**
 * Three-layer smoothing pipeline for hand position data:
 * 1. Exponential Moving Average (EMA)
 * 2. Low-pass filter
 * 3. Deadzone filter
 */
export class SmoothingFilter {
  private previousSmoothed: HandPosition | null = null;
  private previousLowPass: HandPosition | null = null;

  /**
   * Apply Exponential Moving Average
   * Reduces high-frequency noise
   */
  private applyEMA(raw: HandPosition, previous: HandPosition | null): HandPosition {
    if (!previous) return raw;

    const alpha = GESTURE_CONFIG.EMA_ALPHA;
    return {
      x: alpha * raw.x + (1 - alpha) * previous.x,
      y: alpha * raw.y + (1 - alpha) * previous.y,
      z: alpha * raw.z + (1 - alpha) * previous.z,
    };
  }

  /**
   * Apply low-pass filter
   * Further filters rapid changes
   */
  private applyLowPass(ema: HandPosition, previous: HandPosition | null): HandPosition {
    if (!previous) return ema;

    const cutoff = GESTURE_CONFIG.LOWPASS_CUTOFF;
    return {
      x: previous.x + cutoff * (ema.x - previous.x),
      y: previous.y + cutoff * (ema.y - previous.y),
      z: previous.z + cutoff * (ema.z - previous.z),
    };
  }

  /**
   * Apply deadzone filter
   * Ignores tiny movements to prevent jitter
   */
  private applyDeadzone(lowPass: HandPosition, previous: HandPosition | null): HandPosition {
    if (!previous) return lowPass;

    const threshold = GESTURE_CONFIG.DEADZONE_THRESHOLD;
    const dx = Math.abs(lowPass.x - previous.x);
    const dy = Math.abs(lowPass.y - previous.y);
    const dz = Math.abs(lowPass.z - previous.z);

    return {
      x: dx > threshold ? lowPass.x : previous.x,
      y: dy > threshold ? lowPass.y : previous.y,
      z: dz > threshold ? lowPass.z : previous.z,
    };
  }

  /**
   * Apply all three smoothing layers
   */
  smooth(raw: HandPosition): HandPosition {
    // Layer 1: EMA
    const ema = this.applyEMA(raw, this.previousSmoothed);

    // Layer 2: Low-pass
    const lowPass = this.applyLowPass(ema, this.previousLowPass);
    this.previousLowPass = lowPass;

    // Layer 3: Deadzone
    const final = this.applyDeadzone(lowPass, this.previousSmoothed);
    this.previousSmoothed = final;

    return final;
  }

  /**
   * Reset filter state (call when hand is lost or gesture changes)
   */
  reset(): void {
    this.previousSmoothed = null;
    this.previousLowPass = null;
  }

  /**
   * Get the last smoothed position
   */
  getLastSmoothed(): HandPosition | null {
    return this.previousSmoothed;
  }
}
