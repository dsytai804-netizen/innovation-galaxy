import React from 'react';
import { Sparkles, Lightbulb, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { InspirationBasket } from './InspirationBasket';
import type { Keyword } from '../../stores/useBasketStore';

interface InitialViewProps {
  keywords: Keyword[];
  maxKeywords: number;
  onRemoveKeyword: (id: string) => void;
  onSurpriseMe: () => void;
  isGenerating: boolean;
}

export const InitialView: React.FC<InitialViewProps> = ({
  keywords,
  maxKeywords,
  onRemoveKeyword,
  onSurpriseMe,
  isGenerating,
}) => {
  return (
    <>
      {/* 灵感篮子 */}
      <div className="p-5 border-b border-white/5 flex-shrink-0 bg-[#151B2B]">
        {/* 标题行 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold flex items-center gap-2 text-slate-100">
            <Lightbulb className="w-4 h-4 text-yellow-400 fill-yellow-400/20" />
            灵感篮子
          </h2>
          <span className="text-xs text-slate-400 bg-black/30 px-2 py-1 rounded-full border border-white/5 font-mono">
            {keywords.length}/{maxKeywords}
          </span>
        </div>

        {/* 标签容器 */}
        <InspirationBasket
          keywords={keywords}
          maxKeywords={maxKeywords}
          onRemove={onRemoveKeyword}
        />
      </div>

      {/* Surprise Me 按钮 */}
      <div className="p-5 pb-3 flex-shrink-0">
        <button
          disabled={keywords.length === 0 || isGenerating}
          onClick={onSurpriseMe}
          data-cursor="interactive"
          style={{
            background: keywords.length === 0 || isGenerating
              ? 'linear-gradient(to right, rgb(99 102 241 / 0.7), rgb(168 85 247 / 0.7), rgb(236 72 153 / 0.7))'
              : 'linear-gradient(to right, rgb(99 102 241), rgb(168 85 247), rgb(236 72 153))'
          }}
          className="w-full h-[56px] rounded-xl font-bold text-[15px] text-white
            transition-all hover:-translate-y-0.5 active:translate-y-0
            flex items-center justify-center gap-2 relative overflow-hidden group
            shadow-[0_4px_20px_rgba(139,92,246,0.25)]
            hover:shadow-[0_4px_25px_rgba(139,92,246,0.4)]
            disabled:cursor-not-allowed"
        >
          {/* 光泽效果 */}
          <div className="absolute inset-0 bg-white/20 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-700 ease-in-out pointer-events-none"></div>

          {isGenerating ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <Sparkles className="w-5 h-5 relative z-10" />
              </motion.div>
              <span className="relative z-10">生成中...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Surprise Me</span>
            </>
          )}
        </button>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col p-5 pt-2">
        {keywords.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 space-y-4 text-slate-400">
            <div className="w-16 h-16 rounded-2xl bg-[#1A2235] flex items-center justify-center border border-white/5 shadow-inner">
              <Bot className="w-8 h-8 text-slate-500" />
            </div>
            <div>
              <p className="text-sm text-slate-300 font-medium mb-1.5">等待生成灵感</p>
              <p className="text-xs leading-relaxed text-slate-500">收集足够的灵感后,点击上方按钮,AI多智能体将为您分析并生成创新创业Idea。</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
