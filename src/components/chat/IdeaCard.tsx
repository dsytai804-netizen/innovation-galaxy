import React from 'react';
import { motion } from 'framer-motion';
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`
        p-4 rounded-lg border cursor-pointer transition-all
        ${isSelected
          ? 'border-tech-blue bg-tech-blue/10 shadow-lg shadow-tech-blue/20'
          : 'border-white/10 bg-white/5 hover:border-white/30'
        }
      `}
      onClick={() => onSelect(idea)}
    >
      <h4 className="text-base font-semibold text-white mb-2">
        💡 {idea.title}
      </h4>
      <p className="text-sm text-gray-300 leading-relaxed mb-3">
        {idea.description}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {idea.keywords.map((keyword, i) => (
          <span
            key={i}
            className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-gray-400"
          >
            {keyword}
          </span>
        ))}
      </div>
      {isSelected && (
        <div className="mt-2 text-xs text-tech-blue font-medium">
          ✓ 已选择
        </div>
      )}
    </motion.div>
  );
};
