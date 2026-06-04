import { useEffect, useMemo, useState } from "react";
import { socket } from "../socket";
import type { RoomState, RoundStart } from "../types";
import StreetView from "./StreetView";
import GuessMap from "./GuessMap";

interface Props {
  room: RoomState;
  you: string;
  isHost: boolean;
  roundStart: RoundStart | null;
  error: string | null;
  onLeave: () => void;
}

function useCountdown(deadline: number | null) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!deadline) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [deadline]);
  if (!deadline) return null;
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}

export default function Game({ room, you, isHost, roundStart, error, onLeave }: Props) {
  const [pick, setPick] = useState<{ lat: number; lng: number } | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Reseta a cada nova rodada.
  useEffect(() => {
    setPick(null);
    setSubmitted(false);
  }, [room.round, roundStart?.imageId]);

  const secondsLeft = useCountdown(room.status === "playing" ? room.deadline : null);

  const submit = () => {
    if (!pick || submitted) return;
    socket.emit("submit_guess", { lat: pick.lat, lng: pick.lng });
    setSubmitted(true);
  };

  if (error) {
    return (
      <div className="center-screen">
        <div className="card">
          <h2>Ops…</h2>
          <p className="error-line">{error}</p>
          <button className="btn" onClick={onLeave}>Voltar ao início</button>
        </div>
      </div>
    );
  }

  // ---------- TELA FINAL ----------
  if (room.status === "over") {
    const podium = [...room.players].sort((a, b) => b.score - a.score);
    return (
      <div className="center-screen">
        <div className="card over-card">
          <h2>🏁 Fim de jogo!</h2>
          <div className="podium">
            {podium.slice(0, 3).map((p, i) => (
              <div key={p.id} className={`podium-spot p${i}`}>
                <div className="medal">{["🥇", "🥈", "🥉"][i]}</div>
                <div className="pname">{p.name}</div>
                <div className="pscore">{p.score}</div>
              </div>
            ))}
          </div>
          <div className="final-list">
            {podium.map((p, i) => (
              <div key={p.id} className={`player-row ${p.id === you ? "me" : ""}`}>
                <span className="rank">{i + 1}</span>
                <span className="pname">{p.name}</span>
                <span className="pts">{p.score}</span>
              </div>
            ))}
          </div>
          <div className="row-actions">
            {isHost && (
              <button className="btn btn-primary" onClick={() => socket.emit("play_again")}>
                Jogar de novo
              </button>
            )}
            <button className="btn btn-ghost" onClick={onLeave}>Sair</button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- REVELAÇÃO ----------
  if (room.status === "reveal") {
    const results = room.results ?? [];
    return (
      <div className="reveal-screen">
        <div className="reveal-map">
          <GuessMap
            interactive={false}
            pick={null}
            onPick={() => {}}
            reveal={room.actual ? { actual: room.actual, results, you } : null}
          />
        </div>
        <div className="reveal-panel card">
          <h3>Rodada {room.round} / {room.totalRounds}</h3>
          {room.actual && <p className="region">📍 {room.actual.region}</p>}
          <div className="result-list">
            {results.map((r) => (
              <div key={r.id} className={`result-row ${r.id === you ? "me" : ""}`}>
                <span className="pname">{r.name}</span>
                <span className="dist">
                  {r.guess ? formatDist(r.distanceKm!) : "sem palpite"}
                </span>
                <span className="pts">+{r.points}</span>
              </div>
            ))}
          </div>
          {isHost ? (
            <button className="btn btn-primary big" onClick={() => socket.emit("next_round")}>
              {room.round >= room.totalRounds ? "Ver resultado final" : "Próxima rodada ▶"}
            </button>
          ) : (
            <p className="status-line">Aguardando o host continuar…</p>
          )}
        </div>
      </div>
    );
  }

  // ---------- JOGANDO ----------
  const danger = secondsLeft !== null && secondsLeft <= 10;
  return (
    <div className="play-screen">
      {roundStart && <StreetView imageId={roundStart.imageId} token={roundStart.token} />}

      <div className="hud-top">
        <div className="hud-pill">Rodada {room.round}/{room.totalRounds}</div>
        {secondsLeft !== null && (
          <div className={`hud-pill timer ${danger ? "danger" : ""}`}>⏱ {secondsLeft}s</div>
        )}
        <button className="hud-pill leave" onClick={onLeave}>Sair</button>
      </div>

      <Scoreboard room={room} you={you} />

      {submitted ? (
        <div className="submitted-banner">
          ✅ Palpite enviado! Aguardando os outros jogadores…
        </div>
      ) : (
        <div className="map-panel">
          <div className="map-wrap">
            <GuessMap interactive={true} pick={pick} onPick={(lat, lng) => setPick({ lat, lng })} reveal={null} onConfirm={submit} />
          </div>
          <div className="map-controls">
            <button className="btn btn-primary" disabled={!pick} onClick={submit}>
              {pick ? "Cravar palpite" : "Clique no mapa"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Scoreboard({ room, you }: { room: RoomState; you: string }) {
  const players = useMemo(
    () => [...room.players].sort((a, b) => b.score - a.score),
    [room.players]
  );
  return (
    <div className="scoreboard card">
      <h4>Placar</h4>
      {players.map((p) => (
        <div key={p.id} className={`sb-row ${p.id === you ? "me" : ""}`}>
          <span className={`tick ${p.hasGuessed ? "done" : ""}`}>{p.hasGuessed ? "✓" : "•"}</span>
          <span className="pname">{p.name}</span>
          <span className="pts">{p.score}</span>
        </div>
      ))}
    </div>
  );
}

function formatDist(km: number) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 100) return `${km.toFixed(1)} km`;
  return `${Math.round(km).toLocaleString("pt-BR")} km`;
}
