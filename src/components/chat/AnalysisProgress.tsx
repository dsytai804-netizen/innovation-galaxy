import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface AnalysisProgressProps {
  currentAgent: 'pm' | 'tech' | 'orchestrator' | null;
}

const AGENT_INFO = {
  pm: { name: 'Product Manager', label: '商业可行性评估', color: '#4A90E2', estimatedTime: 5 },
  tech: { name: 'Tech Architect', label: '技术架构设计', color: '#50C878', estimatedTime: 5 },
  orchestrator: { name: 'Orchestrator', label: '生成报告摘要', color: '#FFD700', estimatedTime: 30 },
};

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
  currentAgent,
}) => {
  const agents: Array<'pm' | 'tech' | 'orchestrator'> = ['pm', 'tech', 'orchestrator'];
  const [elapsed, setElapsed] = useState(0);

  // 计算总预估时间
  const totalEstimatedTime = Object.values(AGENT_INFO).reduce((sum, info) => sum + info.estimatedTime, 0);

  // 计时器
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 计算当前进度
  const getCurrentProgress = () => {
    if (!currentAgent) return 0;

    const currentIndex = agents.indexOf(currentAgent);
    let completedTime = 0;

    // 累加已完成Agent的时间
    for (let i = 0; i < currentIndex; i++) {
      completedTime += AGENT_INFO[agents[i]].estimatedTime;
    }

    // 当前Agent的进度（最多95%）
    const currentAgentEstimated = AGENT_INFO[currentAgent].estimatedTime;
    const currentProgress = Math.min(elapsed - completedTime, currentAgentEstimated * 0.95);

    return Math.min(((completedTime + currentProgress) / totalEstimatedTime) * 100, 95);
  };

  const progress = getCurrentProgress();
  const remainingTime = Math.max(0, totalEstimatedTime - elapsed);

  return (
    <div className="p-6 space-y-6">
      {/* 标题 */}
      <div className="flex items-center gap-3 text-sm text-indigo-300 font-medium">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}>
          <div className="w-5 h-5 rounded-full border-2 border-indigo-400 border-t-transparent" />
        </motion.div>
        <span>多Agent协作分析中</span>
      </div>

      {/* Agent列表 */}
      <div className="space-y-4 pl-3 border-l-2 border-indigo-500/20 ml-2">
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
                <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30">
                  <Check className="w-5 h-5 text-white stroke-[2.5]" />
                </div>
              ) : isActive ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                  className="w-7 h-7 border-[2.5px] border-indigo-400 border-t-transparent rounded-full flex-shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-full border-2 border-slate-600 flex items-center justify-center flex-shrink-0">
                  <div className="w-3 h-3 bg-slate-600 rounded-full" />
                </div>
              )}
              <div className="flex-1 flex items-center justify-between">
                <span className={`font-medium ${isCompleted || isActive ? 'text-slate-200' : 'text-slate-500'}`}>
                  {info.label}
                </span>
                {isActive && (
                  <span className="text-xs text-indigo-400 font-medium">
                    ~{info.estimatedTime}s
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 进度条和时间信息 - 移到下方 */}
      <div className="space-y-2 pt-2">
        {/* 进度条 */}
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* 进度信息 */}
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400">
            总进度: <span className="text-indigo-400 font-semibold">{Math.round(progress)}%</span>
          </span>
          <span className="text-slate-400">
            {remainingTime > 0 ? (
              <>预计还需 <span className="text-indigo-400 font-semibold">{remainingTime}</span> 秒</>
            ) : (
              <span className="text-emerald-400 font-semibold">即将完成...</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
