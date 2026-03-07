import React from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';

interface ReportViewProps {
  report: string;
  ideaTitle: string;
}

export const ReportView: React.FC<ReportViewProps> = ({
  report,
  ideaTitle,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4"
    >
      <div className="mb-4 pb-4 border-b border-white/10">
        <h3 className="text-base font-bold text-white mb-1">
          📊 分析报告
        </h3>
        <p className="text-sm text-gray-400">{ideaTitle}</p>
      </div>

      <div className="prose prose-invert prose-sm max-w-none">
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1 className="text-xl font-bold text-white mb-3 mt-4">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-lg font-semibold text-white mb-2 mt-4">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-base font-medium text-white mb-2 mt-3">{children}</h3>
            ),
            p: ({ children }) => (
              <p className="text-sm text-gray-300 mb-3 leading-relaxed">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside text-sm text-gray-300 mb-3 space-y-1">
                {children}
              </ul>
            ),
            li: ({ children }) => (
              <li className="text-sm text-gray-300">{children}</li>
            ),
            strong: ({ children }) => (
              <strong className="text-white font-semibold">{children}</strong>
            ),
          }}
        >
          {report}
        </ReactMarkdown>
      </div>
    </motion.div>
  );
};
