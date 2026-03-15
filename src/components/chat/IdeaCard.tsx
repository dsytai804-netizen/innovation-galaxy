import React from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
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
      className="relative bg-[#1A2235] border border-white/5 rounded-xl p-4 cursor-pointer transition-all hover:border-indigo-500/40 hover:bg-[#1D263B] group shadow-lg shadow-black/20 overflow-hidden"
      onClick={() => onSelect(idea)}
    >
      {/* Hover gradient effect */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-3">
          <h4 className="text-sm font-semibold text-indigo-300 group-hover:text-indigo-200 transition-colors pr-2 flex-1">
            {idea.title}
          </h4>
          <span className="bg-indigo-500/10 text-indigo-400 text-[10px] px-2 py-0.5 rounded-full border border-indigo-500/20 whitespace-nowrap font-medium">
            匹配度 95%
          </span>
        </div>

        {/* Keywords */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {idea.keywords.map((keyword, i) => (
            <span
              key={i}
              className="text-[10px] text-slate-300 bg-slate-800/80 px-1.5 py-0.5 rounded border border-white/5"
            >
              {keyword}
            </span>
          ))}
        </div>

        <p className="text-xs text-slate-400 leading-relaxed mb-3 group-hover:text-slate-300 transition-colors line-clamp-3">
          {idea.description}
        </p>

        {/* Action hint */}
        <div className="flex justify-end">
          <span className="text-[11px] text-indigo-400/0 group-hover:text-indigo-400 flex items-center gap-1 transition-all translate-x-2 group-hover:translate-x-0 font-medium">
            查看详情 <ChevronRight className="w-3.5 h-3.5" />
          </span>
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
