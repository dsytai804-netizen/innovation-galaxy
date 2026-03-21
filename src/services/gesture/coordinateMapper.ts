import type { HandPosition } from '../../stores/useGestureStore';
import { GESTURE_CONFIG } from '../../config/constants';
import * as THREE from 'three';

/**
 * Maps hand positions to camera controls using relative movement
 */
export class CoordinateMapper {
  private referencePosition: HandPosition | null = null;
  private lastGesture: string | null = null;

  /**
   * Set reference position (called when gesture changes)
   */
  resetReference(position: HandPosition, gesture: string): void {
    this.referencePosition = { ...position };
    this.lastGesture = gesture;
  }

  /**
   * Get delta from reference position
   */
  private getDelta(current: HandPosition): { x: number; y: number; z: number } {
    if (!this.referencePosition) {
      return { x: 0, y: 0, z: 0 };
    }

    return {
      x: current.x - this.referencePosition.x,
      y: current.y - this.referencePosition.y,
      z: current.z - this.referencePosition.z,
    };
  }

  /**
   * Map to rotation (open palm)
   * Returns azimuth and polar angle deltas in radians
   */
  mapToRotation(current: HandPosition): { azimuth: number; polar: number } {
    const delta = this.getDelta(current);
    const sensitivity = GESTURE_CONFIG.ROTATION_SENSITIVITY;

    return {
      azimuth: delta.x * sensitivity,
      polar: delta.y * sensitivity,
    };
  }

  /**
   * Map to zoom (pinch)
   * Returns distance delta
   */
  mapToZoom(current: HandPosition): number {
    const delta = this.getDelta(current);
    const sensitivity = GESTURE_CONFIG.ZOOM_SENSITIVITY;

    // Y movement controls zoom (up = zoom in, down = zoom out)
    return -delta.y * sensitivity;
  }

  /**
   * Map to pan (fist)
   * Returns x and y deltas in world space
   */
  mapToPan(current: HandPosition, camera: THREE.Camera): { x: number; y: number } {
    const delta = this.getDelta(current);
    const sensitivity = GESTURE_CONFIG.PAN_SENSITIVITY;

    // Get camera right and up vectors
    const right = new THREE.Vector3();
    const up = new THREE.Vector3();
    camera.matrixWorld.extractBasis(right, up, new THREE.Vector3());

    // Map hand movement to world space
    const panX = delta.x * sensitivity;
    const panY = -delta.y * sensitivity; // Invert Y for natural feel

    return { x: panX, y: panY };
  }

  /**
   * Check if reference needs reset (gesture changed)
   */
  needsReset(gesture: string): boolean {
    return this.lastGesture !== gesture;
  }

  /**
   * Clear reference
   */
  clear(): void {
    this.referencePosition = null;
    this.lastGesture = null;
  }
}
