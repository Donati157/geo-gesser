import { useEffect, useRef, useState } from "react";
import { Viewer, NavigationDirection } from "mapillary-js";

interface Props {
  imageId: string;
  token: string;
}

function webglAvailable(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl") || c.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

// Visualizador de rua do Mapillary (WebGL via mapillary-js).
// Setas de navegação SEMPRE visíveis (andar pra frente/trás). Se o WebGL cair,
// troca automaticamente (e silenciosamente) para a foto estática do local.
export default function StreetView({ imageId, token }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const imageIdRef = useRef(imageId);
  const recoverRef = useRef(0);
  const watchdogRef = useRef<number | undefined>(undefined);
  const [gen, setGen] = useState(0);
  const [failed, setFailed] = useState(() => !webglAvailable());
  const [thumb, setThumb] = useState<string | null>(null);
  const [navMsg, setNavMsg] = useState<string | null>(null);

  imageIdRef.current = imageId;

  // Busca a foto estática (fallback) na maior resolução disponível.
  useEffect(() => {
    let active = true;
    setThumb(null);
    fetch(`https://graph.mapillary.com/${imageId}?fields=thumb_original_url,thumb_2048_url&access_token=${token}`)
      .then((r) => r.json())
      .then((d) => {
        const url = d?.thumb_original_url || d?.thumb_2048_url;
        if (active && url) setThumb(url);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [imageId, token]);

  // Cria (ou recria) o visualizador WebGL — só enquanto não tiver falhado.
  useEffect(() => {
    if (failed) return;
    const el = containerRef.current;
    if (!el) return;

    let viewer: Viewer;
    try {
      viewer = new Viewer({
        accessToken: token,
        container: el,
        imageId: imageIdRef.current,
        component: { cover: false },
      });
    } catch {
      setFailed(true);
      return;
    }
    viewerRef.current = viewer;

    // Watchdog: se a imagem não carregar em alguns segundos (id inválido,
    // tela preta, rede), cai para a foto estática em vez de ficar travado.
    const onImage = () => window.clearTimeout(watchdogRef.current);
    viewer.on("image", onImage);
    watchdogRef.current = window.setTimeout(() => setFailed(true), 9000);

    const canvas = el.querySelector("canvas");
    const onLost = (e: Event) => {
      e.preventDefault();
      if (recoverRef.current < 2) {
        recoverRef.current += 1;
        setGen((g) => g + 1);
      } else {
        setFailed(true);
      }
    };
    canvas?.addEventListener("webglcontextlost", onLost as EventListener);

    return () => {
      window.clearTimeout(watchdogRef.current);
      canvas?.removeEventListener("webglcontextlost", onLost as EventListener);
      try {
        viewer.off("image", onImage);
        viewer.remove();
      } catch {
        /* ignora */
      }
      viewerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, gen, failed]);

  // Move para a nova imagem quando a rodada troca.
  useEffect(() => {
    const viewer = viewerRef.current;
    if (failed || !viewer || !imageId) return;
    window.clearTimeout(watchdogRef.current);
    watchdogRef.current = window.setTimeout(() => setFailed(true), 9000);
    viewer.moveTo(imageId).catch(() => setFailed(true));
  }, [imageId, failed]);

  const move = (dir: NavigationDirection, msgFim: string) => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.moveDir(dir).catch(() => {
      setNavMsg(msgFim);
      setTimeout(() => setNavMsg(null), 1600);
    });
  };

  return (
    <div className="street-view" ref={containerRef}>
      {failed && thumb && <img className="street-fallback" src={thumb} alt="Local" />}
      {failed && !thumb && <div className="street-fallback-loading">Carregando foto…</div>}

      {!failed && (
        <div className="sv-nav">
          <button
            className="sv-nav-btn fwd"
            title="Andar pra frente"
            onClick={() => move(NavigationDirection.Next, "Fim da rua por aqui 🛑")}
          >
            ▲
          </button>
          <button
            className="sv-nav-btn"
            title="Andar pra trás"
            onClick={() => move(NavigationDirection.Prev, "Não dá pra voltar mais 🛑")}
          >
            ▼
          </button>
        </div>
      )}
      {navMsg && <div className="sv-nav-msg">{navMsg}</div>}
    </div>
  );
}
