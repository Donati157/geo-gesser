import { VectorTile } from "@mapbox/vector-tile";
import { PbfReader } from "pbf";
import { randomRegion } from "./regions";

// Busca de imagens do Mapillary direto no NAVEGADOR (modo solo, sem servidor).
// Usa vector tiles (z14, camada "image"), igual ao servidor.
const TILE_Z = 14;
const TOKEN = import.meta.env.VITE_MAPILLARY_TOKEN as string | undefined;

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

export async function getRandomImage(maxAttempts = 18): Promise<SoloImage> {
  if (!TOKEN) throw new Error("Token do Mapillary não configurado no cliente.");

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const region = randomRegion();
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
        const gj: any = layer.feature(i).toGeoJSON(x, y, TILE_Z);
        const [flng, flat] = gj.geometry.coordinates;
        feats.push({
          imageId: String(gj.properties.id ?? layer.feature(i).id),
          lng: flng,
          lat: flat,
          region: region.name,
          isPano: gj.properties.is_pano === true || gj.properties.is_pano === 1,
        });
      }
      if (feats.length === 0) continue;

      const panos = feats.filter((f) => f.isPano);
      const pool = panos.length > 0 ? panos : feats;
      return pool[Math.floor(Math.random() * pool.length)];
    } catch {
      continue;
    }
  }
  throw new Error("Não consegui encontrar uma imagem. Tente de novo.");
}
