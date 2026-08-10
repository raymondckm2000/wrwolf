import type { GameEvent, GameState, PhaseKind, PlayerView, Role, SetupConfig } from "./types";

export const createGame = (config: SetupConfig, now = Date.now()): GameState => ({
  version: 1,
  config,
  phase: "Night",
  round: 1,
  events: [],
  startedAt: now,
  updatedAt: now
});

type EventMetadata = "id" | "sequence" | "createdAt" | "phase" | "round";
export type EventInput = GameEvent extends infer Event
  ? Event extends GameEvent
    ? Omit<Event, EventMetadata>
    : never
  : never;

export const addEvent = (state: GameState, input: EventInput, now = Date.now()): GameState => {
  const event = {
    ...input,
    id: `event-${state.events.length + 1}-${now}`,
    sequence: state.events.length + 1,
    createdAt: now,
    phase: state.phase,
    round: state.round
  } as GameEvent;
  return { ...state, events: [...state.events, event], updatedAt: now };
};

export const undoLastEvent = (state: GameState, now = Date.now()): GameState => ({
  ...state,
  events: state.events.slice(0, -1),
  updatedAt: now
});

export const removeEvent = (state: GameState, eventId: string, now = Date.now()): GameState => ({
  ...state,
  events: state.events.filter((event) => event.id !== eventId),
  updatedAt: now
});

export const nextPhase = (state: GameState, now = Date.now()): GameState => {
  const next: Record<PhaseKind, PhaseKind> = { Night: "Day", Day: "Vote", Vote: "Night" };
  return {
    ...state,
    phase: next[state.phase],
    round: state.phase === "Vote" ? state.round + 1 : state.round,
    updatedAt: now
  };
};

export const derivePlayers = (state: GameState): PlayerView[] => {
  const eliminated = new Set(
    state.events.filter((event) => event.type === "ELIMINATE").map((event) => event.target)
  );
  const claims = new Map<number, Role>();
  const confirmed = new Map<number, Role>();
  state.events.forEach((event) => {
    if (event.type === "CLAIM_ROLE") claims.set(event.actor, event.role);
    if (event.type === "CONFIRM_ROLE") confirmed.set(event.target, event.role);
  });
  return Array.from({ length: state.config.playerCount }, (_, index) => ({
    number: index + 1,
    alive: !eliminated.has(index + 1),
    isYou: state.config.you === index + 1,
    claim: claims.get(index + 1),
    confirmedRole: confirmed.get(index + 1)
  }));
};

export const getCurrentVotes = (state: GameState): Map<number, number> => {
  const votes = new Map<number, number>();
  state.events.forEach((event) => {
    if (event.type === "VOTE" && event.phase === state.phase && event.round === state.round) {
      votes.set(event.actor, event.target);
    }
  });
  return votes;
};

export const formatPhase = (state: Pick<GameState, "phase" | "round">) =>
  `${state.phase} ${state.round}`;

export const formatEvent = (event: GameEvent): string => {
  switch (event.type) {
    case "CLAIM_ROLE": return `P${event.actor} claimed ${event.role}`;
    case "SUPPORT": return `P${event.actor} supported P${event.target}`;
    case "SUSPECT": return `P${event.actor} suspected P${event.target}`;
    case "CHECK": return `P${event.actor} checked P${event.target}: ${event.result}${event.knowledge === "PRIVATE" ? " (private)" : " (claim)"}`;
    case "VOTE": return `P${event.actor} voted P${event.target}`;
    case "ELIMINATE": return `P${event.target} out — ${event.cause}`;
    case "CONFIRM_ROLE": return `P${event.target} confirmed ${event.role}`;
  }
};
