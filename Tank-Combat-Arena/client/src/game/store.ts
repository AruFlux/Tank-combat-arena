import { create } from 'zustand';

interface GameState {
  isPlaying: boolean;
  isGameOver: boolean;
  isPaused: boolean;
  score: number;
  health: number;
  maxHealth: number;
  ammo: number;
  maxAmmo: number;
  reloadProgress: number;
  wave: number;
  enemiesAlive: number;
  
  // Actions
  startGame: () => void;
  endGame: (finalScore: number) => void;
  togglePause: () => void;
  updateStats: (stats: Partial<Omit<GameState, 'actions'>>) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  isPlaying: false,
  isGameOver: false,
  isPaused: false,
  score: 0,
  health: 1000,
  maxHealth: 1000,
  ammo: 40,
  maxAmmo: 40,
  reloadProgress: 0,
  wave: 1,
  enemiesAlive: 0,

  startGame: () => set({ isPlaying: true, isGameOver: false, isPaused: false, score: 0, wave: 1, health: 1000, ammo: 40 }),
  endGame: (finalScore) => set({ isPlaying: false, isGameOver: true, score: finalScore }),
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  updateStats: (stats) => set((state) => ({ ...state, ...stats })),
  reset: () => set({
    isPlaying: false, 
    isGameOver: false, 
    isPaused: false,
    score: 0,
    health: 1000,
    ammo: 40,
    wave: 1
  }),
}));
