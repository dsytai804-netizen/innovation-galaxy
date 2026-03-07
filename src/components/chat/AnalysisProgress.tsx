import React from 'react';
import { motion } from 'framer-motion';

interface AnalysisProgressProps {
  currentAgent: 'pm' | 'tech' | 'orchestrator' | null;
}

const AGENT_INFO = {
  pm: { name: 'Product Manager', icon: '👔', color: '#4A90E2' },
  tech: { name: 'Tech Architect', icon: '🔧', color: '#50C878' },
  orchestrator: { name: 'Orchestrator', icon: '🎯', color: '#FFD700' },
};

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
  currentAgent,
}) => {
  const agents: Array<'pm' | 'tech' | 'orchestrator'> = ['pm', 'tech', 'orchestrator'];

  return (
    <div className="p-6 space-y-4">
      <h3 className="text-sm font-semibold text-white mb-4">
        🤖 AI Multi-Agent 分析中...
      </h3>

      {agents.map((agent) => {
        const info = AGENT_INFO[agent];
        const isActive = currentAgent === agent;
        const currentIndex = currentAgent ? agents.indexOf(currentAgent) : -1;
        const agentIndex = agents.indexOf(agent);
        const isCompleted = currentIndex > agentIndex;

        return (
          <motion.div
            key={agent}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: agentIndex * 0.1 }}
            className={`
              flex items-center gap-3 p-3 rounded-lg border transition-all
              ${isActive ? 'border-tech-blue bg-tech-blue/10' :
                isCompleted ? 'border-scenario-green bg-scenario-green/10' :
                'border-white/10 bg-white/5'}
            `}
          >
            <div className="text-2xl">{info.icon}</div>
            <div className="flex-1">
              <div className="text-sm font-medium text-white">{info.name}</div>
              <div className="text-xs text-gray-400">
                {isActive && '正在分析...'}
                {isCompleted && '✓ 完成'}
                {!isActive && !isCompleted && '等待中'}
              </div>
            </div>
            {isActive && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-tech-blue border-t-transparent rounded-full"
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};
