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

  /**
   * 流式调用LLM API
   * 注意：如果后端不支持真正的streaming，这里会模拟流式输出
   * @returns AsyncGenerator<string> - 逐chunk生成的文本
   */
  async *callStream(
    prompt: string,
    options: {
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): AsyncGenerator<string, void, unknown> {
    const apiEndpoint = llmConfig.apiEndpoint;

    console.log('🌊 Starting streaming LLM call:', {
      endpoint: apiEndpoint,
      model: llmConfig.model,
      promptLength: prompt.length,
    });

    const body = {
      model: llmConfig.model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: options.maxTokens ?? 4096,
      temperature: options.temperature ?? 0.7,
      stream: true, // 尝试启用流式
    };

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': llmConfig.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(120000),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Stream API Error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      console.log('📦 Response Content-Type:', contentType);

      // 检查是否是真正的流式响应
      if (contentType.includes('text/event-stream') || contentType.includes('stream')) {
        console.log('🔄 Using real streaming...');
        yield* this.parseStreamResponse(response);
      } else {
        // 后端不支持流式，fallback到模拟流式
        console.log('⚠️ Backend does not support streaming, using simulated streaming...');
        const data = await response.json();
        const content = data.content?.[0]?.text || data.content || '';

        if (!content) {
          console.error('❌ No content in response:', data);
          throw new Error('Empty response from LLM');
        }

        console.log(`📝 Full response length: ${content.length}, simulating stream...`);

        // 模拟流式输出：每次yield 5-10个字符
        for (let i = 0; i < content.length; i += 8) {
          const chunk = content.slice(i, i + 8);
          yield chunk;
          // 添加小延迟模拟真实流式效果
          await new Promise(resolve => setTimeout(resolve, 20));
        }

        console.log('✅ Simulated stream completed');
      }
    } catch (error: any) {
      console.error('💥 Stream call failed:', {
        error: error.message,
        endpoint: apiEndpoint,
        model: llmConfig.model,
      });
      throw error;
    }
  }

  /**
   * 解析真正的流式响应
   */
  private async *parseStreamResponse(response: Response): AsyncGenerator<string, void, unknown> {
    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let eventCount = 0;
    let yieldCount = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log('✅ Stream completed:', { eventCount, yieldCount });
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim() === '') continue;
        // 注意：有些服务器返回 "data:" 没有空格，有些返回 "data: " 有空格
        if (!line.startsWith('data:') && !line.startsWith('data: ')) continue;

        // 去掉 "data:" 或 "data: " 前缀
        const data = line.startsWith('data: ') ? line.slice(6) : line.slice(5);
        if (data === '[DONE]' || data.trim() === '') continue;

        try {
          const parsed = JSON.parse(data);
          eventCount++;

          if (eventCount <= 3) {
            console.log(`🔍 SSE Event ${eventCount}:`, parsed);
          }

          // 尝试多种可能的格式
          if (parsed.type === 'content_block_delta') {
            const text = parsed.delta?.text || '';
            if (text) {
              yieldCount++;
              yield text;
            }
          } else if (parsed.delta?.text) {
            yieldCount++;
            yield parsed.delta.text;
          } else if (parsed.text) {
            yieldCount++;
            yield parsed.text;
          } else if (parsed.content) {
            if (typeof parsed.content === 'string') {
              yieldCount++;
              yield parsed.content;
            } else if (Array.isArray(parsed.content)) {
              for (const item of parsed.content) {
                if (item.text) {
                  yieldCount++;
                  yield item.text;
                }
              }
            }
          }
        } catch (e) {
          console.warn('Failed to parse SSE line:', line.substring(0, 100));
        }
      }
    }
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
