import { socket } from "../socket";
import type { RoomState } from "../types";

interface Props {
  room: RoomState;
  you: string;
  isHost: boolean;
  onLeave: () => void;
}

export default function Lobby({ room, you, isHost, onLeave }: Props) {
  const setSettings = (patch: Partial<{ rounds: number; roundSeconds: number }>) => {
    socket.emit("update_settings", {
      settings: { rounds: room.totalRounds, roundSeconds: room.roundSeconds, ...patch },
    });
  };

  const copyCode = () => navigator.clipboard?.writeText(room.code);

  return (
    <div className="lobby">
      <div className="card lobby-card">
        <button className="btn btn-ghost back" onClick={onLeave}>← Sair</button>

        <h2>Sala de espera</h2>
        <div className="room-code" onClick={copyCode} title="Copiar código">
          <span className="label">Código</span>
          <span className="code">{room.code}</span>
          <span className="copy-hint">clique para copiar</span>
        </div>

        <div className="players-list">
          <h3>Jogadores ({room.players.length})</h3>
          {room.players.map((p) => (
            <div key={p.id} className={`player-row ${p.id === you ? "me" : ""}`}>
              <span className="dot" data-on={p.connected} />
              <span className="pname">{p.name}</span>
              {p.id === room.hostId && <span className="badge">host</span>}
              {p.id === you && <span className="badge you">você</span>}
            </div>
          ))}
        </div>

        <div className="settings">
          <h3>Configuração</h3>
          <div className="setting">
            <label>Rodadas</label>
            <div className="seg">
              {[3, 5, 10].map((n) => (
                <button
                  key={n}
                  className={room.totalRounds === n ? "on" : ""}
                  disabled={!isHost}
                  onClick={() => setSettings({ rounds: n })}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div className="setting">
            <label>Tempo por rodada</label>
            <div className="seg">
              {[30, 60, 90, 120].map((s) => (
                <button
                  key={s}
                  className={room.roundSeconds === s ? "on" : ""}
                  disabled={!isHost}
                  onClick={() => setSettings({ roundSeconds: s })}
                >
                  {s}s
                </button>
              ))}
            </div>
          </div>
        </div>

        {isHost ? (
          <button
            className="btn btn-primary big"
            onClick={() => socket.emit("start_game")}
          >
            Começar partida ▶
          </button>
        ) : (
          <p className="status-line">Aguardando o host iniciar a partida…</p>
        )}
      </div>
    </div>
  );
}
