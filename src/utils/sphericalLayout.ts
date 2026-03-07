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
  const radius = 3;
  return generateFibonacciSphere(childCount, radius, parentNode.position);
}
