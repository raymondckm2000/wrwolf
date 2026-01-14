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

const createNightRuntime = (): GameState["runtime"]["night"] => ({
  wolfTarget: null,
  seerCheck: null,
  witchSave: false,
  witchPoisonTarget: null,
  resolvedDeaths: []
});

const createDayRuntime = (): GameState["runtime"]["day"] => ({
  voteMatrix: {},
  executedSeat: null,
  tieSeats: [],
  reVoteCount: 0
});

const createResources = (): GameState["runtime"]["resources"] => ({
  witch: {
    antidoteAvailable: true,
    poisonAvailable: true
  },
  hunter: {
    shotAvailable: true
  }
});

const createPending = (): GameState["runtime"]["pending"] => ({
  hunterShotFrom: null
});

export const createLog = (round: number, phase: string, messageZh: string): LogEntry => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  round,
  phase,
  messageZh,
  timestamp: Date.now()
});

export const getStep = (stepId: string | null): StepConfig | undefined =>
  stepsConfig.find((step) => step.id === stepId);

const getSeatByRole = (state: GameState, roleId: string) =>
  state.seats.find((seat) => seat.roleId === roleId);

const isSeatAlive = (state: GameState, seatNo: number | null) => {
  if (seatNo === null) return false;
  return state.seats.some((seat) => seat.seatNo === seatNo && seat.alive);
};

const normalizeVoteMatrix = (state: GameState, matrix: Record<number, number[]>) => {
  const aliveSeats = new Set(state.seats.filter((seat) => seat.alive).map((seat) => seat.seatNo));
  return Object.entries(matrix).reduce<Record<number, number[]>>((acc, [target, voters]) => {
    const targetSeat = Number(target);
    if (!aliveSeats.has(targetSeat)) return acc;
    const filteredVoters = Array.from(
      new Set(voters.filter((voter) => aliveSeats.has(voter)))
    );
    acc[targetSeat] = filteredVoters;
    return acc;
  }, {});
};

