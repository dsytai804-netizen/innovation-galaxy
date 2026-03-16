import React, { useState, type KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled = false,
  placeholder = '输入问题...',
}) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-3 items-end w-full">
      <div className="flex-1 bg-[#1A2235] border border-white/10 rounded-xl flex flex-col focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all shadow-inner">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          rows={2}
          className="w-full bg-transparent border-none outline-none text-[13px] text-slate-200 placeholder:text-slate-500
            resize-none p-3 custom-scrollbar
            disabled:opacity-50 disabled:cursor-not-allowed
            caret-indigo-400"
          data-cursor="interactive"
          style={{ color: '#e2e8f0' }}
        />
      </div>
      <button
        onClick={handleSend}
        disabled={!input.trim() || disabled}
        className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600
          hover:from-indigo-600 hover:to-purple-700
          disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-500
          flex items-center justify-center text-white transition-all duration-200
          flex-shrink-0 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40
          disabled:shadow-none hover:scale-105 active:scale-95
          mb-0.5 border border-indigo-400/20"
        data-cursor="interactive"
        aria-label="发送消息"
      >
        <Send className="w-4 h-4 ml-0.5" />
      </button>
    </div>
  );
};
