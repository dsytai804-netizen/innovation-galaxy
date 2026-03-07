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

        {/* Controls - 类似VR看房的交互体验 */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.6}
          zoomSpeed={1.0}
          enablePan={false}
          minDistance={10}
          maxDistance={80}
          // 平滑的惯性滚动
          enableZoom={true}
          zoomToCursor={false}
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
    </div>
  );
};
