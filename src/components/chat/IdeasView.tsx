import React from 'react';
import { ChevronLeft, FileText, RefreshCw, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { InspirationBasket } from './InspirationBasket';
import { IdeaCard } from './IdeaCard';
import type { Keyword } from '../../stores/useBasketStore';
import type { Idea } from '../../stores/useAnalysisStore';

interface IdeasViewProps {
  ideas: Idea[];
  selectedIdeas: string[];
  keywords: Keyword[];
  maxKeywords: number;
  onRemoveKeyword: (id: string) => void;
  onToggleIdea: (idea: Idea) => void;
  onBack: () => void;
  onAnalyze: () => void;
  onRegenerateIdeas: () => Promise<void>;
  isGenerating: boolean;
}

export const IdeasView: React.FC<IdeasViewProps> = ({
  ideas,
  selectedIdeas,
  keywords,
  maxKeywords,
  onRemoveKeyword,
  onToggleIdea,
  onBack,
  onAnalyze,
  onRegenerateIdeas,
  isGenerating,
}) => {
  const [basketExpanded, setBasketExpanded] = React.useState(false);

  return (
    <div className="flex flex-col h-full">
      {/* 顶部：返回按钮 + 收起的篮子 */}
      <div className="border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-2 p-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            data-cursor="interactive"
            aria-label="返回"
          >
            <ChevronLeft className="w-4 h-4 text-slate-400" />
          </button>
          <h2 className="text-sm font-medium text-slate-100 flex-1">
            创意方案
          </h2>
          <span className="text-xs text-slate-400">
            已选 {selectedIdeas.length}/3
          </span>
        </div>

        {basketExpanded ? (
          <div className="p-3 pt-0">
            <InspirationBasket
              keywords={keywords}
              maxKeywords={maxKeywords}
              onRemove={onRemoveKeyword}
            />
          </div>
        ) : (
          <InspirationBasket
            keywords={keywords}
            maxKeywords={maxKeywords}
            onRemove={onRemoveKeyword}
            collapsed
            onExpand={() => setBasketExpanded(true)}
          />
        )}
      </div>

      {/* 中间：创意卡片滚动区 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 pt-2 space-y-4">
        {/* 创意列表标题 */}
        <div className="flex items-center gap-2 text-sm text-slate-300 font-medium mb-3">
          <FileText className="w-4 h-4 text-indigo-400" />
          发现 {ideas.length} 个优质创意
        </div>

        {ideas.map((idea, index) => (
          <IdeaCard
            key={idea.id}
            idea={idea}
            index={index}
            onSelect={onToggleIdea}
            isSelected={selectedIdeas.includes(idea.id)}
          />
        ))}

        {/* 重新生成按钮 */}
        <div className="pt-2">
          <button
            onClick={onRegenerateIdeas}
            disabled={isGenerating}
            className="w-full py-2.5 bg-slate-700/50 hover:bg-slate-700/70
              text-slate-300 hover:text-white rounded-lg transition-all
              flex items-center justify-center gap-2 text-sm
              disabled:opacity-50 disabled:cursor-not-allowed"
            data-cursor="interactive"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? '生成中...' : '重新生成创意'}</span>
          </button>
        </div>
      </div>

      {/* 底部：Deep Analysis 按钮（sticky） */}
      {selectedIdeas.length > 0 && (
        <div className="border-t border-white/5 p-4 bg-[#0F1423] flex-shrink-0">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onAnalyze}
            data-cursor="interactive"
            className="w-full px-4 py-3 rounded-lg
              bg-indigo-500 hover:bg-indigo-600
              text-white font-medium text-sm
              transition-all duration-200
              shadow-lg hover:shadow-xl
              flex items-center justify-center gap-2"
          >
            <span>Deep Analysis ({selectedIdeas.length})</span>
          </motion.button>

          {/* 对话框提示 */}
          <div className="mt-4 px-3 py-3 bg-indigo-500/5 border border-indigo-500/10 rounded-lg">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-slate-300 leading-relaxed">
                  选中您感兴趣的创意后，点击"深度分析"生成完整产品报告。
                  报告生成后，您可以继续提问细化方案。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
