import { useEffect, useRef, useState } from "react";
import { Viewer } from "mapillary-js";

interface Props {
  imageId: string;
  token: string;
}

// Visualizador de rua do Mapillary. Mantido montado o jogo todo (um único
// contexto WebGL) e movido com moveTo() a cada rodada. Se o contexto WebGL
// cair (limite do navegador / GPU), recria o visualizador automaticamente.
export default function StreetView({ imageId, token }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const imageIdRef = useRef(imageId);
  const [gen, setGen] = useState(0); // muda -> força recriar o visualizador

  imageIdRef.current = imageId;

  // Cria (ou recria, quando `gen` muda) o visualizador.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const viewer = new Viewer({
      accessToken: token,
      container: el,
      imageId: imageIdRef.current,
      component: { cover: false },
    });
    viewerRef.current = viewer;

    // Recuperação de contexto WebGL perdido: recria o visualizador.
    const canvas = el.querySelector("canvas");
    const onLost = (e: Event) => {
      e.preventDefault();
      setGen((g) => g + 1);
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
  }, [token, gen]);

  // Move para a nova imagem quando a rodada troca.
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !imageId) return;
    viewer.moveTo(imageId).catch(() => {
      /* imagem pode não estar disponível; ignora silenciosamente */
    });
  }, [imageId]);

  return <div className="street-view" ref={containerRef} />;
}
