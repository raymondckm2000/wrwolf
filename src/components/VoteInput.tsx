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
  const [voteMatrix, setVoteMatrix] = useState<Record<number, number[]>>({});

  const toggleVoter = (seatNo: number) => {
    setVoters((prev) => ({ ...prev, [seatNo]: !prev[seatNo] }));
  };

  const addVotes = () => {
    if (!selectedTarget) return;
    const selectedVoters = Object.entries(voters)
      .filter(([, value]) => value)
      .map(([seatNo]) => Number(seatNo));
    setVoteMatrix((prev) => ({ ...prev, [selectedTarget]: selectedVoters }));
    setSelectedTarget(null);
    setVoters({});
  };

  const submitVotes = () => {
    if (!Object.keys(voteMatrix).length) return;
    onCommit(voteMatrix);
    setVoteMatrix({});
    setSelectedTarget(null);
    setVoters({});
  };

  const removeTarget = (targetSeat: number) => {
    setVoteMatrix((prev) => {
      const next = { ...prev };
      delete next[targetSeat];
      return next;
    });
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
          <button className="secondary-button" onClick={addVotes} type="button">
            加入此票型
          </button>
          <button className="primary-button" onClick={submitVotes} type="button">
            送出全部票型
          </button>
        </div>
        {Object.keys(voteMatrix).length ? (
          <div style={{ marginTop: "12px" }}>
            <div className="small">已輸入票型</div>
            {Object.entries(voteMatrix).map(([target, votersList]) => (
              <div className="log-item" key={target}>
                {target} 號：{votersList.join(", ") || "無"}
                <button
                  type="button"
                  className="secondary-button"
                  style={{ marginLeft: "8px" }}
                  onClick={() => removeTarget(Number(target))}
                >
                  移除
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};
