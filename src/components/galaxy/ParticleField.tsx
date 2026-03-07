import React, { useRef, useMemo } from 'react';
import { Points, PointMaterial } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { APP_CONSTANTS } from '../../config/constants';

export const ParticleField: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate particle positions
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(APP_CONSTANTS.PARTICLE_COUNT * 3);

    for (let i = 0; i < APP_CONSTANTS.PARTICLE_COUNT; i++) {
      // Random spherical distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 15 + Math.random() * 20;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }

    return positions;
  }, []);

  // Animate particles
  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.elapsedTime * 0.02;
      pointsRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.01) * 0.1;
    }
  });

  return (
    <Points ref={pointsRef} positions={particlePositions}>
      <PointMaterial
        transparent
        color="#4A90E2"
        size={0.05}
        sizeAttenuation
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};
