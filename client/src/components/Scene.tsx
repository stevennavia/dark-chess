"use client";

import React, { useMemo } from "react";
import * as THREE from "three";

function Pillar({ position, height = 6 }: { position: [number, number, number]; height?: number }) {
  return (
    <group position={position}>
      <mesh position={[0, height / 2 - 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, height, 8]} />
        <meshStandardMaterial
          color="#2a2a3a"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[0, height - 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.35, 0.3, 8]} />
        <meshStandardMaterial
          color="#3a3a4a"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
      <mesh position={[0, -0.3, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.6, 0.3, 8]} />
        <meshStandardMaterial
          color="#1a1a2a"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}

function Arch({ position, scale = 1, rotationY = 0 }: { position: [number, number, number]; scale?: number; rotationY?: number }) {
  return (
    <group position={position} scale={scale} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 3, 0]} castShadow>
        <torusGeometry args={[2, 0.15, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#2a2a3a" roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh position={[-2, 1.5, 0]} castShadow>
        <boxGeometry args={[0.2, 3, 0.2]} />
        <meshStandardMaterial color="#2a2a3a" roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh position={[2, 1.5, 0]} castShadow>
        <boxGeometry args={[0.2, 3, 0.2]} />
        <meshStandardMaterial color="#2a2a3a" roughness={0.9} metalness={0.1} />
      </mesh>
    </group>
  );
}

function Statue({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 0.8, 8]} />
        <meshStandardMaterial color="#3a3a4a" roughness={0.8} metalness={0.2} />
      </mesh>
      <mesh position={[0, 2.2, 0]} castShadow>
        <sphereGeometry args={[0.25, 6, 6]} />
        <meshStandardMaterial color="#4a4a5a" roughness={0.7} metalness={0.3} />
      </mesh>
      <mesh position={[0, 2.6, 0]} castShadow>
        <coneGeometry args={[0.15, 0.4, 6]} />
        <meshStandardMaterial color="#4a4a5a" roughness={0.7} metalness={0.3} />
      </mesh>
      <mesh position={[-0.25, 1.8, 0]} rotation={[0, 0, -0.3]} castShadow>
        <boxGeometry args={[0.1, 0.5, 0.1]} />
        <meshStandardMaterial color="#3a3a4a" roughness={0.8} metalness={0.2} />
      </mesh>
      <mesh position={[0.25, 1.8, 0]} rotation={[0, 0, 0.3]} castShadow>
        <boxGeometry args={[0.1, 0.5, 0.1]} />
        <meshStandardMaterial color="#3a3a4a" roughness={0.8} metalness={0.2} />
      </mesh>
    </group>
  );
}

function RuinedWall({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[3, 3, 0.3]} />
        <meshStandardMaterial color="#2a2a38" roughness={0.95} metalness={0.05} />
      </mesh>
      <mesh position={[-1, 0.8, 0]} castShadow>
        <boxGeometry args={[1.5, 0.3, 0.35]} />
        <meshStandardMaterial color="#222230" roughness={0.95} metalness={0.05} />
      </mesh>
      <mesh position={[0.5, 2.2, 0]} castShadow>
        <boxGeometry args={[0.8, 0.3, 0.35]} />
        <meshStandardMaterial color="#222230" roughness={0.95} metalness={0.05} />
      </mesh>
    </group>
  );
}

export function Scene() {
  const pillars = useMemo(() => {
    const positions: [number, number, number][] = [];
    const dist = 7;
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      positions.push([Math.cos(angle) * dist, -0.5, Math.sin(angle) * dist]);
    }
    return positions;
  }, []);

  return (
    <group>
      <mesh position={[0, -0.8, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial
          color="#0a0a12"
          roughness={1}
          metalness={0}
        />
      </mesh>

      {pillars.map((pos, i) => (
        <Pillar key={i} position={pos} height={6 + Math.sin(i) * 2} />
      ))}

      <Arch position={[0, -0.5, -7]} scale={1.2} />
      <Arch position={[0, -0.5, 7]} scale={1.2} rotationY={Math.PI} />

      <Statue position={[-5, -0.5, -5]} scale={1.3} />
      <Statue position={[5, -0.5, -5]} scale={1.3} />
      <Statue position={[-5, -0.5, 5]} scale={1.1} />
      <Statue position={[5, -0.5, 5]} scale={1.1} />

      <RuinedWall position={[-8, -0.5, -3]} rotation={1.2} />
      <RuinedWall position={[8, -0.5, -3]} rotation={-1.2} />
      <RuinedWall position={[-8, -0.5, 3]} rotation={1.5} />
      <RuinedWall position={[8, -0.5, 3]} rotation={-1.5} />
    </group>
  );
}
