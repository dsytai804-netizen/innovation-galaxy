import { Keyword } from '../../stores/useBasketStore';

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
};
