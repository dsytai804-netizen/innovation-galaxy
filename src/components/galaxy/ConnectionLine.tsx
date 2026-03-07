import React, { useRef, useMemo } from 'react';
import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ConnectionLineProps {
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
  opacity?: number;
}

export const ConnectionLine: React.FC<ConnectionLineProps> = ({
  start,
  end,
  color = '#4A90E2',
  opacity = 0.3,
}) => {
  const lineRef = useRef<any>(null);

  // Animate line opacity
  useFrame(({ clock }) => {
    if (lineRef.current && lineRef.current.material) {
      const material = lineRef.current.material as THREE.LineBasicMaterial;
      material.opacity = opacity * (0.5 + 0.5 * Math.sin(clock.elapsedTime * 0.5));
    }
  });

  // Calculate curve points
  const curvePoints = useMemo(() => {
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);
    const midPoint = new THREE.Vector3().lerpVectors(startVec, endVec, 0.5);

    // Add slight curve toward center
    const curve = new THREE.QuadraticBezierCurve3(
      startVec,
      midPoint.multiplyScalar(0.9), // Pull toward center
      endVec
    );

    return curve.getPoints(20);
  }, [start, end]);

  return (
    <Line
      ref={lineRef}
      points={curvePoints}
      color={color}
      lineWidth={1}
      transparent
      opacity={opacity}
    />
  );
};
