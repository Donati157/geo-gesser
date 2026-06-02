import { useEffect, useState } from "react";
import { socket } from "./socket";
import type { RoomState, RoundStart } from "./types";
import Home from "./components/Home";
import Lobby from "./components/Lobby";
import Game from "./components/Game";

export default function App() {
  const [connected, setConnected] = useState(socket.connected);
  const [you, setYou] = useState<string>("");
  const [room, setRoom] = useState<RoomState | null>(null);
  const [roundStart, setRoundStart] = useState<RoundStart | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onConnect = () => {
      setConnected(true);
      setYou(socket.id || "");
    };
    const onDisconnect = () => setConnected(false);
    const onRoomUpdate = (state: RoomState) => setRoom(state);
    const onRoundStart = (rs: RoundStart) => {
      setRoundStart(rs);
      setError(null);
    };
    const onGameError = ({ message }: { message: string }) => setError(message);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("room_update", onRoomUpdate);
    socket.on("round_start", onRoundStart);
    socket.on("round_end", onRoomUpdate);
    socket.on("game_error", onGameError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("room_update", onRoomUpdate);
      socket.off("round_start", onRoundStart);
      socket.off("round_end", onRoomUpdate);
      socket.off("game_error", onGameError);
    };
  }, []);

  const leave = () => {
    setRoom(null);
    setRoundStart(null);
    setError(null);
    socket.disconnect();
    socket.connect();
  };

  if (!room) {
    return <Home connected={connected} setYou={setYou} onError={setError} error={error} />;
  }

  const isHost = room.hostId === you;

  if (room.status === "lobby") {
    return <Lobby room={room} you={you} isHost={isHost} onLeave={leave} />;
  }

  return (
    <Game
      room={room}
      you={you}
      isHost={isHost}
      roundStart={roundStart}
      error={error}
      onLeave={leave}
    />
  );
}
