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

  /**
   * 流式展开节点 - 边生成边渲染
   * @param parentNode 父节点
   * @param onPartialNodes 当部分节点生成时的回调
   * @returns 最终生成的所有节点
   */
  async *expandNodeStream(
    parentNode: GraphNode
  ): AsyncGenerator<GraphNode[], void, unknown> {
    const prompt = PROMPTS.nodeExpansion(parentNode.label, parentNode.depth);

    let buffer = '';
    let parsedChildren: ChildNodeData[] = [];

    // 使用流式调用
    for await (const chunk of llmClient.callStream(prompt, {
      temperature: 0.8,
      maxTokens: 2000,
    })) {
      buffer += chunk;

      // 尝试解析部分 JSON
      const partial = this.tryParsePartialJSON(buffer);

      if (partial && partial.children && Array.isArray(partial.children)) {
        // 检查是否有新的子节点
        const newChildrenCount = partial.children.length;

        if (newChildrenCount > parsedChildren.length) {
          // 有新的子节点，立即渲染
          const newChildren = partial.children.slice(parsedChildren.length);
          parsedChildren = partial.children;

          // 生成新节点
          const startIndex = newChildrenCount - newChildren.length;
          const positions = generateChildNodePositions(parentNode, 15); // 预留15个位置

          const newNodes: GraphNode[] = newChildren.map((child, idx) => ({
            id: `${parentNode.id}-child-${startIndex + idx}-${Date.now()}`,
            label: child.label,
            type: parentNode.type,
            position: positions[startIndex + idx],
            color: COLORS[parentNode.type] || COLORS.technology,
            size: Math.max(0.3, parentNode.size * 0.7),
            expanded: false,
            depth: parentNode.depth + 1,
            children: [],
          }));

          // 立即返回新节点
          yield newNodes;
        }
      }
    }
  }

  /**
   * 尝试解析部分 JSON
   * 支持解析不完整的 JSON 对象
   */
  private tryParsePartialJSON(text: string): NodeExpansionResponse | null {
    try {
      // 尝试直接解析
      return JSON.parse(text);
    } catch {
      // 解析失败，尝试提取和修复

      // 提取 JSON 代码块
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/```\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[1]);
        } catch {}
      }

      // 尝试查找 children 数组
      const childrenMatch = text.match(/"children"\s*:\s*\[([\s\S]*?)\]/);
      if (childrenMatch) {
        try {
          // 尝试解析 children 数组
          const childrenText = `{"children": [${childrenMatch[1]}]}`;
          return JSON.parse(childrenText);
        } catch {}
      }

      // 尝试修复不完整的 JSON
      // 例如：{"children": [{"label": "A", "description": "..."}
      // 补全为：{"children": [{"label": "A", "description": "..."}]}
      const partialMatch = text.match(/"children"\s*:\s*\[([\s\S]*)/);
      if (partialMatch) {
        try {
          let partial = partialMatch[1].trim();

          // 移除末尾的逗号和不完整的对象
          partial = partial.replace(/,\s*\{[^}]*$/, '');
          partial = partial.replace(/,\s*$/, '');

          const fixed = `{"children": [${partial}]}`;
          return JSON.parse(fixed);
        } catch {}
      }

      return null;
    }
  }
}

export const nodeExpansionService = new NodeExpansionService();
