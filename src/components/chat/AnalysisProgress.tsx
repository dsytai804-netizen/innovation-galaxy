import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface AnalysisProgressProps {
  currentAgent: 'pm' | 'tech' | 'orchestrator' | null;
}

const AGENT_INFO = {
  pm: { name: 'Product Manager', label: '商业可行性评估', color: '#4A90E2' },
  tech: { name: 'Tech Architect', label: '技术架构设计', color: '#50C878' },
  orchestrator: { name: 'Orchestrator', label: '生成报告摘要', color: '#FFD700' },
};

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
  currentAgent,
}) => {
  const agents: Array<'pm' | 'tech' | 'orchestrator'> = ['pm', 'tech', 'orchestrator'];

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3 text-sm text-indigo-400 font-medium">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}>
          <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent" />
        </motion.div>
        <span>多Agent思考中...</span>
      </div>

      <div className="space-y-4 pl-2.5 border-l-2 border-indigo-500/20 ml-2">
        {agents.map((agent, idx) => {
          const info = AGENT_INFO[agent];
          const isActive = currentAgent === agent;
          const currentIndex = currentAgent ? agents.indexOf(currentAgent) : -1;
          const agentIndex = agents.indexOf(agent);
          const isCompleted = currentIndex > agentIndex;

          return (
            <motion.div
              key={agent}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.2 }}
              className="flex items-center gap-3 text-[13px]"
            >
              {isCompleted ? (
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-white stroke-[3]" />
                </div>
              ) : isActive ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full flex-shrink-0"
                />
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-slate-600 flex items-center justify-center flex-shrink-0">
                  <div className="w-2.5 h-2.5 bg-slate-600 rounded-full" />
                </div>
              )}
              <span className={isCompleted || isActive ? 'text-slate-300' : 'text-slate-400'}>
                {info.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
