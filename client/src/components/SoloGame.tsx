import { useEffect, useState } from "react";
import StreetView from "./StreetView";
import GuessMap from "./GuessMap";
import { getRandomImage, mapillaryToken, type SoloImage } from "../mapillary";
import { haversineKm, scoreForDistance, formatDist, proximity, STREAK_KM, MAX_SCORE } from "../scoring";
import { loadRecord, updateRecord, type Record } from "../record";

const TOTAL = 5;
type Phase = "loading" | "playing" | "reveal" | "over" | "error";

interface LastResult {
  distanceKm: number;
  points: number;
  streak: number;
  gained: boolean;
}

export default function SoloGame({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [round, setRound] = useState(0);
  const [image, setImage] = useState<SoloImage | null>(null);
  const [pick, setPick] = useState<{ lat: number; lng: number } | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [last, setLast] = useState<LastResult | null>(null);
  const [nextImg, setNextImg] = useState<SoloImage | null>(null); // pré-carregada
  const [mapOpen, setMapOpen] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [record] = useState<Record>(() => loadRecord());
  const [result, setResult] = useState<{ record: Record; beatScore: boolean; beatStreak: boolean } | null>(null);

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

  // Pré-carrega a próxima imagem durante a revelação -> próxima rodada instantânea.
  useEffect(() => {
    if (phase !== "reveal" || round >= TOTAL || nextImg) return;
    let active = true;
    getRandomImage()
      .then((img) => {
        if (active) setNextImg(img);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [phase, round, nextImg]);

  const submit = () => {
    if (!pick || !image) return;
    const distanceKm = haversineKm(pick, { lat: image.lat, lng: image.lng });
    const points = scoreForDistance(distanceKm);
    const kept = distanceKm < STREAK_KM;
    const newStreak = kept ? streak + 1 : 0;
    setScore((s) => s + points);
    setStreak(newStreak);
    setMaxStreak((m) => Math.max(m, newStreak));
    setLast({ distanceKm, points, streak: newStreak, gained: kept });
    setPhase("reveal");
  };

  const next = () => {
    if (round >= TOTAL) {
      setResult(updateRecord(score, maxStreak));
      setPhase("over");
      return;
    }
    if (nextImg) {
      // Já pré-carregada: troca instantânea, sem tela de loading.
      setImage(nextImg);
      setNextImg(null);
      setRound((r) => r + 1);
      setPick(null);
      setLast(null);
      setMapOpen(false);
      setPhase("playing");
    } else {
      loadRound(round + 1);
    }
  };

  const restart = () => {
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setResult(null);
    setNextImg(null);
    loadRound(1);
  };

  const prox = last ? proximity(last.distanceKm) : null;
  const max = TOTAL * MAX_SCORE;
  const finalPct = Math.round((score / max) * 100);

  // O StreetView fica SEMPRE montado durante o jogo (um único contexto WebGL).
  // As outras telas (loading/reveal/over) são sobrepostas por cima.
  return (
    <div className="play-screen">
      {image && phase !== "over" && phase !== "error" && (
        <StreetView imageId={image.imageId} token={mapillaryToken()} />
      )}

      {/* ----- JOGANDO ----- */}
      {phase === "playing" && (
        <>
          <div className="hud-top">
            <div className="hud-pill">Solo · Rodada {round}/{TOTAL}</div>
            {streak >= 2 && <div className="hud-pill fire-pill">🔥 {streak}</div>}
            <div className="hud-pill timer">{score} pts</div>
            <button className="hud-pill leave" onClick={onExit}>Sair</button>
          </div>

          {record.score > 0 && (
            <div className="record-chip">🏆 Recorde: {record.score.toLocaleString("pt-BR")}</div>
          )}

          <div className={`map-panel ${mapOpen ? "open" : ""}`}>
            <div className="map-wrap">
              <GuessMap interactive={true} pick={pick} onPick={(lat, lng) => setPick({ lat, lng })} reveal={null} onConfirm={submit} />
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
        </>
      )}

      {/* ----- LOADING (overlay) ----- */}
      {phase === "loading" && (
        <div className="overlay">
          <div className="card" style={{ textAlign: "center" }}>
            <div className="spinner" />
            <h3>Procurando um lugar pelo mundo…</h3>
            <p className="status-line">Carregando imagem do Mapillary</p>
          </div>
        </div>
      )}

      {/* ----- ERRO (overlay) ----- */}
      {phase === "error" && (
        <div className="overlay">
          <div className="card" style={{ textAlign: "center" }}>
            <h3>Ops…</h3>
            <p className="error-line">{errMsg}</p>
            <div className="row-actions">
              <button className="btn btn-primary" onClick={() => loadRound(round || 1)}>Tentar de novo</button>
              <button className="btn btn-ghost" onClick={onExit}>Sair</button>
            </div>
          </div>
        </div>
      )}

      {/* ----- REVELAÇÃO (overlay) ----- */}
      {phase === "reveal" && image && last && pick && prox && (
        <div className="reveal-screen">
          <div className="reveal-map">
            <GuessMap
              interactive={false}
              pick={null}
              onPick={() => {}}
              reveal={{ actual: { lat: image.lat, lng: image.lng }, results: [
                { id: "you", name: "Você", guess: pick, distanceKm: last.distanceKm, points: last.points, score },
              ], you: "you" }}
            />
          </div>
          <div className="reveal-panel card">
            <h3>Rodada {round} / {TOTAL}</h3>
            <p className="region">📍 {image.region}</p>

            <div className={`prox prox-${prox.cls}`}>
              <div className="prox-head">
                <span className="prox-emoji">{prox.emoji}</span>
                <span className="prox-label">{prox.label}</span>
                <span className="prox-pct">{prox.pct}%</span>
              </div>
              <div className="prox-bar"><div className="prox-fill" style={{ width: `${prox.pct}%` }} /></div>
            </div>

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

            {last.gained ? (
              last.streak >= 2 && (
                <div className="streak-banner">
                  <span className="fire">🔥</span>
                  <span>Streak {last.streak}! {last.streak >= 4 ? "Tá pegando fogo!" : "Mandou bem!"}</span>
                </div>
              )
            ) : (
              <div className="streak-banner lost">💨 Streak perdido (ficou a mais de {STREAK_KM} km)</div>
            )}

            <div className="result-row me" style={{ marginTop: "auto" }}>
              <span className="pname">Total</span>
              <span className="pts">{score}</span>
            </div>
            <button className="btn btn-primary big" onClick={next}>
              {round >= TOTAL ? "Ver resultado final" : "Próxima rodada ▶"}
            </button>
          </div>
        </div>
      )}

      {/* ----- FIM (overlay) ----- */}
      {phase === "over" && (
        <div className="overlay">
          <div className="card over-card">
            <h2>🏁 Fim de jogo!</h2>
            <div className="solo-final">
              <div className="big-score">{score.toLocaleString("pt-BR")}</div>
              <div className="big-score-sub">de {max.toLocaleString("pt-BR")} pontos · {finalPct}%</div>
            </div>

            {result?.beatScore && <div className="record-banner">🏆 Novo recorde de pontos!</div>}
            {result?.beatStreak && maxStreak >= 2 && (
              <div className="record-banner streak">🔥 Novo recorde de streak: {maxStreak}!</div>
            )}

            <div className="record-row">
              <div className="rec">
                <span className="rec-label">🏆 Recorde de pontos</span>
                <span className="rec-val">{(result?.record.score ?? record.score).toLocaleString("pt-BR")}</span>
              </div>
              <div className="rec">
                <span className="rec-label">🔥 Melhor streak</span>
                <span className="rec-val">{result?.record.streak ?? record.streak}</span>
              </div>
            </div>

            <div className="row-actions">
              <button className="btn btn-primary" onClick={restart}>Jogar de novo</button>
              <button className="btn btn-ghost" onClick={onExit}>Voltar ao início</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
