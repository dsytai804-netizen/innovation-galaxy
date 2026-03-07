import React, { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useGraphStore } from '../../stores/useGraphStore';
import { Planet } from './Planet';
import { ConnectionLine } from './ConnectionLine';
import { ParticleField } from './ParticleField';

export const GalaxyCanvas: React.FC = () => {
  const loadInitialGraph = useGraphStore((state) => state.loadInitialGraph);
  const nodes = useGraphStore((state) => state.nodes);
  const edges = useGraphStore((state) => state.edges);

  useEffect(() => {
    loadInitialGraph();
  }, [loadInitialGraph]);

  return (
    <div className="flex-1 bg-galaxy-bg relative">
      {/* 3D Canvas */}
      <Canvas>
        {/* Camera */}
        <PerspectiveCamera makeDefault position={[0, 0, 25]} fov={60} />

        {/* Lights */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4A90E2" />

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

        {/* Controls */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.5}
          zoomSpeed={0.8}
          panSpeed={0.8}
          enablePan={true}
          minDistance={10}
          maxDistance={80}
          // Mac触控板支持
          touches={{
            ONE: 2, // 单指旋转 (TOUCH.ROTATE)
            TWO: 1, // 双指平移 (TOUCH.PAN)
          }}
          mouseButtons={{
            LEFT: 2,  // 鼠标左键旋转 (MOUSE.ROTATE)
            MIDDLE: 1, // 鼠标中键平移 (MOUSE.PAN)
            RIGHT: 1,  // 鼠标右键平移 (MOUSE.PAN)
          }}
        />

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

      {/* Footer Hint */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
        <p className="text-xs text-gray-400 whitespace-nowrap">
          单指旋转 | 双指平移 | 捏合缩放 | 单击展开 | 双击添加
        </p>
      </div>
    </div>
  );
};
