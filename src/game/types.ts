export const SPECIAL_ROLES = ["Seer", "Witch", "Hunter", "Guard", "Idiot", "Knight"] as const;
export const WOLF_ROLES = ["Werewolf", "Wolf King", "White Wolf King"] as const;
export type SpecialRole = (typeof SPECIAL_ROLES)[number];
export type WolfRole = (typeof WOLF_ROLES)[number];
export type Role = "Villager" | SpecialRole | WolfRole;
export type Alignment = "GOOD" | "WOLF";
export type Concern = "LOW" | "MEDIUM" | "HIGH";
export type PhaseKind = "Night" | "Day" | "Vote";
export type EliminationCause = "Night Kill" | "Voted Out" | "Witch Poison" | "Hunter Shot" | "Other";

export interface SetupConfig {
  playerCount: number;
  villagers: number;
  specials: number;
  wolves: number;
  specialRoles: SpecialRole[];
  wolfRoles: WolfRole[];
  you: number;
  yourRole: Role;
  knownWolfTeammates: number[];
}

interface BaseEvent {
  id: string;
  sequence: number;
  createdAt: number;
  phase: PhaseKind;
  round: number;
}

export type GameEvent =
  | (BaseEvent & { type: "CLAIM_ROLE"; actor: number; role: Role })
  | (BaseEvent & { type: "SUPPORT" | "SUSPECT"; actor: number; target: number })
  | (BaseEvent & {
      type: "CHECK";
      actor: number;
      target: number;
      result: Alignment;
      knowledge: "CLAIM" | "PRIVATE";
    })
  | (BaseEvent & { type: "VOTE"; actor: number; target: number })
  | (BaseEvent & { type: "ELIMINATE"; target: number; cause: EliminationCause })
  | (BaseEvent & { type: "CONFIRM_ROLE"; target: number; role: Role; alignment: Alignment });

export interface GameState {
  version: 1;
  config: SetupConfig;
  phase: PhaseKind;
  round: number;
  events: GameEvent[];
  startedAt: number;
  updatedAt: number;
}

export interface PlayerView {
  number: number;
  alive: boolean;
  isYou: boolean;
  claim?: Role;
  confirmedRole?: Role;
}

export interface AnalysisReason {
  label: string;
  eventIds: string[];
}

export interface PlayerAnalysis {
  player: number;
  score: number;
  concern: Concern;
  reasons: AnalysisReason[];
}

export interface RoleConflict {
  role: Role;
  players: number[];
  eventIds: string[];
}

export interface RelationshipFinding {
  players: [number, number];
  strength: number;
  reasons: AnalysisReason[];
}

export interface AnalysisResult {
  players: PlayerAnalysis[];
  conflicts: RoleConflict[];
  relationships: RelationshipFinding[];
  privateKnowledge: Array<{ player: number; alignment: Alignment; eventId?: string; label: string }>;
}
