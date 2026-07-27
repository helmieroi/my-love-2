import { memo, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type BackgroundParticlesProps = {
  /** Number of glowing particles (kept low on mobile for performance). */
  count?: number;
};

/** Soft round glow sprite shared by every particle. */
function createDotTexture(): THREE.CanvasTexture {
  const size = 64;
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
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.35, "rgba(255,214,229,0.75)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Floating glowing dust particles. Geometry + material are created once and
 * shared; a single group is rotated slowly in `useFrame` (no per-frame state).
 */
function BackgroundParticles({ count = 600 }: BackgroundParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 6 + Math.random() * 22;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.7;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 24 - 4;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.2,
      map: createDotTexture(),
      color: new THREE.Color("#fb7185"),
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    return { geometry: geo, material: mat };
  }, [count]);

  // Dispose GPU resources when unmounting or when count changes.
  useEffect(() => {
    return () => {
      geometry.dispose();
      material.map?.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((_, delta) => {
    const group = pointsRef.current;
    if (!group) return;
    group.rotation.z += delta * 0.02;
    group.rotation.y += delta * 0.01;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

export default memo(BackgroundParticles);
