import { VectorTile } from "@mapbox/vector-tile";
import { PbfReader } from "pbf";
import { REGIONS } from "./regions";

// Busca de imagens do Mapillary direto no NAVEGADOR (modo solo, sem servidor).
// Usa vector tiles (z14, camada "image"), igual ao servidor.
const TILE_Z = 14;
const TOKEN = import.meta.env.VITE_MAPILLARY_TOKEN as string | undefined;

// Cidades vs interior/rural (pra cair às vezes em lugar sem muita pista).
const isRural = (r: { name: string }) => /Interior|Campo|Pampa|Meio-Oeste/.test(r.name);
const RURAL = REGIONS.filter(isRural);
const CITIES = REGIONS.filter((r) => !isRural(r));
const pick = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)];

export interface SoloImage {
  imageId: string;
  lat: number;
  lng: number;
  region: string;
  isPano: boolean;
}

function lngLatToTile(lng: number, lat: number, z: number) {
  const n = 2 ** z;
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return { x, y };
}

export function mapillaryToken(): string {
  return TOKEN || "";
}

export async function getRandomImage(maxAttempts = 36): Promise<SoloImage> {
  if (!TOKEN) throw new Error("Token do Mapillary não configurado no cliente.");

  // ~45% das rodadas tentam um lugar rural/interior (mais difícil).
  const wantRural = RURAL.length > 0 && Math.random() < 0.45;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const fallback = attempt >= maxAttempts - 10;
    const region = fallback ? pick(REGIONS) : pick(wantRural ? RURAL : CITIES);
    const [minLng, minLat, maxLng, maxLat] = region.bbox;
    const lng = minLng + Math.random() * (maxLng - minLng);
    const lat = minLat + Math.random() * (maxLat - minLat);
    const { x, y } = lngLatToTile(lng, lat, TILE_Z);

    try {
      const res = await fetch(
        `https://tiles.mapillary.com/maps/vtp/mly1_public/2/${TILE_Z}/${x}/${y}?access_token=${TOKEN}`
      );
      if (!res.ok) continue;
      const buf = new Uint8Array(await res.arrayBuffer());
      const tile = new VectorTile(new PbfReader(buf));
      const layer = tile.layers.image;
      if (!layer || layer.length === 0) continue;

      const feats: SoloImage[] = [];
      for (let i = 0; i < layer.length; i++) {
        const feat = layer.feature(i);
        const id = (feat.properties as any).id;
        // IDs do Mapillary > 2^53 são corrompidos ao virar número JS -> pula.
        if (typeof id !== "number" || !Number.isSafeInteger(id)) continue;
        const isPano = (feat.properties as any).is_pano === true || (feat.properties as any).is_pano === 1;
        if (!isPano) continue; // SÓ panoramas 360°
        const gj: any = feat.toGeoJSON(x, y, TILE_Z);
        const [flng, flat] = gj.geometry.coordinates;
        feats.push({ imageId: String(id), lng: flng, lat: flat, region: region.name, isPano: true });
      }
      if (feats.length === 0) continue; // tile sem 360° -> tenta outro

      return feats[Math.floor(Math.random() * feats.length)];
    } catch {
      continue;
    }
  }
  throw new Error("Não consegui encontrar uma imagem. Tente de novo.");
}
