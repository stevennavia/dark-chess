import { Room, Client } from "colyseus";
import { Chess } from "chess.js";
import {
  GameStateData,
  GamePhase,
  PlayerColor,
  MoveRecord,
  createInitialGameState,
} from "../state/GameState";

export class ChessRoom extends Room<GameStateData> {
  private chess: Chess;
  private gameData: GameStateData;
  private moveTimers: Map<string, NodeJS.Timeout> = new Map();
  private static readonly MOVE_TIMEOUT_MS = 30 * 60 * 1000;
  private static readonly ABANDON_TIMEOUT_MS = 60 * 1000;

  onCreate(options: any): void {
    this.chess = new Chess();
    this.gameData = createInitialGameState();
    this.setState(this.gameData);
    this.maxClients = 2;

    this.onMessage("move", (client, message: { from: string; to: string; promotion?: string }) => {
      this.handleMove(client, message);
    });

    this.onMessage("resign", (client) => {
      this.handleResign(client);
    });

    this.onMessage("draw_offer", (client) => {
      this.handleDrawOffer(client);
    });

    this.onMessage("draw_response", (client, message: { accept: boolean }) => {
      this.handleDrawResponse(client, message);
    });

    this.onMessage("rematch", (client) => {
      this.handleRematch(client);
    });

    this.onMessage("player_name", (client, message: { name: string }) => {
      const player = this.gameData.players.find((p) => p.id === client.sessionId);
      if (player) {
        player.name = message.name;
      }
    });

    console.log(`Room ${this.roomId} created`);
  }

  onJoin(client: Client, options?: { name?: string }): void {
    const color = this.gameData.players.length === 0
      ? PlayerColor.WHITE
      : PlayerColor.BLACK;

    const player = {
      id: client.sessionId,
      sessionId: client.sessionId,
      color,
      name: options?.name || `Player ${this.gameData.players.length + 1}`,
      connected: true,
    };

    this.gameData.players.push(player);
    console.log(`Player ${player.name} (${color}) joined room ${this.roomId}`);

    client.send("player_assigned", {
      id: client.sessionId,
      color,
      name: player.name,
    });

    if (this.gameData.players.length === 2) {
      this.startGame();
    }

    this.broadcast("players_update", {
      players: this.gameData.players.map((p) => ({
        id: p.id,
        color: p.color,
        name: p.name,
        connected: p.connected,
      })),
    });
  }

  onLeave(client: Client, consented: boolean): void {
    const player = this.gameData.players.find((p) => p.id === client.sessionId);
    if (player) {
      player.connected = false;
      console.log(`Player ${player.name} disconnected`);

      if (this.gameData.phase === GamePhase.PLAYING || this.gameData.phase === GamePhase.CHECK) {
        const abandonTimer = setTimeout(() => {
          this.endGame(player.color === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE, GamePhase.ABANDONED);
        }, ChessRoom.ABANDON_TIMEOUT_MS);
        this.moveTimers.set(client.sessionId, abandonTimer);

        this.broadcast("player_disconnected", {
          playerId: player.id,
          color: player.color,
        });
      }
    }

    this.broadcast("players_update", {
      players: this.gameData.players.map((p) => ({
        id: p.id,
        color: p.color,
        name: p.name,
        connected: p.connected,
      })),
    });
  }

  onRejoin(client: Client, options?: { name?: string }): void {
    const existingPlayer = this.gameData.players.find((p) => p.id === client.sessionId);
    if (existingPlayer) {
      existingPlayer.connected = true;
      existingPlayer.sessionId = client.sessionId;
      const timer = this.moveTimers.get(client.sessionId);
      if (timer) {
        clearTimeout(timer);
        this.moveTimers.delete(client.sessionId);
      }

      client.send("reconnected", {
        color: existingPlayer.color,
        fen: this.gameData.fen,
        turn: this.gameData.turn,
        phase: this.gameData.phase,
        moves: this.gameData.moves,
      });

      this.broadcast("player_reconnected", {
        playerId: existingPlayer.id,
        color: existingPlayer.color,
      });
    } else {
      this.onJoin(client, options);
    }
  }

  onDispose(): void {
    this.moveTimers.forEach((timer) => clearTimeout(timer));
    this.moveTimers.clear();
    console.log(`Room ${this.roomId} disposed`);
  }

  private startGame(): void {
    this.gameData.phase = GamePhase.PLAYING;
    this.gameData.startedAt = Date.now();
    this.resetChess();
    this.broadcast("game_start", {
      fen: this.gameData.fen,
      turn: this.gameData.turn,
      players: this.gameData.players.map((p) => ({
        id: p.id,
        color: p.color,
        name: p.name,
      })),
    });
    this.broadcast("state_update", this.getPublicState());
    console.log(`Game started in room ${this.roomId}`);
  }

