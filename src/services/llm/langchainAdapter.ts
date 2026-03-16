import { llmClient } from './llmClient';
import { llmConfig } from '../../config/llm.config';

/**
 * LangChain风格的LLM客户端适配器
 * 直接使用原生的llmClient,避免ChatAnthropic的相对路径问题
 *
 * 问题: @langchain/anthropic的ChatAnthropic不支持相对路径作为API URL (如 /llm-api/v1)
 * 解决: 使用已经work的llmClient,它正确处理了Vite代理的相对路径
 */
export class LangChainLLMClient {
  constructor() {
    console.log('🔗 LangChain-style adapter initialized (using native llmClient):', {
      model: llmConfig.model,
      endpoint: llmConfig.apiEndpoint,
    });
  }

  /**
   * 流式调用 - 委托给原生llmClient
   * @param prompt 用户提示
   * @param options 可选配置
   * @returns AsyncGenerator<string> 逐chunk生成的文本
   */
  async *callStream(
    prompt: string,
    options: {
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): AsyncGenerator<string, void, unknown> {
    console.log('🌊 LangChain-style streaming call (delegating to llmClient)');

    try {
      // 直接使用llmClient的流式方法
      for await (const chunk of llmClient.callStream(prompt, options)) {
        yield chunk;
      }

      console.log('✅ Stream completed');
    } catch (error: any) {
      console.error('💥 Stream failed:', {
        error: error.message,
        type: error.name,
      });
      throw error;
    }
  }

  /**
   * 非流式调用 - 委托给原生llmClient
   * @param prompt 用户提示
   * @param options 可选配置
   * @returns Promise<string> 完整响应文本
   */
  async call(
    prompt: string,
    options: {
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): Promise<string> {
    console.log('📞 LangChain-style call (delegating to llmClient)');

    try {
      // 直接使用llmClient的call方法
      const content = await llmClient.call(prompt, options);

      console.log('✅ Call completed:', {
        responseLength: content.length,
      });

      return content;
    } catch (error: any) {
      console.error('💥 Call failed:', {
        error: error.message,
        type: error.name,
      });
      throw error;
    }
  }
}

export const langChainClient = new LangChainLLMClient();
