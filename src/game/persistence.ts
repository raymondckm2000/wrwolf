import type { GameState } from "./types";

export const STORAGE_KEY = "moonlog.current-game.v1";

export const loadGame = (): GameState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    return parsed.version === 1 ? parsed : null;
  } catch {
    return null;
  }
};

export const saveGame = (state: GameState) => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
export const clearGame = () => localStorage.removeItem(STORAGE_KEY);
