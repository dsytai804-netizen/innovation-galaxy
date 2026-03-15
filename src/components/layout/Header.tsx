import React from 'react';
import { Sparkles, MousePointer2, HelpCircle } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="h-[60px] flex-shrink-0 flex items-center justify-between px-6 border-b border-white/10 bg-[#0B0F19] z-20 sticky top-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-[17px] font-bold text-white tracking-wide flex items-center gap-2">
          Innovation Galaxy
        </h1>
        <span className="text-slate-500 text-sm border-l border-white/10 pl-3 ml-1">
          智能创意生成系统
        </span>
      </div>
      <div className="flex items-center gap-6 text-sm text-slate-400">
        <span className="flex items-center gap-2 text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">
          <MousePointer2 className="w-3.5 h-3.5" /> 探索模式
        </span>
        <button className="flex items-center gap-1.5 hover:text-white transition-colors">
          <HelpCircle className="w-4 h-4" /> 帮助
        </button>
      </div>
    </header>
  );
};
