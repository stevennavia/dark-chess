"use client";

import React, { useState } from "react";
import { GameCanvas } from "@/components/GameCanvas";
import { Lobby } from "@/components/UI/Lobby";
import { GameUI } from "@/components/UI/GameUI";
import { useGameStore } from "@/store/gameStore";
import { multiplayer } from "@/network/multiplayer";

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);
  const { phase, connectionStatus } = useGameStore();

  const handleGameStart = () => {
    setGameStarted(true);
  };

  return (
    <main className="relative w-full h-screen overflow-hidden">
      <GameCanvas />
      {!gameStarted && <Lobby onGameStart={handleGameStart} />}
      <GameUI />
    </main>
  );
}
