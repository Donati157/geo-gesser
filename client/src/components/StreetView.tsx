import { useEffect, useRef, useState } from "react";
import { Viewer } from "mapillary-js";

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

// Visualizador de rua do Mapillary (WebGL via mapillary-js). Usa as setas
// beges nativas do Mapillary para andar pela rua. Se o WebGL cair, troca
// automaticamente (e silenciosamente) para a foto estática do local.
export default function StreetView({ imageId, token }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const imageIdRef = useRef(imageId);
  const recoverRef = useRef(0);
  const watchdogRef = useRef<number | undefined>(undefined);
  const [gen, setGen] = useState(0);
  const [failed, setFailed] = useState(() => !webglAvailable());
  const [thumb, setThumb] = useState<string | null>(null);

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
      // Sem imageId no construtor: a imagem é carregada via moveTo (abaixo),
      // assim a promise do moveTo reflete sucesso/falha de forma confiável.
      viewer = new Viewer({
        accessToken: token,
        container: el,
        component: { cover: false },
      });
    } catch {
      setFailed(true);
      return;
    }
    viewerRef.current = viewer;

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
        viewer.remove();
      } catch {
        /* ignora */
      }
      viewerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, gen, failed]);

  // Move para a imagem da rodada (inicial e nas trocas). Watchdog único: se o
  // moveTo não resolver em 12s (id inválido/tela preta/rede), cai pra foto.
  useEffect(() => {
    const viewer = viewerRef.current;
    if (failed || !viewer || !imageId) return;
    window.clearTimeout(watchdogRef.current);
    const wd = window.setTimeout(() => setFailed(true), 12000);
    watchdogRef.current = wd;
    viewer
      .moveTo(imageId)
      .then(() => window.clearTimeout(wd))
      .catch(() => {
        window.clearTimeout(wd);
        setFailed(true);
      });
  }, [imageId, failed]);

  return (
    <div className="street-view" ref={containerRef}>
      {failed && thumb && <img className="street-fallback" src={thumb} alt="Local" />}
      {failed && !thumb && <div className="street-fallback-loading">Carregando foto…</div>}
    </div>
  );
}
