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
      console.log('🚀 Calling LLM API:', {
        endpoint: llmConfig.apiEndpoint,
        model: llmConfig.model,
        promptLength: prompt.length,
        maxTokens: options.maxTokens ?? 4096
      });

      const response = await fetch(llmConfig.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': llmConfig.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: llmConfig.model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: options.maxTokens ?? 4096,
        }),
        signal: AbortSignal.timeout(llmConfig.timeout),
      });

      console.log('✅ API Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ LLM API Error Response:', errorText);
        throw new Error(`LLM API Error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📦 API Response Data:', data);

      const content = data.content?.[0]?.text || data.content || '';
      console.log('📝 Extracted Content Length:', content.length);

      return {
        content,
        usage: data.usage,
      };
    } catch (error: any) {
      console.error('💥 LLM Call Error:', {
        error: error.message,
        type: error.name,
        retryCount,
      });

      if (retryCount < llmConfig.maxRetries) {
        console.warn(`🔄 Retrying (${retryCount + 1}/${llmConfig.maxRetries})...`);
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
