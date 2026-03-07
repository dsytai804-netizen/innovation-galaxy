import type { GraphNode } from '../../stores/useGraphStore';
import { llmClient } from '../llm/llmClient';
import { PROMPTS } from '../llm/promptBuilder';
import { generateChildNodePositions } from '../../utils/sphericalLayout';
import { COLORS } from '../../config/constants';

interface ChildNodeData {
  label: string;
  description: string;
}

interface NodeExpansionResponse {
  children: ChildNodeData[];
}

export class NodeExpansionService {
  async expandNode(parentNode: GraphNode): Promise<GraphNode[]> {
    const prompt = PROMPTS.nodeExpansion(parentNode.label, parentNode.depth);

    const response = await llmClient.callJSON<NodeExpansionResponse>(prompt, {
      temperature: 0.8,
      maxTokens: 2000,
    });

    if (!response.children || !Array.isArray(response.children)) {
      throw new Error('Invalid response format from LLM');
    }

    const childCount = Math.min(response.children.length, 15);
    const children = response.children.slice(0, childCount);

    const positions = generateChildNodePositions(parentNode, childCount);

    const childNodes: GraphNode[] = children.map((child, index) => ({
      id: `${parentNode.id}-child-${index}-${Date.now()}`,
      label: child.label,
      type: parentNode.type,
      position: positions[index],
      color: COLORS[parentNode.type] || COLORS.technology,
      size: Math.max(0.3, parentNode.size * 0.7),
      expanded: false,
      depth: parentNode.depth + 1,
      children: [],
    }));

    return childNodes;
  }
}

export const nodeExpansionService = new NodeExpansionService();
