import { create } from 'zustand';

export interface Idea {
  id: string;
  title: string;
  description: string;
  keywords: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface AnalysisStore {
  ideas: Idea[];
  selectedIdea: Idea | null;
  report: string | null;
  chatHistory: ChatMessage[];
  isGenerating: boolean;
  isAnalyzing: boolean;
  currentAgent: 'pm' | 'tech' | 'orchestrator' | null;

  // Actions
  setIdeas: (ideas: Idea[]) => void;
  selectIdea: (idea: Idea) => void;
  setReport: (report: string) => void;
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChat: () => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setCurrentAgent: (agent: 'pm' | 'tech' | 'orchestrator' | null) => void;
  reset: () => void;
}

export const useAnalysisStore = create<AnalysisStore>((set) => ({
  ideas: [],
  selectedIdea: null,
  report: null,
  chatHistory: [],
  isGenerating: false,
  isAnalyzing: false,
  currentAgent: null,

  setIdeas: (ideas) => set({ ideas }),

  selectIdea: (idea) => set({ selectedIdea: idea }),

  setReport: (report) => set({ report }),

  addChatMessage: (message) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    set((state) => ({
      chatHistory: [...state.chatHistory, newMessage],
    }));
  },

  clearChat: () => set({ chatHistory: [] }),

  setIsGenerating: (isGenerating) => set({ isGenerating }),

  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),

  setCurrentAgent: (agent) => set({ currentAgent: agent }),

  reset: () => set({
    ideas: [],
    selectedIdea: null,
    report: null,
    chatHistory: [],
    isGenerating: false,
    isAnalyzing: false,
    currentAgent: null,
  }),
}));
