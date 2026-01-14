import { Seat } from "../engine/types";

type SeatGridProps = {
  seats: Seat[];
  selected?: number | null;
  allowNone?: boolean;
  onSelect: (seatNo: number | null) => void;
};

export const SeatGrid = ({
  seats,
  selected,
  allowNone,
  onSelect
}: SeatGridProps) => {
  return (
    <div className="seat-grid">
      {seats.map((seat) => (
        <button
          key={seat.seatNo}
          type="button"
          className={`seat-button ${selected === seat.seatNo ? "selected" : ""}`}
          onClick={() => onSelect(seat.seatNo)}
        >
          {seat.seatNo}
        </button>
      ))}
      {allowNone ? (
        <button
          type="button"
          className={`seat-button ${selected === null ? "selected" : ""}`}
          onClick={() => onSelect(null)}
        >
          不選
        </button>
      ) : null}
    </div>
  );
};
