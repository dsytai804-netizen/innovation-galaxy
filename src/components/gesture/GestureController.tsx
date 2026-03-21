import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGestureStore } from '../../stores/useGestureStore';
import { CoordinateMapper } from '../../services/gesture/coordinateMapper';

/**
 * Gesture Controller Component
 * Translates hand gestures to camera controls
 */
export const GestureController: React.FC = () => {
  const { camera, gl } = useThree();
  const { isActive, currentGesture, smoothedHandPosition } = useGestureStore();

  const mapperRef = useRef<CoordinateMapper>(new CoordinateMapper());
  const targetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const sphericalRef = useRef<THREE.Spherical>(new THREE.Spherical(15, Math.PI / 2, 0));

  // Initialize camera position from current camera state
  useEffect(() => {
    if (isActive) {
      // Calculate spherical coordinates from current camera position
      const offset = camera.position.clone().sub(targetRef.current);
      sphericalRef.current.setFromVector3(offset);
      console.log('🎮 Gesture control activated - camera state synchronized');
    } else {
      // Reset mapper when deactivated
      mapperRef.current.clear();
    }
  }, [isActive, camera]);

  // Update camera based on hand position and gesture
  useEffect(() => {
    if (!isActive || !smoothedHandPosition || currentGesture === 'none') {
      return;
    }

    const mapper = mapperRef.current;

    // Reset reference if gesture changed
    if (mapper.needsReset(currentGesture)) {
      mapper.resetReference(smoothedHandPosition, currentGesture);
      console.log(`✋ Gesture changed: ${currentGesture}`);
      return;
    }

    // Minimum movement threshold to prevent drift
    const MOVEMENT_THRESHOLD = 0.003; // 0.3% minimum movement

    // Apply control based on gesture type
    let shouldUpdate = false;

    switch (currentGesture) {
      case 'open_palm': {
        // Rotation
        const { azimuth, polar } = mapper.mapToRotation(smoothedHandPosition);

        // Only update if movement is significant
        if (Math.abs(azimuth) > MOVEMENT_THRESHOLD || Math.abs(polar) > MOVEMENT_THRESHOLD) {
          // Update spherical coordinates
          sphericalRef.current.theta -= azimuth;
          sphericalRef.current.phi = THREE.MathUtils.clamp(
            sphericalRef.current.phi - polar,
            0.1,
            Math.PI - 0.1
          );
          shouldUpdate = true;

          // Update reference point after applying movement to prevent continuous drift
          mapper.resetReference(smoothedHandPosition, currentGesture);
        }

        break;
      }

      case 'pinch': {
        // Zoom
        const distanceDelta = mapper.mapToZoom(smoothedHandPosition);

        // Only update if movement is significant
        if (Math.abs(distanceDelta) > 0.05) {
          // Update distance
          sphericalRef.current.radius = THREE.MathUtils.clamp(
            sphericalRef.current.radius + distanceDelta,
            3,
            80
          );
          shouldUpdate = true;

          // Update reference point after applying movement
          mapper.resetReference(smoothedHandPosition, currentGesture);
        }

        break;
      }

      case 'fist': {
        // Pan
        const { x, y } = mapper.mapToPan(smoothedHandPosition, camera);

        // Only update if movement is significant (降低阈值使平移更灵敏)
        if (Math.abs(x) > 0.01 || Math.abs(y) > 0.01) {
          // Get camera right and up vectors
          const right = new THREE.Vector3();
          const up = new THREE.Vector3();
          camera.matrixWorld.extractBasis(right, up, new THREE.Vector3());

          // Calculate pan vector
          const panVector = new THREE.Vector3();
          panVector.addScaledVector(right, x);
          panVector.addScaledVector(up, y);

          // Update both target and camera position (to maintain relative position)
          targetRef.current.add(panVector);
          camera.position.add(panVector);
          camera.lookAt(targetRef.current);

          shouldUpdate = false; // We already updated camera, don't update again

          // Update reference point after applying movement
          mapper.resetReference(smoothedHandPosition, currentGesture);
        }

        break;
      }
    }

    // Only apply camera transformation if there was significant movement
    if (shouldUpdate) {
      const offset = new THREE.Vector3();
      offset.setFromSpherical(sphericalRef.current);
      camera.position.copy(targetRef.current).add(offset);
      camera.lookAt(targetRef.current);
    }

    // Force update (renderer will update automatically)
  }, [smoothedHandPosition, currentGesture, isActive, camera, gl]);

  // This component doesn't render anything
  return null;
};
