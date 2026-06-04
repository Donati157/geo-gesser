// Carrega contornos de países (uma vez) e acha o país que contém um ponto.
// Usado para pintar o país do local real no resultado (estilo FreeGuessr).
type Ring = [number, number][];
interface Feature {
  properties: { name: string };
  geometry:
    | { type: "Polygon"; coordinates: Ring[] }
    | { type: "MultiPolygon"; coordinates: Ring[][] };
}

const URL = "https://cdn.jsdelivr.net/gh/johan/world.geo.json@master/countries.geo.json";
let cache: Promise<Feature[]> | null = null;

export function loadCountries(): Promise<Feature[]> {
  if (!cache) {
    cache = fetch(URL)
      .then((r) => r.json())
      .then((gj: any) => gj.features as Feature[])
      .catch(() => []);
  }
  return cache;
}

function pointInRing(lng: number, lat: number, ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const hit = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (hit) inside = !inside;
  }
  return inside;
}

function pointInPolygon(lng: number, lat: number, rings: Ring[]): boolean {
  if (!pointInRing(lng, lat, rings[0])) return false;
  for (let k = 1; k < rings.length; k++) if (pointInRing(lng, lat, rings[k])) return false;
  return true;
}

export async function findCountry(lat: number, lng: number): Promise<Feature | null> {
  const feats = await loadCountries();
  for (const f of feats) {
    const g = f.geometry;
    if (g.type === "Polygon") {
      if (pointInPolygon(lng, lat, g.coordinates)) return f;
    } else if (g.type === "MultiPolygon") {
      if (g.coordinates.some((poly) => pointInPolygon(lng, lat, poly))) return f;
    }
  }
  return null;
}
