import React, { useRef, useState } from 'react';
import { Mesh } from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import type { GraphNode } from '../../stores/useGraphStore';
import { useGraphStore } from '../../stores/useGraphStore';
import { useBasketStore } from '../../stores/useBasketStore';
import { nodeExpansionService } from '../../services/graph/nodeExpansionService';

interface PlanetProps {
  node: GraphNode;
}

export const Planet: React.FC<PlanetProps> = ({ node }) => {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const addKeyword = useBasketStore((state) => state.addKeyword);
  const hasKeyword = useBasketStore((state) => state.hasKeyword);
  const expandNode = useGraphStore((state) => state.expandNode);
  const setIsExpanding = useGraphStore((state) => state.setIsExpanding);

  const isSelected = hasKeyword(node.id);

  // Idle rotation animation
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
  });

  // Click handler - add to basket
  const handleClick = (e: any) => {
    e.stopPropagation();

    if (!isSelected) {
      addKeyword({
        id: node.id,
        label: node.label,
        type: node.type === 'core' ? 'technology' : node.type,
        color: node.color,
      });
    }
  };

  // Double click handler - expand node
  const handleDoubleClick = async (e: any) => {
    e.stopPropagation();

    if (node.expanded) {
      console.log('Node already expanded');
      return;
    }

    try {
      setIsExpanding(true);
      console.log('Expanding node:', node.label);

      const children = await nodeExpansionService.expandNode(node);
      expandNode(node.id, children);

      console.log(`Expanded ${node.label} with ${children.length} children`);
    } catch (error) {
      console.error('Failed to expand node:', error);
      alert('节点扩展失败，请检查LLM API配置');
    } finally {
      setIsExpanding(false);
    }
  };

  return (
    <group position={node.position}>
      {/* Planet Sphere */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
        scale={hovered ? node.size * 1.2 : node.size}
      >
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={hovered ? 0.8 : isSelected ? 0.5 : 0.3}
          roughness={0.3}
          metalness={0.5}
        />
      </mesh>

      {/* Glow effect on hover */}
      {hovered && (
        <mesh scale={node.size * 1.4}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshBasicMaterial
            color={node.color}
            transparent
            opacity={0.2}
          />
        </mesh>
      )}

      {/* Label */}
      <Text
        position={[0, node.size * 0.8, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {node.label}
      </Text>
    </group>
  );
};
