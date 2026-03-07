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

    const prompt = PROMPTS.ideaGeneration(keywords);

    const response = await llmClient.callJSON<IdeaGenerationResponse>(prompt, {
      temperature: 0.9,
      maxTokens: 2000,
    });

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
