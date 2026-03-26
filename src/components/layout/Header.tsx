import React, { useState } from 'react';
import { Sparkles, MousePointer2, HelpCircle, PanelRightOpen } from 'lucide-react';
import { AboutModal } from '../about/AboutModal';

interface HeaderProps {
  onTogglePanel: () => void;
  isPanelCollapsed: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onTogglePanel, isPanelCollapsed }) => {
  const [showAbout, setShowAbout] = useState(false);
  return (
    <>
      <header className="h-[60px] flex-shrink-0 flex items-center justify-between px-6 border-b border-white/10 bg-[#0B0F19] z-20 sticky top-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-[17px] font-bold text-white tracking-wide flex items-center">
          Innovation Galaxy
          <span className="mx-3 text-white/20 font-light">｜</span>
          <span className="text-slate-300 font-medium">点子孵化器</span>
        </h1>
      </div>
      <div className="flex items-center gap-6 text-sm text-slate-400">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onTogglePanel();
          }}
          className="flex items-center gap-2 text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20 hover:bg-indigo-500/20 hover:text-indigo-200 transition-all cursor-pointer"
          data-cursor="interactive"
        >
          {isPanelCollapsed ? (
            <>
              <PanelRightOpen className="w-3.5 h-3.5" /> 探索模式
            </>
          ) : (
            <>
              <MousePointer2 className="w-3.5 h-3.5" /> 探索模式
            </>
          )}
        </button>
        <button onClick={() => setShowAbout(true)} className="flex items-center gap-1.5 hover:text-white transition-colors" data-cursor="interactive">
          <HelpCircle className="w-4 h-4" /> 帮助
        </button>
      </div>
    </header>
    {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </>
  );
};
