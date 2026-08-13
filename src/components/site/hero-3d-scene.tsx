"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import type { Group } from "three";

// Same hex approximations already documented in DESIGN.md > Colors for
// SF Teal / SF Lime — three.js materials need literal hex, not CSS vars.
const TEAL = "#0e5865";
const LIME = "#bccd0f";
const INK = "#0a0a0a";

const TARGET_FPS = 30;

/** Nothing renders in this Canvas unless invalidate() is called — this loop
 * is the only thing calling it, at a capped interval, and only while the
 * hero is actually in view. No interval running = zero render calls. */
function RenderLoop({ isActive }: { isActive: boolean }) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    if (!isActive) return;

    invalidate();
    const interval = setInterval(() => invalidate(), 1000 / TARGET_FPS);
    return () => clearInterval(interval);
  }, [isActive, invalidate]);

  return null;
}

type FloatingObjectConfig = {
  position: [number, number, number];
  scale: number;
  rotationSpeed: number;
};

function PadelBall({ position, scale, rotationSpeed }: FloatingObjectConfig) {
  const groupRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * rotationSpeed;
    groupRef.current.rotation.x += delta * rotationSpeed * 0.4;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.6}>
      <group ref={groupRef} position={position} scale={scale}>
        <mesh>
          <sphereGeometry args={[0.5, 20, 20]} />
          <meshStandardMaterial
            color={LIME}
            roughness={0.6}
            emissive={LIME}
            emissiveIntensity={0.25}
          />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.5, 0.015, 8, 32]} />
          <meshBasicMaterial color={INK} transparent opacity={0.35} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.5, 0.015, 8, 32]} />
          <meshBasicMaterial color={INK} transparent opacity={0.35} />
        </mesh>
      </group>
    </Float>
  );
}

function Paddle({ position, scale, rotationSpeed }: FloatingObjectConfig) {
  const groupRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * rotationSpeed;
    groupRef.current.rotation.z += delta * rotationSpeed * 0.3;
  });

  return (
    <Float speed={1} rotationIntensity={0.25} floatIntensity={0.5}>
      <group ref={groupRef} position={position} scale={scale}>
        <mesh position={[0, 0.5, 0]} scale={[1, 1.25, 0.22]}>
          <sphereGeometry args={[0.5, 20, 20]} />
          <meshStandardMaterial
            color={TEAL}
            roughness={0.4}
            emissive={TEAL}
            emissiveIntensity={0.4}
          />
        </mesh>
        <mesh position={[0, -0.35, 0]}>
          <cylinderGeometry args={[0.055, 0.07, 0.55, 10]} />
          <meshStandardMaterial
            color={TEAL}
            roughness={0.4}
            emissive={TEAL}
            emissiveIntensity={0.4}
          />
        </mesh>
      </group>
    </Float>
  );
}

// Depth spread: nearer objects (less negative z) are scaled up, farther
// ones scaled down, so the group reads as occupying real space rather than
// sitting flat on one plane.
const BALLS: FloatingObjectConfig[] = [
  { position: [-3.2, 1.2, -2], scale: 1.1, rotationSpeed: 0.5 },
  { position: [2.8, -0.8, -5], scale: 0.7, rotationSpeed: 0.35 },
  { position: [-1.5, -1.6, -7], scale: 0.5, rotationSpeed: 0.4 },
  { position: [3.6, 1.8, -4], scale: 0.85, rotationSpeed: 0.45 },
];

const PADDLES: FloatingObjectConfig[] = [
  { position: [1.4, 1.5, -3], scale: 1, rotationSpeed: 0.3 },
  { position: [-3, -1.2, -6], scale: 0.65, rotationSpeed: 0.25 },
  { position: [0.2, -1.9, -4.5], scale: 0.8, rotationSpeed: 0.28 },
];

function Scene({ isActive }: { isActive: boolean }) {
  return (
    <>
      <RenderLoop isActive={isActive} />
      <ambientLight intensity={0.85} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} color={LIME} />
      <directionalLight position={[-4, -2, 3]} intensity={0.6} color={TEAL} />
      {BALLS.map((config, index) => (
        <PadelBall key={`ball-${index}`} {...config} />
      ))}
      {PADDLES.map((config, index) => (
        <Paddle key={`paddle-${index}`} {...config} />
      ))}
    </>
  );
}

export function Hero3DScene({ isActive }: { isActive: boolean }) {
  return (
    <Canvas
      dpr={[1, 2]}
      frameloop="demand"
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 0, 6], fov: 45 }}
      style={{ width: "100%", height: "100%" }}
    >
      <Scene isActive={isActive} />
    </Canvas>
  );
}
