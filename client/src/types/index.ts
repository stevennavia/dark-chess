export enum GamePhase {
  WAITING = "waiting",
  PLAYING = "playing",
  CHECK = "check",
  CHECKMATE = "checkmate",
  STALEMATE = "stalemate",
  DRAW = "draw",
  RESIGNED = "resigned",
  ABANDONED = "abandoned",
}

export enum PlayerColor {
  WHITE = "white",
  BLACK = "black",
}

export interface Player {
  id: string;
  color: PlayerColor;
  name: string;
  connected: boolean;
}

export interface MoveRecord {
  from: string;
  to: string;
  promotion?: string;
  san: string;
  fen: string;
  piece: string;
  captured?: string;
  timestamp: number;
}

export interface GameState {
  phase: GamePhase;
  fen: string;
  turn: PlayerColor;
  players: Player[];
  moves: MoveRecord[];
  winner?: PlayerColor;
  startedAt?: number;
  finishedAt?: number;
}

export interface PiecePosition {
  square: string;
  type: string;
  color: "w" | "b";
  row: number;
  col: number;
}

export interface SquareHighlight {
  square: string;
  type: "selected" | "valid-move" | "last-move" | "check";
}

export interface CameraTarget {
  position: [number, number, number];
  lookAt: [number, number, number];
}

export const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
export const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"] as const;

export const PIECE_UNICODE: Record<string, string> = {
  K: "♔",
  Q: "♕",
  R: "♖",
  B: "♗",
  N: "♘",
  P: "♙",
  k: "♚",
  q: "♛",
  r: "♜",
  b: "♝",
  n: "♞",
  p: "♟",
};

export const PIECE_NAMES: Record<string, string> = {
  K: "King",
  Q: "Queen",
  R: "Rook",
  B: "Bishop",
  N: "Knight",
  P: "Pawn",
};

export const PIECE_VALUES: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};
