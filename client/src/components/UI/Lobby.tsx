"use client";

import React, { useState, useEffect } from "react";
import { useGameStore } from "@/store/gameStore";
import { multiplayer } from "@/network/multiplayer";
import { GamePhase, PlayerColor } from "@/types";

export function Lobby({ onGameStart }: { onGameStart: () => void }) {
  const { setMyInfo, setRoomId, setConnectionStatus, playerName, setPlayerName, connectionStatus } = useGameStore();
  const [roomIdInput, setRoomIdInput] = useState("");
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    multiplayer.setHandlers({
      onPlayerAssigned: (data) => {
        setMyInfo(data.id, data.color, data.name);
      },
      onGameStart: () => {
        setConnectionStatus("connected");
        setIsJoining(false);
        onGameStart();
      },
      onPlayersUpdate: (data) => {
        const players = data.players;
        if (players.length === 2) {
          setConnectionStatus("connected");
        }
      },
      onStateUpdate: (state) => {
        if (state.phase && state.phase !== GamePhase.WAITING) {
          onGameStart();
        }
      },
    });
  }, []);

  const handleCreate = async () => {
    try {
      setError("");
      setIsJoining(true);
      setConnectionStatus("connecting");
      const roomId = await multiplayer.createRoom(playerName || undefined);
      setCurrentRoomId(roomId);
      setRoomId(roomId);
      localStorage.setItem(`chess_player_${roomId}`, multiplayer.getSessionId() || "");
    } catch (e: any) {
      setError(e.message || "Failed to create room");
      setIsJoining(false);
      setConnectionStatus("disconnected");
    }
  };

  const handleJoin = async () => {
    if (!roomIdInput.trim()) {
      setError("Enter a room code");
      return;
    }
    try {
      setError("");
      setIsJoining(true);
      setConnectionStatus("connecting");
      await multiplayer.joinRoom(roomIdInput.trim(), playerName || undefined);
      setCurrentRoomId(roomIdInput.trim());
      setRoomId(roomIdInput.trim());
    } catch (e: any) {
      setError(e.message || "Failed to join room");
      setIsJoining(false);
      setConnectionStatus("disconnected");
    }
  };

  const handleJoinOrCreate = async () => {
    try {
      setError("");
      setIsJoining(true);
      setConnectionStatus("connecting");
      const roomId = await multiplayer.joinOrCreate(playerName || undefined);
      setCurrentRoomId(roomId);
      setRoomId(roomId);
      localStorage.setItem(`chess_player_${roomId}`, multiplayer.getSessionId() || "");
    } catch (e: any) {
      setError(e.message || "Failed to find or create room");
      setIsJoining(false);
      setConnectionStatus("disconnected");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900">
      <div className="relative w-full max-w-md p-8 mx-4">
        <div className="absolute inset-0 bg-dark-800/80 backdrop-blur-sm rounded-lg border border-dark-600" />
        <div className="relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-gothic text-gold tracking-widest">DARK CHESS</h1>
            <p className="text-sm text-dark-500 font-medieval tracking-wider">A Cursed Ritual Battle</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-dark-500 mb-1 tracking-wider uppercase">Your Name</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name..."
                maxLength={20}
                className="w-full px-4 py-2 bg-dark-900 border border-dark-600 text-gray-300 placeholder-dark-500 rounded focus:outline-none focus:border-gold transition-colors text-sm"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={isJoining}
                className="flex-1 px-4 py-2 bg-gold/20 border border-gold/40 text-gold rounded hover:bg-gold/30 disabled:opacity-50 transition-all text-sm tracking-wider"
              >
                {isJoining && !currentRoomId ? "Creating..." : "Create Room"}
              </button>
              <button
                onClick={handleJoinOrCreate}
                disabled={isJoining}
                className="flex-1 px-4 py-2 bg-dark-700 border border-dark-500 text-gray-300 rounded hover:bg-dark-600 disabled:opacity-50 transition-all text-sm tracking-wider"
              >
                {isJoining ? "Searching..." : "Quick Play"}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dark-600" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-dark-800 text-dark-500">or join existing</span>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
                placeholder="Room code..."
                className="flex-1 px-4 py-2 bg-dark-900 border border-dark-600 text-gray-300 placeholder-dark-500 rounded focus:outline-none focus:border-gold transition-colors text-sm"
              />
              <button
                onClick={handleJoin}
                disabled={isJoining || !roomIdInput.trim()}
                className="px-4 py-2 bg-dark-700 border border-dark-500 text-gray-300 rounded hover:bg-dark-600 disabled:opacity-50 transition-all text-sm"
              >
                Join
              </button>
            </div>
          </div>

          {currentRoomId && (
            <div className="text-center space-y-2">
              <p className="text-xs text-dark-500">Room Code</p>
              <p className="text-2xl font-mono text-gold tracking-widest">{currentRoomId}</p>
              <p className="text-xs text-dark-500 animate-pulse">Waiting for opponent...</p>
            </div>
          )}

          {error && (
            <p className="text-center text-blood text-xs">{error}</p>
          )}

          {connectionStatus === "connecting" && !currentRoomId && (
            <div className="flex justify-center">
              <div className="w-5 h-5 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
