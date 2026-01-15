import { Role } from "../../engine/types";
import { RoleTile } from "../../components/RoleTile";

type SetupPageProps = {
  playerCount: number;
  roles: Role[];
  totalSelected: number;
  wolvesCount: number;
  canStart: boolean;
  startBlockReason: string;
  onPlayerCountChange: (next: number) => void;
  onToggleRole: (roleId: string, enabled: boolean) => void;
  onOpenRules: () => void;
};

const renderRoleSection = (
  title: string,
  roles: Role[],
  onToggleRole: (roleId: string, enabled: boolean) => void
) => (
  <div className="card">
    <div className="card-title">
      {title}{" "}
      <span className="badge">
        {roles.filter((r) => r.enabled).reduce((sum, role) => sum + role.count, 0)}
      </span>
    </div>
    <div className="role-grid">
      {roles.map((role) => (
        <RoleTile
          key={role.id}
          role={role}
          onToggle={(enabled) => onToggleRole(role.id, enabled)}
        />
      ))}
    </div>
  </div>
);

export const SetupPage = ({
  playerCount,
  roles,
  totalSelected,
  wolvesCount,
  canStart,
  startBlockReason,
  onPlayerCountChange,
  onToggleRole,
  onOpenRules
}: SetupPageProps) => {
  const goodRoles = roles.filter((role) => role.camp === "good");
  const wolfRoles = roles.filter((role) => role.camp === "wolf");
  const thirdRoles = roles.filter((role) => role.camp === "third");

  return (
    <div className="page">
      <div className="card">
        <div className="card-title">玩家人數</div>
        <div className="control-row">
          <button
            className="secondary-button"
            type="button"
            onClick={() => onPlayerCountChange(playerCount - 1)}
          >
            -
          </button>
          <div style={{ fontSize: "28px", fontWeight: 700 }}>{playerCount}</div>
          <button
            className="secondary-button"
            type="button"
            onClick={() => onPlayerCountChange(playerCount + 1)}
          >
            +
          </button>
        </div>
      </div>

      {renderRoleSection("正義聯盟-神職", goodRoles.slice(0, 3), onToggleRole)}
      {renderRoleSection("正義聯盟-平民", goodRoles.slice(3), onToggleRole)}
      {renderRoleSection("邪惡聯盟-狼人", wolfRoles, onToggleRole)}
      {renderRoleSection("第三陣營", thirdRoles, onToggleRole)}

      <button className="primary-button" type="button" onClick={onOpenRules}>
        變化規則
      </button>

      <div className="small" style={{ marginTop: "12px" }}>
        診斷：playerCount={playerCount}，totalSelected={totalSelected}，
        wolvesCount={wolvesCount}，canStart={String(canStart)}，reason=
        {startBlockReason}
      </div>
    </div>
  );
};
