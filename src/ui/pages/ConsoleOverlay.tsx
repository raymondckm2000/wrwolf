import { useEffect, useState } from "react";
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
  const [witchSave, setWitchSave] = useState(false);
  const [witchPoison, setWitchPoison] = useState<number | null>(null);
  const [witchPoisonEnabled, setWitchPoisonEnabled] = useState(false);

  const handleCommit = () => {
    if (step.id === "WITCH_STEP") {
      onCommit({ save: witchSave, poisonTarget: witchPoison });
      setSelectedSeat(null);
      setWitchSave(false);
      setWitchPoison(null);
      setWitchPoisonEnabled(false);
      return;
    }
    if (step.id === "HUNTER_RESOLVE") {
      if (!state.rules.hunterMaySkipOnDeath && selectedSeat === null) {
        return;
      }
      onCommit(selectedSeat);
      setSelectedSeat(null);
      return;
    }
    if (step.input?.allowNone === false && selectedSeat === null) {
      return;
    }
    onCommit(selectedSeat);
    setSelectedSeat(null);
  };

  const witchSeat = state.seats.find((seat) => seat.roleId === "witch");
  const wolfTarget = state.runtime.night.wolfTarget;
  const isSelfSaveBlocked =
    state.rules.witchFirstNightNoSelfSave &&
    state.round === 1 &&
    wolfTarget &&
    witchSeat?.seatNo === wolfTarget;
  const canUseAntidote = state.runtime.resources.witch.antidoteAvailable && !isSelfSaveBlocked;
  const canUsePoison = state.runtime.resources.witch.poisonAvailable;
  const disablePoison = state.rules.witchNoDoublePotionSameNight && witchSave;

  useEffect(() => {
    setSelectedSeat(null);
    setWitchSave(false);
    setWitchPoison(null);
    setWitchPoisonEnabled(false);
  }, [step.id]);

  useEffect(() => {
    if (!canUsePoison || disablePoison) {
      setWitchPoisonEnabled(false);
      setWitchPoison(null);
    }
  }, [canUsePoison, disablePoison]);

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
        {step.input?.kind === "witchAction" ? (
          <div className="card">
            <div className="card-title">{step.input.promptZh}</div>
            <div className="small" style={{ marginBottom: "12px" }}>
              昨夜被殺：{wolfTarget ?? "無"}
            </div>
            <div className="control-row">
              <button
                className={`secondary-button ${witchSave ? "active" : ""}`}
                type="button"
                onClick={() => setWitchSave((prev) => !prev)}
                disabled={!canUseAntidote}
              >
                使用解藥
              </button>
              <button
                className={`secondary-button ${witchPoisonEnabled ? "active" : ""}`}
                type="button"
                onClick={() => {
                  setWitchPoisonEnabled((prev) => !prev);
                  if (witchPoisonEnabled) {
                    setWitchPoison(null);
                    setSelectedSeat(null);
                  }
                }}
                disabled={!canUsePoison || disablePoison}
              >
                使用毒藥
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={() => {
                  setWitchSave(false);
                  setWitchPoison(null);
                  setWitchPoisonEnabled(false);
                }}
              >
                不使用
              </button>
            </div>
            <SeatGrid
              seats={state.seats}
              selected={selectedSeat}
              allowNone
              onSelect={(seatNo) => {
                setSelectedSeat(seatNo);
                if (seatNo && witchPoisonEnabled) {
                  setWitchPoison(seatNo);
                } else {
                  setWitchPoison(null);
                }
              }}
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
        {step.input?.kind === "hunterShot" ? (
          <div className="card">
            <div className="card-title">{step.input.promptZh}</div>
            <SeatGrid
              seats={state.seats}
              selected={selectedSeat}
              allowNone={state.rules.hunterMaySkipOnDeath}
              onSelect={(seatNo) => setSelectedSeat(seatNo)}
            />
            <div style={{ marginTop: "12px" }}>
              <button className="primary-button" type="button" onClick={handleCommit}>
                確認
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};
