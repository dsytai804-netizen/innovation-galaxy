import React, { useState } from 'react';
import { useBasketStore } from '../../stores/useBasketStore';
import { useAnalysisStore, type Idea } from '../../stores/useAnalysisStore';
import { ideaGenerationService } from '../../services/llm/ideaGenerationService';
import { multiAgentService } from '../../services/llm/multiAgentService';
import { IdeaCard } from '../chat/IdeaCard';
import { AnalysisProgress } from '../chat/AnalysisProgress';
import { ReportView } from '../chat/ReportView';
import { ChatMessage } from '../chat/ChatMessage';
import { ChatInput } from '../chat/ChatInput';
import { motion } from 'framer-motion';

export const ChatPanel: React.FC = () => {
  const keywords = useBasketStore((state) => state.keywords);
  const removeKeyword = useBasketStore((state) => state.removeKeyword);
  const maxKeywords = useBasketStore((state) => state.maxKeywords);

  const ideas = useAnalysisStore((state) => state.ideas);
  const setIdeas = useAnalysisStore((state) => state.setIdeas);
  const selectedIdea = useAnalysisStore((state) => state.selectedIdea);
  const selectIdea = useAnalysisStore((state) => state.selectIdea);
  const report = useAnalysisStore((state) => state.report);
  const setReport = useAnalysisStore((state) => state.setReport);
  const chatHistory = useAnalysisStore((state) => state.chatHistory);
  const addChatMessage = useAnalysisStore((state) => state.addChatMessage);
  const isGenerating = useAnalysisStore((state) => state.isGenerating);
  const setIsGenerating = useAnalysisStore((state) => state.setIsGenerating);
  const isAnalyzing = useAnalysisStore((state) => state.isAnalyzing);
  const setIsAnalyzing = useAnalysisStore((state) => state.setIsAnalyzing);
  const currentAgent = useAnalysisStore((state) => state.currentAgent);
  const setCurrentAgent = useAnalysisStore((state) => state.setCurrentAgent);

  const [selectedIdeas, setSelectedIdeas] = useState<string[]>([]);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const handleSurpriseMe = async () => {
    if (keywords.length === 0) return;

    try {
      setIsGenerating(true);
      const generatedIdeas = await ideaGenerationService.generateIdeas(keywords);
      setIdeas(generatedIdeas);
      setSelectedIdeas([]);
    } catch (error) {
      console.error('Failed to generate ideas:', error);
      alert('创意生成失败，请检查LLM API配置');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleIdeaSelection = (idea: Idea) => {
    setSelectedIdeas(prev => {
      if (prev.includes(idea.id)) {
        return prev.filter(id => id !== idea.id);
      } else if (prev.length < 3) {
        return [...prev, idea.id];
      }
      return prev;
    });
  };

  const handleDeepAnalysis = async () => {
    if (selectedIdeas.length === 0) return;

    const ideaToAnalyze = ideas.find(i => i.id === selectedIdeas[0]);
    if (!ideaToAnalyze) return;

    try {
      setIsAnalyzing(true);
      selectIdea(ideaToAnalyze);

      const analysisReport = await multiAgentService.analyzeIdea(
        ideaToAnalyze,
        (agent) => setCurrentAgent(agent)
      );

      setReport(analysisReport);
      setCurrentAgent(null);
    } catch (error) {
      console.error('Failed to analyze idea:', error);
      alert('分析失败，请检查LLM API配置');
      setIsAnalyzing(false);
      setCurrentAgent(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedIdea || !report) return;

    addChatMessage({ role: 'user', content: message });

    try {
      setIsSendingMessage(true);

      const response = await multiAgentService.answerFollowUp(
        selectedIdea.title,
        report.substring(0, 500),
        message
      );

      addChatMessage({ role: 'assistant', content: response });
    } catch (error) {
      console.error('Failed to get response:', error);
      addChatMessage({
        role: 'assistant',
        content: '抱歉，回答失败，请重试。',
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <div className="w-[400px] bg-black/40 backdrop-blur-xl border-l border-white/10 flex flex-col flex-shrink-0">
      {/* Idea Basket */}
      <div className="p-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">灵感篮子</h3>
          <span className="text-xs text-gray-400">
            {keywords.length}/{maxKeywords}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 min-h-[60px] max-h-[200px] overflow-y-auto">
          {keywords.length === 0 ? (
            <p className="text-xs text-gray-500 italic w-full">
              点击3D图谱中的节点添加关键词...
            </p>
          ) : (
            keywords.map((keyword) => (
              <div
                key={keyword.id}
                className="group relative px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all hover:scale-105"
                style={{
                  backgroundColor: `${keyword.color}20`,
                  borderColor: keyword.color,
                  borderWidth: '1px',
                  color: keyword.color,
                }}
              >
                <span>{keyword.label}</span>
                <button
                  onClick={() => removeKeyword(keyword.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>

        <button
          disabled={keywords.length === 0 || isGenerating}
          onClick={handleSurpriseMe}
          className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-tech-blue to-scenario-green rounded-lg font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-tech-blue/30 transition-all"
        >
          {isGenerating ? '🎲 生成中...' : '🎲 Surprise Me'}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {isAnalyzing ? (
          <AnalysisProgress currentAgent={currentAgent} />
        ) : report && selectedIdea ? (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
              <ReportView report={report} ideaTitle={selectedIdea.title} />

              {chatHistory.length > 0 && (
                <div className="px-4 pb-4">
                  <div className="border-t border-white/10 pt-4 mb-4">
                    <h4 className="text-sm font-semibold text-white mb-3">💬 继续探讨</h4>
                  </div>
                  {chatHistory.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                  ))}
                </div>
              )}
            </div>

            <ChatInput
              onSend={handleSendMessage}
              disabled={isSendingMessage}
              placeholder={isSendingMessage ? '思考中...' : '继续提问...'}
            />
          </div>
        ) : ideas.length > 0 ? (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">
                💡 创意方案 ({ideas.length})
              </h3>
              <span className="text-xs text-gray-400">
                已选 {selectedIdeas.length}/3
              </span>
            </div>

            {ideas.map((idea, index) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                index={index}
                onSelect={toggleIdeaSelection}
                isSelected={selectedIdeas.includes(idea.id)}
              />
            ))}

            {selectedIdeas.length > 0 && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleDeepAnalysis}
                className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium text-white hover:shadow-lg hover:shadow-purple-600/30 transition-all"
              >
                🔍 Deep Analysis ({selectedIdeas.length})
              </motion.button>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full p-6">
            <p className="text-sm text-gray-500 text-center leading-relaxed">
              选择关键词后点击 "Surprise Me"<br />生成创新产品创意
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
