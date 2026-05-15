"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Lighting() {
  return (
    <>
      <ambientLight intensity={0.15} color="#1a1a3a" />
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.4}
        color="#4466aa"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <directionalLight
        position={[-5, 8, -5]}
        intensity={0.15}
        color="#aa4444"
      />
      <pointLight position={[0, 3, 0]} intensity={0.3} color="#4466aa" />
      <pointLight position={[3, 1, 3]} intensity={0.1} color="#ff8844" />
      <pointLight position={[-3, 1, -3]} intensity={0.1} color="#ff8844" />
      <hemisphereLight
        args={["#1a1a3a", "#0a0a12", 0.3]}
      />
    </>
  );
}

export function Fog() {
  return (
    <fog attach="fog" args={["#0a0a12", 8, 18]} />
  );
}

export function AmbientParticles({ count = 300 }: { count?: number }) {
  const meshRef = useRef<THREE.Points>(null);

  const [positions, sizes] = React.useMemo(() => {
    const pos = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = Math.random() * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
      siz[i] = Math.random() * 0.03 + 0.01;
    }
    return [pos, siz];
  }, [count]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 1] += delta * 0.05;
      if (positions[i * 3 + 1] > 8) positions[i * 3 + 1] = 0;
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#aaaacc"
        transparent
        opacity={0.3}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function FireEmbers({ count = 50 }: { count?: number }) {
  const meshRef = useRef<THREE.Points>(null);

  const [positions, velocities] = React.useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.5;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = Math.random() * 0.5;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
      vel[i] = Math.random() * 0.5 + 0.2;
    }
    return [pos, vel];
  }, [count]);

  const velRef = useRef(velocities);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 1] += delta * velRef.current[i];
      positions[i * 3] += delta * (Math.random() - 0.5) * 0.1;
      positions[i * 3 + 2] += delta * (Math.random() - 0.5) * 0.1;
      if (positions[i * 3 + 1] > 1.5) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 0.3;
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = Math.sin(angle) * radius;
      }
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#ff6622"
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function Torch({ position }: { position: [number, number, number] }) {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((_) => {
    if (!lightRef.current) return;
    lightRef.current.intensity = 0.3 + Math.sin(Date.now() * 0.005) * 0.1;
  });

  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.02, 0.04, 0.3, 6]} />
        <meshStandardMaterial color="#3a2a1a" />
      </mesh>
      <pointLight
        ref={lightRef}
        position={[0, 0.5, 0]}
        intensity={0.4}
        color="#ff8844"
        distance={3}
        decay={2}
      />
      <FireEmbers count={20} />
    </group>
  );
}

export function Torches() {
  const torchPositions: [number, number, number][] = [
    [-4.5, -0.2, -4.5],
    [4.5, -0.2, -4.5],
    [-4.5, -0.2, 4.5],
    [4.5, -0.2, 4.5],
    [0, -0.2, -5.5],
    [0, -0.2, 5.5],
  ];

  return (
    <>
      {torchPositions.map((pos, i) => (
        <Torch key={i} position={pos} />
      ))}
    </>
  );
}
