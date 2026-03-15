import React, { useEffect, useRef } from 'react';
import { ChevronLeft, Sparkles, User } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { InspirationBasket } from './InspirationBasket';
import { ChatInput } from './ChatInput';
import type { Keyword } from '../../stores/useBasketStore';
import type { ChatMessage as ChatMessageType } from '../../stores/useAnalysisStore';

interface ConversationViewProps {
  report: string;
  chatHistory: ChatMessageType[];
  keywords: Keyword[];
  maxKeywords: number;
  onRemoveKeyword: (id: string) => void;
  onBack: () => void;
  onSendMessage: (message: string) => void;
  isSending: boolean;
}

export const ConversationView: React.FC<ConversationViewProps> = ({
  report,
  chatHistory,
  keywords,
  maxKeywords,
  onRemoveKeyword,
  onBack,
  onSendMessage,
  isSending,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [basketExpanded, setBasketExpanded] = React.useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [chatHistory]);

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
            创意分析对话
          </h2>
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

      {/* 中间：消息流 */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4"
      >
        {/* AI生成的报告作为第一条消息 */}
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 px-4 py-3 rounded-2xl bg-[#1A2235] border border-white/5">
            <div className="prose prose-sm prose-invert max-w-none">
              <ReactMarkdown>{report}</ReactMarkdown>
            </div>
          </div>
        </div>

        {/* 对话历史 */}
        {chatHistory.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {msg.role === 'assistant' ? (
              <>
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 px-4 py-3 rounded-2xl bg-[#1A2235] border border-white/5 max-w-[85%]">
                  <p className="text-sm text-slate-200 whitespace-pre-wrap">{msg.content}</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-[#1A2235] flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-slate-200" />
                </div>
                <div className="flex-1 px-4 py-3 rounded-2xl bg-indigo-500 text-white max-w-[85%]">
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* 底部：输入框 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 border-t border-white/5 bg-[#0F1423] flex-shrink-0 flex gap-3 items-end shadow-[0_-10px_30px_rgba(0,0,0,0.3)]"
      >
        <ChatInput
          onSend={onSendMessage}
          disabled={isSending}
          placeholder={isSending ? '思考中...' : '深入探讨这个Idea，或要求完善商业计划...'}
        />
      </motion.div>
    </div>
  );
};
