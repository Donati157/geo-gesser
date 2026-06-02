import dotenv from "dotenv";
dotenv.config(); // server/.env
dotenv.config({ path: "../.env" }); // .env da raiz como fallback (não sobrescreve o de cima)
import http from "node:http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { getRandomImage } from "./mapillary.js";
import { haversineKm, scoreForDistance } from "./scoring.js";
import {
  rooms,
  createRoom,
  addPlayer,
  publicRoom,
  removeRoom,
  clamp,
} from "./rooms.js";

const PORT = process.env.PORT || 3001;
const TOKEN = process.env.MAPILLARY_TOKEN;

// Origem(ns) permitida(s) para CORS. Em produção, defina CLIENT_ORIGIN com a
// URL do cliente na Vercel (ex: https://geo-gesser.vercel.app). Aceita várias
// separadas por vírgula. Sem essa variável, libera tudo ("*") — ok para dev.
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",").map((s) => s.trim())
  : "*";

if (!TOKEN || TOKEN.includes("cole-seu-token")) {
  console.warn(
    "\n⚠️  MAPILLARY_TOKEN não configurado. Crie um arquivo .env (veja .env.example).\n" +
      "    O jogo não conseguirá carregar imagens sem ele.\n"
  );
}

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));
app.get("/", (_req, res) => res.json({ name: "GeoGesser", ok: true, rooms: rooms.size }));
app.get("/health", (_req, res) => res.json({ ok: true, rooms: rooms.size }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: CLIENT_ORIGIN } });

// ---- helpers de broadcast ----
function broadcast(room) {
  io.to(room.code).emit("room_update", publicRoom(room));
}

function send(socket, event, payload) {
  socket.emit(event, payload);
}

// ---- ciclo de jogo ----
async function startRound(room) {
  room.round += 1;
  room.guesses.clear();
  room.status = "playing";
  room.location = null;
  room.deadline = null;

  let image;
  try {
    image = await getRandomImage(TOKEN);
  } catch (err) {
    console.error("[round] falha ao buscar imagem:", err.message);
    io.to(room.code).emit("game_error", {
      message: "Não consegui carregar uma imagem do Mapillary. Verifique o token e tente de novo.",
    });
    room.status = "lobby";
    room.round -= 1;
    broadcast(room);
    return;
  }

  room.location = image;
  room.deadline = Date.now() + room.settings.roundSeconds * 1000;

  // Envia a imagem (id + token) para o cliente montar o visualizador.
  io.to(room.code).emit("round_start", {
    round: room.round,
    totalRounds: room.settings.rounds,
    imageId: image.imageId,
    token: TOKEN,
    deadline: room.deadline,
  });
  broadcast(room);

  if (room.timer) clearTimeout(room.timer);
  room.timer = setTimeout(() => endRound(room), room.settings.roundSeconds * 1000 + 500);
}

function maybeEndEarly(room) {
  const active = [...room.players.values()].filter((p) => p.connected);
  if (active.length > 0 && active.every((p) => room.guesses.has(p.id))) {
    endRound(room);
  }
}

function endRound(room) {
  if (room.status !== "playing") return;
  if (room.timer) clearTimeout(room.timer);
  room.timer = null;
  room.status = "reveal";
  room.deadline = null;
  io.to(room.code).emit("round_end", publicRoom(room));
  broadcast(room);
}

function nextStep(room) {
  if (room.round >= room.settings.rounds) {
    room.status = "over";
    broadcast(room);
  } else {
    startRound(room);
  }
}

function resetToLobby(room) {
  if (room.timer) clearTimeout(room.timer);
  room.timer = null;
  room.status = "lobby";
  room.round = 0;
  room.location = null;
  room.deadline = null;
  room.guesses.clear();
  for (const p of room.players.values()) p.score = 0;
  broadcast(room);
}

// ---- conexões ----
io.on("connection", (socket) => {
  let joinedCode = null;

  socket.on("create_room", ({ name, settings }, ack) => {
    const room = createRoom(socket.id, name, settings);
    joinedCode = room.code;
    socket.join(room.code);
    ack?.({ ok: true, code: room.code, you: socket.id });
    broadcast(room);
  });

  socket.on("join_room", ({ code, name }, ack) => {
    code = String(code || "").toUpperCase().trim();
    const room = rooms.get(code);
    if (!room) return ack?.({ ok: false, error: "Sala não encontrada." });
    if (room.status !== "lobby")
      return ack?.({ ok: false, error: "A partida já começou." });
    if (room.players.size >= 12)
      return ack?.({ ok: false, error: "Sala cheia (máx. 12)." });

    addPlayer(room, socket.id, name);
    joinedCode = room.code;
    socket.join(room.code);
    ack?.({ ok: true, code: room.code, you: socket.id });
    broadcast(room);
  });

  socket.on("update_settings", ({ settings }) => {
    const room = rooms.get(joinedCode);
    if (!room || room.hostId !== socket.id || room.status !== "lobby") return;
    room.settings.rounds = clamp(settings?.rounds ?? room.settings.rounds, 1, 20);
    room.settings.roundSeconds = clamp(settings?.roundSeconds ?? room.settings.roundSeconds, 15, 300);
    broadcast(room);
  });

  socket.on("start_game", () => {
    const room = rooms.get(joinedCode);
    if (!room || room.hostId !== socket.id) return;
    if (room.status !== "lobby" && room.status !== "over") return;
    room.round = 0;
    for (const p of room.players.values()) p.score = 0;
    startRound(room);
  });

  socket.on("submit_guess", ({ lat, lng }) => {
    const room = rooms.get(joinedCode);
    if (!room || room.status !== "playing" || !room.location) return;
    if (room.guesses.has(socket.id)) return; // já palpitou
    if (typeof lat !== "number" || typeof lng !== "number") return;

    const distanceKm = haversineKm(
      { lat, lng },
      { lat: room.location.lat, lng: room.location.lng }
    );
    const points = scoreForDistance(distanceKm);
    room.guesses.set(socket.id, { lat, lng, distanceKm, points, submittedAt: Date.now() });

    const player = room.players.get(socket.id);
    if (player) player.score += points;

    broadcast(room);
    maybeEndEarly(room);
  });

  socket.on("next_round", () => {
    const room = rooms.get(joinedCode);
    if (!room || room.hostId !== socket.id || room.status !== "reveal") return;
    nextStep(room);
  });

  socket.on("play_again", () => {
    const room = rooms.get(joinedCode);
    if (!room || room.hostId !== socket.id) return;
    resetToLobby(room);
  });

  socket.on("disconnect", () => {
    const room = rooms.get(joinedCode);
    if (!room) return;
    const player = room.players.get(socket.id);
    if (player) player.connected = false;

    // Se ainda há gente, mantém a sala; senão, descarta após um tempinho.
    const anyConnected = [...room.players.values()].some((p) => p.connected);
    if (!anyConnected) {
      removeRoom(room);
      return;
    }

    // Reatribui o host se o host saiu.
    if (room.hostId === socket.id) {
      const next = [...room.players.values()].find((p) => p.connected);
      if (next) room.hostId = next.id;
    }
    broadcast(room);
    if (room.status === "playing") maybeEndEarly(room);
  });
});

server.listen(PORT, () => {
  console.log(`\n🌍  GeoGesser server rodando em http://localhost:${PORT}\n`);
});
