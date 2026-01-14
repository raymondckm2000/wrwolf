import { Rules } from "../engine/types";

type RuleToggleProps = {
  label: string;
  description: string;
  value: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
};

export const RuleToggle = ({
  label,
  description,
  value,
  disabled,
  onChange
}: RuleToggleProps) => {
  return (
    <div className="card">
      <button
        type="button"
        className="toggle-button"
        disabled={disabled}
        onClick={() => onChange(!value)}
      >
        <span>{label}</span>
        <span>{value ? "ON" : "OFF"}</span>
      </button>
      <div className="rule-description">{description}</div>
    </div>
  );
};
