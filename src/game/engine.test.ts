import { describe, expect, it } from "vitest";
import { analyzeGame } from "./analysis";
import { addEvent, createGame, derivePlayers, getCurrentVotes, nextPhase, undoLastEvent } from "./engine";
import type { GameState, SetupConfig } from "./types";

const config: SetupConfig = {
  playerCount: 10,
  villagers: 4,
  specials: 4,
  wolves: 2,
  specialRoles: ["Seer", "Witch", "Hunter", "Guard"],
  wolfRoles: ["Werewolf", "Werewolf"],
  you: 1,
  yourRole: "Seer",
  knownWolfTeammates: []
};

const record = (state: GameState, event: Parameters<typeof addEvent>[1], time: number) => addEvent(state, event, time);

describe("event-sourced game engine", () => {
  it("creates and advances a valid 10-player game", () => {
    let game = createGame(config, 1);
    expect(derivePlayers(game)).toHaveLength(10);
    game = nextPhase(game, 2);
    expect([game.phase, game.round]).toEqual(["Day", 1]);
    game = nextPhase(nextPhase(game, 3), 4);
    expect([game.phase, game.round]).toEqual(["Night", 2]);
  });

  it("undoes the most recent structured event", () => {
    const game = record(createGame(config, 1), { type: "SUSPECT", actor: 4, target: 7 }, 2);
    expect(game.events).toHaveLength(1);
    expect(undoLastEvent(game, 3).events).toHaveLength(0);
  });

  it("uses the latest vote by a voter for live totals", () => {
    let game = createGame(config, 1);
    game = record(game, { type: "VOTE", actor: 2, target: 5 }, 2);
    game = record(game, { type: "VOTE", actor: 2, target: 6 }, 3);
    expect(getCurrentVotes(game).get(2)).toBe(6);
  });
});

describe("deterministic analysis", () => {
  it("reports a unique-role claim conflict without choosing a liar", () => {
    let game = createGame(config, 1);
    game = record(game, { type: "CLAIM_ROLE", actor: 2, role: "Seer" }, 2);
    game = record(game, { type: "CLAIM_ROLE", actor: 5, role: "Seer" }, 3);
    const result = analyzeGame(game);
    expect(result.conflicts[0]).toMatchObject({ role: "Seer", players: [2, 5] });
    expect(result.players.find((item) => item.player === 2)?.concern).toBe("MEDIUM");
    expect(result.players.find((item) => item.player === 5)?.concern).toBe("MEDIUM");
  });

  it("maps contradiction, support, and mitigating vote reasons to event IDs", () => {
    let game = createGame(config, 1);
    game = record(game, { type: "CHECK", actor: 2, target: 6, result: "GOOD", knowledge: "CLAIM" }, 2);
    game = record(game, { type: "SUPPORT", actor: 4, target: 6 }, 3);
    game = record(game, { type: "VOTE", actor: 9, target: 6 }, 4);
    game = record(game, { type: "CONFIRM_ROLE", target: 6, role: "Werewolf", alignment: "WOLF" }, 5);
    const result = analyzeGame(game);
    const p2 = result.players.find((item) => item.player === 2)!;
    const p4 = result.players.find((item) => item.player === 4)!;
    const p9 = result.players.find((item) => item.player === 9)!;
    expect(p2.concern).toBe("HIGH");
    expect(p4.concern).toBe("MEDIUM");
    expect(p9.score).toBe(-1);
    [...p2.reasons, ...p4.reasons, ...p9.reasons].forEach((reason) => {
      expect(reason.eventIds.length).toBeGreaterThan(0);
      reason.eventIds.forEach((id) => expect(game.events.some((event) => event.id === id)).toBe(true));
    });
  });

  it("keeps the user's actual Seer check private and separately certain", () => {
    let game = createGame(config, 1);
    game = record(game, { type: "CHECK", actor: 1, target: 6, result: "GOOD", knowledge: "PRIVATE" }, 2);
    const result = analyzeGame(game);
    expect(result.privateKnowledge[0]).toMatchObject({ player: 6, alignment: "GOOD", label: "Your private Seer check" });
    expect(result.players.find((item) => item.player === 1)?.score).toBe(0);
  });
});
