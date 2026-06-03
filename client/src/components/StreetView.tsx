import { useEffect, useRef, useState } from "react";
import { Viewer } from "mapillary-js";

interface Props {
  imageId: string;
  token: string;
}

// Detecta se o navegador consegue criar um contexto WebGL.
function webglAvailable(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl") || c.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

// Visualizador de rua do Mapillary (WebGL via mapillary-js).
// Se o WebGL não estiver disponível ou o contexto cair (ex: muitas abas, GPU
// sob pressão), cai para uma FOTO ESTÁTICA do local — assim o jogo nunca trava
// numa tela preta e sempre dá pra adivinhar.
export default function StreetView({ imageId, token }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const imageIdRef = useRef(imageId);
  const recoverRef = useRef(0); // quantas vezes já tentou recuperar (persiste entre recriações)
  const [gen, setGen] = useState(0);
  const [failed, setFailed] = useState(() => !webglAvailable());
  const [thumb, setThumb] = useState<string | null>(null);

  imageIdRef.current = imageId;

  // Busca a foto estática (fallback) para a imagem atual.
  useEffect(() => {
    let active = true;
    setThumb(null);
    fetch(`https://graph.mapillary.com/${imageId}?fields=thumb_2048_url&access_token=${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (active && d?.thumb_2048_url) setThumb(d.thumb_2048_url);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [imageId, token]);

  // Cria (ou recria) o visualizador WebGL — só se não tiver falhado.
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

    const canvas = el.querySelector("canvas");
    const onLost = (e: Event) => {
      e.preventDefault();
      // Tenta recriar até 2 vezes; se continuar perdendo, cai pro fallback estático.
      if (recoverRef.current < 2) {
        recoverRef.current += 1;
        setGen((g) => g + 1);
      } else {
        setFailed(true);
      }
    };
    canvas?.addEventListener("webglcontextlost", onLost as EventListener);

    return () => {
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

  // Move para a nova imagem quando a rodada troca.
  useEffect(() => {
    const viewer = viewerRef.current;
    if (failed || !viewer || !imageId) return;
    viewer.moveTo(imageId).catch(() => {});
  }, [imageId, failed]);

  return (
    <div className="street-view" ref={containerRef}>
      {failed && thumb && <img className="street-fallback" src={thumb} alt="Local" />}
      {failed && !thumb && (
        <div className="street-fallback-loading">Carregando imagem…</div>
      )}
    </div>
  );
}
