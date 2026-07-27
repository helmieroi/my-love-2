import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import type { RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { Poem } from "../types/poem";
import type { HeartCurve } from "../utils/heartCurve";

const TAU = Math.PI * 2;

type PoemTitleProps = {
  poem: Poem;
  index: number;
  total: number;
  curve: HeartCurve;
  /** Base traversal speed (progress per second). */
  baseSpeed: number;
  /** True while a dialog is open — slows all titles. */
  pausedRef: RefObject<boolean>;
  /** True once the intro has finished — reveals + enables the titles. */
  started: boolean;
  isMobile: boolean;
  onSelect: (poem: Poem) => void;
};

/**
 * A single poem title that continuously glides around the heart outline.
 *
 * Position is driven entirely through refs inside `useFrame` (no per-frame
 * React state). The label itself is real DOM (via drei <Html/>) so Arabic
 * shaping + RTL are handled correctly by the browser.
 */
function PoemTitle({
  poem,
  index,
  total,
  curve,
  baseSpeed,
  pausedRef,
  started,
  isMobile,
  onSelect,
}: PoemTitleProps) {
  const groupRef = useRef<THREE.Group>(null);
  const hoveredRef = useRef(false);

  // Even initial spacing around the loop.
  const offset = index / total;
  const progressRef = useRef(offset);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const paused = pausedRef.current;
    const hovered = hoveredRef.current;
    const factor = paused ? 0.12 : hovered ? 0.3 : 1;

    // Clamp delta so a tab-switch stall doesn't cause a sudden jump.
    const dt = Math.min(delta, 0.05);
    progressRef.current += dt * baseSpeed * factor;

    curve.sample(progressRef.current, tmp);
    const elapsed = state.clock.elapsedTime;
    const zFloat = Math.sin(elapsed * 0.6 + offset * TAU) * 0.6;

    group.position.set(tmp.x, tmp.y, zFloat);
  });

  const handleEnter = useCallback(() => {
    hoveredRef.current = true;
    document.body.style.cursor = "pointer";
  }, []);

  const handleLeave = useCallback(() => {
    hoveredRef.current = false;
    document.body.style.cursor = "default";
  }, []);

  const handleClick = useCallback(() => {
    onSelect(poem);
  }, [onSelect, poem]);

  // Safety cleanup: never leave the cursor stuck on unmount.
  useEffect(() => {
    return () => {
      document.body.style.cursor = "default";
    };
  }, []);

  return (
    <group ref={groupRef}>
      <Html
        center
        distanceFactor={isMobile ? 7 : 9}
        zIndexRange={[20, 0]}
        occlude={false}
        pointerEvents={started ? "auto" : "none"}
      >
        <span
          className="poem-label"
          dir="rtl"
          lang="ar"
          role="button"
          tabIndex={started ? 0 : -1}
          aria-label={`افتح قصيدة ${poem.title}`}
          onClick={handleClick}
          onPointerEnter={handleEnter}
          onPointerLeave={handleLeave}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleClick();
            }
          }}
          style={{
            opacity: started ? 1 : 0,
            pointerEvents: started ? "auto" : "none",
            transitionDelay: `${index * 0.08}s`,
            fontSize: isMobile ? "1.05rem" : "1.35rem",
          }}
        >
          {poem.title}
        </span>
      </Html>
    </group>
  );
}

export default memo(PoemTitle);
