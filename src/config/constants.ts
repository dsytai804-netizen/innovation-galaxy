// 应用常量配置

export const APP_CONSTANTS = {
  // 灵感篮子
  MAX_KEYWORDS: 20,

  // 图谱
  MAX_NODES: 500,
  NODE_EXPANSION_COUNT_MIN: 12,
  NODE_EXPANSION_COUNT_MAX: 15,

  // 性能
  FPS_THRESHOLD: 30,
  PARTICLE_COUNT: 2500,

  // 视觉
  NODE_SIZE_RANGE: [0.3, 1.0] as const,
  FADE_DISTANCE_LAYERS: 3,
  HIDE_DISTANCE_LAYERS: 5,

  // 动画
  STAGGER_DELAY: 100, // ms
  TRANSITION_DURATION: 300, // ms

  // 手势识别
  GESTURE_FPS: 30,
  GESTURE_IDLE_TIMEOUT: 2000, // ms

  // UI
  CHAT_PANEL_WIDTH: 400, // px
  HEADER_HEIGHT: 60, // px
  FOOTER_AUTO_HIDE_DELAY: 5000, // ms

  // LLM
  LLM_TIMEOUT: 30000, // ms
  LLM_MAX_RETRIES: 3,

  // 创意生成
  IDEAS_TO_GENERATE: 3,
  IDEA_DESCRIPTION_LENGTH: [100, 150] as const,
};

// 颜色主题
export const COLORS = {
  // 星系颜色
  technology: '#4A90E2',  // 蓝色
  scenario: '#50C878',    // 绿色
  user: '#FF9F40',        // 橙色
  core: '#FFD700',        // 金色

  // 背景
  background: '#0a0e27',

  // UI
  primary: '#4A90E2',
  secondary: '#50C878',
  accent: '#FF9F40',

  // 状态
  success: '#50C878',
  warning: '#FFD700',
  error: '#FF4444',
};

// 响应式断点
export const BREAKPOINTS = {
  DESKTOP_LARGE: 1920,
  DESKTOP: 1440,
  LAPTOP: 1280,
  MIN_SUPPORTED: 1280,
};
