import { useEffect, useMemo, useRef, useState } from "react";
import { countByCamp } from "../engine/roles";
import {
  createInitialState,
  createLog,
  gameReducer,
  getStep,
  startNewGame
} from "../engine/gameEngine";
import { loadState, saveState } from "../engine/storage";
import { ConsoleOverlay } from "./pages/ConsoleOverlay";
import { DealPage } from "./pages/DealPage";
import { LogPage } from "./pages/LogPage";
import { RoleRevealPage } from "./pages/RoleRevealPage";
import { RulesPage } from "./pages/RulesPage";
import { SetupPage } from "./pages/SetupPage";
import { GameState } from "../engine/types";

const tabs = ["開局", "規則", "紀錄"] as const;

type TabKey = (typeof tabs)[number];

export const App = () => {
  const [state, setState] = useState<GameState>(createInitialState());
  const [currentTab, setCurrentTab] = useState<TabKey>("開局");
  const [showReveal, setShowReveal] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const isPlayableAudio = (audioFile: string | null | undefined) =>
    Boolean(audioFile && audioFile !== "PLACEHOLDER_ONLY");

  const dispatch = (action: Parameters<typeof gameReducer>[1]) => {
    setState((prev) => gameReducer(prev, action));
  };

  useEffect(() => {
    let mounted = true;
    loadState().then((saved) => {
      if (saved && mounted) {
        setState(saved);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    saveState(state).catch(() => null);
  }, [state]);

  const enabledRoles = useMemo(
    () => state.rolesPool.filter((role) => role.enabled),
    [state.rolesPool]
  );

  const step = getStep(state.stepId);

  useEffect(() => {
    if (!step || !step.autoPlay || !state.audioUnlocked) {
      return;
    }
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    if (isPlayableAudio(step.audioFile)) {
      const audio = audioRef.current;
      audio.src = step.audioFile as string;
      audio.currentTime = 0;
      if (state.stepStatus !== "paused") {
        audio.play().catch(() => null);
      }
    }

    if (!step.requiresInput && step.autoAdvance) {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        dispatch({ type: "ADVANCE_STEP" });
      }, step.minDurationSec * 1000);
    }

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [state.stepId, state.audioUnlocked, state.stepStatus]);

  useEffect(() => {
    if (state.phase === "NIGHT" && !state.stepId) {
      dispatch({ type: "START_STEP", stepId: "NIGHT_START" });
    }
  }, [state.phase, state.stepId]);

  const handleStartGame = () => {
    setCurrentTab("開局");
    dispatch({ type: "SET_PHASE", phase: "PRE_GAME_CONFIRM" });
  };

  const handleConfirmStart = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const unlockAudioFile: string | null = null;
    if (isPlayableAudio(unlockAudioFile)) {
      audioRef.current.src = unlockAudioFile as string;
      audioRef.current.play().catch(() => null);
    }
    dispatch({ type: "AUDIO_UNLOCKED" });
    dispatch({ type: "LOCK_RULES" });
    setState((prev) => startNewGame(prev));
  };

  const handleDealReveal = () => {
    setShowReveal(true);
  };

  const handleRevealConfirm = () => {
    const seat = state.seats[state.dealSeatIndex];
    dispatch({ type: "DEAL_REVEALED", seatNo: seat.seatNo });
    setShowReveal(false);
    if (state.dealSeatIndex + 1 >= state.playerCount) {
      dispatch({
        type: "ADD_LOG",
        entry: createLog(state.round, "DEAL_MODE", "派身份完成")
      });
      dispatch({ type: "START_STEP", stepId: "NIGHT_START" });
      dispatch({ type: "SET_PHASE", phase: "NIGHT" });
      dispatch({ type: "ADVANCE_DEAL" });
      return;
    }
    dispatch({ type: "ADVANCE_DEAL" });
  };

  const handleCommitStep = (payload: unknown) => {
    dispatch({ type: "COMMIT_INPUT", payload });
    dispatch({ type: "ADVANCE_STEP" });
  };

  const handlePause = () => {
    if (!audioRef.current) return;
    if (state.stepStatus === "paused") {
      audioRef.current.play().catch(() => null);
      dispatch({ type: "RESUME_STEP" });
    } else {
      audioRef.current.pause();
      dispatch({ type: "PAUSE_STEP" });
    }
  };

  const handleReplay = () => {
    if (!audioRef.current || !step) return;
    if (!isPlayableAudio(step.audioFile)) return;
    audioRef.current.src = step.audioFile as string;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => null);
  };

  const handleSkip = () => {
    dispatch({ type: "SKIP_STEP" });
    dispatch({ type: "ADVANCE_STEP" });
  };

  const handleExport = () => {
    const content = JSON.stringify(state.logs, null, 2);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "werewolf-log.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const currentSeat = state.seats[state.dealSeatIndex];
  const roleForCurrentSeat = state.rolesPool.find(
    (role) => role.id === currentSeat?.roleId
  );

  const renderContent = () => {
    if (state.phase === "DEAL_MODE" && currentSeat && !showReveal) {
      return (
        <DealPage
          seat={currentSeat}
          onNameChange={(name) =>
            dispatch({ type: "SET_SEAT_NAME", seatNo: currentSeat.seatNo, name })
          }
          onReveal={handleDealReveal}
        />
      );
    }

    if (state.phase === "DEAL_MODE" && currentSeat && showReveal) {
      return (
        <RoleRevealPage
          seat={currentSeat}
          role={roleForCurrentSeat}
          onConfirm={handleRevealConfirm}
        />
      );
    }

    if (currentTab === "開局") {
      return (
        <SetupPage
          playerCount={state.playerCount}
          roles={state.rolesPool}
          onPlayerCountChange={(next) =>
            dispatch({ type: "SET_PLAYER_COUNT", value: next })
          }
          onToggleRole={(roleId, enabled) =>
            dispatch({ type: "TOGGLE_ROLE", roleId, enabled })
          }
          onOpenRules={() => {
            setCurrentTab("規則");
            dispatch({ type: "SET_PHASE", phase: "SETUP_RULES" });
          }}
        />
      );
    }

    if (currentTab === "規則") {
      return (
        <RulesPage
          rules={state.rules}
          locked={state.rulesLocked}
          onToggleRule={(key, value) =>
            dispatch({ type: "SET_RULE", key, value })
          }
          onStartGame={handleStartGame}
        />
      );
    }

    return <LogPage logs={state.logs} onExport={handleExport} />;
  };

  const roleSummary = countByCamp(enabledRoles);
  const godIds = new Set(["seer", "witch", "hunter"]);
  const godCount = enabledRoles.filter((role) => godIds.has(role.id)).length;
  const villagerCount = enabledRoles.filter((role) => role.id === "villager").length;

  return (
    <div className="app">
      {renderContent()}

      {state.phase === "PRE_GAME_CONFIRM" ? (
        <div className="overlay">
          <div className="modal">
            <div className="card-title">{state.playerCount} 人場</div>
            <div className="section-grid">
              <div>
                神職/平民/狼人/第三：{godCount}/{villagerCount}/{roleSummary.wolf}/
                {roleSummary.third}
              </div>
              <div className="small">模式：屠邊模式 / 技能判斷</div>
            </div>
            <div className="control-row" style={{ marginTop: "16px" }}>
              <button
                className="secondary-button"
                type="button"
                onClick={() => dispatch({ type: "SET_PHASE", phase: "SETUP_RULES" })}
              >
                返回
              </button>
              <button className="primary-button" type="button" onClick={handleConfirmStart}>
                正式開始遊戲
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {step ? (
        <ConsoleOverlay
          state={state}
          step={step}
          onCommit={handleCommitStep}
          onPause={handlePause}
          onReplay={handleReplay}
          onSkip={handleSkip}
        />
      ) : null}

      {state.phase !== "DEAL_MODE" ? (
        <div className="tab-bar">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`tab-button ${currentTab === tab ? "active" : ""}`}
              onClick={() => {
                setCurrentTab(tab);
                if (tab === "開局") {
                  dispatch({ type: "SET_PHASE", phase: "SETUP_ROLE_POOL" });
                }
                if (tab === "規則") {
                  dispatch({ type: "SET_PHASE", phase: "SETUP_RULES" });
                }
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};
