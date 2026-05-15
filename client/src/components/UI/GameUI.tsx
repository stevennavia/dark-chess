"use client";

import React from "react";
import { useGameStore } from "@/store/gameStore";
import { multiplayer } from "@/network/multiplayer";
import { GamePhase, PlayerColor } from "@/types";
import { TurnIndicator } from "./TurnIndicator";

export function GameUI() {
  const {
    phase,
    turn,
    players,
    myColor,
    winner,
    moves,
    lastMoveSan,
    opponentName,
    playerName,
    showDrawOffer,
    drawOfferedBy,
    setDrawOffer,
  } = useGameStore();

  const isGameOver = [
    GamePhase.CHECKMATE,
    GamePhase.STALEMATE,
    GamePhase.DRAW,
    GamePhase.RESIGNED,
    GamePhase.ABANDONED,
  ].includes(phase);

  const getResultText = () => {
    if (phase === GamePhase.CHECKMATE) {
      return winner === myColor ? "Victory" : "Defeated";
    }
    if (phase === GamePhase.STALEMATE) return "Stalemate";
    if (phase === GamePhase.DRAW) return "Draw";
    if (phase === GamePhase.RESIGNED) return winner === myColor ? "Opponent Resigned" : "You Resigned";
    if (phase === GamePhase.ABANDONED) return "Game Abandoned";
    return "";
  };

  const getResultSubtext = () => {
    if (phase === GamePhase.CHECKMATE) {
      return winner === myColor ? "The kingdom prevails" : "Darkness consumes all";
    }
    return "The ritual ends";
  };

  const handleCopyRoomId = () => {
    const roomId = multiplayer.getRoomId();
    if (roomId) {
      navigator.clipboard.writeText(roomId);
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      <div className="absolute top-4 left-4 pointer-events-auto">
        <TurnIndicator />
      </div>

      {showDrawOffer && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
          <div className="bg-dark-800/95 border border-dark-600 rounded-lg p-4 text-center space-y-3 backdrop-blur-sm min-w-[200px]">
            <p className="text-gray-300 text-sm">{drawOfferedBy} offers a draw</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => {
                  multiplayer.respondToDraw(true);
                  setDrawOffer(false);
                }}
                className="px-4 py-1.5 bg-gold/20 border border-gold/40 text-gold text-xs rounded hover:bg-gold/30 transition-all"
              >
                Accept
              </button>
              <button
                onClick={() => {
                  multiplayer.respondToDraw(false);
                  setDrawOffer(false);
                }}
                className="px-4 py-1.5 bg-dark-700 border border-dark-500 text-gray-300 text-xs rounded hover:bg-dark-600 transition-all"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute top-4 right-4 pointer-events-auto flex items-center gap-2">
        {multiplayer.getRoomId() && (
          <button
            onClick={handleCopyRoomId}
            className="px-3 py-1.5 bg-dark-800/80 border border-dark-600 text-dark-500 text-xs rounded hover:border-dark-500 hover:text-gray-400 transition-all"
            title="Copy room code"
          >
            {multiplayer.getRoomId()?.slice(0, 6)}...
          </button>
        )}
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto">
        <div className="px-4 py-2 bg-dark-800/80 backdrop-blur-sm border border-dark-600 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${turn === PlayerColor.WHITE ? "bg-gray-200" : "bg-gray-800 border border-gray-600"}`} />
              <span className="text-xs text-dark-400">
                {turn === myColor ? "Your turn" : "Opponent's turn"}
              </span>
            </div>
            {lastMoveSan && (
              <>
                <div className="w-px h-3 bg-dark-600" />
                <span className="text-xs text-dark-500 font-mono">{lastMoveSan}</span>
              </>
            )}
            <div className="w-px h-3 bg-dark-600" />
            <span className="text-xs text-dark-500">Move {Math.ceil(moves.length / 2)}</span>
          </div>
        </div>
      </div>

      {isGameOver && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center pointer-events-auto">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className={`text-5xl font-gothic tracking-widest ${
                winner === myColor ? "text-gold" : "text-blood"
              }`}>
                {getResultText()}
              </h2>
              <p className="text-dark-500 text-sm">{getResultSubtext()}</p>
            </div>
            <button
              onClick={() => multiplayer.requestRematch()}
              className="px-6 py-2 bg-gold/20 border border-gold/40 text-gold rounded hover:bg-gold/30 transition-all text-sm tracking-wider"
            >
              Request Rematch
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
