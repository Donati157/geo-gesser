import { useEffect, useRef } from "react";
import { Viewer } from "mapillary-js";

interface Props {
  imageId: string;
  token: string;
}

// Visualizador de rua do Mapillary. Recria/move conforme a imagem da rodada muda.
export default function StreetView({ imageId, token }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);

  // Cria o visualizador uma vez.
  useEffect(() => {
    if (!containerRef.current) return;
    const viewer = new Viewer({
      accessToken: token,
      container: containerRef.current,
      imageId,
      component: { cover: false },
    });
    viewerRef.current = viewer;
    return () => {
      viewer.remove();
      viewerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

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
