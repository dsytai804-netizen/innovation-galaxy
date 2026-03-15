import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBasketStore } from '../../stores/useBasketStore';
import { useAnalysisStore, type Idea } from '../../stores/useAnalysisStore';
import { ideaGenerationService } from '../../services/llm/ideaGenerationService';
import { multiAgentService } from '../../services/llm/multiAgentService';
import { InitialView } from '../chat/InitialView';
import { IdeasView } from '../chat/IdeasView';
import { AnalysisProgress } from '../chat/AnalysisProgress';
import { ConversationView } from '../chat/ConversationView';

type PanelState = 'initial' | 'ideas' | 'analysis' | 'conversation';

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
  const setIsAnalyzing = useAnalysisStore((state) => state.setIsAnalyzing);
  const currentAgent = useAnalysisStore((state) => state.currentAgent);
  const setCurrentAgent = useAnalysisStore((state) => state.setCurrentAgent);

  const [panelState, setPanelState] = useState<PanelState>('initial');
  const [selectedIdeas, setSelectedIdeas] = useState<string[]>([]);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const handleSurpriseMe = async () => {
    if (keywords.length === 0) return;

    try {
      setIsGenerating(true);
      const generatedIdeas = await ideaGenerationService.generateIdeas(keywords);
      setIdeas(generatedIdeas);
      setSelectedIdeas([]);
      setPanelState('ideas');
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
      setPanelState('analysis');
      setIsAnalyzing(true);
      selectIdea(ideaToAnalyze);

      const analysisReport = await multiAgentService.analyzeIdea(
        ideaToAnalyze,
        (agent) => setCurrentAgent(agent)
      );

      setReport(analysisReport);
      setCurrentAgent(null);
      setPanelState('conversation');
    } catch (error) {
      console.error('Failed to analyze idea:', error);
      alert('分析失败，请检查LLM API配置');
      setIsAnalyzing(false);
      setCurrentAgent(null);
      setPanelState('ideas');
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

  const handleBackToInitial = () => {
    setPanelState('initial');
    setSelectedIdeas([]);
  };

  return (
    <div className="w-[400px] flex-shrink-0 bg-[#0F1423] border-l border-white/5 flex flex-col z-10 shadow-2xl relative h-full font-sans">
      <AnimatePresence mode="wait">
        {panelState === 'initial' && (
          <motion.div
            key="initial"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col h-full"
          >
            <InitialView
              keywords={keywords}
              maxKeywords={maxKeywords}
              onRemoveKeyword={removeKeyword}
              onSurpriseMe={handleSurpriseMe}
              isGenerating={isGenerating}
            />
          </motion.div>
        )}

        {panelState === 'ideas' && (
          <motion.div
            key="ideas"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col h-full"
          >
            <IdeasView
              ideas={ideas}
              selectedIdeas={selectedIdeas}
              keywords={keywords}
              maxKeywords={maxKeywords}
              onRemoveKeyword={removeKeyword}
              onToggleIdea={toggleIdeaSelection}
              onBack={handleBackToInitial}
              onAnalyze={handleDeepAnalysis}
            />
          </motion.div>
        )}

        {panelState === 'analysis' && (
          <motion.div
            key="analysis"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col h-full"
          >
            <AnalysisProgress currentAgent={currentAgent} />
          </motion.div>
        )}

        {panelState === 'conversation' && report && (
          <motion.div
            key="conversation"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col h-full"
          >
            <ConversationView
              report={report}
              chatHistory={chatHistory}
              keywords={keywords}
              maxKeywords={maxKeywords}
              onRemoveKeyword={removeKeyword}
              onBack={handleBackToInitial}
              onSendMessage={handleSendMessage}
              isSending={isSendingMessage}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
