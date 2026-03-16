import { langChainClient } from './langchainAdapter';
import { PROMPTS } from './promptBuilder';
import type { Idea } from '../../stores/useAnalysisStore';

/**
 * 多Agent协作图（使用LangChain）
 * 简化版本：不使用StateGraph的复杂类型系统，直接使用LangChain客户端
 */
export class MultiAgentGraph {
  private onProgress?: (agent: 'pm' | 'tech' | 'orchestrator', chunk?: string) => void;

  constructor() {
    console.log('🏗️ MultiAgentGraph initialized with LangChain');
  }

  /**
   * PM Agent - 产品经理分析
   */
  private async runPMAgent(idea: Idea): Promise<string> {
    console.log('🎯 PM Agent starting...');
    this.onProgress?.('pm');

    const { title, description, keywords } = idea;
    const prompt = PROMPTS.productManager(title, description, keywords);

    const pmAnalysis = await langChainClient.call(prompt, {
      temperature: 0.7,
      maxTokens: 2000,
    });

    console.log('✅ PM Agent completed');
    return pmAnalysis;
  }

  /**
   * Tech Agent - 技术架构师分析
   */
  private async runTechAgent(idea: Idea): Promise<string> {
    console.log('🔧 Tech Agent starting...');
    this.onProgress?.('tech');

    const { title, description, keywords } = idea;

    // 筛选技术关键词
    const techKeywords = keywords.filter(k =>
      k.includes('AI') || k.includes('区块链') || k.includes('物联网') ||
      k.includes('AR') || k.includes('VR') || k.includes('5G') ||
      k.includes('量子') || k.includes('生物') || k.includes('新能源')
    );

    const prompt = PROMPTS.techArchitect(
      title,
      description,
      techKeywords.length > 0 ? techKeywords : keywords
    );

    const techAnalysis = await langChainClient.call(prompt, {
      temperature: 0.7,
      maxTokens: 2000,
    });

    console.log('✅ Tech Agent completed');
    return techAnalysis;
  }

  /**
   * Orchestrator - 整合报告（流式）
   */
  private async *runOrchestrator(
    idea: Idea,
    pmAnalysis: string,
    techAnalysis: string
  ): AsyncGenerator<string, void, unknown> {
    console.log('📊 Orchestrator starting (streaming)...');
    this.onProgress?.('orchestrator');

    const prompt = PROMPTS.orchestrator(
      idea.title,
      idea.description,
      pmAnalysis,
      techAnalysis
    );

    // 流式生成报告 - 增加maxTokens到8000确保完整输出
    for await (const chunk of langChainClient.callStream(prompt, {
      temperature: 0.6,
      maxTokens: 8000,  // 🔧 从3000增加到8000
    })) {
      this.onProgress?.('orchestrator', chunk);
      yield chunk;
    }

    console.log('✅ Orchestrator completed');
  }

  /**
   * 执行分析
   * @param idea 创意idea
   * @param onProgress 进度回调
   * @returns 完整的分析报告
   */
  async analyze(
    idea: Idea,
    onProgress?: (agent: 'pm' | 'tech' | 'orchestrator', chunk?: string) => void
  ): Promise<string> {
    console.log('🚀 Starting MultiAgentGraph analysis for:', idea.title);
    this.onProgress = onProgress;

    try {
      // 步骤1: PM和Tech Agent并行执行
      console.log('📊 Step 1: Running PM and Tech agents in parallel...');
      const [pmAnalysis, techAnalysis] = await Promise.all([
        this.runPMAgent(idea),
        this.runTechAgent(idea),
      ]);

      console.log('✅ PM Analysis length:', pmAnalysis.length);
      console.log('✅ Tech Analysis length:', techAnalysis.length);

      // 步骤2: Orchestrator流式生成报告
      console.log('📊 Step 2: Running Orchestrator (streaming)...');
      let finalReport = '';
      let chunkCount = 0;

      for await (const chunk of this.runOrchestrator(idea, pmAnalysis, techAnalysis)) {
        finalReport += chunk;
        chunkCount++;
        if (chunkCount % 10 === 0) {
          console.log(`📦 Streamed ${chunkCount} chunks, total length: ${finalReport.length}`);
        }
      }

      console.log('✅ MultiAgentGraph analysis completed');
      console.log(`📝 Final report length: ${finalReport.length} characters`);
      console.log(`📦 Total chunks: ${chunkCount}`);

      if (finalReport.length === 0) {
        console.error('❌ WARNING: Final report is empty!');
      }

      return finalReport;
    } catch (error: any) {
      console.error('💥 MultiAgentGraph analysis failed:', error);
      console.error('💥 Error stack:', error.stack);
      throw error;
    }
  }
}

// 导出单例
export const multiAgentGraph = new MultiAgentGraph();
