interface CacheEntry {
  response: string;
  timestamp: number;
}

/**
 * LLM响应缓存
 * 用于缓存相同参数的API响应，减少重复调用
 */
export class LLMCache {
  private cache = new Map<string, CacheEntry>();
  private ttl: number; // 缓存时间（毫秒）
  private maxSize: number; // 最大缓存条目数

  constructor(ttl: number = 1000 * 60 * 30, maxSize: number = 100) {
    this.ttl = ttl; // 默认30分钟
    this.maxSize = maxSize;
  }

  /**
   * 生成缓存key
   */
  private getKey(prompt: string, options: any): string {
    const optionsStr = JSON.stringify({
      temperature: options.temperature,
      maxTokens: options.maxTokens,
    });
    // 使用prompt的hash + options生成key（简化版，生产环境建议用更好的hash算法）
    return `${this.simpleHash(prompt)}::${optionsStr}`;
  }

  /**
   * 简单hash函数
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  /**
   * 获取缓存
   */
  get(prompt: string, options: any): string | null {
    const key = this.getKey(prompt, options);
    const entry = this.cache.get(key);

    if (!entry) {
      console.log('💾 Cache miss for key:', key.substring(0, 20) + '...');
      return null;
    }

    // 检查是否过期
    if (Date.now() - entry.timestamp > this.ttl) {
      console.log('⏰ Cache expired for key:', key.substring(0, 20) + '...');
      this.cache.delete(key);
      return null;
    }

    console.log('✅ Cache hit for key:', key.substring(0, 20) + '...');
    return entry.response;
  }

  /**
   * 设置缓存
   */
  set(prompt: string, options: any, response: string) {
    // 如果缓存已满，删除最旧的条目
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
        console.log('🗑️ Cache full, removed oldest entry');
      }
    }

    const key = this.getKey(prompt, options);
    this.cache.set(key, {
      response,
      timestamp: Date.now(),
    });
    console.log('💾 Cached response for key:', key.substring(0, 20) + '...', `(${this.cache.size}/${this.maxSize})`);
  }

  /**
   * 清空缓存
   */
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`🗑️ Cleared ${size} cache entries`);
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      ttl: this.ttl,
    };
  }
}

// 导出单例
export const llmCache = new LLMCache();
