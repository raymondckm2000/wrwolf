import { LogEntry } from "../../engine/types";

type LogPageProps = {
  logs: LogEntry[];
  onExport: () => void;
};

export const LogPage = ({ logs, onExport }: LogPageProps) => {
  const grouped = logs.reduce<Record<number, LogEntry[]>>((acc, entry) => {
    acc[entry.round] = acc[entry.round] ?? [];
    acc[entry.round].push(entry);
    return acc;
  }, {});

  const rounds = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="page">
      <button className="primary-button" type="button" onClick={onExport}>
        匯出 JSON
      </button>
      {rounds.map((round) => (
        <div className="card" key={round}>
          <div className="card-title">第 {round} 回合</div>
          {grouped[round].map((entry) => (
            <div className="log-item" key={entry.id}>
              {entry.messageZh}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