const computeVoteResult = (matrix: Record<number, number[]>) => {
  const voteCounts = Object.entries(matrix).map(([target, voters]) => ({
    target: Number(target),
    count: voters.length
  }));
  if (!voteCounts.length) {
    return { executedSeat: null, tieSeats: [] };
  }
  const sorted = [...voteCounts].sort((a, b) => b.count - a.count);
  const topCount = sorted[0]?.count ?? 0;
  const topSeats = sorted.filter((entry) => entry.count === topCount).map((entry) => entry.target);
  return {
    executedSeat: topSeats.length === 1 ? topSeats[0] : null,
    tieSeats: topSeats.length > 1 ? topSeats : []
  };
};

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
  runtime: {
    night: createNightRuntime(),
    day: createDayRuntime(),
    resources: createResources(),
    pending: createPending()
  }
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
      const nextPhase = step?.phase ?? state.phase;
      let runtime = state.runtime;
      if (action.stepId === "NIGHT_START") {
        runtime = {
          ...runtime,
          night: createNightRuntime()
        };
      }
      if (action.stepId === "DAY_START") {
        runtime = {
          ...runtime,
          day: createDayRuntime()
        };
      }
      return {
        ...state,
        stepId: action.stepId,
        stepStatus: step?.requiresInput ? "waitInput" : "playing",
        phase: nextPhase,
        runtime
      };
    }
    case "PAUSE_STEP":
      return { ...state, stepStatus: "paused" };
    case "RESUME_STEP":
      return { ...state, stepStatus: "playing" };
    case "SKIP_STEP": {
      const step = getStep(state.stepId);
      const message = step ? `STEP_SKIPPED：${step.titleZh}` : "STEP_SKIPPED";
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
        const validatedTarget = isSeatAlive(state, targetSeat) ? targetSeat : null;
        return {
          ...state,
          runtime: {
            ...state.runtime,
            night: {
              ...state.runtime.night,
              wolfTarget: validatedTarget
            }
          },
          logs: [
            createLog(
              state.round,
              state.phase,
              `WOLF_TARGET：${validatedTarget ?? "不殺"}`
            ),
            ...state.logs
          ]
        };
      }
      if (stepId === "SEER_STEP") {
        const targetSeat = action.payload as number;
        const validatedTarget = isSeatAlive(state, targetSeat) ? targetSeat : null;
        const targetData = validatedTarget
          ? state.seats.find((seat) => seat.seatNo === validatedTarget)
          : null;
        return {
          ...state,
          logs: [
            createLog(
              state.round,
              state.phase,
              `SEER_CHECK：${validatedTarget ?? "無效"}${
                targetData ? `（${targetData.camp === "wolf" ? "狼人" : "好人"}）` : ""
              }`
            ),
            ...state.logs
          ],
          runtime: {
            ...state.runtime,
            night: {
              ...state.runtime.night,
              seerCheck: validatedTarget
            }
          }
        };
      }
      if (stepId === "WITCH_STEP") {
        const payload = action.payload as {
          save: boolean;
          poisonTarget: number | null;
        };
        const witchSeat = getSeatByRole(state, "witch");
        const isSelfSaveBlocked =
          state.rules.witchFirstNightNoSelfSave &&
          state.round === 1 &&
          witchSeat &&
          state.runtime.night.wolfTarget === witchSeat.seatNo;
        const canSave =
          payload.save &&
          state.runtime.night.wolfTarget !== null &&
          state.runtime.resources.witch.antidoteAvailable &&
          !isSelfSaveBlocked;
        const requestedPoison = isSeatAlive(state, payload.poisonTarget)
          ? payload.poisonTarget
          : null;
        const canPoison =
          requestedPoison !== null && state.runtime.resources.witch.poisonAvailable;
        const save = canSave;
        const poisonTarget =
          state.rules.witchNoDoublePotionSameNight && save ? null : canPoison ? requestedPoison : null;
        const resources = {
          ...state.runtime.resources,
          witch: {
            antidoteAvailable: save
              ? false
              : state.runtime.resources.witch.antidoteAvailable,
            poisonAvailable: poisonTarget
              ? false
              : state.runtime.resources.witch.poisonAvailable
          }
        };
        return {
          ...state,
          runtime: {
            ...state.runtime,
            resources,
            night: {
              ...state.runtime.night,
              witchSave: save,
              witchPoisonTarget: poisonTarget
            }
          },
          logs: [
            createLog(
              state.round,
              state.phase,
              `WITCH_DECISION：${
                save ? "解藥" : "不救"
              }${poisonTarget ? `，毒 ${poisonTarget} 號` : ""}`
            ),
            ...state.logs
          ]
        };
      }
      if (stepId === "DAY_VOTING") {
        const votes = normalizeVoteMatrix(state, action.payload as Record<number, number[]>);
        const { executedSeat, tieSeats } = computeVoteResult(votes);
        return {
          ...state,
          runtime: {
            ...state.runtime,
            day: {
              ...state.runtime.day,
              voteMatrix: votes,
              executedSeat,
              tieSeats,
              reVoteCount:
                tieSeats.length > 1 ? state.runtime.day.reVoteCount + 1 : state.runtime.day.reVoteCount
            }
          },
          logs: [
            createLog(
              state.round,
              state.phase,
              `VOTES_RECORDED：${executedSeat ? `最高票 ${executedSeat} 號` : "平票"}`
            ),
            ...state.logs
          ]
        };
      }
      if (stepId === "HUNTER_RESOLVE") {
        const hunterTarget = action.payload as number | null;
        if (!state.rules.hunterMaySkipOnDeath && hunterTarget === null) {
          return state;
        }
        const validatedTarget = isSeatAlive(state, hunterTarget) ? hunterTarget : null;
        const shouldConsumeShot = Boolean(validatedTarget);
        return {
          ...state,
          runtime: {
            ...state.runtime,
            resources: {
              ...state.runtime.resources,
              hunter: {
                shotAvailable: shouldConsumeShot
                  ? false
                  : state.runtime.resources.hunter.shotAvailable
              }
            },
            pending: {
              ...state.runtime.pending,
              hunterShotFrom: null
            }
          },
          logs: [
            createLog(
              state.round,
              state.phase,
              validatedTarget
                ? `HUNTER_SHOT：帶走 ${validatedTarget} 號`
                : "HUNTER_SHOT：未帶人"
            ),
            ...state.logs
          ],
          seats: validatedTarget
            ? state.seats.map((seat) =>
                seat.seatNo === validatedTarget ? { ...seat, alive: false } : seat
              )
            : state.seats
        };
      }
      return state;
    }
    case "ADVANCE_STEP": {
      const stepId = state.stepId;
      if (!stepId) return state;
      let nextState = state;
      if (stepId === "NIGHT_RESOLVE") {
        const deaths: number[] = [];
        if (nextState.runtime.night.wolfTarget && !nextState.runtime.night.witchSave) {
          deaths.push(nextState.runtime.night.wolfTarget);
        }
        if (nextState.runtime.night.witchPoisonTarget) {
          deaths.push(nextState.runtime.night.witchPoisonTarget);
        }
        const uniqueDeaths = Array.from(new Set(deaths)).filter((seatNo) =>
          nextState.seats.some((seat) => seat.seatNo === seatNo && seat.alive)
        );
        const nextSeats = nextState.seats.map((seat) =>
          uniqueDeaths.includes(seat.seatNo) ? { ...seat, alive: false } : seat
        );
        const hunterDeath = uniqueDeaths.find((seatNo) => {
          const seat = nextState.seats.find((item) => item.seatNo === seatNo);
          return seat?.roleId === "hunter";
        });
        nextState = {
          ...nextState,
          seats: nextSeats,
          logs: [
            createLog(
              nextState.round,
              nextState.phase,
              uniqueDeaths.length
                ? `NIGHT_DEATHS：${uniqueDeaths.join(", ")}`
                : "NIGHT_DEATHS：平安夜"
            ),
            ...nextState.logs
          ],
          runtime: {
            ...nextState.runtime,
            night: {
              ...nextState.runtime.night,
              resolvedDeaths: uniqueDeaths
            },
            pending: {
              ...nextState.runtime.pending,
              hunterShotFrom:
                hunterDeath && nextState.runtime.resources.hunter.shotAvailable
                  ? hunterDeath
                  : nextState.runtime.pending.hunterShotFrom
            }
          }
        };
      }
      if (stepId === "DAY_EXECUTION") {
        const executedSeat = nextState.runtime.day.executedSeat;
        const executedSeatData = nextState.seats.find((seat) => seat.seatNo === executedSeat);
        const nextSeats = nextState.seats.map((seat) => {
          if (executedSeat && seat.seatNo === executedSeat) return { ...seat, alive: false };
          return seat;
        });
        const hunterDeath =
          executedSeatData?.roleId === "hunter" &&
          nextState.runtime.resources.hunter.shotAvailable
            ? executedSeat
            : null;
        nextState = {
          ...nextState,
          seats: nextSeats,
          logs: [
            createLog(
              nextState.round,
              nextState.phase,
              executedSeat
                ? `EXECUTION：處決 ${executedSeat} 號`
                : "EXECUTION：無人被處決"
            ),
            ...nextState.logs
          ],
          runtime: {
            ...nextState.runtime,
            pending: {
              ...nextState.runtime.pending,
              hunterShotFrom: hunterDeath ?? nextState.runtime.pending.hunterShotFrom
            }
          }
        };
      }
      if (stepId === "CHECK_WIN") {
        const alive = state.seats.filter((seat) => seat.alive);
        const wolves = alive.filter((seat) => seat.camp === "wolf").length;
        const others = alive.filter((seat) => seat.camp !== "wolf").length;
        const godIds = new Set(["seer", "witch", "hunter"]);
        const totalGods = state.seats.filter((seat) => seat.roleId && godIds.has(seat.roleId)).length;
        const aliveGods = alive.filter((seat) => seat.roleId && godIds.has(seat.roleId)).length;
        const allGodsDead = state.rules.winByRemainingSkillsEdge && totalGods > 0 && aliveGods === 0;
        if (wolves === 0 || wolves >= others || allGodsDead) {
          return {
            ...state,
            phase: "GAME_END",
            stepId: "GAME_END",
            stepStatus: "playing",
            logs: [
              createLog(
                state.round,
                state.phase,
                `WIN_CHECK：${wolves === 0 ? "好人獲勝" : "狼人獲勝"}`
              ),
              createLog(state.round, state.phase, "GAME_END：遊戲結束"),
              ...state.logs
            ]
          };
        }
        return {
          ...state,
          phase: "NIGHT",
          stepId: "NIGHT_START",
          round: state.round + 1,
          stepStatus: "playing",
          logs: [
            createLog(
              state.round,
              state.phase,
              `WIN_CHECK：狼人 ${wolves}，好人 ${others}，未結束`
            ),
            ...state.logs
          ]
        };
      }

      let nextStepId = getNextStepId(stepId);
      if (
        nextState.runtime.pending.hunterShotFrom &&
        (stepId === "NIGHT_RESOLVE" || stepId === "DAY_EXECUTION")
      ) {
        nextStepId = "HUNTER_RESOLVE";
      }
      if (stepId === "HUNTER_RESOLVE") {
        nextStepId = "CHECK_WIN";
      }
      if (stepId === "DAY_EXECUTION" && !nextState.runtime.pending.hunterShotFrom) {
        nextStepId = "CHECK_WIN";
      }
      if (!nextStepId) {
        return state;
      }
      const nextStep = getStep(nextStepId);
      const nextPhase = nextStep?.phase ?? nextState.phase;
      return {
        ...nextState,
        stepId: nextStepId,
        phase: nextPhase,
        stepStatus: nextStep?.requiresInput ? "waitInput" : "playing"
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
    round: 1,
    stepId: null,
    runtime: {
      night: createNightRuntime(),
      day: createDayRuntime(),
      resources: createResources(),
      pending: createPending()
    },
    logs: [createLog(1, "DEAL_MODE", "開始派身份"), ...state.logs]
  };
};
