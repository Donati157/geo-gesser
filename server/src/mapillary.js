import { randomRegion } from "./locations.js";

const GRAPH = "https://graph.mapillary.com/images";

// Busca uma imagem de rua aleatória num ponto bem coberto do mundo.
// Estratégia: sorteia uma região, pede ao Mapillary as imagens dentro daquela
// bounding box e escolhe uma ao acaso. Tenta várias regiões até achar uma
// com imagens disponíveis (a cobertura varia).
export async function getRandomImage(token, { maxAttempts = 10 } = {}) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const region = randomRegion();
    const params = new URLSearchParams({
      access_token: token,
      fields: "id,computed_geometry,geometry,is_pano,captured_at",
      bbox: region.bbox.join(","),
      limit: "40",
    });
    let data;
    try {
      const res = await fetch(`${GRAPH}?${params}`);
      if (!res.ok) {
        const body = await res.text();
        console.warn(`[mapillary] ${res.status} para ${region.name}: ${body.slice(0, 200)}`);
        continue;
      }
      data = await res.json();
    } catch (err) {
      console.warn(`[mapillary] erro de rede em ${region.name}:`, err.message);
      continue;
    }

    const images = data?.data ?? [];
    if (images.length === 0) continue;

    // Prefere panoramas (navegação 360°), mas aceita qualquer imagem.
    const panos = images.filter((i) => i.is_pano);
    const pool = panos.length > 0 ? panos : images;
    const img = pool[Math.floor(Math.random() * pool.length)];

    const coords = img.computed_geometry?.coordinates ?? img.geometry?.coordinates;
    if (!coords) continue;
    const [lng, lat] = coords;

    return {
      imageId: String(img.id),
      lat,
      lng,
      region: region.name,
      isPano: Boolean(img.is_pano),
    };
  }
  throw new Error("Não foi possível encontrar uma imagem no Mapillary após várias tentativas.");
}
