import { useMemo, useState } from "react";
import { SPECIAL_ROLES, WOLF_ROLES, type Role, type SetupConfig, type SpecialRole, type WolfRole } from "../game/types";

type Props = { onStart: (config: SetupConfig) => void; onCancel: () => void };
type Draft = Omit<SetupConfig, "you" | "yourRole" | "knownWolfTeammates">;

const presets: Record<string, Draft> = {
  "10 players": { playerCount: 10, villagers: 4, specials: 4, wolves: 2, specialRoles: ["Seer", "Witch", "Hunter", "Guard"], wolfRoles: ["Werewolf", "Werewolf"] },
  "12 players": { playerCount: 12, villagers: 4, specials: 4, wolves: 4, specialRoles: ["Seer", "Witch", "Hunter", "Guard"], wolfRoles: ["Werewolf", "Werewolf", "Werewolf", "Wolf King"] }
};

const Counter = ({ label, value, min = 0, max = 18, onChange }: { label: string; value: number; min?: number; max?: number; onChange: (value: number) => void }) => (
  <div className="counter">
    <div><span>{label}</span><strong>{value}</strong></div>
    <div className="counter-controls">
      <button type="button" aria-label={`Decrease ${label}`} disabled={value <= min} onClick={() => onChange(value - 1)}>−</button>
      <button type="button" aria-label={`Increase ${label}`} disabled={value >= max} onClick={() => onChange(value + 1)}>+</button>
    </div>
  </div>
);

