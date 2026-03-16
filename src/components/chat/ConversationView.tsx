import React, { useEffect, useRef } from 'react';
import { ChevronLeft, Sparkles, User } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/github-dark.css';
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
  isAnalyzing: boolean;
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
  isAnalyzing,
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
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight, rehypeRaw]}
                components={{
                  h1: ({ node, ...props }) => (
                    <h1 className="text-2xl font-bold text-indigo-200 mb-4 pb-3 border-b-2 border-indigo-500/30 mt-8 first:mt-0" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="text-xl font-semibold text-indigo-300 mb-3 mt-6 pb-2 border-b border-slate-700" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="text-lg font-medium text-slate-200 mb-2 mt-4" {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="text-sm text-slate-300 leading-relaxed mb-4" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc list-outside ml-5 mb-4 space-y-2" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal list-outside ml-5 mb-4 space-y-2" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="text-sm text-slate-300 leading-relaxed" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-4 border-indigo-500 pl-4 py-2 bg-indigo-500/5 my-4 italic text-slate-400" {...props} />
                  ),
                  code: ({ node, inline, ...props }: any) =>
                    inline ? (
                      <code className="bg-slate-800 text-pink-300 px-1.5 py-0.5 rounded text-xs font-mono" {...props} />
                    ) : (
                      <code className="block bg-slate-900 p-4 rounded-lg text-sm font-mono overflow-x-auto my-4" {...props} />
                    ),
                  pre: ({ node, ...props }) => (
                    <pre className="bg-slate-900 rounded-lg overflow-hidden my-4" {...props} />
                  ),
                  table: ({ node, ...props }) => (
                    <div className="overflow-x-auto my-4">
                      <table className="min-w-full border border-slate-700" {...props} />
                    </div>
                  ),
                  th: ({ node, ...props }) => (
                    <th className="bg-slate-800 border border-slate-700 px-3 py-2 text-left text-sm font-semibold text-slate-200" {...props} />
                  ),
                  td: ({ node, ...props }) => (
                    <td className="border border-slate-700 px-3 py-2 text-sm text-slate-300" {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong className="font-bold text-indigo-300" {...props} />
                  ),
                }}
              >
                {report}
              </ReactMarkdown>

              {/* 打字光标 - 仅在报告生成过程中显示 */}
              {isAnalyzing && report && (
                <span className="inline-block w-2 h-4 bg-indigo-400 animate-pulse ml-1 align-middle" />
              )}
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
