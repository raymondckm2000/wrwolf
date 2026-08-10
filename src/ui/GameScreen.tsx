import { useState } from "react";
import { analyzeGame } from "../game/analysis";
import { derivePlayers, formatPhase, type EventInput } from "../game/engine";
import type { GameState } from "../game/types";
import { PlayerSheet } from "./PlayerSheet";
import { Voting } from "./Voting";

export function GameScreen({ state, onRecord, onUndo, onNextPhase, onOpenSettings }: { state: GameState; onRecord: (event: EventInput) => void; onUndo: () => void; onNextPhase: () => void; onOpenSettings: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [voting, setVoting] = useState(false);
  const players = derivePlayers(state);
  const analysis = analyzeGame(state);
  const concern = new Map(analysis.players.map((item) => [item.player, item.concern]));
  if (voting) return <Voting state={state} onRecord={onRecord} onClose={() => setVoting(false)} />;
  return <div className="game-screen">
    <header className="game-header"><div><span className="eyebrow">{formatPhase(state).toUpperCase()}</span><h1>The circle</h1></div><div className="header-actions"><button type="button" className="phase-button" onClick={onNextPhase}>Next phase <span>›</span></button><button type="button" className="icon-button" aria-label="Settings" onClick={onOpenSettings}>•••</button></div></header>
    <div className="quiet-status"><span>{players.filter((player) => player.alive).length} alive</span><i /> <span>{state.events.length} events</span>{analysis.conflicts.length > 0 && <><i /><strong>⚠ {analysis.conflicts.length} conflict</strong></>}</div>
    <section className="players-grid" aria-label="Players">{players.map((player) => {
      const level = concern.get(player.number) ?? "LOW";
      return <button type="button" key={player.number} className={`player-card concern-${level.toLowerCase()} ${!player.alive ? "out" : ""} ${player.isYou ? "you" : ""} ${player.claim ? "has-claim" : ""}`} onClick={() => setSelected(player.number)}>
        <span className="player-meta">{player.isYou ? "YOU" : !player.alive ? "OUT" : "ALIVE"}</span><strong>{player.number}</strong>
        <div>{player.claim ? <span className="claim-badge">♙ {player.claim}</span> : <span className={`concern-label ${level.toLowerCase()}`}>{level === "LOW" ? "LOWER" : level === "MEDIUM" ? "WATCH" : "HIGH"}</span>}</div>
      </button>;
    })}</section>
    <div className="game-quickbar"><button type="button" className="vote-launch" onClick={() => setVoting(true)}><b>✓</b><span><strong>Voting mode</strong><small>Fast voter → target entry</small></span><i>›</i></button><button type="button" className="undo-button" disabled={state.events.length === 0} onClick={onUndo}>↶ <span>Undo</span></button></div>
    {selected !== null && <PlayerSheet actor={selected} state={state} onClose={() => setSelected(null)} onRecord={onRecord} />}
  </div>;
}
