import React, { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useGraphStore } from '../../stores/useGraphStore';
import { useControlStore } from '../../stores/useControlStore';
import { useGestureStore } from '../../stores/useGestureStore';
import { Planet } from './Planet';
import { ConnectionLine } from './ConnectionLine';
import { ParticleField } from './ParticleField';
import { GestureController } from '../gesture/GestureController';
import { GestureCameraView } from '../gesture/GestureCameraView';

export const GalaxyCanvas: React.FC = () => {
  const loadInitialGraph = useGraphStore((state) => state.loadInitialGraph);
  const nodes = useGraphStore((state) => state.nodes);
  const edges = useGraphStore((state) => state.edges);
  const controlMode = useControlStore((state) => state.controlMode);
  const isGestureActive = useGestureStore((state) => state.isActive);

  useEffect(() => {
    loadInitialGraph();
  }, [loadInitialGraph]);

  return (
    <div className="flex-1 bg-galaxy-bg relative">
      {/* 3D Canvas */}
      <Canvas>
        {/* Camera - 正面视角，但有更大的缩放范围 */}
        <PerspectiveCamera makeDefault position={[0, 0, 30]} fov={60} />

        {/* Lights - 增强立体感 */}
        <ambientLight intensity={0.35} />
        <pointLight position={[10, 10, 10]} intensity={1.0} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4A90E2" />
        <pointLight position={[0, 0, 15]} intensity={0.3} color="#9370DB" />

        {/* Particle Field */}
        <ParticleField />

        {/* Render Planets */}
        {nodes.map((node) => (
          <Planet key={node.id} node={node} />
        ))}

        {/* Render Connection Lines */}
        {edges.map((edge, index) => {
          const sourceNode = nodes.find(n => n.id === edge.source);
          const targetNode = nodes.find(n => n.id === edge.target);

          if (!sourceNode || !targetNode) return null;

          return (
            <ConnectionLine
              key={`${edge.source}-${edge.target}-${index}`}
              start={sourceNode.position}
              end={targetNode.position}
              color={sourceNode.color}
              opacity={0.3}
            />
          );
        })}

        {/* Controls - 类似VR看房的交互体验 */}
        <OrbitControls
          enabled={!isGestureActive}
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.6}
          zoomSpeed={1.0}
          enableRotate={controlMode === 'rotation'}
          enablePan={controlMode === 'pan'}
          panSpeed={1.0}
          target={[0, 0, 0]}
          // 在平移模式下，将左键设置为平移而不是旋转
          mouseButtons={
            controlMode === 'pan'
              ? {
                  LEFT: THREE.MOUSE.PAN,
                  MIDDLE: THREE.MOUSE.DOLLY,
                  RIGHT: THREE.MOUSE.ROTATE,
                }
              : {
                  LEFT: THREE.MOUSE.ROTATE,
                  MIDDLE: THREE.MOUSE.DOLLY,
                  RIGHT: THREE.MOUSE.PAN,
                }
          }
          // 触摸控制 - 支持触控板和触摸屏
          touches={
            controlMode === 'pan'
              ? {
                  ONE: THREE.TOUCH.PAN,      // 单指 = 平移
                  TWO: THREE.TOUCH.DOLLY_PAN, // 双指 = 缩放+平移
                }
              : {
                  ONE: THREE.TOUCH.ROTATE,    // 单指 = 旋转
                  TWO: THREE.TOUCH.DOLLY_PAN, // 双指 = 缩放+平移
                }
          }
          minDistance={3}
          maxDistance={80}
          // 平滑的惯性滚动
          enableZoom={true}
          zoomToCursor={false}
        />

        {/* Gesture Controller */}
        {isGestureActive && <GestureController />}

        {/* Post-processing Effects */}
        <EffectComposer>
          <Bloom
            intensity={0.5}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>

      {/* Gesture Camera View (outside Canvas) */}
      <GestureCameraView />
    </div>
  );
};
