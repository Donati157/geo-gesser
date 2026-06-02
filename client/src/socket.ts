import { io, Socket } from "socket.io-client";

// Endereço do servidor. Em dev, o servidor roda na porta 3001.
// Pode sobrescrever com a variável VITE_SERVER_URL ao buildar.
const URL =
  import.meta.env.VITE_SERVER_URL ||
  `${window.location.protocol}//${window.location.hostname}:3001`;

export const socket: Socket = io(URL, { autoConnect: true });
