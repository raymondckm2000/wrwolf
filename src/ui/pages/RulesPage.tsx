import { Rules } from "../../engine/types";
import { rulesDescriptions } from "../../engine/rules";
import { RuleToggle } from "../../components/RuleToggle";

type RulesPageProps = {
  rules: Rules;
  locked: boolean;
  onToggleRule: (key: keyof Rules, value: boolean) => void;
  onStartGame: () => void;
};

export const RulesPage = ({
  rules,
  locked,
  onToggleRule,
  onStartGame
}: RulesPageProps) => {
  return (
    <div className="page">
      {Object.entries(rules).map(([key, value]) => (
        <RuleToggle
          key={key}
          label={rulesDescriptions[key as keyof Rules]}
          description={key}
          value={value}
          disabled={locked}
          onChange={(next) => onToggleRule(key as keyof Rules, next)}
        />
      ))}

      <button className="primary-button" type="button" onClick={onStartGame}>
        開始遊戲
      </button>
    </div>
  );
};
