import localForage from "localforage";
import { GameState } from "./types";

const STORAGE_KEY = "werewolf-host-assistant";

export const saveState = async (state: GameState) => {
  await localForage.setItem(STORAGE_KEY, state);
};

export const loadState = async (): Promise<GameState | null> => {
  const state = await localForage.getItem<GameState>(STORAGE_KEY);
  return state ?? null;
};

export const clearState = async () => {
  await localForage.removeItem(STORAGE_KEY);
};
