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
