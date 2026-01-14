export type Camp = "good" | "wolf" | "third" | null;

export type Seat = {
  seatNo: number;
  name: string;
  roleId: string | null;
  camp: Camp;
  alive: boolean;
  revealed: boolean;
  marks: {
    guarded?: boolean;
    poisoned?: boolean;
    lover?: number;
  };
};

export type Role = {
  id: string;
  nameZh: string;
  camp: Exclude<Camp, null>;
  nightAction?: {
    type: "selectTarget" | "yesNo" | "selectTargetOptional";
    constraints?: string;
  };
  descriptionZh: string;
  enabled: boolean;
};

export type Rules = {
  noRevealOnDeath: boolean;
  wolfCanSameTargetConsecutive: boolean;
  witchFirstNightNoSelfSave: boolean;
  witchNoDoublePotionSameNight: boolean;
  hunterMaySkipOnDeath: boolean;
  hunterAndWolfKingChainSkill: boolean;
  winByRemainingSkillsEdge: boolean;
  doubleExplodeWarn: boolean;
};

export type LogEntry = {
  id: string;
  round: number;
  phase: string;
  messageZh: string;
  timestamp: number;
};

export type StepInput =
  | null
  | {
      kind: "selectSeat" | "toggle" | "voteMatrix";
      promptZh: string;
      allowNone?: boolean;
    };

export type StepConfig = {
  id: string;
  phase: GameState["phase"];
  titleZh: string;
  scriptZh: string;
  audioFile: string | null;
  autoPlay: boolean;
  autoAdvance: boolean;
  minDurationSec: number;
  maxDurationSec: number;
  requiresInput: boolean;
  input: StepInput;
};

export type StepStatus = "playing" | "waitInput" | "paused";

export type Phase =
  | "SETUP_ROLE_POOL"
  | "SETUP_RULES"
  | "PRE_GAME_CONFIRM"
  | "DEAL_MODE"
  | "NIGHT"
  | "NIGHT_RESOLVE"
  | "DAY"
  | "CHECK_WIN"
  | "GAME_END";

export type GameState = {
  playerCount: number;
  seats: Seat[];
  rolesPool: Role[];
  rules: Rules;
  phase: Phase;
  round: number;
  stepId: string | null;
  stepStatus: StepStatus;
  logs: LogEntry[];
  audioUnlocked: boolean;
  rulesLocked: boolean;
  dealSeatIndex: number;
  pendingNightKill: number | null;
  pendingWitchSave: boolean;
  pendingWitchPoison: number | null;
  pendingVotes: Record<number, number[]>;
  pendingExecutionHunterTarget: number | null;
};

export type EngineAction =
  | { type: "HYDRATE_STATE"; state: GameState }
  | { type: "ADD_LOG"; entry: LogEntry }
  | { type: "SET_PLAYER_COUNT"; value: number }
  | { type: "TOGGLE_ROLE"; roleId: string; enabled: boolean }
  | { type: "SET_RULE"; key: keyof Rules; value: boolean }
  | { type: "SET_PHASE"; phase: Phase }
  | { type: "LOCK_RULES" }
  | { type: "AUDIO_UNLOCKED" }
  | { type: "SET_SEAT_NAME"; seatNo: number; name: string }
  | { type: "DEAL_REVEALED"; seatNo: number }
  | { type: "ADVANCE_DEAL" }
  | { type: "START_STEP"; stepId: string }
  | { type: "PAUSE_STEP" }
  | { type: "RESUME_STEP" }
  | { type: "SKIP_STEP" }
  | { type: "COMMIT_INPUT"; payload: unknown }
  | { type: "ADVANCE_STEP" }
  | { type: "RESET_GAME" };
