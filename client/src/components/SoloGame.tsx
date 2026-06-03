import { useEffect, useState } from "react";
import StreetView from "./StreetView";
import GuessMap from "./GuessMap";
import { getRandomImage, mapillaryToken, type SoloImage } from "../mapillary";
import { haversineKm, scoreForDistance, formatDist } from "../scoring";

const TOTAL = 5;
type Phase = "loading" | "playing" | "reveal" | "over" | "error";

export default function SoloGame({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [round, setRound] = useState(0);
  const [image, setImage] = useState<SoloImage | null>(null);
  const [pick, setPick] = useState<{ lat: number; lng: number } | null>(null);
  const [score, setScore] = useState(0);
  const [last, setLast] = useState<{ distanceKm: number; points: number } | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const loadRound = async (n: number) => {
    setPhase("loading");
    setPick(null);
    setLast(null);
    setMapOpen(false);
    try {
      const img = await getRandomImage();
      setImage(img);
      setRound(n);
      setPhase("playing");
    } catch (e: any) {
      setErrMsg(e?.message || "Erro ao carregar imagem.");
      setPhase("error");
    }
  };

  useEffect(() => {
    loadRound(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = () => {
    if (!pick || !image) return;
    const distanceKm = haversineKm(pick, { lat: image.lat, lng: image.lng });
    const points = scoreForDistance(distanceKm);
    setScore((s) => s + points);
    setLast({ distanceKm, points });
    setPhase("reveal");
  };

  const next = () => {
    if (round >= TOTAL) setPhase("over");
    else loadRound(round + 1);
  };

  const restart = () => {
    setScore(0);
    loadRound(1);
  };

  // ---------- LOADING ----------
  if (phase === "loading") {
    return (
      <div className="center-screen">
        <div className="card" style={{ textAlign: "center" }}>
          <div className="spinner" />
          <h3>Procurando um lugar pelo mundo…</h3>
          <p className="status-line">Carregando imagem do Mapillary</p>
        </div>
      </div>
    );
  }

  // ---------- ERROR ----------
  if (phase === "error") {
    return (
      <div className="center-screen">
        <div className="card" style={{ textAlign: "center" }}>
          <h3>Ops…</h3>
          <p className="error-line">{errMsg}</p>
          <div className="row-actions">
            <button className="btn btn-primary" onClick={() => loadRound(round || 1)}>
              Tentar de novo
            </button>
            <button className="btn btn-ghost" onClick={onExit}>Sair</button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- OVER ----------
  if (phase === "over") {
    const max = TOTAL * 5000;
    const pct = Math.round((score / max) * 100);
    return (
      <div className="center-screen">
        <div className="card over-card">
          <h2>🏁 Fim de jogo!</h2>
          <div className="solo-final">
            <div className="big-score">{score.toLocaleString("pt-BR")}</div>
            <div className="big-score-sub">de {max.toLocaleString("pt-BR")} pontos · {pct}%</div>
          </div>
          <p className="status-line">
            {pct >= 80 ? "🌍 Mestre da geografia!" : pct >= 50 ? "👏 Mandou bem!" : "🧭 Continue explorando!"}
          </p>
          <div className="row-actions">
            <button className="btn btn-primary" onClick={restart}>Jogar de novo</button>
            <button className="btn btn-ghost" onClick={onExit}>Voltar ao início</button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- REVEAL ----------
  if (phase === "reveal" && image && last && pick) {
    const results = [
      { id: "you", name: "Você", guess: pick, distanceKm: last.distanceKm, points: last.points, score },
    ];
    return (
      <div className="reveal-screen">
        <div className="reveal-map">
          <GuessMap
            interactive={false}
            pick={null}
            onPick={() => {}}
            reveal={{ actual: { lat: image.lat, lng: image.lng }, results, you: "you" }}
          />
        </div>
        <div className="reveal-panel card">
          <h3>Rodada {round} / {TOTAL}</h3>
          <p className="region">📍 {image.region}</p>
          <div className="solo-reveal-stats">
            <div className="stat">
              <span className="stat-label">Distância</span>
              <span className="stat-val">{formatDist(last.distanceKm)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Pontos</span>
              <span className="stat-val good">+{last.points}</span>
            </div>
          </div>
          <div className="result-row me" style={{ marginTop: "auto" }}>
            <span className="pname">Total</span>
            <span className="pts">{score}</span>
          </div>
          <button className="btn btn-primary big" onClick={next}>
            {round >= TOTAL ? "Ver resultado final" : "Próxima rodada ▶"}
          </button>
        </div>
      </div>
    );
  }

  // ---------- PLAYING ----------
  return (
    <div className="play-screen">
      {image && <StreetView imageId={image.imageId} token={mapillaryToken()} />}

      <div className="hud-top">
        <div className="hud-pill">Solo · Rodada {round}/{TOTAL}</div>
        <div className="hud-pill timer">{score} pts</div>
        <button className="hud-pill leave" onClick={onExit}>Sair</button>
      </div>

      <div className={`map-panel ${mapOpen ? "open" : ""}`}>
        <div className="map-wrap">
          <GuessMap interactive={true} pick={pick} onPick={(lat, lng) => setPick({ lat, lng })} reveal={null} />
        </div>
        <div className="map-controls">
          <button className="btn btn-ghost small" onClick={() => setMapOpen((o) => !o)}>
            {mapOpen ? "Esconder mapa" : "🗺 Abrir mapa"}
          </button>
          <button className="btn btn-primary" disabled={!pick} onClick={submit}>
            {pick ? "Cravar palpite" : "Clique no mapa"}
          </button>
        </div>
      </div>
    </div>
  );
}
