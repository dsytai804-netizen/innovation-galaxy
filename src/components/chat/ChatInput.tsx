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
            disabled:opacity-50 disabled:cursor-not-allowed"
          data-cursor="interactive"
        />
      </div>
      <button
        onClick={handleSend}
        disabled={!input.trim() || disabled}
        className="w-10 h-10 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:bg-[#1A2235] disabled:text-slate-600
          flex items-center justify-center text-white transition-colors flex-shrink-0 shadow-lg disabled:shadow-none mb-0.5"
        data-cursor="interactive"
        aria-label="发送消息"
      >
        <Send className="w-4 h-4 ml-0.5" />
      </button>
    </div>
  );
};
