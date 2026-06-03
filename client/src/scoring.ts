export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export const MAX_SCORE = 5000;
const SCALE_KM = 1500;

export function scoreForDistance(distanceKm: number): number {
  return Math.round(MAX_SCORE * Math.exp(-distanceKm / SCALE_KM));
}

export function formatDist(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 100) return `${km.toFixed(1)} km`;
  return `${Math.round(km).toLocaleString("pt-BR")} km`;
}

// Distância máxima que mantém o "foguinho" (streak) vivo: acertar a região.
export const STREAK_KM = 500;

export interface Proximity {
  emoji: string;
  label: string;
  cls: string;
  pct: number; // 0-100, quão "cheio" fica o medidor
}

export function proximity(distanceKm: number): Proximity {
  const pct = Math.round((scoreForDistance(distanceKm) / MAX_SCORE) * 100);
  if (distanceKm < 0.5) return { emoji: "🎯", label: "CRAVOU!", cls: "perfect", pct };
  if (distanceKm < 5) return { emoji: "🔥", label: "Muito perto!", cls: "hot", pct };
  if (distanceKm < 50) return { emoji: "😎", label: "Perto", cls: "good", pct };
  if (distanceKm < STREAK_KM) return { emoji: "🙂", label: "Acertou a região", cls: "ok", pct };
  if (distanceKm < 2000) return { emoji: "😬", label: "Longe", cls: "far", pct };
  return { emoji: "🥶", label: "Bem longe", cls: "cold", pct };
}
