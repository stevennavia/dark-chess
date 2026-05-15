"use client";

import React, { useRef, useMemo, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Chess } from "chess.js";
import * as THREE from "three";

import { Board } from "./Board";
import { Piece } from "./Piece";
import { Scene } from "./Scene";
import { Lighting, Fog, AmbientParticles, Torches } from "./Atmosphere";
import { useGameStore } from "@/store/gameStore";
import { multiplayer } from "@/network/multiplayer";
import { fenToPieces, squareToPosition } from "@/utils/chess";
import { PlayerColor } from "@/types";

function CameraController() {
  const { camera } = useThree();
  const targetRef = useRef({ x: 0, y: 4.5, z: 6.5 });

  useFrame(() => {
    camera.position.lerp(
      new THREE.Vector3(targetRef.current.x, targetRef.current.y, targetRef.current.z),
      0.05
    );
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function Pieces() {
  const { fen, selectedSquare, myColor } = useGameStore();
  const pieces = useMemo(() => fenToPieces(fen), [fen]);

  return (
    <group>
      {pieces.map((piece) => {
        const pos = squareToPosition(piece.square);
        const isSelected = piece.square === selectedSquare;
        const color = piece.color === "w" ? "w" : "b";
        return (
          <Piece
            key={`${piece.square}-${piece.type}-${piece.color}`}
            type={piece.type}
            color={color}
            position={[pos.x, 0.35, pos.z]}
            isSelected={isSelected}
            isAnimating={false}
          />
        );
      })}
    </group>
  );
}

function ClickHandler({ onSquareClick }: { onSquareClick: (square: string) => void }) {
  const { camera, raycaster, pointer, scene } = useThree();

  const handleClick = useCallback(() => {
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
      const point = intersects[0].point;
      const x = Math.round(point.x + 3.5);
      const z = Math.round(point.z + 3.5);
      if (x >= 0 && x <= 7 && z >= 0 && z <= 7) {
        const file = String.fromCharCode(97 + x);
        const rank = String(8 - z);
        onSquareClick(`${file}${rank}`);
      }
    }
  }, [camera, raycaster, pointer, scene, onSquareClick]);

  useFrame(() => {
    if (window.__chessClickPending) {
      window.__chessClickPending = false;
      handleClick();
    }
  });

  return null;
}

declare global {
  interface Window { __chessClickPending: boolean; }
}

export function GameCanvas() {
  const {
    fen,
    selectedSquare,
    validMoves,
    lastMove,
    myColor,
    phase,
    selectSquare,
    setValidMoves,
  } = useGameStore();

  const chessRef = useRef<Chess>(new Chess());

  useEffect(() => {
    try {
      chessRef.current.load(fen);
    } catch { }
  }, [fen]);

  const getMovesForSquare = useCallback((sq: string): string[] => {
    try {
      const chess = chessRef.current;
      const moves = chess.moves({ square: sq, verbose: true });
      return moves.map((m: any) => m.to);
    } catch {
      return [];
    }
  }, []);

  const onSquareClick = useCallback((square: string) => {
    if (phase === "waiting" || phase === "checkmate" || phase === "stalemate" || phase === "draw") return;

    const pieces = fenToPieces(fen);
    const myColorCode = myColor === PlayerColor.WHITE ? "w" : "b";
    const clickedPiece = pieces.find(
      (p) => p.square === square && p.color === myColorCode
    );

    if (selectedSquare) {
      if (square === selectedSquare) {
        selectSquare(null);
        setValidMoves([]);
        return;
      }

      const isValid = validMoves.includes(square);
      if (isValid) {
        multiplayer.sendMove(selectedSquare, square);
        selectSquare(null);
        setValidMoves([]);
        return;
      }

      if (clickedPiece) {
        selectSquare(square);
        const moves = getMovesForSquare(square);
        setValidMoves(moves);
        return;
      }

      selectSquare(null);
      setValidMoves([]);
      return;
    }

    if (clickedPiece) {
      selectSquare(square);
      const moves = getMovesForSquare(square);
      setValidMoves(moves);
    }
  }, [fen, selectedSquare, validMoves, myColor, phase, selectSquare, setValidMoves, getMovesForSquare]);

  return (
    <Canvas
      shadows
      camera={{
        position: [0, 4.5, 6.5],
        fov: 45,
        near: 0.1,
        far: 100,
      }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
      }}
      onPointerDown={() => {
        window.__chessClickPending = true;
      }}
      style={{ background: "#0a0a12" }}
    >
      <Fog />
      <Lighting />
      <CameraController />
      <ClickHandler onSquareClick={onSquareClick} />
      <Scene />
      <Board
        selectedSquare={selectedSquare}
        validMoves={validMoves}
        lastMove={lastMove}
      />
      <Pieces />
      <Torches />
      <AmbientParticles count={400} />
    </Canvas>
  );
}
