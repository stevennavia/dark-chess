"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";

const BOARD_SIZE = 8;
const TILE_SIZE = 1;
const BOARD_OFFSET = (BOARD_SIZE - 1) * TILE_SIZE / 2;
const TILE_HEIGHT = 0.15;
const BOARD_THICKNESS = 0.5;

interface BoardProps {
  selectedSquare: string | null;
  validMoves: string[];
  lastMove: { from: string; to: string } | null;
}

function squareToPos(square: string): { x: number; z: number } {
  const file = square.charCodeAt(0) - 97;
  const rank = 8 - parseInt(square[1]);
  return { x: file - 3.5, z: rank - 3.5 };
}

function isLightTile(row: number, col: number): boolean {
  return (row + col) % 2 === 0;
}

function Tile({ row, col, isValidMove, isSelected, isLastMove, isCheckSquare }: {
  row: number; col: number;
  isValidMove: boolean; isSelected: boolean;
  isLastMove: boolean; isCheckSquare: boolean;
}) {
  const x = col - 3.5;
  const z = row - 3.5;
  const isLight = isLightTile(row, col);

  const baseColor = isLight ? "#3a3a4a" : "#1a1a2a";
  const selectedColor = "#c9a84c";
  const validMoveColor = "rgba(201, 168, 76, 0.15)";
  const lastMoveColor = "rgba(201, 168, 76, 0.08)";
  const checkColor = "rgba(200, 0, 0, 0.4)";

  let color = baseColor;
  if (isCheckSquare) color = checkColor;
  else if (isSelected) color = selectedColor;
  else if (isLastMove) color = lastMoveColor;

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, -TILE_HEIGHT / 2, 0]} receiveShadow>
        <boxGeometry args={[TILE_SIZE * 0.98, TILE_HEIGHT, TILE_SIZE * 0.98]} />
        <meshStandardMaterial
          color={color}
          roughness={isLight ? 0.7 : 0.9}
          metalness={isLight ? 0.1 : 0.3}
        />
      </mesh>
      {isValidMove && (
        <mesh position={[0, 0.01, 0]}>
          <circleGeometry args={[0.15, 16]} />
          <meshBasicMaterial
            color="#c9a84c"
            transparent
            opacity={0.5}
          />
        </mesh>
      )}
      {isCheckSquare && (
        <mesh position={[0, 0.01, 0]}>
          <ringGeometry args={[0.2, 0.35, 24]} />
          <meshBasicMaterial
            color="#ff0000"
            transparent
            opacity={0.6}
          />
        </mesh>
      )}
    </group>
  );
}

export function Board({ selectedSquare, validMoves, lastMove }: BoardProps) {
  const validMoveSquares = useMemo(() => new Set(validMoves), [validMoves]);

  const tiles = useMemo(() => {
    const result = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const file = String.fromCharCode(97 + col);
        const rank = String(8 - row);
        const square = `${file}${rank}`;
        result.push(
          <Tile
            key={square}
            row={row}
            col={col}
            isValidMove={validMoveSquares.has(square)}
            isSelected={selectedSquare === square}
            isLastMove={lastMove?.from === square || lastMove?.to === square}
            isCheckSquare={false}
          />
        );
      }
    }
    return result;
  }, [validMoveSquares, selectedSquare, lastMove]);

  return (
    <group position={[0, -0.25, 0]}>
      <group>
        {tiles}
      </group>
      <group position={[0, -BOARD_THICKNESS / 2, 0]}>
        <mesh position={[0, -0.3, 0]} receiveShadow>
          <boxGeometry args={[8.8, 0.2, 8.8]} />
          <meshStandardMaterial color="#0a0a12" roughness={1} metalness={0} />
        </mesh>
      </group>
      <group position={[0, -BOARD_THICKNESS / 2, 0]}>
        {[-4.4, 4.4].map((x) =>
          [-4.4, 4.4].map((z) => (
            <mesh key={`corner-${x}-${z}`} position={[x, -0.2, z]}>
              <boxGeometry args={[0.3, 0.8, 0.3]} />
              <meshStandardMaterial color="#2a2a3a" metalness={0.5} roughness={0.5} />
            </mesh>
          ))
        )}
      </group>
    </group>
  );
}
