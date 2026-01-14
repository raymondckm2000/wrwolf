import { useState } from "react";
import { SeatGrid } from "../../components/SeatGrid";
import { StepCard } from "../../components/StepCard";
import { VoteInput } from "../../components/VoteInput";
import { GameState, StepConfig } from "../../engine/types";

type ConsoleOverlayProps = {
  state: GameState;
  step: StepConfig;
  onCommit: (payload: unknown) => void;
  onPause: () => void;
  onReplay: () => void;
  onSkip: () => void;
};

export const ConsoleOverlay = ({
  state,
  step,
  onCommit,
  onPause,
  onReplay,
  onSkip
}: ConsoleOverlayProps) => {
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [witchAction, setWitchAction] = useState<"save" | "poison" | "none">("none");

  const handleCommit = () => {
    if (step.id === "WITCH_STEP") {
      onCommit({ action: witchAction, targetSeat: selectedSeat });
      setSelectedSeat(null);
      setWitchAction("none");
      return;
    }
    onCommit(selectedSeat);
    setSelectedSeat(null);
  };

  return (
    <>
      <StepCard
        step={step}
        status={state.stepStatus}
        onPause={onPause}
        onReplay={onReplay}
        onSkip={onSkip}
      />
      <div className="page" style={{ paddingTop: "120px" }}>
        {step.input?.kind === "selectSeat" ? (
          <div className="card">
            <div className="card-title">{step.input.promptZh}</div>
            {step.id === "WITCH_STEP" ? (
              <div className="small" style={{ marginBottom: "12px" }}>
                昨夜被殺：{state.pendingNightKill ?? "無"}
              </div>
            ) : null}
            {step.id === "WITCH_STEP" ? (
              <div className="control-row">
                <button
                  className={`secondary-button ${witchAction === "save" ? "active" : ""}`}
                  type="button"
                  onClick={() => setWitchAction("save")}
                >
                  使用解藥
                </button>
                <button
                  className={`secondary-button ${witchAction === "poison" ? "active" : ""}`}
                  type="button"
                  onClick={() => setWitchAction("poison")}
                >
                  使用毒藥
                </button>
                <button
                  className={`secondary-button ${witchAction === "none" ? "active" : ""}`}
                  type="button"
                  onClick={() => setWitchAction("none")}
                >
                  不使用
                </button>
              </div>
            ) : null}
            <SeatGrid
              seats={state.seats}
              selected={selectedSeat}
              allowNone={step.input.allowNone}
              onSelect={(seatNo) => setSelectedSeat(seatNo)}
            />
            <div style={{ marginTop: "12px" }}>
              <button className="primary-button" type="button" onClick={handleCommit}>
                確認
              </button>
            </div>
          </div>
        ) : null}
        {step.input?.kind === "voteMatrix" ? (
          <div className="card">
            <div className="card-title">{step.input.promptZh}</div>
            <VoteInput seats={state.seats} onCommit={onCommit} />
          </div>
        ) : null}
      </div>
    </>
  );
};
