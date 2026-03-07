import { create } from 'zustand';

export interface Keyword {
  id: string;
  label: string;
  type: 'technology' | 'scenario' | 'user';
  color: string;
}

interface BasketStore {
  keywords: Keyword[];
  maxKeywords: number;

  // Actions
  addKeyword: (keyword: Keyword) => boolean;
  removeKeyword: (id: string) => void;
  clearKeywords: () => void;
  hasKeyword: (id: string) => boolean;
  isFull: () => boolean;
  getKeywordsByType: (type: 'technology' | 'scenario' | 'user') => Keyword[];
}

export const useBasketStore = create<BasketStore>((set, get) => ({
  keywords: [],
  maxKeywords: 20,

  addKeyword: (keyword) => {
    const state = get();

    // Check if already exists
    if (state.hasKeyword(keyword.id)) {
      return false;
    }

    // Check if basket is full
    if (state.isFull()) {
      return false;
    }

    set((state) => ({
      keywords: [...state.keywords, keyword],
    }));

    return true;
  },

  removeKeyword: (id) => set((state) => ({
    keywords: state.keywords.filter(k => k.id !== id),
  })),

  clearKeywords: () => set({ keywords: [] }),

  hasKeyword: (id) => {
    const state = get();
    return state.keywords.some(k => k.id === id);
  },

  isFull: () => {
    const state = get();
    return state.keywords.length >= state.maxKeywords;
  },

  getKeywordsByType: (type) => {
    const state = get();
    return state.keywords.filter(k => k.type === type);
  },
}));
