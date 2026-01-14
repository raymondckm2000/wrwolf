import { StepConfig } from "../engine/types";

type StepCardProps = {
  step: StepConfig;
  status: string;
  onPause: () => void;
  onReplay: () => void;
  onSkip: () => void;
};

export const StepCard = ({ step, status, onPause, onReplay, onSkip }: StepCardProps) => {
  return (
    <div className="step-card">
      <h3>{step.titleZh}</h3>
      <div className="small">{step.scriptZh}</div>
      {!step.audioFile ? <div className="small">[Audio Placeholder]</div> : null}
      <div className="control-row">
        <button className="secondary-button" onClick={onPause} type="button">
          {status === "paused" ? "繼續" : "暫停"}
        </button>
        <button className="secondary-button" onClick={onReplay} type="button">
          重播
        </button>
        <button className="secondary-button" onClick={onSkip} type="button">
          跳過
        </button>
      </div>
    </div>
  );
};
