import { useState } from "react";
import { socket } from "../socket";

interface Props {
  connected: boolean;
  setYou: (id: string) => void;
  onError: (msg: string | null) => void;
  error: string | null;
}

export default function Home({ connected, setYou, onError, error }: Props) {
  const [name, setName] = useState(localStorage.getItem("gg_name") || "");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const remember = () => localStorage.setItem("gg_name", name.trim());

  const create = () => {
    if (!name.trim()) return onError("Digite seu nome primeiro.");
    remember();
    setBusy(true);
    onError(null);
    socket.emit(
      "create_room",
      { name: name.trim(), settings: { rounds: 5, roundSeconds: 90 } },
      (res: any) => {
        setBusy(false);
        if (res?.ok) setYou(res.you);
        else onError(res?.error || "Erro ao criar sala.");
      }
    );
  };

  const join = () => {
    if (!name.trim()) return onError("Digite seu nome primeiro.");
    if (!code.trim()) return onError("Digite o código da sala.");
    remember();
    setBusy(true);
    onError(null);
    socket.emit(
      "join_room",
      { name: name.trim(), code: code.trim().toUpperCase() },
      (res: any) => {
        setBusy(false);
        if (res?.ok) setYou(res.you);
        else onError(res?.error || "Erro ao entrar na sala.");
      }
    );
  };

  return (
    <div className="home">
      <div className="home-hero">
        <h1 className="logo">
          🌍 Geo<span>Gesser</span>
        </h1>
        <p className="tagline">
          Largado em algum lugar do mundo. Explore a rua, leia as pistas e crave no
          mapa. Mais perto = mais pontos. <strong>Grátis, sem login, multiplayer.</strong>
        </p>
      </div>

      <div className="card home-card">
        <label className="field">
          <span>Seu nome</span>
          <input
            value={name}
            maxLength={20}
            placeholder="ex: Capitão Bússola"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && create()}
          />
        </label>

        <button className="btn btn-primary big" disabled={busy || !connected} onClick={create}>
          Criar sala
        </button>

        <div className="divider"><span>ou entre numa sala</span></div>

        <div className="join-row">
          <input
            className="code-input"
            value={code}
            maxLength={4}
            placeholder="CÓDIGO"
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && join()}
          />
          <button className="btn" disabled={busy || !connected} onClick={join}>
            Entrar
          </button>
        </div>

        {!connected && <p className="status-line">Conectando ao servidor…</p>}
        {error && <p className="error-line">{error}</p>}
      </div>

      <p className="footer-note">
        Imagens de rua via <a href="https://www.mapillary.com" target="_blank" rel="noreferrer">Mapillary</a>.
        Jogue com amigos: compartilhe o código da sala.
      </p>
    </div>
  );
}
