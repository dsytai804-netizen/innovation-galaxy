import React, { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
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
          minDistance={10}
          maxDistance={50}
        />
      </Canvas>

      {/* Footer Hint */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
        <p className="text-xs text-gray-400 whitespace-nowrap">
          拖拽旋转 | 滚轮缩放 | 单击选择 | 双击展开
        </p>
      </div>
    </div>
  );
};
