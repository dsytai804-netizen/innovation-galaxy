import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, ChevronDown } from 'lucide-react';
import type { Idea } from '../../stores/useAnalysisStore';

interface IdeaCardProps {
  idea: Idea;
  index: number;
  onSelect: (idea: Idea) => void;
  isSelected: boolean;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({
  idea,
  index,
  onSelect,
  isSelected,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCardClick = () => {
    onSelect(idea);
  };

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡到卡片
    setIsExpanded(!isExpanded);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.15,
        type: "spring",
        stiffness: 100,
      }}
      data-cursor="interactive"
      style={{
        borderColor: isSelected ? 'rgba(99, 102, 241, 0.6)' : 'rgba(255, 255, 255, 0.05)',
        backgroundColor: isSelected ? '#1D263B' : '#1A2235',
      }}
      className="relative border rounded-xl p-5 cursor-pointer transition-all hover:border-indigo-500/40 hover:bg-[#1D263B] group shadow-lg shadow-black/20 overflow-hidden"
      onClick={handleCardClick}
    >
      {/* Hover gradient effect */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <h4 className="text-base font-semibold text-indigo-300 group-hover:text-indigo-200 transition-colors pr-2 flex-1 leading-relaxed">
            {idea.title}
          </h4>
        </div>

        {/* Keywords */}
        <div className="flex flex-wrap gap-2 mb-4">
          {idea.keywords.map((keyword, i) => (
            <span
              key={i}
              className="text-xs text-slate-300 bg-slate-800/80 px-2 py-1 rounded border border-white/5"
            >
              {keyword}
            </span>
          ))}
        </div>

        {/* Description - collapsed or expanded */}
        <AnimatePresence initial={false}>
          {!isExpanded ? (
            <motion.p
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-slate-400 leading-relaxed mb-4 group-hover:text-slate-300 transition-colors line-clamp-3"
            >
              {idea.description}
            </motion.p>
          ) : (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="text-sm text-slate-300 leading-relaxed mb-4 overflow-hidden"
            >
              <p className="mb-4">{idea.description}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action hint - toggle expand/collapse */}
        <div className="flex justify-end">
          <button
            onClick={handleExpandClick}
            className="text-xs text-indigo-400/70 hover:text-indigo-400 flex items-center gap-1 transition-all translate-x-2 group-hover:translate-x-0 font-medium"
          >
            {isExpanded ? (
              <>
                收起 <ChevronDown className="w-4 h-4" />
              </>
            ) : (
              <>
                查看详情 <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Selected indicator */}
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-2 right-2 bg-indigo-500 rounded-full p-1"
          >
            <Check className="w-3 h-3 text-white" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
