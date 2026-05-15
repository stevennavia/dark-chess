import { Client, Room } from "colyseus.js";
import { GameState, PlayerColor, MoveRecord, GamePhase } from "@/types";

export type GameEventHandler = {
  onStateUpdate?: (state: Partial<GameState>) => void;
  onPlayerAssigned?: (data: { id: string; color: PlayerColor; name: string }) => void;
  onGameStart?: (data: { fen: string; turn: PlayerColor; players: any[] }) => void;
  onMoveMade?: (data: { move: MoveRecord; fen: string; turn: PlayerColor; phase: GamePhase; check: boolean }) => void;
  onMoveError?: (data: { error: string }) => void;
  onGameOver?: (data: { winner?: PlayerColor; reason: GamePhase; moves: MoveRecord[] }) => void;
  onDrawOffered?: (data: { fromPlayer: string }) => void;
  onDrawAccepted?: () => void;
  onDrawDeclined?: () => void;
  onPlayerResigned?: (data: { playerId: string; color: PlayerColor }) => void;
  onPlayerDisconnected?: (data: { playerId: string; color: PlayerColor }) => void;
  onPlayerReconnected?: (data: { playerId: string; color: PlayerColor }) => void;
  onReconnected?: (data: { color: PlayerColor; fen: string; turn: PlayerColor; phase: GamePhase; moves: MoveRecord[] }) => void;
  onPlayersUpdate?: (data: { players: any[] }) => void;
};

export class MultiplayerManager {
  private client: Client | null = null;
  private room: Room | null = null;
  private handlers: GameEventHandler = {};
  private endpoint: string;

  constructor(endpoint?: string) {
    this.endpoint = endpoint || process.env.NEXT_PUBLIC_COLYSEUS_ENDPOINT || "ws://localhost:2567";
  }

  setHandlers(handlers: GameEventHandler): void {
    this.handlers = handlers;
  }

  async connect(): Promise<void> {
    if (this.client) return;

    this.client = new Client(this.endpoint);

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Connection timeout")), 10000);
      this.client!.onOpen = () => {
        clearTimeout(timeout);
        resolve();
      };
    });
  }

  async createRoom(playerName?: string): Promise<string> {
    if (!this.client) await this.connect();

    this.room = await this.client!.create("chess_room", {
      name: playerName || `Player_${Math.random().toString(36).slice(2, 6)}`,
    });

    this.setupRoomListeners();
    return this.room.roomId;
  }

  async joinRoom(roomId: string, playerName?: string): Promise<void> {
    if (!this.client) await this.connect();

    this.room = await this.client!.joinById(roomId, {
      name: playerName || `Player_${Math.random().toString(36).slice(2, 6)}`,
    });

    this.setupRoomListeners();
  }

  async joinOrCreate(playerName?: string): Promise<string> {
    if (!this.client) await this.connect();

    this.room = await this.client!.joinOrCreate("chess_room", {
      name: playerName || `Player_${Math.random().toString(36).slice(2, 6)}`,
    });

    this.setupRoomListeners();
    return this.room.roomId;
  }

  async reconnect(roomId: string, playerName?: string): Promise<void> {
    if (!this.client) await this.connect();

    const savedId = localStorage.getItem(`chess_player_${roomId}`);
    const rejoinToken = localStorage.getItem(`chess_token_${roomId}`);

    try {
      if (rejoinToken) {
        this.room = await this.client!.reconnect(roomId, rejoinToken);
      } else {
        this.room = await this.client!.joinById(roomId, {
          name: playerName || `Reconnecting_${Math.random().toString(36).slice(2, 6)}`,
        });
      }
    } catch {
      this.room = await this.client!.joinById(roomId, {
        name: playerName || `Player_${Math.random().toString(36).slice(2, 6)}`,
      });
    }

    this.setupRoomListeners();
    if (savedId) {
      localStorage.setItem(`chess_player_${roomId}`, savedId);
    }
  }

  sendMove(from: string, to: string, promotion?: string): void {
    if (!this.room) return;
    this.room.send("move", { from, to, promotion });
  }

  resign(): void {
    if (!this.room) return;
    this.room.send("resign");
  }

  offerDraw(): void {
    if (!this.room) return;
    this.room.send("draw_offer");
  }

  respondToDraw(accept: boolean): void {
    if (!this.room) return;
    this.room.send("draw_response", { accept });
  }

  requestRematch(): void {
    if (!this.room) return;
    this.room.send("rematch");
  }

  sendPlayerName(name: string): void {
    if (!this.room) return;
    this.room.send("player_name", { name });
  }

  getRoomId(): string | null {
    return this.room?.roomId || null;
  }

  getSessionId(): string | null {
    return this.room?.sessionId || null;
  }

  disconnect(): void {
    if (this.room) {
      this.room.leave();
      this.room = null;
    }
    this.client = null;
  }

  private setupRoomListeners(): void {
    if (!this.room) return;

    localStorage.setItem(`chess_player_${this.room.roomId}`, this.room.sessionId);

    this.room.onStateChange((state) => {
      this.handlers.onStateUpdate?.(state as unknown as Partial<GameState>);
    });

    this.room.onMessage("player_assigned", (data) => {
      this.handlers.onPlayerAssigned?.(data);
    });

    this.room.onMessage("game_start", (data) => {
      this.handlers.onGameStart?.(data);
    });

    this.room.onMessage("move_made", (data) => {
      this.handlers.onMoveMade?.(data);
    });

    this.room.onMessage("move_error", (data) => {
      this.handlers.onMoveError?.(data);
    });

    this.room.onMessage("game_over", (data) => {
      this.handlers.onGameOver?.(data);
    });

    this.room.onMessage("draw_offered", (data) => {
      this.handlers.onDrawOffered?.(data);
    });

    this.room.onMessage("draw_accepted", () => {
      this.handlers.onDrawAccepted?.();
    });

    this.room.onMessage("draw_declined", () => {
      this.handlers.onDrawDeclined?.();
    });

    this.room.onMessage("player_resigned", (data) => {
      this.handlers.onPlayerResigned?.(data);
    });

    this.room.onMessage("player_disconnected", (data) => {
      this.handlers.onPlayerDisconnected?.(data);
    });

    this.room.onMessage("player_reconnected", (data) => {
      this.handlers.onPlayerReconnected?.(data);
    });

    this.room.onMessage("reconnected", (data) => {
      this.handlers.onReconnected?.(data);
    });

    this.room.onMessage("players_update", (data) => {
      this.handlers.onPlayersUpdate?.(data);
    });

    this.room.onLeave((code) => {
      console.log("Left room:", code);
    });
  }
}

export const multiplayer = new MultiplayerManager();