export function Setup({ onStart, onCancel }: Props) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(presets["10 players"]);
  const [you, setYou] = useState(1);
  const [yourRole, setYourRole] = useState<Role>("Villager");
  const [knownWolfTeammates, setKnownWolfTeammates] = useState<number[]>([]);
  const validCounts = draft.villagers + draft.specials + draft.wolves === draft.playerCount;
  const validRoles = draft.specialRoles.length === draft.specials && draft.wolfRoles.length === draft.wolves;
  const availableRoles = useMemo(() => [...new Set<Role>(["Villager", ...draft.specialRoles, ...draft.wolfRoles])], [draft]);

  const setCount = (key: "playerCount" | "villagers" | "specials" | "wolves", value: number) => setDraft((current) => ({ ...current, [key]: value }));
  const toggleSpecial = (role: SpecialRole) => setDraft((current) => ({
    ...current,
    specialRoles: current.specialRoles.includes(role) ? current.specialRoles.filter((item) => item !== role) : current.specialRoles.length < current.specials ? [...current.specialRoles, role] : current.specialRoles
  }));
  const changeWolf = (index: number, role: WolfRole) => setDraft((current) => ({ ...current, wolfRoles: current.wolfRoles.map((item, itemIndex) => itemIndex === index ? role : item) }));
  const normalizeWolfSlots = (count: number) => setDraft((current) => ({ ...current, wolves: count, wolfRoles: Array.from({ length: count }, (_, index) => current.wolfRoles[index] ?? "Werewolf") }));
  const isWolf = WOLF_ROLES.includes(yourRole as WolfRole);

  return (
    <main className="setup-shell">
      <header className="setup-header">
        <button className="icon-button" type="button" onClick={step === 0 ? onCancel : () => setStep(step - 1)} aria-label="Back">←</button>
        <div><span className="eyebrow">NEW GAME</span><h1>{step === 0 ? "Build the circle" : step === 1 ? "Choose the roles" : "Your secret"}</h1></div>
        <span className="step-count">{step + 1}/3</span>
      </header>

      {step === 0 && <section className="setup-content">
        <div className="preset-row">
          {Object.entries(presets).map(([name, config]) => <button key={name} type="button" className={`pill ${draft.playerCount === config.playerCount && draft.wolves === config.wolves ? "selected" : ""}`} onClick={() => setDraft(config)}>{name}</button>)}
          <button type="button" className="pill">Custom</button>
        </div>
        <div className="paper-card counter-list">
          <Counter label="Players" value={draft.playerCount} min={5} max={18} onChange={(value) => setCount("playerCount", value)} />
          <Counter label="Villagers" value={draft.villagers} onChange={(value) => setCount("villagers", value)} />
          <Counter label="Special roles" value={draft.specials} max={SPECIAL_ROLES.length} onChange={(value) => setCount("specials", value)} />
          <Counter label="Wolves" value={draft.wolves} max={6} onChange={normalizeWolfSlots} />
        </div>
        <div className={`balance ${validCounts ? "valid" : "invalid"}`}><span>{validCounts ? "✓" : "!"}</span><div><strong>{draft.villagers} + {draft.specials} + {draft.wolves} = {draft.villagers + draft.specials + draft.wolves}</strong><small>{validCounts ? "The circle is balanced" : `Must equal ${draft.playerCount} players`}</small></div></div>
      </section>}

      {step === 1 && <section className="setup-content">
        <div className="section-heading"><div><span className="eyebrow">GOOD TEAM</span><h2>Special roles</h2></div><span>{draft.specialRoles.length}/{draft.specials}</span></div>
        <div className="role-grid">{SPECIAL_ROLES.map((role) => <button key={role} type="button" className={`role-option ${draft.specialRoles.includes(role) ? "selected" : ""}`} onClick={() => toggleSpecial(role)}><span>{role.slice(0, 1)}</span>{role}<b>{draft.specialRoles.includes(role) ? "✓" : "+"}</b></button>)}</div>
        <div className="section-heading wolf-heading"><div><span className="eyebrow">WOLF TEAM</span><h2>Wolf slots</h2></div><span>{draft.wolves}</span></div>
        <div className="wolf-slots">{draft.wolfRoles.map((role, index) => <div className="wolf-slot" key={index}><strong>Wolf {index + 1}</strong><div>{WOLF_ROLES.map((choice) => <button type="button" key={choice} className={role === choice ? "selected" : ""} onClick={() => changeWolf(index, choice)}>{choice}</button>)}</div></div>)}</div>
      </section>}

      {step === 2 && <section className="setup-content">
        <div className="section-heading"><div><span className="eyebrow">PRIVATE TO YOU</span><h2>Which player are you?</h2></div></div>
        <div className="number-grid identity-grid">{Array.from({ length: draft.playerCount }, (_, index) => index + 1).map((number) => <button type="button" key={number} className={you === number ? "selected" : ""} onClick={() => setYou(number)}>{number}</button>)}</div>
        <div className="section-heading role-question"><div><h2>What is your real role?</h2><p>Stored only on this device.</p></div></div>
        <div className="role-list">{availableRoles.map((role) => <button type="button" key={role} className={yourRole === role ? "selected" : ""} onClick={() => setYourRole(role)}><span>{role}</span><b>{yourRole === role ? "✓" : ""}</b></button>)}</div>
        {isWolf && <><div className="section-heading teammate-question"><div><h2>Known wolf teammates</h2><p>Private. Select up to {Math.max(0, draft.wolves - 1)}.</p></div></div><div className="number-grid identity-grid">{Array.from({ length: draft.playerCount }, (_, index) => index + 1).filter((number) => number !== you).map((number) => <button type="button" key={number} className={knownWolfTeammates.includes(number) ? "selected" : ""} onClick={() => setKnownWolfTeammates((current) => current.includes(number) ? current.filter((item) => item !== number) : current.length < draft.wolves - 1 ? [...current, number] : current)}>{number}</button>)}</div></>}
      </section>}

      <footer className="setup-footer">
        {step < 2 ? <button className="primary" type="button" disabled={(step === 0 && !validCounts) || (step === 1 && !validRoles)} onClick={() => setStep(step + 1)}>Continue <span>→</span></button> : <button className="primary" type="button" onClick={() => onStart({ ...draft, you, yourRole, knownWolfTeammates: isWolf ? knownWolfTeammates : [] })}>Enter game <span>→</span></button>}
      </footer>
    </main>
  );
}
