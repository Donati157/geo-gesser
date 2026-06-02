import { customAlphabet } from "nanoid";

// Código de sala curto e fácil de digitar (sem caracteres ambíguos).
const makeCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 4);

/** @type {Map<string, Room>} */
export const rooms = new Map();

export function createRoom(hostId, hostName, settings) {
  let code = makeCode();
  while (rooms.has(code)) code = makeCode();

  const room = {
    code,
    hostId,
    status: "lobby", // lobby | playing | reveal | over
    round: 0,
    settings: {
      rounds: clamp(settings?.rounds ?? 5, 1, 20),
      roundSeconds: clamp(settings?.roundSeconds ?? 90, 15, 300),
    },
    players: new Map(), // id -> player
    location: null, // segredo da rodada atual (não vai pro cliente até o reveal)
    guesses: new Map(), // id -> { lat, lng, distanceKm, points, submittedAt }
    deadline: null,
    timer: null,
  };
  addPlayer(room, hostId, hostName);
  rooms.set(code, room);
  return room;
}

export function addPlayer(room, id, name) {
  room.players.set(id, {
    id,
    name: (name || "Jogador").slice(0, 20),
    score: 0,
    connected: true,
  });
}

export function clamp(n, min, max) {
  n = Number(n);
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

// Estado público da sala — o que pode ser enviado a todos os clientes.
// Nunca inclui as coordenadas reais enquanto a rodada está em andamento.
export function publicRoom(room) {
  const revealing = room.status === "reveal" || room.status === "over";
  return {
    code: room.code,
    hostId: room.hostId,
    status: room.status,
    round: room.round,
    totalRounds: room.settings.rounds,
    roundSeconds: room.settings.roundSeconds,
    deadline: room.deadline,
    players: [...room.players.values()]
      .map((p) => ({
        id: p.id,
        name: p.name,
        score: p.score,
        connected: p.connected,
        hasGuessed: room.guesses.has(p.id),
      }))
      .sort((a, b) => b.score - a.score),
    actual: revealing && room.location
      ? { lat: room.location.lat, lng: room.location.lng, region: room.location.region }
      : null,
    results: revealing ? buildResults(room) : null,
  };
}

function buildResults(room) {
  return [...room.players.values()]
    .map((p) => {
      const g = room.guesses.get(p.id);
      return {
        id: p.id,
        name: p.name,
        guess: g ? { lat: g.lat, lng: g.lng } : null,
        distanceKm: g ? g.distanceKm : null,
        points: g ? g.points : 0,
        score: p.score,
      };
    })
    .sort((a, b) => b.points - a.points);
}

export function removeRoom(room) {
  if (room.timer) clearTimeout(room.timer);
  rooms.delete(room.code);
}
