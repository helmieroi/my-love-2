import { memo, useEffect, useMemo, useRef } from "react";
import type { RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

type HeartPathProps = {
  /** Heart outline as flat [x, y, z] tuples. */
  points: [number, number, number][];
  /** When true, the breathing animation slows right down. */
  pausedRef: RefObject<boolean>;
};

/** Soft radial texture used for the bloom-like glow behind the heart. */
function createGlowTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );
    gradient.addColorStop(0, "rgba(225,29,72,0.55)");
    gradient.addColorStop(0.5, "rgba(190,18,60,0.18)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * The glowing heart outline. A wide soft line + a crisp bright line give a
 * faux-bloom edge, and a radial glow sprite sits behind it. The whole group
 * gently "breathes" (scale + glow + micro-rotation) via `useFrame`.
 */
function HeartPath({ points, pausedRef }: HeartPathProps) {
  const groupRef = useRef<THREE.Group>(null);
  const glowMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const timeRef = useRef(0);

  const glowTexture = useMemo(() => createGlowTexture(), []);

  useEffect(() => {
    return () => glowTexture.dispose();
  }, [glowTexture]);

  useFrame((_, delta) => {
    const speed = pausedRef.current ? 0.25 : 1;
    timeRef.current += delta * speed;
    const t = timeRef.current;
    const breathe = Math.sin(t * 0.8); // -1 .. 1

    const group = groupRef.current;
    if (group) {
      const scale = 1 + breathe * 0.035;
      group.scale.set(scale, scale, scale);
      group.rotation.z = Math.sin(t * 0.35) * 0.03;
    }

    if (glowMaterialRef.current) {
      glowMaterialRef.current.opacity = 0.3 + (breathe * 0.5 + 0.5) * 0.35;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Bloom-like glow behind the outline */}
      <mesh position={[0, 0, -0.6]} scale={[13, 13, 1]}>
        <circleGeometry args={[1, 64]} />
        <meshBasicMaterial
          ref={glowMaterialRef}
          map={glowTexture}
          transparent
          opacity={0.4}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Wide, soft outer stroke */}
      <Line
        points={points}
        color="#fb7185"
        lineWidth={5}
        transparent
        opacity={0.35}
      />

      {/* Crisp, bright inner stroke */}
      <Line
        points={points}
        color="#ffe4ec"
        lineWidth={1.6}
        transparent
        opacity={0.95}
      />
    </group>
  );
}

export default memo(HeartPath);
