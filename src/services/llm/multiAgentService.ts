import type { Idea } from '../../stores/useAnalysisStore';
import { llmClient } from './llmClient';
import { multiAgentGraph } from './multiAgentGraph';
import { PROMPTS } from './promptBuilder';

export interface AgentResult {
  agent: 'pm' | 'tech' | 'orchestrator';
  content: string;
}

/**
 * 多Agent分析服务
 * 现在使用LangGraph进行Agent编排
 */
export class MultiAgentService {
  /**
   * 分析创意idea
   * @param idea 创意对象
   * @param onProgress 进度回调（agent名称和可选的流式chunk）
   * @returns 完整的分析报告
   */
  async analyzeIdea(
    idea: Idea,
    onProgress?: (agent: 'pm' | 'tech' | 'orchestrator', chunk?: string) => void
  ): Promise<string> {
    console.log('📊 MultiAgentService: Using LangGraph for analysis');

    try {
      // 使用LangGraph进行分析
      return await multiAgentGraph.analyze(idea, onProgress);
    } catch (error) {
      console.error('Multi-agent analysis failed:', error);
      throw error;
    }
  }

  /**
   * 回答后续问题
   * @param ideaTitle 创意标题
   * @param reportSummary 报告摘要
   * @param userQuestion 用户问题
   * @returns AI回答
   */
  async answerFollowUp(
    ideaTitle: string,
    reportSummary: string,
    userQuestion: string
  ): Promise<string> {
    const prompt = PROMPTS.followUp(ideaTitle, reportSummary, userQuestion);

    // 这里继续使用原有的llmClient，因为不需要复杂编排
    return await llmClient.call(prompt, {
      temperature: 0.7,
      maxTokens: 1500,
    });
  }
}

export const multiAgentService = new MultiAgentService();
