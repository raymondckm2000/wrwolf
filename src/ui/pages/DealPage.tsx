import { Seat } from "../../engine/types";

type DealPageProps = {
  seat: Seat;
  onNameChange: (name: string) => void;
  onReveal: () => void;
};

export const DealPage = ({ seat, onNameChange, onReveal }: DealPageProps) => {
  return (
    <div className="fullscreen">
      <div>
        <h1>{seat.seatNo} 號玩家</h1>
        <div className="input-row">
          <label htmlFor="seat-name">如何稱呼你？</label>
          <input
            id="seat-name"
            value={seat.name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="輸入暱稱"
          />
        </div>
      </div>
      <div className="big-card">
        <button className="primary-button" type="button" onClick={onReveal}>
          查看身份
        </button>
      </div>
      <div className="small">請將手機交給玩家查看身份</div>
    </div>
  );
};
