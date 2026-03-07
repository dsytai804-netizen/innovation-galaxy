import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="w-full h-[60px] bg-black/30 backdrop-blur-md border-b border-white/10 z-50 flex-shrink-0">
      <div className="h-full max-w-full px-6 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-tech-blue to-scenario-green flex items-center justify-center flex-shrink-0">
            <span className="text-lg">✨</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-white leading-tight">
              Innovation Galaxy
            </h1>
            <p className="text-[10px] text-gray-400 leading-tight">Explore. Connect. Innovate.</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="px-3 py-1.5 text-sm text-gray-300 hover:text-white transition-colors">
            帮助
          </button>
        </div>
      </div>
    </header>
  );
};
