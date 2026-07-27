import { useRef } from "react";
import type { RefObject } from "react";
import { useFrame } from "@react-three/fiber";

type CameraControllerProps = {
  /** True once the intro is dismissed — triggers the gentle zoom-in. */
  started: boolean;
  /** Disables pointer-driven parallax on small/touch screens. */
  isMobile: boolean;
  /** Reduces movement while a dialog is open. */
  pausedRef: RefObject<boolean>;
};

/**
 * Subtle, readable camera motion:
 *  - eases the camera toward the heart when the experience starts, and
 *  - adds a small pointer-driven parallax on desktop (disabled on mobile).
 * All movement is interpolated so text stays comfortable to read.
 */
export default function CameraController({
  started,
  isMobile,
  pausedRef,
}: CameraControllerProps) {
  const target = useRef({ x: 0, y: 0, z: 22 });

  useFrame((state, delta) => {
    const camera = state.camera;
    const smoothing = Math.min(delta * 2.2, 1);

    const parallax = isMobile ? 0 : pausedRef.current ? 0.4 : 1.6;

    target.current.z = started ? 18 : 22;
    target.current.x = state.pointer.x * parallax;
    target.current.y = state.pointer.y * parallax;

    camera.position.x += (target.current.x - camera.position.x) * smoothing;
    camera.position.y += (target.current.y - camera.position.y) * smoothing;
    camera.position.z += (target.current.z - camera.position.z) * smoothing;

    camera.lookAt(0, 0, 0);
  });

  return null;
}
