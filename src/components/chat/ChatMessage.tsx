import React from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import type { ChatMessage as ChatMessageType } from '../../stores/useAnalysisStore';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`
          max-w-[85%] px-4 py-3 rounded-lg
          ${isUser
            ? 'bg-tech-blue/20 border border-tech-blue/30 text-white'
            : 'bg-white/5 border border-white/10 text-gray-300'
          }
        `}
      >
        {isUser ? (
          <p className="text-sm">{message.content}</p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="text-sm text-gray-300 mb-2 last:mb-0">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside text-sm mb-2">{children}</ul>
                ),
                strong: ({ children }) => (
                  <strong className="text-white">{children}</strong>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
};
