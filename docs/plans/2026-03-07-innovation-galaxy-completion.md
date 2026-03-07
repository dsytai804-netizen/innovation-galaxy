# Innovation Galaxy Completion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete the Innovation Galaxy AI-powered idea incubation system with 3D knowledge graph exploration and multi-agent analysis.

**Architecture:** Frontend-only React app using Three.js for 3D visualization, Zustand for state management, and direct LLM API calls for AI features. Multi-agent orchestration handles PM + Tech + Orchestrator analysis flow.

**Tech Stack:** React 18, TypeScript, Vite, @react-three/fiber, @react-three/drei, @react-three/postprocessing, Zustand, TailwindCSS, Framer Motion

---

## Current Status

✅ **Completed:**
- Project initialization and dependencies
- Basic layout (Header, ChatPanel, GalaxyCanvas)
- 26 initial nodes with 3D rendering
- Planet component with hover/click interactions
- Basket store for keyword collection
- Basic stores structure

❌ **To Implement:**
- Stage 2: Connection lines, particle system, Bloom effects, node expansion (double-click + LLM), performance optimization
- Stage 3: LLM services, Surprise Me idea generation, multi-agent workflow, report rendering, multi-turn chat
- Stage 4 (optional): Gesture recognition
- Stage 5: Optimization and testing

---

## Task 1: Connection Lines (Star Trails)

**Files:**
- Create: `innovation-galaxy/src/components/galaxy/ConnectionLine.tsx`
- Modify: `innovation-galaxy/src/components/galaxy/GalaxyCanvas.tsx`

**Step 1: Create ConnectionLine component**

Create the star trail connection line component:

```typescript
// innovation-galaxy/src/components/galaxy/ConnectionLine.tsx
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
  const lineRef = useRef<THREE.Line>(null);

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
```

**Step 2: Update GalaxyCanvas to render connection lines**

```typescript
// Modify innovation-galaxy/src/components/galaxy/GalaxyCanvas.tsx
// Add import
import { ConnectionLine } from './ConnectionLine';
import { useGraphStore } from '../../stores/useGraphStore';

// Inside the Canvas component, after rendering planets, add:
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
```

Also add edges to the component:

```typescript
const edges = useGraphStore((state) => state.edges);
```

**Step 3: Test connection lines**

Run: `npm run dev` and visit http://localhost:5174/

Expected: Connection lines should appear between nodes (currently empty edges array, so won't see lines yet)

**Step 4: Commit**

```bash
cd innovation-galaxy
git add src/components/galaxy/ConnectionLine.tsx src/components/galaxy/GalaxyCanvas.tsx
git commit -m "feat: add star trail connection lines between nodes

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 2: Particle System (Energy Flow)

**Files:**
- Create: `innovation-galaxy/src/components/galaxy/ParticleField.tsx`
- Modify: `innovation-galaxy/src/components/galaxy/GalaxyCanvas.tsx`

**Step 1: Create ParticleField component**

```typescript
// innovation-galaxy/src/components/galaxy/ParticleField.tsx
import React, { useRef, useMemo } from 'react';
import { Points, PointMaterial } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { APP_CONSTANTS } from '../../config/constants';

export const ParticleField: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate particle positions
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(APP_CONSTANTS.PARTICLE_COUNT * 3);

    for (let i = 0; i < APP_CONSTANTS.PARTICLE_COUNT; i++) {
      // Random spherical distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 15 + Math.random() * 20;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }

    return positions;
  }, []);

  // Animate particles
  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.elapsedTime * 0.02;
      pointsRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.01) * 0.1;
    }
  });

  return (
    <Points ref={pointsRef} positions={particlePositions}>
      <PointMaterial
        transparent
        color="#4A90E2"
        size={0.05}
        sizeAttenuation
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};
```

**Step 2: Add ParticleField to GalaxyCanvas**

```typescript
// Modify innovation-galaxy/src/components/galaxy/GalaxyCanvas.tsx
// Add import
import { ParticleField } from './ParticleField';

// Inside Canvas, after lights, add:
{/* Particle Field */}
<ParticleField />
```

**Step 3: Test particle system**

Run: `npm run dev` and verify particles appear in the scene

Expected: 2500 small blue particles forming a spherical field, slowly rotating

**Step 4: Commit**

```bash
cd innovation-galaxy
git add src/components/galaxy/ParticleField.tsx src/components/galaxy/GalaxyCanvas.tsx
git commit -m "feat: add particle field for energy flow effect

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 3: Bloom Post-Processing Effect

**Files:**
- Modify: `innovation-galaxy/src/components/galaxy/GalaxyCanvas.tsx`

**Step 1: Add Bloom effect to Canvas**

```typescript
// Modify innovation-galaxy/src/components/galaxy/GalaxyCanvas.tsx
// Add imports
import { EffectComposer, Bloom } from '@react-three/postprocessing';

// Wrap everything inside Canvas with EffectComposer, before closing </Canvas>:
<EffectComposer>
  <Bloom
    intensity={0.5}
    luminanceThreshold={0.2}
    luminanceSmoothing={0.9}
    mipmapBlur
  />
</EffectComposer>
```

**Step 2: Test Bloom effect**

Run: `npm run dev`

Expected: Planets should have a glowing bloom effect, especially when hovered

**Step 3: Commit**

```bash
cd innovation-galaxy
git add src/components/galaxy/GalaxyCanvas.tsx
git commit -m "feat: add bloom post-processing for glow effects

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 4: LLM Service Layer

**Files:**
- Create: `innovation-galaxy/src/services/llm/llmClient.ts`
- Create: `innovation-galaxy/src/services/llm/promptBuilder.ts`

**Step 1: Create LLM client with retry logic**

```typescript
// innovation-galaxy/src/services/llm/llmClient.ts
import { llmConfig } from '../../config/llm.config';

