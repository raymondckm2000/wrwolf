import { baseRoles, expandRolePool } from "./roles";
import { defaultRules } from "./rules";
import { stepsConfig, stepOrder } from "./steps";
import {
  EngineAction,
  GameState,
  LogEntry,
  Role,
  Seat,
  StepConfig
} from "./types";

const createSeats = (count: number): Seat[] =>
  Array.from({ length: count }, (_, index) => ({
    seatNo: index + 1,
    name: "",
    roleId: null,
    camp: null,
    alive: true,
    revealed: false,
    marks: {}
  }));

const shuffle = <T,>(items: T[]): T[] => {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const createLog = (round: number, phase: string, messageZh: string): LogEntry => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  round,
  phase,
  messageZh,
  timestamp: Date.now()
});

export const getStep = (stepId: string | null): StepConfig | undefined =>
  stepsConfig.find((step) => step.id === stepId);

const getNextStepId = (currentId: string | null): string | null => {
  if (!currentId) {
    return stepOrder[0] ?? null;
  }
  const index = stepOrder.indexOf(currentId);
  if (index === -1) return stepOrder[0] ?? null;
  return stepOrder[index + 1] ?? null;
};

const assignRoles = (seats: Seat[], roles: Role[]): Seat[] => {
  const pool = shuffle(expandRolePool(roles));
  return seats.map((seat, index) => {
    const role = pool[index];
    return {
      ...seat,
      roleId: role?.id ?? null,
      camp: role?.camp ?? null,
      alive: true,
      revealed: false
    };
  });
};

export const createInitialState = (): GameState => ({
  playerCount: 10,
  seats: createSeats(10),
  rolesPool: baseRoles.map((role) => ({ ...role })),
  rules: { ...defaultRules },
  phase: "SETUP_ROLE_POOL",
  round: 1,
  stepId: null,
  stepStatus: "playing",
  logs: [],
  audioUnlocked: false,
  rulesLocked: false,
  dealSeatIndex: 0,
  pendingNightKill: null,
  pendingWitchSave: false,
  pendingWitchPoison: null,
  pendingVotes: {},
  pendingExecutionHunterTarget: null
});

