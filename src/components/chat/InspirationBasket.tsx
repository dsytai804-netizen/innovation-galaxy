import React from 'react';
import { ChevronDown, X } from 'lucide-react';
import type { Keyword } from '../../stores/useBasketStore';

interface InspirationBasketProps {
  keywords: Keyword[];
  maxKeywords: number;
  onRemove: (id: string) => void;
  collapsed?: boolean;
  onExpand?: () => void;
}

export const InspirationBasket: React.FC<InspirationBasketProps> = ({
  keywords,
  onRemove,
  collapsed = false,
  onExpand,
}) => {
  if (collapsed) {
    return (
      <button
        onClick={onExpand}
        className="flex items-center justify-between p-3 w-full border-b border-white/5 hover:bg-white/5 transition-colors"
        data-cursor="interactive"
      >
        <div className="flex items-center gap-2">
          <ChevronDown className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-100">灵感篮子</span>
          <span className="text-xs text-slate-400">({keywords.length})</span>
        </div>

        <div className="flex -space-x-1">
          {keywords.slice(0, 3).map(k => (
            <span
              key={k.id}
              className="w-6 h-6 rounded-full border-2 border-[#0F1423] flex items-center justify-center text-xs font-bold"
              style={{
                backgroundColor: k.color,
                color: 'rgba(255,255,255,0.9)'
              }}
            >
              {k.label.charAt(0)}
            </span>
          ))}
          {keywords.length > 3 && (
            <span className="w-6 h-6 rounded-full border-2 border-[#0F1423] bg-[#1A2235] flex items-center justify-center text-xs text-slate-400">
              +{keywords.length - 3}
            </span>
          )}
        </div>
      </button>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
      {keywords.length === 0 ? (
        <p className="text-xs text-slate-500 py-3 w-full text-center border border-dashed border-slate-700 rounded-lg bg-white/5">
          请从左侧知识图谱中选择关键词
        </p>
      ) : (
        keywords.map((keyword) => (
          <div
            key={keyword.id}
            data-cursor="interactive"
            className="group inline-flex items-center gap-1.5 bg-[#1F2937] hover:bg-[#374151] border border-white/5 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            <span>{keyword.label}</span>
            <button
              data-cursor="interactive"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(keyword.id);
              }}
              className="focus:outline-none"
              aria-label={`删除 ${keyword.label}`}
            >
              <X className="w-3 h-3 text-slate-500 group-hover:text-rose-400 transition-colors" />
            </button>
          </div>
        ))
      )}
    </div>
  );
};
