// Distância de Haversine entre dois pontos (em km).
export function haversineKm(a, b) {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

// Pontuação por rodada: máximo de 5000, decaindo exponencialmente com a distância.
// Acertar bem perto (< ~150m) vale praticamente 5000; ~erros de milhares de km
// tendem a zero. Escala parecida com a do GeoGuessr.
const MAX_SCORE = 5000;
const SCALE_KM = 1500;

export function scoreForDistance(distanceKm) {
  const score = MAX_SCORE * Math.exp(-distanceKm / SCALE_KM);
  return Math.round(score);
}

export { MAX_SCORE };
