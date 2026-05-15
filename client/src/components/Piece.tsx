"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface PieceProps {
  type: string;
  color: "w" | "b";
  position: [number, number, number];
  isSelected: boolean;
  isAnimating: boolean;
}

function PawnGeometry({ isWhite }: { isWhite: boolean }) {
  const baseColor = isWhite ? "#c0c0d0" : "#1a1a2e";
  const accentColor = isWhite ? "#e8e0d0" : "#2a1a1a";

  return (
    <group>
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 0.2, 8]} />
        <meshStandardMaterial color={baseColor} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.3, 0]} castShadow>
        <sphereGeometry args={[0.18, 8, 6]} />
        <meshStandardMaterial color={baseColor} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.35, 0]} castShadow>
        <sphereGeometry args={[0.08, 6, 4]} />
        <meshStandardMaterial color={accentColor} metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

function RookGeometry({ isWhite }: { isWhite: boolean }) {
  const baseColor = isWhite ? "#b0b0c0" : "#1a1a2e";
  const accentColor = isWhite ? "#d4c8a0" : "#3a2a2a";

  return (
    <group>
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.35, 0.3, 8]} />
        <meshStandardMaterial color={baseColor} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.25, 0.2, 8]} />
        <meshStandardMaterial color={baseColor} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[0.35, 0.1, 0.35]} />
        <meshStandardMaterial color={accentColor} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.15, 0.6, 0]} castShadow>
        <boxGeometry args={[0.06, 0.15, 0.06]} />
        <meshStandardMaterial color={accentColor} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-0.15, 0.6, 0]} castShadow>
        <boxGeometry args={[0.06, 0.15, 0.06]} />
        <meshStandardMaterial color={accentColor} metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

function KnightGeometry({ isWhite }: { isWhite: boolean }) {
  const baseColor = isWhite ? "#a0a0b8" : "#1a1a2e";
  const accentColor = isWhite ? "#c8b888" : "#4a1a1a";

  return (
    <group>
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.32, 0.3, 8]} />
        <meshStandardMaterial color={baseColor} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 0.15, 8]} />
        <meshStandardMaterial color={baseColor} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.45, 0.1]} rotation={[0.3, 0, 0]} castShadow>
        <coneGeometry args={[0.15, 0.2, 6]} />
        <meshStandardMaterial color={accentColor} metalness={0.7} roughness={0.2} />
      </mesh>
      <pointLight position={[0, 0.5, 0.2]} intensity={isWhite ? 0.1 : 0.05} color={isWhite ? "#aaccff" : "#ff2222"} />
    </group>
  );
}

function BishopGeometry({ isWhite }: { isWhite: boolean }) {
  const baseColor = isWhite ? "#c8c8d8" : "#1a1a2e";
  const accentColor = isWhite ? "#d4c090" : "#3a1a2a";
  const robeColor = isWhite ? "#e0d8c8" : "#2a1a2a";

  return (
    <group>
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.35, 0.24, 8]} />
        <meshStandardMaterial color={robeColor} metalness={0.3} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.32, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.22, 0.2, 8]} />
        <meshStandardMaterial color={baseColor} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.5, 0]} castShadow>
        <coneGeometry args={[0.12, 0.2, 8]} />
        <meshStandardMaterial color={baseColor} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.55, 0]} castShadow>
        <sphereGeometry args={[0.06, 6, 4]} />
        <meshStandardMaterial color={accentColor} metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

function QueenGeometry({ isWhite }: { isWhite: boolean }) {
  const baseColor = isWhite ? "#d0d0e0" : "#1a1a2e";
  const accentColor = isWhite ? "#e8d8a8" : "#4a1a2a";
  const gemColor = isWhite ? "#4488ff" : "#ff2244";

  return (
    <group>
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.38, 0.3, 8]} />
        <meshStandardMaterial color={baseColor} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.25, 0.2, 8]} />
        <meshStandardMaterial color={baseColor} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.55, 0]} castShadow>
        <coneGeometry args={[0.16, 0.25, 8]} />
        <meshStandardMaterial color={baseColor} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.65, 0]} castShadow>
        <sphereGeometry args={[0.07, 6, 4]} />
        <meshStandardMaterial color={gemColor} metalness={0.9} roughness={0.1} emissive={gemColor} emissiveIntensity={0.3} />
      </mesh>
      {[-0.12, 0.12].map((x) => (
        <mesh key={x} position={[x, 0.6, 0]} castShadow>
          <boxGeometry args={[0.04, 0.12, 0.04]} />
          <meshStandardMaterial color={accentColor} metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      <pointLight position={[0, 0.7, 0]} intensity={isWhite ? 0.2 : 0.1} color={isWhite ? "#ffffff" : "#ff4444"} />
    </group>
  );
}

function KingGeometry({ isWhite }: { isWhite: boolean }) {
  const baseColor = isWhite ? "#d8d8e8" : "#1a1a2e";
  const accentColor = isWhite ? "#e8d8a8" : "#4a2a1a";
  const crownColor = isWhite ? "#e8c86a" : "#6a3a1a";
  const gemColor = isWhite ? "#4488ff" : "#ff2244";

  return (
    <group>
      <mesh position={[0, 0.18, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 0.35, 8]} />
        <meshStandardMaterial color={baseColor} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.28, 0.2, 8]} />
        <meshStandardMaterial color={baseColor} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.58, 0]} castShadow>
        <coneGeometry args={[0.18, 0.2, 8]} />
        <meshStandardMaterial color={crownColor} metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.72, 0]} castShadow>
        <boxGeometry args={[0.04, 0.18, 0.04]} />
        <meshStandardMaterial color={accentColor} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.78, 0]} castShadow>
        <sphereGeometry args={[0.06, 6, 4]} />
        <meshStandardMaterial color={gemColor} metalness={0.9} roughness={0.1} emissive={gemColor} emissiveIntensity={0.4} />
      </mesh>
      <pointLight position={[0, 0.7, 0]} intensity={isWhite ? 0.3 : 0.15} color={isWhite ? "#ffddaa" : "#ff4444"} />
    </group>
  );
}

const pieceComponents: Record<string, React.FC<{ isWhite: boolean }>> = {
  P: PawnGeometry,
  R: RookGeometry,
  N: KnightGeometry,
  B: BishopGeometry,
  Q: QueenGeometry,
  K: KingGeometry,
};

export function Piece({ type, color, position, isSelected, isAnimating }: PieceProps) {
  const groupRef = useRef<THREE.Group>(null);
  const isWhite = color === "w";
  const Component = pieceComponents[type];
  const targetY = position[1];

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (isAnimating) return;

    groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.1;

    if (isSelected) {
      groupRef.current.position.y = targetY + 0.15 + Math.sin(Date.now() * 0.003) * 0.05;
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  if (!Component) return null;

  const floatY = isSelected ? targetY + 0.15 : targetY;

  return (
    <group
      ref={groupRef}
      position={[position[0], floatY, position[2]]}
    >
      <Component isWhite={isWhite} />
    </group>
  );
}
