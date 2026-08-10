import { WOLF_ROLES, type AnalysisReason, type AnalysisResult, type GameEvent, type GameState, type PlayerAnalysis, type Role } from "./types";

const uniquelyConfigured = (state: GameState, role: Role) => {
  if (role === "Villager" || role === "Werewolf") return false;
  return [...state.config.specialRoles, ...state.config.wolfRoles].filter((item) => item === role).length === 1;
};

const concernFor = (score: number): PlayerAnalysis["concern"] => score >= 4 ? "HIGH" : score >= 2 ? "MEDIUM" : "LOW";

export const analyzeGame = (state: GameState): AnalysisResult => {
  const scores = new Map<number, number>();
  const reasons = new Map<number, AnalysisReason[]>();
  const add = (player: number, amount: number, label: string, eventIds: string[]) => {
    scores.set(player, (scores.get(player) ?? 0) + amount);
    reasons.set(player, [...(reasons.get(player) ?? []), { label, eventIds }]);
  };

  const confirmedAlignment = new Map<number, { alignment: "GOOD" | "WOLF"; event: GameEvent }>();
  state.events.forEach((event) => {
    if (event.type === "CONFIRM_ROLE") confirmedAlignment.set(event.target, { alignment: event.alignment, event });
  });

  const claimsByRole = new Map<Role, Extract<GameEvent, { type: "CLAIM_ROLE" }>[]>();
  state.events.forEach((event) => {
    if (event.type === "CLAIM_ROLE") claimsByRole.set(event.role, [...(claimsByRole.get(event.role) ?? []), event]);
  });
  const conflicts = [...claimsByRole.entries()]
    .filter(([role, events]) => uniquelyConfigured(state, role) && new Set(events.map((event) => event.actor)).size > 1)
    .map(([role, events]) => ({ role, players: [...new Set(events.map((event) => event.actor))], eventIds: events.map((event) => event.id) }));
  conflicts.forEach((conflict) => conflict.players.forEach((player) => add(player, 2, `${conflict.role} claim conflict`, conflict.eventIds)));

  state.events.forEach((event) => {
    if (event.type === "CHECK" && event.knowledge === "CLAIM") {
      const confirmed = confirmedAlignment.get(event.target);
      if (confirmed && confirmed.alignment !== event.result) {
        add(event.actor, 4, `Check on P${event.target} contradicts confirmed ${confirmed.alignment}`, [event.id, confirmed.event.id]);
      }
    }
    if (event.type === "SUPPORT") {
      const confirmed = confirmedAlignment.get(event.target);
      if (confirmed?.alignment === "WOLF") add(event.actor, 2, `Supported confirmed wolf P${event.target}`, [event.id, confirmed.event.id]);
    }
    if (event.type === "VOTE") {
      const confirmed = confirmedAlignment.get(event.target);
      if (confirmed?.alignment === "WOLF") add(event.actor, -1, `Voted against confirmed wolf P${event.target}`, [event.id, confirmed.event.id]);
    }
  });

  const latestVotesByRound = new Map<string, Map<number, Extract<GameEvent, { type: "VOTE" }>>>();
  state.events.forEach((event) => {
    if (event.type !== "VOTE") return;
    const key = `${event.round}-${event.phase}`;
    const votes = latestVotesByRound.get(key) ?? new Map();
    votes.set(event.actor, event);
    latestVotesByRound.set(key, votes);
  });
  const pairEvidence = new Map<string, { players: [number, number]; events: GameEvent[] }>();
  latestVotesByRound.forEach((votes) => {
    const list = [...votes.values()];
    for (let left = 0; left < list.length; left += 1) {
      for (let right = left + 1; right < list.length; right += 1) {
        if (list[left].target !== list[right].target) continue;
        const players = [list[left].actor, list[right].actor].sort((a, b) => a - b) as [number, number];
        const key = players.join("-");
        const evidence = pairEvidence.get(key) ?? { players, events: [] };
        evidence.events.push(list[left], list[right]);
        pairEvidence.set(key, evidence);
      }
    }
  });
  const relationships = [...pairEvidence.values()]
    .filter((item) => item.events.length >= 4)
    .map((item) => ({
      players: item.players,
      strength: item.events.length / 2,
      reasons: [{ label: `Voted together in ${item.events.length / 2} phases`, eventIds: [...new Set(item.events.map((event) => event.id))] }]
    }))
    .sort((a, b) => b.strength - a.strength);

  const privateKnowledge: AnalysisResult["privateKnowledge"] = [];
  if (WOLF_ROLES.includes(state.config.yourRole as (typeof WOLF_ROLES)[number])) {
    state.config.knownWolfTeammates.forEach((player) => privateKnowledge.push({ player, alignment: "WOLF", label: "Privately known wolf-team member" }));
  }
  state.events.forEach((event) => {
    if (event.type === "CHECK" && event.knowledge === "PRIVATE") {
      privateKnowledge.push({ player: event.target, alignment: event.result, eventId: event.id, label: "Your private Seer check" });
    }
  });

  const players = Array.from({ length: state.config.playerCount }, (_, index) => {
    const player = index + 1;
    const score = scores.get(player) ?? 0;
    return { player, score, concern: concernFor(score), reasons: reasons.get(player) ?? [] };
  }).sort((a, b) => b.score - a.score || a.player - b.player);

  return { players, conflicts, relationships, privateKnowledge };
};
