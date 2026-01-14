import { Role, Seat } from "../../engine/types";

type RoleRevealPageProps = {
  seat: Seat;
  role: Role | undefined;
  onConfirm: () => void;
};

export const RoleRevealPage = ({ seat, role, onConfirm }: RoleRevealPageProps) => {
  return (
    <div className="fullscreen">
      <div>
        <div className="badge">{seat.seatNo} 號玩家</div>
        <h1>{role?.nameZh ?? "身份"}</h1>
        <div className="small">陣營：{role?.camp ?? ""}</div>
      </div>
      <div className="big-card">
        <div>
          <div>{role?.descriptionZh ?? ""}</div>
        </div>
      </div>
      <button className="primary-button" type="button" onClick={onConfirm}>
        確定
      </button>
    </div>
  );
};
