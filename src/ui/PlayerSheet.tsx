import { useState } from "react";
import type { EventInput } from "../game/engine";
import { SPECIAL_ROLES, WOLF_ROLES, type Alignment, type EliminationCause, type GameState, type Role } from "../game/types";

type Action = "CLAIM_ROLE" | "SUPPORT" | "SUSPECT" | "CHECK" | "VOTE" | "ELIMINATE" | "CONFIRM_ROLE";
type Props = { actor: number; state: GameState; onClose: () => void; onRecord: (event: EventInput) => void };
const actions: Array<{ id: Action; label: string; hint: string; icon: string }> = [
  { id: "CLAIM_ROLE", label: "Claim role", hint: "Public claim", icon: "♙" },
  { id: "SUPPORT", label: "Support / protect", hint: "Back another player", icon: "＋" },
  { id: "SUSPECT", label: "Suspect / attack", hint: "Pressure another player", icon: "!" },
  { id: "CHECK", label: "Check claim", hint: "Good or wolf result", icon: "⌕" },
  { id: "VOTE", label: "Vote", hint: "Record this player's vote", icon: "✓" },
  { id: "ELIMINATE", label: "Eliminated", hint: "Mark this player out", icon: "×" },
  { id: "CONFIRM_ROLE", label: "Confirm role", hint: "Known fact, not a claim", icon: "◆" }
];

export function PlayerSheet({ actor, state, onClose, onRecord }: Props) {
  const [action, setAction] = useState<Action | null>(null);
  const [target, setTarget] = useState<number | null>(null);
  const roles: Role[] = ["Villager", ...SPECIAL_ROLES, ...WOLF_ROLES];
  const targets = Array.from({ length: state.config.playerCount }, (_, index) => index + 1).filter((number) => number !== actor);
  const commit = (event: EventInput) => { onRecord(event); onClose(); };
  const chooseRole = (role: Role) => {
    if (action === "CLAIM_ROLE") commit({ type: "CLAIM_ROLE", actor, role });
    if (action === "CONFIRM_ROLE") commit({ type: "CONFIRM_ROLE", target: actor, role, alignment: WOLF_ROLES.includes(role as (typeof WOLF_ROLES)[number]) ? "WOLF" : "GOOD" });
  };
  const chooseTarget = (number: number) => {
    if (action === "SUPPORT" || action === "SUSPECT" || action === "VOTE") commit({ type: action, actor, target: number });
    else setTarget(number);
  };
  const chooseCheck = (result: Alignment) => {
    if (!target) return;
    const knowledge = actor === state.config.you && state.config.yourRole === "Seer" ? "PRIVATE" : "CLAIM";
    commit({ type: "CHECK", actor, target, result, knowledge });
  };
  const causes: EliminationCause[] = ["Night Kill", "Voted Out", "Witch Poison", "Hunter Shot", "Other"];

  return <div className="sheet-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="bottom-sheet" role="dialog" aria-modal="true" aria-label={`Player ${actor} actions`} onMouseDown={(event) => event.stopPropagation()}>
      <div className="sheet-handle" />
      <header className="sheet-title"><button type="button" onClick={() => action ? (setAction(null), setTarget(null)) : onClose()}>{action ? "←" : "×"}</button><div><span>PLAYER</span><strong>{actor}</strong></div><small>{action ? actions.find((item) => item.id === action)?.label : "Quick actions"}</small></header>
      {!action && <div className="action-list">{actions.map((item) => <button type="button" key={item.id} onClick={() => setAction(item.id)}><b>{item.icon}</b><span><strong>{item.label}</strong><small>{item.hint}</small></span><i>›</i></button>)}</div>}
      {(action === "CLAIM_ROLE" || action === "CONFIRM_ROLE") && <div className="sheet-options role-sheet-options">{roles.map((role) => <button type="button" key={role} onClick={() => chooseRole(role)}>{role}<span>›</span></button>)}</div>}
      {(action === "SUPPORT" || action === "SUSPECT" || action === "VOTE" || action === "CHECK") && target === null && <div><p className="sheet-prompt">Choose a target</p><div className="number-grid sheet-number-grid">{targets.map((number) => <button type="button" key={number} onClick={() => chooseTarget(number)}>{number}</button>)}</div></div>}
      {action === "CHECK" && target !== null && <div><p className="sheet-prompt">P{actor} says P{target} is…</p><div className="result-grid"><button type="button" className="good" onClick={() => chooseCheck("GOOD")}>GOOD</button><button type="button" className="wolf" onClick={() => chooseCheck("WOLF")}>WOLF</button></div></div>}
      {action === "ELIMINATE" && <div className="sheet-options">{causes.map((cause) => <button type="button" key={cause} onClick={() => commit({ type: "ELIMINATE", target: actor, cause })}>{cause}<span>›</span></button>)}</div>}
    </section>
  </div>;
}
