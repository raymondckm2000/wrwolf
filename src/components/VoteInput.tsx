import { useMemo, useState } from "react";
import { Seat } from "../engine/types";

type VoteInputProps = {
  seats: Seat[];
  onCommit: (votes: Record<number, number[]>) => void;
};

export const VoteInput = ({ seats, onCommit }: VoteInputProps) => {
  const aliveSeats = useMemo(() => seats.filter((seat) => seat.alive), [seats]);
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [voters, setVoters] = useState<Record<number, boolean>>({});

  const toggleVoter = (seatNo: number) => {
    setVoters((prev) => ({ ...prev, [seatNo]: !prev[seatNo] }));
  };

  const submitVotes = () => {
    if (!selectedTarget) return;
    const selectedVoters = Object.entries(voters)
      .filter(([, value]) => value)
      .map(([seatNo]) => Number(seatNo));
    onCommit({ [selectedTarget]: selectedVoters });
    setSelectedTarget(null);
    setVoters({});
  };

  return (
    <div className="vote-grid">
      <div className="vote-card">
        <div className="card-title">選擇被投者</div>
        <div className="seat-grid">
          {aliveSeats.map((seat) => (
            <button
              key={seat.seatNo}
              type="button"
              className={`seat-button ${
                selectedTarget === seat.seatNo ? "selected" : ""
              }`}
              onClick={() => setSelectedTarget(seat.seatNo)}
            >
              {seat.seatNo}
            </button>
          ))}
        </div>
      </div>
      <div className="vote-card">
        <div className="card-title">哪些人投他</div>
        <div className="seat-grid">
          {aliveSeats.map((seat) => (
            <button
              key={seat.seatNo}
              type="button"
              className={`seat-button ${voters[seat.seatNo] ? "selected" : ""}`}
              onClick={() => toggleVoter(seat.seatNo)}
            >
              {seat.seatNo}
            </button>
          ))}
        </div>
        <div style={{ marginTop: "12px" }}>
          <button className="primary-button" onClick={submitVotes} type="button">
            確認票型
          </button>
        </div>
      </div>
    </div>
  );
};
