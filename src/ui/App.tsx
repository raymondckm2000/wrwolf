import { useEffect, useState } from "react";
import { addEvent, createGame, nextPhase, removeEvent, undoLastEvent, type EventInput } from "../game/engine";
import { clearGame, loadGame, saveGame } from "../game/persistence";
import type { GameState, SetupConfig } from "../game/types";
import { AnalysisScreen } from "./AnalysisScreen";
import { GameScreen } from "./GameScreen";
import { Setup } from "./Setup";
import { Timeline } from "./Timeline";

type Tab = "game" | "timeline" | "analysis";
type View = "home" | "setup" | "active";
const initialGame = loadGame();

export function App() {
  const [game, setGame] = useState<GameState | null>(initialGame);
  const [view, setView] = useState<View>(initialGame ? "home" : "setup");
  const [tab, setTab] = useState<Tab>("game");
  const [settings, setSettings] = useState(false);
  useEffect(() => { if (game) saveGame(game); }, [game]);
  const start = (config: SetupConfig) => { const next = createGame(config); setGame(next); saveGame(next); setView("active"); };
  const reset = () => { clearGame(); setGame(null); setSettings(false); setView("setup"); setTab("game"); };
  const record = (event: EventInput) => setGame((current) => current ? addEvent(current, event) : current);

  if (view === "setup") return <Setup onStart={start} onCancel={() => game ? setView("home") : undefined} />;
  if (view === "home" && game) return <main className="home-screen"><div className="brand-mark">M</div><div className="home-copy"><span className="eyebrow">WEREWOLF ASSISTANT</span><h1>Read the room.<br/>Remember <em>everything.</em></h1><p>Fast, private game tracking with explainable analysis. No AI. No accounts.</p></div><div className="resume-card"><div><span>IN PROGRESS</span><strong>{game.config.playerCount} players</strong><small>{game.phase} {game.round} · {game.events.length} events</small></div><button className="primary" type="button" onClick={() => setView("active")}>Resume game <span>→</span></button></div><button className="text-button" type="button" onClick={() => setView("setup")}>Start a new game</button><button className="danger-text" type="button" onClick={reset}>Reset saved game</button><footer>Saved privately on this device</footer></main>;
  if (!game) return null;

  return <div className="app-shell">
    <main className="app-content">
      {tab === "game" && <GameScreen state={game} onRecord={record} onUndo={() => setGame(undoLastEvent(game))} onNextPhase={() => setGame(nextPhase(game))} onOpenSettings={() => setSettings(true)} />}
      {tab === "timeline" && <Timeline state={game} onRemove={(id) => setGame(removeEvent(game, id))} />}
      {tab === "analysis" && <AnalysisScreen state={game} />}
    </main>
    <nav className="bottom-nav" aria-label="Main navigation">{([['game','◉','Game'],['timeline','≡','Timeline'],['analysis','◇','Analysis']] as const).map(([id, icon, label]) => <button type="button" key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}><b>{icon}</b><span>{label}</span></button>)}</nav>
    {settings && <div className="sheet-backdrop" onMouseDown={() => setSettings(false)}><section className="bottom-sheet settings-sheet" onMouseDown={(event) => event.stopPropagation()}><div className="sheet-handle"/><header><div><span>GAME SETTINGS</span><h2>Private game info</h2></div><button type="button" onClick={() => setSettings(false)}>×</button></header><div className="private-card"><span>YOU ARE</span><strong>P{game.config.you} · {game.config.yourRole}</strong><small>Only shown in this settings sheet.</small></div><button className="sheet-menu" type="button" onClick={() => setView("home")}>Leave to home <span>›</span></button><button className="sheet-menu danger" type="button" onClick={reset}>Reset this game <span>›</span></button></section></div>}
  </div>;
}
