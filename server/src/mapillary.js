import { VectorTile } from "@mapbox/vector-tile";
import { PbfReader } from "pbf";
import { randomRegion } from "./locations.js";

// O endpoint Graph /images?bbox= do Mapillary quebra em áreas densas
// ("Please reduce the amount of data..."). A forma confiável é usar os
// VECTOR TILES, que são fatiados por tile e aguentam qualquer densidade.
// Camada "image" no zoom 14 traz pontos de imagens individuais.
const TILE_Z = 14;
const tileUrl = (z, x, y, token) =>
  `https://tiles.mapillary.com/maps/vtp/mly1_public/2/${z}/${x}/${y}?access_token=${token}`;

function lngLatToTile(lng, lat, z) {
  const n = 2 ** z;
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return { x, y };
}

function randomPointIn(bbox) {
  const [minLng, minLat, maxLng, maxLat] = bbox;
  return {
    lng: minLng + Math.random() * (maxLng - minLng),
    lat: minLat + Math.random() * (maxLat - minLat),
  };
}

// Busca uma imagem de rua aleatória num ponto bem coberto do mundo.
export async function getRandomImage(token, { maxAttempts = 16 } = {}) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const region = randomRegion();
    const pt = randomPointIn(region.bbox);
    const { x, y } = lngLatToTile(pt.lng, pt.lat, TILE_Z);

    let features;
    try {
      const res = await fetch(tileUrl(TILE_Z, x, y, token));
      if (!res.ok) {
        console.warn(`[mapillary] tile ${res.status} em ${region.name}`);
        continue;
      }
      const buf = new Uint8Array(await res.arrayBuffer());
      const tile = new VectorTile(new PbfReader(buf));
      const layer = tile.layers.image;
      if (!layer || layer.length === 0) continue; // tile sem cobertura

      features = [];
      for (let i = 0; i < layer.length; i++) {
        const feat = layer.feature(i);
        const id = feat.properties.id;
        // IDs do Mapillary > 2^53 são corrompidos ao virar número JS -> pula.
        if (typeof id !== "number" || !Number.isSafeInteger(id)) continue;
        const gj = feat.toGeoJSON(x, y, TILE_Z);
        const [lng, lat] = gj.geometry.coordinates;
        features.push({
          id: String(id),
          lng,
          lat,
          isPano: gj.properties.is_pano === true || gj.properties.is_pano === 1,
        });
      }
    } catch (err) {
      console.warn(`[mapillary] erro em ${region.name}:`, err.message);
      continue;
    }

    if (!features || features.length === 0) continue;

    // Prefere panoramas (navegação 360°), mas aceita qualquer imagem.
    const panos = features.filter((f) => f.isPano);
    const pool = panos.length > 0 ? panos : features;
    const img = pool[Math.floor(Math.random() * pool.length)];

    return {
      imageId: img.id,
      lat: img.lat,
      lng: img.lng,
      region: region.name,
      isPano: img.isPano,
    };
  }
  throw new Error("Não foi possível encontrar uma imagem no Mapillary após várias tentativas.");
}
