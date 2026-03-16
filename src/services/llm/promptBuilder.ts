import type { Keyword } from '../../stores/useBasketStore';

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
你是一位创新项目总监。请整合产品和技术两方面的分析，生成一份**结构清晰、层次分明**的完整产品分析报告。

<format_requirements>
请严格按照以下Markdown格式输出：

1. 使用明确的标题层级：
   - # 一级标题（主要章节，用于报告标题）
   - ## 二级标题（子章节，用于各个分析部分）
   - ### 三级标题（细节点）

2. 合理使用列表：
   - 无序列表使用 - 或 *
   - 有序列表使用 1. 2. 3.
   - 列表项之间保持清晰

3. 重点内容使用 **加粗**

4. 代码或技术术语使用反引号：\`技术名称\`

5. 段落之间保持一个空行，避免内容拥挤

6. 表格格式：
   | 列1 | 列2 | 列3 |
   |-----|-----|-----|
   | 内容 | 内容 | 内容 |

7. 引用重要观点使用 > 引用块
</format_requirements>

【产品Idea】
${ideaTitle}
${ideaDescription}

【产品经理分析】
${pmAnalysis}

【技术架构师分析】
${techAnalysis}

请生成一份结构完整、逻辑清晰的分析报告，包含以下部分（每个章节之间空一行）：

# ${ideaTitle} - 产品分析报告

## 一、产品概述

[150字左右概括产品定位、核心价值和目标用户]

## 二、市场分析

### 2.1 目标用户
- 用户画像
- 用户规模
- 核心需求

### 2.2 市场机会
- 市场规模
- 增长趋势
- 竞争态势

### 2.3 差异化优势
[相比现有竞品的3-5个关键优势点]

## 三、功能设计

### 3.1 核心功能模块

| 功能模块 | 功能描述 | 优先级 |
|---------|---------|-------|
| ... | ... | P0/P1/P2 |

### 3.2 用户旅程
[关键使用流程的步骤描述]

## 四、技术架构

### 4.1 系统架构设计
[整体架构描述，包括前端、后端、数据层]

### 4.2 核心技术栈

**前端**：\`React\`、\`TypeScript\`...
**后端**：\`Node.js\`、\`Express\`...
**数据库**：\`PostgreSQL\`...
**AI/ML**：\`OpenAI API\`...

### 4.3 技术难点与解决方案
- **难点1**：[描述] → 解决方案：[描述]
- **难点2**：[描述] → 解决方案：[描述]

## 五、商业模式

### 5.1 变现方式
[2-3种可行的变现方式]

### 5.2 成本结构
[主要成本项]

### 5.3 收入预期
[基于用户规模的收入估算]

## 六、实施路径

### 6.1 MVP范围（4-6周）
- [ ] 核心功能1
- [ ] 核心功能2
- [ ] 核心功能3

### 6.2 开发计划

| 阶段 | 时间 | 交付内容 | 关键里程碑 |
|-----|------|---------|-----------|
| MVP | 6周 | 核心功能 | 首批用户测试 |
| V1.0 | +8周 | 完整功能 | 正式发布 |
| V2.0 | +12周 | 高级功能 | 规模化运营 |

### 6.3 资源需求
**团队**：前端x1、后端x1、产品x1
**预算**：[估算]

## 七、风险与建议

### 7.1 主要风险
- **市场风险**：[描述及应对]
- **技术风险**：[描述及应对]
- **运营风险**：[描述及应对]

### 7.2 关键建议
> [3-5条关键建议，突出最重要的执行建议]

## 八、成功指标

| 指标类型 | 具体指标 | 目标值 | 时间节点 |
|---------|---------|-------|---------|
| 用户增长 | DAU | ... | MVP后3个月 |
| 用户留存 | 次日留存率 | ... | MVP后1个月 |
| 商业指标 | 付费转化率 | ... | V1.0后2个月 |

---

*报告生成时间：${new Date().toLocaleString('zh-CN')}*
*分析团队：Innovation Galaxy AI (PM Agent + Tech Agent + Orchestrator)*
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
