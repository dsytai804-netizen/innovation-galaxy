import type { GraphNode } from '../stores/useGraphStore';

export function generateFibonacciSphere(
  count: number,
  radius: number,
  centerPosition: [number, number, number]
): Array<[number, number, number]> {
  const positions: Array<[number, number, number]> = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;

    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;

    positions.push([
      centerPosition[0] + x * radius,
      centerPosition[1] + y * radius,
      centerPosition[2] + z * radius,
    ]);
  }

  return positions;
}

export function generateChildNodePositions(
  parentNode: GraphNode,
  childCount: number
): Array<[number, number, number]> {
  // 根据子节点数量动态调整半径，避免重叠
  // 基础半径 + 每个节点额外增加一点空间
  const baseRadius = 4;
  const extraRadius = Math.min(childCount * 0.3, 3); // 最多增加3单位
  const radius = baseRadius + extraRadius;

  return generateFibonacciSphere(childCount, radius, parentNode.position);
}
