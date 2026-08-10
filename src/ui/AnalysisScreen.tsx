import { useState } from "react";
import { analyzeGame } from "../game/analysis";
import { formatEvent } from "../game/engine";
import type { AnalysisReason, GameState } from "../game/types";

export function AnalysisScreen({ state }: { state: GameState }) {
  const analysis = analyzeGame(state);
  const [detail, setDetail] = useState<{ title: string; reasons: AnalysisReason[] } | null>(null);
  const watched = analysis.players.filter((item) => item.concern !== "LOW");
  const lower = analysis.players.filter((item) => item.concern === "LOW" && item.reasons.length > 0);
  const events = new Map(state.events.map((event) => [event.id, event]));
  return <div className="secondary-screen analysis-screen"><header><span className="eyebrow">RULE-BASED · NO AI</span><h1>Analysis</h1><p>Concern is evidence, never a verdict. Tap any result to see why.</p></header>
    {watched.length === 0 && analysis.conflicts.length === 0 && analysis.relationships.length === 0 && analysis.privateKnowledge.length === 0 && <div className="empty-state"><b>◇</b><h2>Not enough evidence</h2><p>Claims, checks, support and votes will create explainable findings.</p></div>}
    {watched.length > 0 && <section className="analysis-section"><h2>WATCH</h2>{watched.map((item) => <button type="button" key={item.player} onClick={() => setDetail({ title: `P${item.player} · ${item.concern}`, reasons: item.reasons })}><strong>P{item.player}</strong><span className={`level ${item.concern.toLowerCase()}`}>{item.concern}</span><i>›</i></button>)}</section>}
    {analysis.conflicts.length > 0 && <section className="analysis-section"><h2>ROLE CONFLICT</h2>{analysis.conflicts.map((item) => <button type="button" key={item.role} onClick={() => setDetail({ title: `${item.role} conflict`, reasons: [{ label: `${item.players.map((player) => `P${player}`).join(" / ")} claimed one configured slot`, eventIds: item.eventIds }] })}><strong>⚠ {item.role}</strong><span>{item.players.map((player) => `P${player}`).join(" / ")}</span><i>›</i></button>)}</section>}
    {analysis.relationships.length > 0 && <section className="analysis-section"><h2>STRONG RELATIONSHIP</h2>{analysis.relationships.map((item) => <button type="button" key={item.players.join("-")} onClick={() => setDetail({ title: `P${item.players[0]} ↔ P${item.players[1]}`, reasons: item.reasons })}><strong>P{item.players[0]} ↔ P{item.players[1]}</strong><span>{item.strength} aligned votes</span><i>›</i></button>)}</section>}
    {analysis.privateKnowledge.length > 0 && <section className="analysis-section private"><h2>PRIVATE KNOWLEDGE</h2>{analysis.privateKnowledge.map((item, index) => <button type="button" key={`${item.player}-${index}`} onClick={() => setDetail({ title: `P${item.player} · ${item.alignment}`, reasons: [{ label: item.label, eventIds: item.eventId ? [item.eventId] : [] }] })}><strong>P{item.player}</strong><span>{item.alignment}</span><i>›</i></button>)}</section>}
    {lower.length > 0 && <section className="analysis-section"><h2>LOWER CONCERN</h2>{lower.map((item) => <button type="button" key={item.player} onClick={() => setDetail({ title: `P${item.player} · LOW`, reasons: item.reasons })}><strong>P{item.player}</strong><span>LOW</span><i>›</i></button>)}</section>}
    {detail && <div className="sheet-backdrop" onMouseDown={() => setDetail(null)}><section className="bottom-sheet reason-sheet" onMouseDown={(event) => event.stopPropagation()}><div className="sheet-handle"/><header><div><span>WHY THIS RESULT</span><h2>{detail.title}</h2></div><button type="button" onClick={() => setDetail(null)}>×</button></header>{detail.reasons.map((reason, index) => <article key={index}><strong>{reason.label}</strong>{reason.eventIds.map((id) => events.get(id)).filter(Boolean).map((event) => <small key={event!.id}>#{event!.sequence} · {formatEvent(event!)}</small>)}{reason.eventIds.length === 0 && <small>Derived from your private setup.</small>}</article>)}</section></div>}
  </div>;
}
