import { useMemo, useState } from "react";
import { derivePlayers, getCurrentVotes, type EventInput } from "../game/engine";
import type { GameState } from "../game/types";

export function Voting({ state, onRecord, onClose }: { state: GameState; onRecord: (event: EventInput) => void; onClose: () => void }) {
  const [voter, setVoter] = useState<number | null>(null);
  const players = derivePlayers(state).filter((player) => player.alive);
  const votes = getCurrentVotes(state);
  const totals = useMemo(() => {
    const result = new Map<number, number>();
    votes.forEach((target) => result.set(target, (result.get(target) ?? 0) + 1));
    return result;
  }, [votes]);
  const select = (number: number) => {
    if (voter === null) setVoter(number);
    else {
      onRecord({ type: "VOTE", actor: voter, target: number });
      setVoter(null);
    }
  };
  return <section className="vote-mode">
    <header className="vote-header"><button type="button" onClick={onClose}>×</button><div><span>FAST VOTING</span><h2>{voter ? `P${voter} votes for…` : "Choose voter"}</h2></div><small>{votes.size}/{players.length}</small></header>
    <div className="vote-help">{voter ? "Tap a target. Tap voter again to cancel." : "Tap voter → tap target. New votes replace old ones."}</div>
    <div className="vote-player-grid">{players.map((player) => <button type="button" key={player.number} className={`${voter === player.number ? "selected" : ""} ${voter !== null && voter === player.number ? "cancel-voter" : ""}`} onClick={() => voter === player.number ? setVoter(null) : select(player.number)}><strong>{player.number}</strong>{voter === null && votes.has(player.number) && <small>→ P{votes.get(player.number)}</small>}{voter !== null && <small>{totals.get(player.number) ?? 0} vote{(totals.get(player.number) ?? 0) === 1 ? "" : "s"}</small>}</button>)}</div>
    <div className="vote-totals"><span>LIVE TOTALS</span>{[...totals.entries()].sort((a, b) => b[1] - a[1]).map(([target, count]) => <div key={target}><strong>P{target}</strong><span>{Array.from({ length: count }, (_, index) => <i key={index} />)}</span><b>{count}</b></div>)}</div>
    <button className="primary done-voting" type="button" onClick={onClose}>Done voting</button>
  </section>;
}
