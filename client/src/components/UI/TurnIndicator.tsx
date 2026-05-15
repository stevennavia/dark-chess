"use client";

import React from "react";
import { useGameStore } from "@/store/gameStore";
import { PlayerColor, GamePhase } from "@/types";

export function TurnIndicator() {
  const { turn, phase, players, myColor, opponentName, playerName, isCheck } = useGameStore();

  const me = players.find((p) => p.id === useGameStore.getState().myId);
  const opponent = players.find((p) => p.id !== useGameStore.getState().myId);

  const myName = me?.name || playerName || "You";
  const oppName = opponent?.name || opponentName || "Opponent";

  if (phase === GamePhase.WAITING) return null;

  return (
    <div className="space-y-2">
      <PlayerBadge
        color={PlayerColor.WHITE}
        name={turn === PlayerColor.WHITE ? (myColor === PlayerColor.WHITE ? myName : oppName) : (myColor === PlayerColor.WHITE ? myName : oppName)}
        isActive={turn === PlayerColor.WHITE}
        isMe={myColor === PlayerColor.WHITE}
      />
      <PlayerBadge
        color={PlayerColor.BLACK}
        name={turn === PlayerColor.BLACK ? (myColor === PlayerColor.WHITE ? oppName : myName) : (myColor === PlayerColor.WHITE ? oppName : myName)}
        isActive={turn === PlayerColor.BLACK}
        isMe={myColor === PlayerColor.BLACK}
      />
      {isCheck && (
        <div className="px-3 py-1 bg-blood/20 border border-blood/40 rounded animate-pulse">
          <span className="text-blood text-xs tracking-wider">CHECK</span>
        </div>
      )}
    </div>
  );
}

function PlayerBadge({ color, name, isActive, isMe }: {
  color: PlayerColor;
  name: string;
  isActive: boolean;
  isMe: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded border transition-all ${
      isActive
        ? "bg-dark-700/80 border-gold/40"
        : "bg-dark-800/50 border-transparent"
    }`}>
      <div className={`w-3 h-3 rounded-full ${
        color === PlayerColor.WHITE ? "bg-gray-200" : "bg-gray-900 border border-gray-600"
      }`} />
      <div className="flex flex-col">
        <span className={`text-xs ${
          isActive ? "text-gold" : "text-dark-400"
        }`}>
          {name}
          {isMe && !isActive && <span className="text-dark-600 ml-1">(you)</span>}
        </span>
        {isActive && (
          <span className="text-[10px] text-dark-500">active</span>
        )}
      </div>
    </div>
  );
}
