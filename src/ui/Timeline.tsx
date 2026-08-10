import { formatEvent } from "../game/engine";
import type { GameState } from "../game/types";

export function Timeline({ state, onRemove }: { state: GameState; onRemove: (eventId: string) => void }) {
  const groups = state.events.reduce<Map<string, typeof state.events>>((map, event) => {
    const key = `${event.phase} ${event.round}`;
    map.set(key, [...(map.get(key) ?? []), event]);
    return map;
  }, new Map());
  return <div className="secondary-screen"><header><span className="eyebrow">STRUCTURED LOG</span><h1>Timeline</h1><p>Every item comes from a tap. Remove an older event to correct it.</p></header>
    {state.events.length === 0 && <div className="empty-state"><b>○</b><h2>No events yet</h2><p>Actions recorded in the game will appear here.</p></div>}
    {[...groups.entries()].reverse().map(([phase, events]) => <section className="timeline-group" key={phase}><h2>{phase}<span>{events.length}</span></h2>{[...events].reverse().map((event) => <article key={event.id}><i className={`event-icon ${event.type.toLowerCase()}`} /> <div><strong>{formatEvent(event)}</strong><small>Event #{event.sequence} · {event.type.replaceAll("_", " ")}</small></div><button type="button" aria-label={`Remove ${formatEvent(event)}`} onClick={() => onRemove(event.id)}>×</button></article>)}</section>)}
  </div>;
}
