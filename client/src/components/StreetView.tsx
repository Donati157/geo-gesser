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

// Visualizador de rua do Mapillary (WebGL via mapillary-js).
// Se o WebGL falhar/cair, OU se o jogador pedir, mostra a FOTO ESTÁTICA do
// local — assim o jogo nunca trava numa tela preta e sempre dá pra adivinhar.
export default function StreetView({ imageId, token }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const imageIdRef = useRef(imageId);
  const recoverRef = useRef(0);
  const [gen, setGen] = useState(0);
  const [failed, setFailed] = useState(() => !webglAvailable()); // WebGL indisponível/perdido
  const [userStatic, setUserStatic] = useState(false); // jogador escolheu foto estática
  const [thumb, setThumb] = useState<string | null>(null);

  imageIdRef.current = imageId;
  const showStatic = failed || userStatic;

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

  // Cria (ou recria) o visualizador WebGL — só quando não estiver em modo foto.
  useEffect(() => {
    if (showStatic) return;
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
  }, [token, gen, showStatic]);

  // Move para a nova imagem quando a rodada troca.
  useEffect(() => {
    const viewer = viewerRef.current;
    if (showStatic || !viewer || !imageId) return;
    viewer.moveTo(imageId).catch(() => {});
  }, [imageId, showStatic]);

  const retry360 = () => {
    recoverRef.current = 0;
    setFailed(false);
    setUserStatic(false);
    setGen((g) => g + 1);
  };

  return (
    <div className="street-view" ref={containerRef}>
      {showStatic && thumb && <img className="street-fallback" src={thumb} alt="Local" />}
      {showStatic && !thumb && <div className="street-fallback-loading">Carregando foto…</div>}

      {!showStatic ? (
        <button
          className="sv-toggle"
          title="Se a imagem travar, troque para a foto estática"
          onClick={() => setUserStatic(true)}
        >
          🖼️ Travou? Ver foto
        </button>
      ) : (
        !failed && (
          <button className="sv-toggle" onClick={retry360}>
            ↻ Tentar 360°
          </button>
        )
      )}
    </div>
  );
}
