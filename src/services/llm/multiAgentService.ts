import type { Idea } from '../../stores/useAnalysisStore';
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
