import { Role } from "../engine/types";

type RoleTileProps = {
  role: Role;
  onToggle: (enabled: boolean) => void;
};

export const RoleTile = ({ role, onToggle }: RoleTileProps) => {
  return (
    <button
      className="card"
      onClick={() => onToggle(!role.enabled)}
      type="button"
    >
      <div className="card-title">{role.nameZh}</div>
      <div className="small">{role.descriptionZh}</div>
      <div style={{ marginTop: "12px" }}>
        <span className="badge">{role.enabled ? "啟用" : "鎖定"}</span>
      </div>
    </button>
  );
};