  private handleMove(client: Client, message: { from: string; to: string; promotion?: string }): void {
    if (this.gameData.phase !== GamePhase.PLAYING && this.gameData.phase !== GamePhase.CHECK) {
      client.send("move_error", { error: "Game is not in progress" });
      return;
    }

    const player = this.gameData.players.find((p) => p.id === client.sessionId);
    if (!player) {
      client.send("move_error", { error: "Player not found" });
      return;
    }

    if (this.chess.turn() !== (player.color === PlayerColor.WHITE ? "w" : "b")) {
      client.send("move_error", { error: "Not your turn" });
      return;
    }

    try {
      const move = this.chess.move({
        from: message.from,
        to: message.to,
        promotion: message.promotion || "q",
      });

      const moveRecord: MoveRecord = {
        from: move.from,
        to: move.to,
        san: move.san,
        fen: move.after,
        piece: move.piece,
        captured: move.captured,
        timestamp: Date.now(),
      };

      this.gameData.moves.push(moveRecord);
      this.gameData.fen = move.after;
      this.gameData.turn = this.chess.turn() === "w" ? PlayerColor.WHITE : PlayerColor.BLACK;

      if (this.chess.isCheckmate()) {
        this.gameData.phase = GamePhase.CHECKMATE;
        this.endGame(player.color, GamePhase.CHECKMATE);
      } else if (this.chess.isStalemate()) {
        this.gameData.phase = GamePhase.STALEMATE;
        this.endGame(undefined, GamePhase.STALEMATE);
      } else if (this.chess.isDraw()) {
        this.gameData.phase = GamePhase.DRAW;
        this.endGame(undefined, GamePhase.DRAW);
      } else if (this.chess.isCheck()) {
        this.gameData.phase = GamePhase.CHECK;
      } else {
        this.gameData.phase = GamePhase.PLAYING;
      }

      const publicState = this.getPublicState();
      this.broadcast("move_made", {
        move: moveRecord,
        fen: move.after,
        turn: this.gameData.turn,
        phase: this.gameData.phase,
        check: this.chess.isCheck(),
      });
      this.broadcast("state_update", publicState);

      console.log(`Move: ${move.san} by ${player.color}`);
    } catch (e: any) {
      client.send("move_error", { error: e.message || "Invalid move" });
    }
  }

  private handleResign(client: Client): void {
    const player = this.gameData.players.find((p) => p.id === client.sessionId);
    if (!player) return;

    const winner = player.color === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
    this.endGame(winner, GamePhase.RESIGNED);
    this.broadcast("player_resigned", {
      playerId: player.id,
      color: player.color,
    });
  }

  private handleDrawOffer(client: Client): void {
    const opponent = this.gameData.players.find((p) => p.id !== client.sessionId);
    if (opponent && opponent.connected) {
      const sender = this.gameData.players.find((p) => p.id === client.sessionId);
      this.clients.forEach((c) => {
        if (c.sessionId === opponent.id) {
          c.send("draw_offered", {
            fromPlayer: sender?.name || "Opponent",
          });
        }
      });
    }
  }

  private handleDrawResponse(client: Client, message: { accept: boolean }): void {
    if (message.accept) {
      this.endGame(undefined, GamePhase.DRAW);
      this.broadcast("draw_accepted", {});
    } else {
      const opponent = this.gameData.players.find((p) => p.id !== client.sessionId);
      if (opponent) {
        this.clients.forEach((c) => {
          if (c.sessionId === opponent.id) {
            c.send("draw_declined", {});
          }
        });
      }
    }
  }

  private handleRematch(client: Client): void {
    const player = this.gameData.players.find((p) => p.id === client.sessionId);
    if (!player) return;

    player.connected = true;

    const allReady = this.gameData.players.every((p) => p.connected);
    if (allReady && this.gameData.players.length === 2) {
      this.resetChess();
      this.gameData.phase = GamePhase.PLAYING;
      this.gameData.moves = [];
      this.gameData.finishedAt = undefined;
      this.gameData.startedAt = Date.now();

      this.broadcast("game_start", {
        fen: this.gameData.fen,
        turn: this.gameData.turn,
        players: this.gameData.players.map((p) => ({
          id: p.id,
          color: p.color,
          name: p.name,
        })),
      });
      this.broadcast("state_update", this.getPublicState());
      console.log(`Rematch started in room ${this.roomId}`);
    }
  }

  private endGame(winner?: PlayerColor, reason?: GamePhase): void {
    this.gameData.winner = winner;
    this.gameData.phase = reason || GamePhase.DRAW;
    this.gameData.finishedAt = Date.now();

    this.broadcast("game_over", {
      winner,
      reason: this.gameData.phase,
      moves: this.gameData.moves,
    });
  }

  private resetChess(): void {
    this.chess = new Chess();
    this.gameData.fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  }

  private getPublicState(): any {
    return {
      fen: this.gameData.fen,
      turn: this.gameData.turn,
      phase: this.gameData.phase,
      players: this.gameData.players.map((p) => ({
        id: p.id,
        color: p.color,
        name: p.name,
        connected: p.connected,
      })),
      moves: this.gameData.moves,
      winner: this.gameData.winner,
      startedAt: this.gameData.startedAt,
      finishedAt: this.gameData.finishedAt,
    };
  }
}