export interface LLMResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
  };
}

export class LLMClient {
  private async callWithRetry(
    prompt: string,
    options: {
      temperature?: number;
      maxTokens?: number;
    } = {},
    retryCount = 0
  ): Promise<LLMResponse> {
    try {
      const response = await fetch(llmConfig.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${llmConfig.apiKey}`,
        },
        body: JSON.stringify({
          model: llmConfig.model,
          prompt,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 1500,
        }),
        signal: AbortSignal.timeout(llmConfig.timeout),
      });

      if (!response.ok) {
        throw new Error(`LLM API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      return {
        content: data.choices?.[0]?.text || data.content || '',
        usage: data.usage,
      };
    } catch (error) {
      if (retryCount < llmConfig.maxRetries) {
        console.warn(`LLM call failed, retrying (${retryCount + 1}/${llmConfig.maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.callWithRetry(prompt, options, retryCount + 1);
      }
      throw error;
    }
  }

  async call(prompt: string, options?: { temperature?: number; maxTokens?: number }): Promise<string> {
    const response = await this.callWithRetry(prompt, options);
    return response.content;
  }

  async callJSON<T = any>(prompt: string, options?: { temperature?: number; maxTokens?: number }): Promise<T> {
    const content = await this.call(prompt, options);

    // Extract JSON from markdown code blocks if present
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```\n?([\s\S]*?)\n?```/);
    const jsonString = jsonMatch ? jsonMatch[1] : content;

    try {
      return JSON.parse(jsonString.trim());
    } catch (error) {
      console.error('Failed to parse LLM JSON response:', jsonString);
      throw new Error('Invalid JSON response from LLM');
    }
  }
}

export const llmClient = new LLMClient();
```

**Step 2: Create prompt builder**

```typescript
// innovation-galaxy/src/services/llm/promptBuilder.ts
import { Keyword } from '../../stores/useBasketStore';

// Load prompts from Python file (we'll convert them to TS)
export const PROMPTS = {
  nodeExpansion: (parentLabel: string, depth: number) => `
你是一个创新技术专家。用户正在探索"${parentLabel}"领域（当前层级：${depth}）。

请生成12-15个该领域下当前最热门、最具创新潜力的细分方向。

要求：
1. 必须是2024-2026年的前沿技术/趋势
2. 适合用于黑客松和创新产品开发
3. 每个方向用简短的中文词组表达（3-6个字）
4. 按热度和创新度排序
5. 确保多样性，覆盖不同子领域

返回JSON格式：
{
  "children": [
    {"label": "文生图", "description": "Stable Diffusion等AI图像生成技术"},
    {"label": "文生视频", "description": "Sora等视频生成技术"},
    ...
  ]
}

请直接返回JSON，不要包含其他文字说明。
`,

  ideaGeneration: (keywords: Keyword[]) => {
    const techKeywords = keywords.filter(k => k.type === 'technology').map(k => k.label).join('、');
    const scenarioKeywords = keywords.filter(k => k.type === 'scenario').map(k => k.label).join('、');
    const userKeywords = keywords.filter(k => k.type === 'user').map(k => k.label).join('、');

    return `
给出如下关键词，请生成3个创新产品idea：

【技术维度】
${techKeywords || '无'}

【场景维度】
${scenarioKeywords || '无'}

【用户维度】
${userKeywords || '无'}

要求：
1. 每个idea包含标题（10字以内）和描述（100-150字）
2. 适合黑客松快速验证
3. 强调创新性和可行性
4. 体现三个维度的有机结合
5. 关注实际用户痛点

返回JSON格式：
{
  "ideas": [
    {
      "title": "AI老人健康监护",
      "description": "...",
      "keywords": ["AI技术", "医疗健康", "老年人"]
    },
    ...
  ]
}

请直接返回JSON，不要包含其他文字说明。
`;
  },

  productManager: (ideaTitle: string, ideaDescription: string, keywords: string[]) => `
你是一位资深产品经理。请对以下创新产品idea进行商业分析：

【产品Idea】
${ideaTitle}
${ideaDescription}

【相关关键词】
${keywords.join('、')}

请按以下结构输出分析报告（每部分100-150字）：

## 目标用户
- 核心用户画像
- 用户规模估算

## 用户痛点
- 当前存在的主要问题
- 痛点严重程度

## 产品价值
- 如何解决痛点
- 核心价值主张

## 市场机会
- 市场规模
- 增长趋势

## 商业模式
- 可能的变现方式
- 收入预期

## 竞争分析
- 现有竞品
- 差异化优势

请用专业但易懂的语言，突出商业可行性。
`,

  techArchitect: (ideaTitle: string, ideaDescription: string, techKeywords: string[]) => `
你是一位资深技术架构师。请为以下产品idea设计技术实现方案：

【产品Idea】
${ideaTitle}
${ideaDescription}

【涉及技术】
${techKeywords.join('、')}

请按以下结构输出技术方案（每部分100-150字）：

## 系统架构
- 整体架构设计（前端/后端/数据）
- 技术选型理由

## 核心技术
- 关键技术栈
- 技术难点

## 关键模块
- 核心功能模块
- 模块间交互

## 技术挑战
- 主要技术风险
- 解决思路

## 开发周期
- 阶段划分
- 时间估算（MVP版本）

请注重技术的可行性和实用性，适合黑客松快速开发。
`,

  orchestrator: (ideaTitle: string, ideaDescription: string, pmAnalysis: string, techAnalysis: string) => `
你是一位创新项目总监。请整合产品和技术两方面的分析，生成一份完整的产品分析报告。

【产品Idea】
${ideaTitle}
${ideaDescription}

【产品经理分析】
${pmAnalysis}

【技术架构师分析】
${techAnalysis}

请生成一份结构完整、逻辑清晰的分析报告，包含以下部分：

# 📊 Innovation Galaxy - 产品分析报告

## 💡 Idea概述
（简明扼要总结这个idea，50字以内）

## 👥 市场与用户分析
（整合PM的用户分析和市场机会）

## 🎯 产品设计方向
（整合PM的产品价值和商业模式，提出具体产品设计建议）

## 🏗️ 技术实现方案
（整合Tech的系统架构和核心技术）

## 🚀 实施路线图
（结合开发周期，给出分阶段实施计划，包括MVP、迭代版本）

## ⚠️ 风险与挑战
（整合商业风险和技术风险）

## 📈 成功指标
（定义3-5个关键成功指标）

要求：
- 语言专业但易懂
- 突出可行性和创新性
- 适合黑客松或快速验证场景
- 使用Markdown格式，结构清晰
`,

  followUp: (ideaTitle: string, reportSummary: string, userQuestion: string) => `
你是Innovation Galaxy的AI助手。用户正在针对以下产品idea进行深入探讨：

【产品Idea】
${ideaTitle}

【之前的分析报告】
${reportSummary}

【用户问题】
${userQuestion}

请基于之前的分析，针对用户的问题给出专业、有深度的回答。

要求：
- 保持上下文连贯性
- 如需更多细节，可以参考之前的PM和Tech分析
- 回答要具体、可操作
- 适当提供例子或参考
`,
};
```

**Step 3: Test LLM client (manual verification)**

The LLM client will be tested when we implement the actual features that use it.

**Step 4: Commit**

```bash
cd innovation-galaxy
git add src/services/llm/
git commit -m "feat: add LLM client service with retry logic and prompt builder

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 5: Node Expansion Service

**Files:**
- Create: `innovation-galaxy/src/services/graph/nodeExpansionService.ts`
- Create: `innovation-galaxy/src/utils/sphericalLayout.ts`

**Step 1: Create spherical layout utility (Fibonacci sphere)**

```typescript
// innovation-galaxy/src/utils/sphericalLayout.ts
import { GraphNode } from '../stores/useGraphStore';

export function generateFibonacciSphere(
  count: number,
  radius: number,
  centerPosition: [number, number, number]
): Array<[number, number, number]> {
  const positions: Array<[number, number, number]> = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~137.5 degrees

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2; // Range: 1 to -1
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
  const radius = 3; // Distance from parent
  return generateFibonacciSphere(childCount, radius, parentNode.position);
}
```

**Step 2: Create node expansion service**

```typescript
// innovation-galaxy/src/services/graph/nodeExpansionService.ts
import { GraphNode } from '../../stores/useGraphStore';
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
    // Generate prompt
    const prompt = PROMPTS.nodeExpansion(parentNode.label, parentNode.depth);

    // Call LLM
    const response = await llmClient.callJSON<NodeExpansionResponse>(prompt, {
      temperature: 0.8,
      maxTokens: 2000,
    });

    // Validate response
    if (!response.children || !Array.isArray(response.children)) {
      throw new Error('Invalid response format from LLM');
    }

    // Limit to 12-15 children
    const childCount = Math.min(response.children.length, 15);
    const children = response.children.slice(0, childCount);

    // Generate positions using Fibonacci sphere
    const positions = generateChildNodePositions(parentNode, childCount);

    // Create child nodes
    const childNodes: GraphNode[] = children.map((child, index) => ({
      id: `${parentNode.id}-child-${index}-${Date.now()}`,
      label: child.label,
      type: parentNode.type,
      position: positions[index],
      color: COLORS[parentNode.type] || COLORS.technology,
      size: Math.max(0.3, parentNode.size * 0.7), // Smaller than parent
      expanded: false,
      depth: parentNode.depth + 1,
      children: [],
    }));

    return childNodes;
  }
}

export const nodeExpansionService = new NodeExpansionService();
```

**Step 3: Update Planet component to handle double-click expansion**

```typescript
// Modify innovation-galaxy/src/components/galaxy/Planet.tsx
// Add imports
import { useGraphStore } from '../../stores/useGraphStore';
import { nodeExpansionService } from '../../services/graph/nodeExpansionService';

// Inside Planet component, update handleDoubleClick:
const expandNode = useGraphStore((state) => state.expandNode);
const setIsExpanding = useGraphStore((state) => state.setIsExpanding);

const handleDoubleClick = async (e: any) => {
  e.stopPropagation();

  // Don't expand if already expanded
  if (node.expanded) {
    console.log('Node already expanded');
    return;
  }

  try {
    setIsExpanding(true);
    console.log('Expanding node:', node.label);

    // Call expansion service
    const children = await nodeExpansionService.expandNode(node);

    // Update store
    expandNode(node.id, children);

    console.log(`Expanded ${node.label} with ${children.length} children`);
  } catch (error) {
    console.error('Failed to expand node:', error);
    alert('节点扩展失败，请检查LLM API配置');
  } finally {
    setIsExpanding(false);
  }
};
```

**Step 4: Test node expansion**

Run: `npm run dev`, double-click a node

Expected: Node should expand with 12-15 child nodes arranged in a sphere (requires valid LLM API config)

**Step 5: Commit**

```bash
cd innovation-galaxy
git add src/services/graph/ src/utils/sphericalLayout.ts src/components/galaxy/Planet.tsx
git commit -m "feat: implement node expansion with LLM and Fibonacci sphere layout

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 6: Surprise Me - Idea Generation

**Files:**
- Create: `innovation-galaxy/src/services/llm/ideaGenerationService.ts`
- Create: `innovation-galaxy/src/components/chat/IdeaCard.tsx`
- Modify: `innovation-galaxy/src/components/layout/ChatPanel.tsx`

**Step 1: Create idea generation service**

```typescript
// innovation-galaxy/src/services/llm/ideaGenerationService.ts
import { Keyword } from '../../stores/useBasketStore';
import { Idea } from '../../stores/useAnalysisStore';
import { llmClient } from './llmClient';
import { PROMPTS } from './promptBuilder';

interface IdeaGenerationResponse {
  ideas: Array<{
    title: string;
    description: string;
    keywords: string[];
  }>;
}

export class IdeaGenerationService {
  async generateIdeas(keywords: Keyword[]): Promise<Idea[]> {
    if (keywords.length === 0) {
      throw new Error('No keywords provided');
    }

    // Generate prompt
    const prompt = PROMPTS.ideaGeneration(keywords);

    // Call LLM
    const response = await llmClient.callJSON<IdeaGenerationResponse>(prompt, {
      temperature: 0.9,
      maxTokens: 2000,
    });

    // Validate and transform
    if (!response.ideas || !Array.isArray(response.ideas)) {
      throw new Error('Invalid response format from LLM');
    }

    return response.ideas.slice(0, 3).map((idea, index) => ({
      id: `idea-${Date.now()}-${index}`,
      title: idea.title,
      description: idea.description,
      keywords: idea.keywords || [],
    }));
  }
}

export const ideaGenerationService = new IdeaGenerationService();
```

**Step 2: Create IdeaCard component**

```typescript
// innovation-galaxy/src/components/chat/IdeaCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Idea } from '../../stores/useAnalysisStore';

interface IdeaCardProps {
  idea: Idea;
  index: number;
  onSelect: (idea: Idea) => void;
  isSelected: boolean;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({
  idea,
  index,
  onSelect,
  isSelected,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`
        p-4 rounded-lg border cursor-pointer transition-all
        ${isSelected
          ? 'border-tech-blue bg-tech-blue/10 shadow-lg shadow-tech-blue/20'
          : 'border-white/10 bg-white/5 hover:border-white/30'
        }
      `}
      onClick={() => onSelect(idea)}
    >
      <h4 className="text-base font-semibold text-white mb-2">
        💡 {idea.title}
      </h4>
      <p className="text-sm text-gray-300 leading-relaxed mb-3">
        {idea.description}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {idea.keywords.map((keyword, i) => (
          <span
            key={i}
            className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-gray-400"
          >
            {keyword}
          </span>
        ))}
      </div>
      {isSelected && (
        <div className="mt-2 text-xs text-tech-blue font-medium">
          ✓ 已选择
        </div>
      )}
    </motion.div>
  );
};
```

**Step 3: Update ChatPanel to handle Surprise Me**

```typescript
// Modify innovation-galaxy/src/components/layout/ChatPanel.tsx
import React, { useState } from 'react';
import { useBasketStore } from '../../stores/useBasketStore';
import { useAnalysisStore, Idea } from '../../stores/useAnalysisStore';
import { ideaGenerationService } from '../../services/llm/ideaGenerationService';
import { IdeaCard } from '../chat/IdeaCard';
import { motion } from 'framer-motion';

export const ChatPanel: React.FC = () => {
  const keywords = useBasketStore((state) => state.keywords);
  const removeKeyword = useBasketStore((state) => state.removeKeyword);
  const maxKeywords = useBasketStore((state) => state.maxKeywords);

  const ideas = useAnalysisStore((state) => state.ideas);
  const setIdeas = useAnalysisStore((state) => state.setIdeas);
  const isGenerating = useAnalysisStore((state) => state.isGenerating);
  const setIsGenerating = useAnalysisStore((state) => state.setIsGenerating);

  const [selectedIdeas, setSelectedIdeas] = useState<string[]>([]);

  const handleSurpriseMe = async () => {
    if (keywords.length === 0) return;

    try {
      setIsGenerating(true);
      const generatedIdeas = await ideaGenerationService.generateIdeas(keywords);
      setIdeas(generatedIdeas);
      setSelectedIdeas([]);
    } catch (error) {
      console.error('Failed to generate ideas:', error);
      alert('创意生成失败，请检查LLM API配置');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleIdeaSelection = (idea: Idea) => {
    setSelectedIdeas(prev => {
      if (prev.includes(idea.id)) {
        return prev.filter(id => id !== idea.id);
      } else if (prev.length < 3) {
        return [...prev, idea.id];
      }
      return prev;
    });
  };

  return (
    <div className="w-[400px] bg-black/40 backdrop-blur-xl border-l border-white/10 flex flex-col flex-shrink-0">
      {/* Idea Basket */}
      <div className="p-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">灵感篮子</h3>
          <span className="text-xs text-gray-400">
            {keywords.length}/{maxKeywords}
          </span>
        </div>

        {/* Keywords */}
        <div className="flex flex-wrap gap-2 min-h-[60px] max-h-[200px] overflow-y-auto">
          {keywords.length === 0 ? (
            <p className="text-xs text-gray-500 italic w-full">
              点击3D图谱中的节点添加关键词...
            </p>
          ) : (
            keywords.map((keyword) => (
              <div
                key={keyword.id}
                className="group relative px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all hover:scale-105"
                style={{
                  backgroundColor: `${keyword.color}20`,
                  borderColor: keyword.color,
                  borderWidth: '1px',
                  color: keyword.color,
                }}
              >
                <span>{keyword.label}</span>
                <button
                  onClick={() => removeKeyword(keyword.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>

        {/* Surprise Me Button */}
        <button
          disabled={keywords.length === 0 || isGenerating}
          onClick={handleSurpriseMe}
          className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-tech-blue to-scenario-green rounded-lg font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-tech-blue/30 transition-all"
        >
          {isGenerating ? '🎲 生成中...' : '🎲 Surprise Me'}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {ideas.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-500 text-center leading-relaxed">
              选择关键词后点击 "Surprise Me"<br />生成创新产品创意
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">
                💡 创意方案 ({ideas.length})
              </h3>
              <span className="text-xs text-gray-400">
                已选 {selectedIdeas.length}/3
              </span>
            </div>

            {ideas.map((idea, index) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                index={index}
                onSelect={toggleIdeaSelection}
                isSelected={selectedIdeas.includes(idea.id)}
              />
            ))}

            {selectedIdeas.length > 0 && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium text-white hover:shadow-lg hover:shadow-purple-600/30 transition-all"
              >
                🔍 Deep Analysis ({selectedIdeas.length})
              </motion.button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
```

**Step 4: Test idea generation**

Run: `npm run dev`, add keywords, click "Surprise Me"

Expected: 3 idea cards should appear, user can select up to 3 ideas

**Step 5: Commit**

```bash
cd innovation-galaxy
git add src/services/llm/ideaGenerationService.ts src/components/chat/IdeaCard.tsx src/components/layout/ChatPanel.tsx
git commit -m "feat: implement Surprise Me idea generation with selectable cards

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 7: Multi-Agent Analysis System

**Files:**
- Create: `innovation-galaxy/src/services/llm/multiAgentService.ts`
- Create: `innovation-galaxy/src/components/chat/AnalysisProgress.tsx`
- Create: `innovation-galaxy/src/components/chat/ReportView.tsx`
- Modify: `innovation-galaxy/src/components/layout/ChatPanel.tsx`

**Step 1: Create multi-agent analysis service**

```typescript
// innovation-galaxy/src/services/llm/multiAgentService.ts
import { Idea } from '../../stores/useAnalysisStore';
import { llmClient } from './llmClient';
import { PROMPTS } from './promptBuilder';

export interface AgentResult {
  agent: 'pm' | 'tech' | 'orchestrator';
  content: string;
}

export class MultiAgentService {
  async analyzeIdea(
    idea: Idea,
    onProgress?: (agent: 'pm' | 'tech' | 'orchestrator') => void
  ): Promise<string> {
    try {
      // Step 1: PM and Tech agents run in parallel
      onProgress?.('pm');
      const pmPromise = this.runPMAgent(idea);

      onProgress?.('tech');
      const techPromise = this.runTechAgent(idea);

      const [pmAnalysis, techAnalysis] = await Promise.all([pmPromise, techPromise]);

      // Step 2: Orchestrator integrates results
      onProgress?.('orchestrator');
      const finalReport = await this.runOrchestratorAgent(idea, pmAnalysis, techAnalysis);

      return finalReport;
    } catch (error) {
      console.error('Multi-agent analysis failed:', error);
      throw error;
    }
  }

  private async runPMAgent(idea: Idea): Promise<string> {
    const prompt = PROMPTS.productManager(
      idea.title,
      idea.description,
      idea.keywords
    );

    return await llmClient.call(prompt, {
      temperature: 0.7,
      maxTokens: 2000,
    });
  }

  private async runTechAgent(idea: Idea): Promise<string> {
    const techKeywords = idea.keywords.filter(k =>
      k.includes('AI') || k.includes('区块链') || k.includes('物联网') ||
      k.includes('AR') || k.includes('VR') || k.includes('5G') ||
      k.includes('量子') || k.includes('生物') || k.includes('新能源')
    );

    const prompt = PROMPTS.techArchitect(
      idea.title,
      idea.description,
      techKeywords.length > 0 ? techKeywords : idea.keywords
    );

    return await llmClient.call(prompt, {
      temperature: 0.7,
      maxTokens: 2000,
    });
  }

  private async runOrchestratorAgent(
    idea: Idea,
    pmAnalysis: string,
    techAnalysis: string
  ): Promise<string> {
    const prompt = PROMPTS.orchestrator(
      idea.title,
      idea.description,
      pmAnalysis,
      techAnalysis
    );

    return await llmClient.call(prompt, {
      temperature: 0.6,
      maxTokens: 3000,
    });
  }
}

export const multiAgentService = new MultiAgentService();
```

**Step 2: Create AnalysisProgress component**

```typescript
// innovation-galaxy/src/components/chat/AnalysisProgress.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface AnalysisProgressProps {
  currentAgent: 'pm' | 'tech' | 'orchestrator' | null;
}

const AGENT_INFO = {
  pm: { name: 'Product Manager', icon: '👔', color: '#4A90E2' },
  tech: { name: 'Tech Architect', icon: '🔧', color: '#50C878' },
  orchestrator: { name: 'Orchestrator', icon: '🎯', color: '#FFD700' },
};

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
  currentAgent,
}) => {
  return (
    <div className="p-6 space-y-4">
      <h3 className="text-sm font-semibold text-white mb-4">
        🤖 AI Multi-Agent 分析中...
      </h3>

      {(['pm', 'tech', 'orchestrator'] as const).map((agent) => {
        const info = AGENT_INFO[agent];
        const isActive = currentAgent === agent;
        const isCompleted = currentAgent &&
          (['pm', 'tech', 'orchestrator'].indexOf(currentAgent) >
           ['pm', 'tech', 'orchestrator'].indexOf(agent));

        return (
          <motion.div
            key={agent}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: ['pm', 'tech', 'orchestrator'].indexOf(agent) * 0.1 }}
            className={`
              flex items-center gap-3 p-3 rounded-lg border transition-all
              ${isActive ? 'border-tech-blue bg-tech-blue/10' :
                isCompleted ? 'border-scenario-green bg-scenario-green/10' :
                'border-white/10 bg-white/5'}
            `}
          >
            <div className="text-2xl">{info.icon}</div>
            <div className="flex-1">
              <div className="text-sm font-medium text-white">{info.name}</div>
              <div className="text-xs text-gray-400">
                {isActive && '正在分析...'}
                {isCompleted && '✓ 完成'}
                {!isActive && !isCompleted && '等待中'}
              </div>
            </div>
            {isActive && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-tech-blue border-t-transparent rounded-full"
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};
```

**Step 3: Create ReportView component**

```typescript
// innovation-galaxy/src/components/chat/ReportView.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';

interface ReportViewProps {
  report: string;
  ideaTitle: string;
}

export const ReportView: React.FC<ReportViewProps> = ({
  report,
  ideaTitle,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4"
    >
      <div className="mb-4 pb-4 border-b border-white/10">
        <h3 className="text-base font-bold text-white mb-1">
          📊 分析报告
        </h3>
        <p className="text-sm text-gray-400">{ideaTitle}</p>
      </div>

      <div className="prose prose-invert prose-sm max-w-none">
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1 className="text-xl font-bold text-white mb-3 mt-4">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-lg font-semibold text-white mb-2 mt-4">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-base font-medium text-white mb-2 mt-3">{children}</h3>
            ),
            p: ({ children }) => (
              <p className="text-sm text-gray-300 mb-3 leading-relaxed">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside text-sm text-gray-300 mb-3 space-y-1">
                {children}
              </ul>
            ),
            li: ({ children }) => (
              <li className="text-sm text-gray-300">{children}</li>
            ),
            strong: ({ children }) => (
              <strong className="text-white font-semibold">{children}</strong>
            ),
          }}
        >
          {report}
        </ReactMarkdown>
      </div>
    </motion.div>
  );
};
```

**Step 4: Update ChatPanel to handle Deep Analysis**

```typescript
// Modify innovation-galaxy/src/components/layout/ChatPanel.tsx
// Add imports
import { multiAgentService } from '../../services/llm/multiAgentService';
import { AnalysisProgress } from '../chat/AnalysisProgress';
import { ReportView } from '../chat/ReportView';

// Inside component, add:
const selectIdea = useAnalysisStore((state) => state.selectIdea);
const selectedIdea = useAnalysisStore((state) => state.selectedIdea);
const report = useAnalysisStore((state) => state.report);
const setReport = useAnalysisStore((state) => state.setReport);
const isAnalyzing = useAnalysisStore((state) => state.isAnalyzing);
const setIsAnalyzing = useAnalysisStore((state) => state.setIsAnalyzing);
const currentAgent = useAnalysisStore((state) => state.currentAgent);
const setCurrentAgent = useAnalysisStore((state) => state.setCurrentAgent);

const handleDeepAnalysis = async () => {
  if (selectedIdeas.length === 0) return;

  // For now, analyze the first selected idea
  const ideaToAnalyze = ideas.find(i => i.id === selectedIdeas[0]);
  if (!ideaToAnalyze) return;

  try {
    setIsAnalyzing(true);
    selectIdea(ideaToAnalyze);

    const analysisReport = await multiAgentService.analyzeIdea(
      ideaToAnalyze,
      (agent) => setCurrentAgent(agent)
    );

    setReport(analysisReport);
    setCurrentAgent(null);
  } catch (error) {
    console.error('Failed to analyze idea:', error);
    alert('分析失败，请检查LLM API配置');
    setIsAnalyzing(false);
    setCurrentAgent(null);
  } finally {
    setIsAnalyzing(false);
  }
};

// Update Deep Analysis button onClick:
onClick={handleDeepAnalysis}

// Update content rendering logic:
{isAnalyzing ? (
  <AnalysisProgress currentAgent={currentAgent} />
) : report && selectedIdea ? (
  <ReportView report={report} ideaTitle={selectedIdea.title} />
) : ideas.length > 0 ? (
  // ... existing idea cards rendering
) : (
  // ... existing empty state
)}
```

**Step 5: Test multi-agent analysis**

Run: `npm run dev`, generate ideas, select one, click "Deep Analysis"

Expected: Progress indicators show, then report appears

**Step 6: Commit**

```bash
cd innovation-galaxy
git add src/services/llm/multiAgentService.ts src/components/chat/AnalysisProgress.tsx src/components/chat/ReportView.tsx src/components/layout/ChatPanel.tsx
git commit -m "feat: implement multi-agent analysis with PM, Tech, and Orchestrator

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 8: Multi-Turn Chat

**Files:**
- Create: `innovation-galaxy/src/components/chat/ChatInput.tsx`
- Create: `innovation-galaxy/src/components/chat/ChatMessage.tsx`
- Modify: `innovation-galaxy/src/services/llm/multiAgentService.ts`
- Modify: `innovation-galaxy/src/components/layout/ChatPanel.tsx`

**Step 1: Add follow-up method to multi-agent service**

```typescript
// Modify innovation-galaxy/src/services/llm/multiAgentService.ts
// Add method to class:
async answerFollowUp(
  ideaTitle: string,
  reportSummary: string,
  userQuestion: string
): Promise<string> {
  const prompt = PROMPTS.followUp(ideaTitle, reportSummary, userQuestion);

  return await llmClient.call(prompt, {
    temperature: 0.7,
    maxTokens: 1500,
  });
}
```

**Step 2: Create ChatMessage component**

```typescript
// innovation-galaxy/src/components/chat/ChatMessage.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { ChatMessage as ChatMessageType } from '../../stores/useAnalysisStore';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`
          max-w-[85%] px-4 py-3 rounded-lg
          ${isUser
            ? 'bg-tech-blue/20 border border-tech-blue/30 text-white'
            : 'bg-white/5 border border-white/10 text-gray-300'
          }
        `}
      >
        {isUser ? (
          <p className="text-sm">{message.content}</p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="text-sm text-gray-300 mb-2 last:mb-0">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside text-sm mb-2">{children}</ul>
                ),
                strong: ({ children }) => (
                  <strong className="text-white">{children}</strong>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
};
```

**Step 3: Create ChatInput component**

```typescript
// innovation-galaxy/src/components/chat/ChatInput.tsx
import React, { useState, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled = false,
  placeholder = '输入问题...',
}) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-white/10 bg-black/20 flex-shrink-0">
      <div className="flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          rows={2}
          className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-tech-blue/50 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          className="px-4 py-2 bg-tech-blue rounded-lg text-white text-sm font-medium hover:bg-tech-blue/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          发送
        </button>
      </div>
    </div>
  );
};
```

**Step 4: Update ChatPanel to show chat interface after report**

```typescript
// Modify innovation-galaxy/src/components/layout/ChatPanel.tsx
// Add imports
import { ChatMessage } from '../chat/ChatMessage';
import { ChatInput } from '../chat/ChatInput';

// Inside component:
const chatHistory = useAnalysisStore((state) => state.chatHistory);
const addChatMessage = useAnalysisStore((state) => state.addChatMessage);

const [isSendingMessage, setIsSendingMessage] = useState(false);

const handleSendMessage = async (message: string) => {
  if (!selectedIdea || !report) return;

  // Add user message
  addChatMessage({ role: 'user', content: message });

  try {
    setIsSendingMessage(true);

    // Get AI response
    const response = await multiAgentService.answerFollowUp(
      selectedIdea.title,
      report.substring(0, 500), // Use summary
      message
    );

    // Add assistant message
    addChatMessage({ role: 'assistant', content: response });
  } catch (error) {
    console.error('Failed to get response:', error);
    addChatMessage({
      role: 'assistant',
      content: '抱歉，回答失败，请重试。',
    });
  } finally {
    setIsSendingMessage(false);
  }
};

// Update content area to show chat history after report:
{report && selectedIdea && (
  <>
    <div className="flex-1 overflow-y-auto">
      <ReportView report={report} ideaTitle={selectedIdea.title} />

      {chatHistory.length > 0 && (
        <div className="px-4 pb-4">
          <div className="border-t border-white/10 pt-4 mb-4">
            <h4 className="text-sm font-semibold text-white mb-3">💬 继续探讨</h4>
          </div>
          {chatHistory.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
        </div>
      )}
    </div>

    <ChatInput
      onSend={handleSendMessage}
      disabled={isSendingMessage}
      placeholder={isSendingMessage ? '思考中...' : '继续提问...'}
    />
  </>
)}
```

**Step 5: Test multi-turn chat**

Run: `npm run dev`, complete full flow to report, then ask questions

Expected: Chat interface appears, questions get answered with context

**Step 6: Commit**

```bash
cd innovation-galaxy
git add src/components/chat/ChatInput.tsx src/components/chat/ChatMessage.tsx src/services/llm/multiAgentService.ts src/components/layout/ChatPanel.tsx
git commit -m "feat: implement multi-turn chat with context preservation

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 9: Performance Optimization

**Files:**
- Create: `innovation-galaxy/src/utils/performanceMonitor.ts`
- Modify: `innovation-galaxy/src/components/galaxy/GalaxyCanvas.tsx`
- Modify: `innovation-galaxy/src/components/galaxy/Planet.tsx`

**Step 1: Create performance monitor**

```typescript
// innovation-galaxy/src/utils/performanceMonitor.ts
import { APP_CONSTANTS } from '../config/constants';

class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;

  updateFPS() {
    this.frameCount++;
    const currentTime = performance.now();

    if (currentTime >= this.lastTime + 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
      this.frameCount = 0;
      this.lastTime = currentTime;
    }

    return this.fps;
  }

  getFPS(): number {
    return this.fps;
  }

  isPerformanceLow(): boolean {
    return this.fps < APP_CONSTANTS.FPS_THRESHOLD;
  }
}

export const performanceMonitor = new PerformanceMonitor();
```

**Step 2: Add LOD (Level of Detail) to Planet component**

```typescript
// Modify innovation-galaxy/src/components/galaxy/Planet.tsx
// Add import
import { useThree } from '@react-three/fiber';
import { useMemo } from 'react';

// Inside component:
const camera = useThree((state) => state.camera);

// Calculate distance from camera
const distanceFromCamera = useMemo(() => {
  const planetPos = new THREE.Vector3(...node.position);
  const cameraPos = camera.position;
  return planetPos.distanceTo(cameraPos);
}, [node.position, camera.position]);

// Determine if node should be visible based on distance and depth
const shouldRender = useMemo(() => {
  // Hide nodes that are too far based on depth
  const maxDistance = 50 - (node.depth * 5);
  return distanceFromCamera < maxDistance;
}, [distanceFromCamera, node.depth]);

// Adjust opacity based on distance
const opacity = useMemo(() => {
  if (distanceFromCamera > 40) return 0.3;
  if (distanceFromCamera > 30) return 0.6;
  return 1.0;
}, [distanceFromCamera]);

// Don't render if too far
if (!shouldRender) return null;

// Update material properties:
<meshStandardMaterial
  color={node.color}
  emissive={node.color}
  emissiveIntensity={hovered ? 0.8 : isSelected ? 0.5 : 0.3}
  roughness={0.3}
  metalness={0.5}
  transparent
  opacity={opacity}
/>
```

**Step 3: Add performance monitoring to GalaxyCanvas**

```typescript
// Modify innovation-galaxy/src/components/galaxy/GalaxyCanvas.tsx
// Add imports
import { useFrame } from '@react-three/fiber';
import { performanceMonitor } from '../../utils/performanceMonitor';
import { useState } from 'react';

// Inside component:
const [showFPS, setShowFPS] = useState(false);
const [fps, setFPS] = useState(60);

// Add FPS monitoring (inside a useFrame somewhere or create a FPS component)
useEffect(() => {
  const interval = setInterval(() => {
    setFPS(performanceMonitor.getFPS());
  }, 1000);

  return () => clearInterval(interval);
}, []);

// Add FPS display in the footer area:
{showFPS && (
  <div className="absolute top-4 right-4 px-3 py-2 bg-black/60 backdrop-blur-md rounded-lg border border-white/10">
    <span className="text-xs text-white">FPS: {fps}</span>
  </div>
)}
```

**Step 4: Test performance**

Run: `npm run dev`, expand many nodes, check FPS

Expected: Performance optimizations keep FPS above 30

**Step 5: Commit**

```bash
cd innovation-galaxy
git add src/utils/performanceMonitor.ts src/components/galaxy/Planet.tsx src/components/galaxy/GalaxyCanvas.tsx
git commit -m "feat: add performance monitoring and LOD optimization

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 10: Error Handling & Polish

**Files:**
- Create: `innovation-galaxy/src/components/common/ErrorBoundary.tsx`
- Create: `innovation-galaxy/src/components/common/LoadingSpinner.tsx`
- Modify: `innovation-galaxy/src/App.tsx`

**Step 1: Create ErrorBoundary**

```typescript
// innovation-galaxy/src/components/common/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-screen h-screen flex items-center justify-center bg-galaxy-bg">
          <div className="max-w-md p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">⚠️ 出错了</h2>
            <p className="text-sm text-gray-300 mb-4">
              {this.state.error?.message || '发生未知错误'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-tech-blue rounded-lg text-white text-sm font-medium hover:bg-tech-blue/80 transition-colors"
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Step 2: Create LoadingSpinner**

```typescript
// innovation-galaxy/src/components/common/LoadingSpinner.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <motion.div
        className={`${sizeClasses[size]} border-3 border-tech-blue border-t-transparent rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      {text && <p className="text-sm text-gray-400">{text}</p>}
    </div>
  );
};
```

**Step 3: Wrap App with ErrorBoundary**

```typescript
// Modify innovation-galaxy/src/App.tsx
import { ErrorBoundary } from './components/common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <div className="w-screen h-screen flex flex-col overflow-hidden bg-galaxy-bg">
        <Header />
        <div className="flex-1 flex overflow-hidden">
          <GalaxyCanvas />
          <ChatPanel />
        </div>
      </div>
    </ErrorBoundary>
  );
}
```

**Step 4: Test error handling**

Verify app handles errors gracefully

**Step 5: Commit**

```bash
cd innovation-galaxy
git add src/components/common/ src/App.tsx
git commit -m "feat: add error boundary and loading components

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 11: Environment Configuration

**Files:**
- Modify: `innovation-galaxy/.env.example`
- Create: `innovation-galaxy/README_SETUP.md`

**Step 1: Update .env.example**

```bash
# Modify innovation-galaxy/.env.example
VITE_LLM_API_ENDPOINT=https://your-llm-api-endpoint.com/v1/completions
VITE_LLM_API_KEY=your-api-key-here
VITE_LLM_MODEL=your-model-name
```

**Step 2: Create setup documentation**

```markdown
# Innovation Galaxy - Setup Guide

## Prerequisites

- Node.js >= 18
- npm >= 9
- LLM API access (company private deployment)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` file with your LLM API credentials:
   - `VITE_LLM_API_ENDPOINT`: Your LLM API endpoint
   - `VITE_LLM_API_KEY`: Your API key
   - `VITE_LLM_MODEL`: Model name to use

## Development

```bash
npm run dev
```

Visit http://localhost:5173 (or next available port)

## Build

```bash
npm run build
```

## Usage

1. **Explore 3D Galaxy**: Click and drag to rotate, scroll to zoom
2. **Select Keywords**: Click nodes to add to basket
3. **Expand Nodes**: Double-click nodes to see sub-categories
4. **Generate Ideas**: Click "Surprise Me" to generate 3 product ideas
5. **Deep Analysis**: Select ideas and click "Deep Analysis" for AI report
6. **Chat**: Ask follow-up questions about the analysis

## Troubleshooting

### "节点扩展失败"
- Check LLM API configuration in `.env`
- Verify API endpoint is accessible
- Check API key is valid

### Low FPS
- Reduce number of expanded nodes
- Close other browser tabs
- Use a more powerful GPU

### API Timeout
- Increase timeout in `src/config/llm.config.ts`
- Check network connection
- Contact API provider

## License

MIT
```

**Step 3: Save setup documentation**

```bash
# Save to innovation-galaxy/README_SETUP.md
```

**Step 4: Commit**

```bash
cd innovation-galaxy
git add .env.example README_SETUP.md
git commit -m "docs: add setup guide and environment configuration

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Optional: Task 12: Gesture Recognition (Stage 4)

This task is optional per PRD. If time permits:

**Files:**
- Create: `innovation-galaxy/src/services/gesture/gestureService.ts`
- Create: `innovation-galaxy/src/components/galaxy/GestureOverlay.tsx`
- Modify: `innovation-galaxy/src/components/layout/Header.tsx`

Implementation details would include:
- MediaPipe Hands integration
- Permission request flow
- Gesture detection (pinch, palm move, point)
- Fallback to mouse control
- Performance monitoring

*Skipping detailed steps for optional feature - can be implemented if requested.*

---

## Summary

This plan implements the complete Innovation Galaxy system following the PRD structure:

**Stage 2 Complete:**
- ✅ Connection lines (star trails)
- ✅ Particle system
- ✅ Bloom effects
- ✅ Node expansion with LLM
- ✅ Performance optimization (LOD, FPS monitoring)

**Stage 3 Complete:**
- ✅ LLM service layer
- ✅ Surprise Me idea generation
- ✅ Multi-agent analysis (PM + Tech + Orchestrator)
- ✅ Report rendering
- ✅ Multi-turn chat

**Stage 5 Complete:**
- ✅ Error handling
- ✅ Loading states
- ✅ Documentation

**Total Tasks:** 11 core tasks (+ 1 optional gesture recognition)

**Estimated Time:** 1-2 weeks for full implementation

Each task is broken down into small, testable steps with frequent commits following TDD principles where applicable.
