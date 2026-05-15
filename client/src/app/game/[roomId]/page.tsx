"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { GameCanvas } from "@/components/GameCanvas";
import { GameUI } from "@/components/UI/GameUI";
import { useGameStore } from "@/store/gameStore";
import { multiplayer } from "@/network/multiplayer";
import { PlayerColor } from "@/types";

export default function GameRoom() {
  const params = useParams();
  const roomId = params?.roomId as string;
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const { setMyInfo, setRoomId, setConnectionStatus, playerName } = useGameStore();

  useEffect(() => {
    if (!roomId) return;

    const connect = async () => {
      try {
        setConnectionStatus("connecting");
        await multiplayer.connect();
        await multiplayer.reconnect(roomId, playerName || undefined);
        setConnected(true);
        setRoomId(roomId);
        setConnectionStatus("connected");
      } catch (e: any) {
        setError(e.message || "Failed to connect");
        setConnectionStatus("disconnected");
      }
    };

    multiplayer.setHandlers({
      onPlayerAssigned: (data) => {
        setMyInfo(data.id, data.color, data.name);
      },
    });

    connect();
  }, [roomId]);

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-dark-900">
        <div className="text-center space-y-4">
          <p className="text-blood text-lg">{error}</p>
          <a
            href="/"
            className="inline-block px-4 py-2 bg-gold/20 border border-gold/40 text-gold rounded hover:bg-gold/30 transition-all text-sm"
          >
            Back to Lobby
          </a>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-dark-900">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-gold/40 border-t-gold rounded-full animate-spin mx-auto" />
          <p className="text-dark-400 text-sm">Joining the ritual...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative w-full h-screen overflow-hidden">
      <GameCanvas />
      <GameUI />
    </main>
  );
}