export const gameReducer = (state: GameState, action: EngineAction): GameState => {
  switch (action.type) {
    case "HYDRATE_STATE":
      return action.state;
    case "SET_PLAYER_COUNT": {
      const count = Math.min(20, Math.max(5, action.value));
      return {
        ...state,
        playerCount: count,
        seats: createSeats(count)
      };
    }
    case "ADD_LOG":
      return { ...state, logs: [action.entry, ...state.logs] };
    case "TOGGLE_ROLE": {
      const rolesPool = state.rolesPool.map((role) =>
        role.id === action.roleId ? { ...role, enabled: action.enabled } : role
      );
      return { ...state, rolesPool };
    }
    case "SET_RULE":
      return {
        ...state,
        rules: {
          ...state.rules,
          [action.key]: action.value
        }
      };
    case "SET_PHASE":
      return { ...state, phase: action.phase };
    case "LOCK_RULES":
      return { ...state, rulesLocked: true };
    case "AUDIO_UNLOCKED":
      return { ...state, audioUnlocked: true };
    case "SET_SEAT_NAME":
      return {
        ...state,
        seats: state.seats.map((seat) =>
          seat.seatNo === action.seatNo ? { ...seat, name: action.name } : seat
        )
      };
    case "DEAL_REVEALED":
      return {
        ...state,
        seats: state.seats.map((seat) =>
          seat.seatNo === action.seatNo ? { ...seat, revealed: true } : seat
        )
      };
    case "ADVANCE_DEAL": {
      const nextIndex = state.dealSeatIndex + 1;
      return {
        ...state,
        dealSeatIndex: nextIndex
      };
    }
    case "START_STEP": {
      const step = getStep(action.stepId);
      return {
        ...state,
        stepId: action.stepId,
        stepStatus: step?.requiresInput ? "waitInput" : "playing"
      };
    }
    case "PAUSE_STEP":
      return { ...state, stepStatus: "paused" };
    case "RESUME_STEP":
      return { ...state, stepStatus: "playing" };
    case "SKIP_STEP": {
      const step = getStep(state.stepId);
      const message = step ? `${step.titleZh} - 已跳過` : "已跳過步驟";
      return {
        ...state,
        logs: [createLog(state.round, state.phase, message), ...state.logs]
      };
    }
    case "COMMIT_INPUT": {
      const stepId = state.stepId;
      if (!stepId) return state;
      if (stepId === "WEREWOLF_STEP") {
        const targetSeat = action.payload as number | null;
        return {
          ...state,
          pendingNightKill: targetSeat,
          logs: [
            createLog(
              state.round,
              state.phase,
              `狼人選擇擊殺：${targetSeat ?? "不殺"}`
            ),
            ...state.logs
          ]
        };
      }
      if (stepId === "SEER_STEP") {
        const targetSeat = action.payload as number;
        return {
          ...state,
          logs: [
            createLog(state.round, state.phase, `預言家驗了 ${targetSeat} 號`),
            ...state.logs
          ]
        };
      }
      if (stepId === "WITCH_STEP") {
        const payload = action.payload as {
          action: "save" | "poison" | "none";
          targetSeat: number | null;
        };
        const save = payload.action === "save";
        const poisonTarget = payload.action === "poison" ? payload.targetSeat : null;
        return {
          ...state,
          pendingWitchSave: save,
          pendingWitchPoison: poisonTarget,
          logs: [
            createLog(
              state.round,
              state.phase,
              `女巫行動：${payload.action === "none" ? "不使用" : payload.action}`
            ),
            ...state.logs
          ]
        };
      }
      if (stepId === "DAY_VOTING") {
        const votes = action.payload as Record<number, number[]>;
        return {
          ...state,
          pendingVotes: votes,
          logs: [createLog(state.round, state.phase, "白天投票已記錄"), ...state.logs]
        };
      }
      if (stepId === "DAY_EXECUTION") {
        const hunterTarget = action.payload as number | null;
        return {
          ...state,
          pendingExecutionHunterTarget: hunterTarget,
          logs: [
            createLog(
              state.round,
              state.phase,
              hunterTarget ? `獵人帶走 ${hunterTarget} 號` : "獵人未帶人"
            ),
            ...state.logs
          ]
        };
      }
      return state;
    }
    case "ADVANCE_STEP": {
      const stepId = state.stepId;
      if (stepId === "NIGHT_RESOLVE") {
        const deaths: number[] = [];
        if (state.pendingNightKill && !state.pendingWitchSave) {
          deaths.push(state.pendingNightKill);
        }
        if (state.pendingWitchPoison) {
          deaths.push(state.pendingWitchPoison);
        }
        const nextSeats = state.seats.map((seat) =>
          deaths.includes(seat.seatNo) ? { ...seat, alive: false } : seat
        );
        return {
          ...state,
          seats: nextSeats,
          pendingNightKill: null,
          pendingWitchSave: false,
          pendingWitchPoison: null,
          logs: [
            createLog(
              state.round,
              state.phase,
              deaths.length
                ? `夜晚死亡：${deaths.join(", ")}`
                : "夜晚平安"
            ),
            ...state.logs
          ]
        };
      }
      if (stepId === "DAY_EXECUTION") {
        const voteCounts = Object.entries(state.pendingVotes).map(([target, voters]) => ({
          target: Number(target),
          count: voters.length
        }));
        const sorted = [...voteCounts].sort((a, b) => b.count - a.count);
        const top = sorted[0];
        const executedSeat = top?.target ?? null;
        const executedSeatData = state.seats.find((seat) => seat.seatNo === executedSeat);
        const hunterTarget =
          executedSeatData?.roleId === "hunter" ? state.pendingExecutionHunterTarget : null;
        const nextSeats = state.seats.map((seat) => {
          if (seat.seatNo === executedSeat) return { ...seat, alive: false };
          if (hunterTarget && seat.seatNo === hunterTarget) return { ...seat, alive: false };
          return seat;
        });
        return {
          ...state,
          seats: nextSeats,
          pendingExecutionHunterTarget: null,
          logs: [
            createLog(
              state.round,
              state.phase,
              executedSeat
                ? `處決 ${executedSeat} 號${hunterTarget ? `，獵人帶走 ${hunterTarget} 號` : ""}`
                : "無人被處決"
            ),
            ...state.logs
          ]
        };
      }
      if (stepId === "CHECK_WIN") {
        const alive = state.seats.filter((seat) => seat.alive);
        const wolves = alive.filter((seat) => seat.camp === "wolf").length;
        const others = alive.filter((seat) => seat.camp !== "wolf").length;
        if (wolves === 0 || wolves >= others) {
          return {
            ...state,
            phase: "GAME_END",
            stepId: "GAME_END",
            stepStatus: "playing",
            logs: [
              createLog(
                state.round,
                state.phase,
                wolves === 0 ? "好人獲勝" : "狼人獲勝"
              ),
              ...state.logs
            ]
          };
        }
        return {
          ...state,
          phase: "NIGHT",
          stepId: "NIGHT_START",
          round: state.round + 1,
          stepStatus: "playing"
        };
      }

      const nextStepId = getNextStepId(stepId);
      if (!nextStepId) {
        return state;
      }
      const nextStep = getStep(nextStepId);
      const nextPhase = nextStep?.phase ?? state.phase;
      const nextRound = stepId === "CHECK_WIN" ? state.round + 1 : state.round;
      return {
        ...state,
        stepId: nextStepId,
        phase: nextPhase,
        round: nextRound,
        stepStatus: "playing"
      };
    }
    case "RESET_GAME": {
      return createInitialState();
    }
    default:
      return state;
  }
};

export const startNewGame = (state: GameState): GameState => {
  const enabledRoles = state.rolesPool.filter((role) => role.enabled);
  const seats = assignRoles(state.seats, enabledRoles);
  return {
    ...state,
    seats,
    phase: "DEAL_MODE",
    dealSeatIndex: 0,
    logs: [createLog(state.round, "DEAL_MODE", "開始派身份"), ...state.logs]
  };
};
