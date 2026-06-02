export type Status = "lobby" | "playing" | "reveal" | "over";

export interface Player {
  id: string;
  name: string;
  score: number;
  connected: boolean;
  hasGuessed: boolean;
}

export interface RoundResult {
  id: string;
  name: string;
  guess: { lat: number; lng: number } | null;
  distanceKm: number | null;
  points: number;
  score: number;
}

export interface RoomState {
  code: string;
  hostId: string;
  status: Status;
  round: number;
  totalRounds: number;
  roundSeconds: number;
  deadline: number | null;
  players: Player[];
  actual: { lat: number; lng: number; region: string } | null;
  results: RoundResult[] | null;
}

export interface RoundStart {
  round: number;
  totalRounds: number;
  imageId: string;
  token: string;
  deadline: number;
}
