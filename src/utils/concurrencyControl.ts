/**
 * 并发控制器 - 限制同时进行的请求数量
 * 避免同时发起过多API请求导致限流或性能问题
 */
export class ConcurrencyController {
  private maxConcurrent: number;
  private running: number = 0;
  private queue: Array<{
    task: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  constructor(maxConcurrent: number = 3) {
    this.maxConcurrent = maxConcurrent;
    console.log(`🚦 ConcurrencyController initialized with limit: ${maxConcurrent}`);
  }

  /**
   * 执行任务（带并发控制）
   */
  async run<T>(task: () => Promise<T>): Promise<T> {
    // 如果当前运行数未达到上限，直接执行
    if (this.running < this.maxConcurrent) {
      return this.executeTask(task);
    }

    // 否则加入队列等待
    console.log(`⏳ Task queued (running: ${this.running}/${this.maxConcurrent}, queue: ${this.queue.length})`);
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
    });
  }

  /**
   * 执行任务
   */
  private async executeTask<T>(task: () => Promise<T>): Promise<T> {
    this.running++;
    console.log(`🏃 Task started (running: ${this.running}/${this.maxConcurrent})`);

    try {
      const result = await task();
      return result;
    } finally {
      this.running--;
      console.log(`✅ Task completed (running: ${this.running}/${this.maxConcurrent})`);
      this.processQueue();
    }
  }

  /**
   * 处理队列中的下一个任务
   */
  private processQueue() {
    if (this.queue.length > 0 && this.running < this.maxConcurrent) {
      const next = this.queue.shift();
      if (next) {
        console.log(`📤 Processing queued task (queue remaining: ${this.queue.length})`);
        this.executeTask(next.task)
          .then(next.resolve)
          .catch(next.reject);
      }
    }
  }

  /**
   * 获取当前状态
   */
  getStatus() {
    return {
      running: this.running,
      queued: this.queue.length,
      maxConcurrent: this.maxConcurrent,
    };
  }

  /**
   * 清空队列
   */
  clearQueue() {
    const count = this.queue.length;
    this.queue.forEach(item => {
      item.reject(new Error('Queue cleared'));
    });
    this.queue = [];
    console.log(`🗑️ Cleared ${count} queued tasks`);
  }
}

// 导出单例
export const llmConcurrencyController = new ConcurrencyController(3);
