import { create } from 'zustand';

export type GestureType = 'none' | 'open_palm' | 'pinch' | 'fist';

export interface HandPosition {
  x: number;
  y: number;
  z: number;
}

interface GestureStore {
  // State
  isActive: boolean;
  currentGesture: GestureType;
  smoothedHandPosition: HandPosition | null;
  rawHandPosition: HandPosition | null;
  error: string | null;
  handLost: boolean;

  // Actions
  setActive: (active: boolean) => void;
  setGesture: (gesture: GestureType) => void;
  updateHandPosition: (raw: HandPosition | null, smoothed: HandPosition | null) => void;
  setError: (error: string | null) => void;
  setHandLost: (lost: boolean) => void;
  reset: () => void;
}

const initialState = {
  isActive: false,
  currentGesture: 'none' as GestureType,
  smoothedHandPosition: null,
  rawHandPosition: null,
  error: null,
  handLost: false,
};

export const useGestureStore = create<GestureStore>((set) => ({
  ...initialState,

  setActive: (active) => set({ isActive: active }),

  setGesture: (gesture) => set({ currentGesture: gesture }),

  updateHandPosition: (raw, smoothed) =>
    set({
      rawHandPosition: raw,
      smoothedHandPosition: smoothed,
      handLost: false, // Reset hand lost flag when position updates
    }),

  setError: (error) => set({ error }),

  setHandLost: (lost) => set({ handLost: lost }),

  reset: () => set(initialState),
}));
