import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/60 via-black/40 to-transparent backdrop-blur-sm border-t border-white/5">
      <div className="h-full max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* 左侧：项目信息 */}
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="font-medium text-gray-300">Innovation Galaxy</span>
          <span className="text-gray-600">|</span>
          <span>智能创意生成系统</span>
        </div>

        {/* 中间：交互提示 */}
        <div className="flex items-center gap-6 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
            <span>拖拽旋转</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
            <span>滚轮缩放</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
            <span>单击选中</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
            <span>双击展开</span>
          </div>
        </div>

        {/* 右侧：版权信息 */}
        <div className="text-xs text-gray-500">
          Powered by Claude AI
        </div>
      </div>
    </footer>
  );
};
