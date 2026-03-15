import { create } from 'zustand';

type ControlMode = 'rotation' | 'pan';

interface ControlStore {
  controlMode: ControlMode;
  setControlMode: (mode: ControlMode) => void;
  toggleControlMode: () => void;
}

export const useControlStore = create<ControlStore>((set) => ({
  controlMode: 'rotation', // Default to rotation mode
  setControlMode: (mode) => set({ controlMode: mode }),
  toggleControlMode: () =>
    set((state) => ({
      controlMode: state.controlMode === 'rotation' ? 'pan' : 'rotation',
    })),
}));
