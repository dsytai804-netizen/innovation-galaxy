// LLM API Configuration

export const llmConfig = {
  apiEndpoint: import.meta.env.VITE_LLM_API_ENDPOINT || '',
  apiKey: import.meta.env.VITE_LLM_API_KEY || '',
  model: import.meta.env.VITE_LLM_MODEL || 'default-model',
  timeout: 30000,  // 30秒超时
  maxRetries: 3,   // 最多重试3次
};

// API调用辅助函数
export async function callLLM(prompt: string, options?: {
  temperature?: number;
  maxTokens?: number;
}) {
  const response = await fetch(llmConfig.apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${llmConfig.apiKey}`,
    },
    body: JSON.stringify({
      model: llmConfig.model,
      prompt,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1500,
    }),
    signal: AbortSignal.timeout(llmConfig.timeout),
  });

  if (!response.ok) {
    throw new Error(`LLM API Error: ${response.statusText}`);
  }

  return response.json();
}
