import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { Poem } from "../types/poem";
import type { HeartCurve } from "../utils/heartCurve";

const TAU = Math.PI * 2;

/** Fade-out duration before a slot swaps to its next poem (matches CSS). */
const SWAP_FADE_MS = 450;

/**
 * Labels are centred on the curve, so half of a wide title hangs past it. On a
 * phone the outline sits close enough to the side edges that a long title would
 * clip, so the ring rides inside the heart there.
 *
 * The squeeze is mostly horizontal: a portrait screen has plenty of vertical
 * room, and clipping only ever happens left/right.
 */
const LABEL_INSET_X_MOBILE = 0.7;
const LABEL_INSET_Y_MOBILE = 0.9;

type PoemTitleProps = {
  /** The poem this orbit slot currently carries; may change over time. */
  poem: Poem;
  /** Slot position around the loop. */
  index: number;
  /** Number of slots orbiting simultaneously. */
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
 * A single orbit slot: a poem title that continuously glides around the heart.
 *
 * Slots are permanent — only the poem they carry rotates — so the motion stays
 * perfectly smooth while the scene cycles through the full collection. When the
 * `poem` prop changes the label fades out, swaps text, and fades back in.
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

  // The poem actually painted right now — trails `poem` by one fade.
  const [shown, setShown] = useState(poem);
  const [swapping, setSwapping] = useState(false);

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

    // The curve is centred on the origin, so scaling the sampled point pulls
    // the label toward the heart's middle.
    const insetX = isMobile ? LABEL_INSET_X_MOBILE : 1;
    const insetY = isMobile ? LABEL_INSET_Y_MOBILE : 1;
    group.position.set(tmp.x * insetX, tmp.y * insetY, zFloat);
  });

  // Cross-fade whenever this slot is handed a different poem.
  useEffect(() => {
    if (poem.id === shown.id) return;
    setSwapping(true);
    const timer = setTimeout(() => {
      setShown(poem);
      setSwapping(false);
    }, SWAP_FADE_MS);
    return () => clearTimeout(timer);
  }, [poem, shown.id]);

  // The staggered reveal is a one-off; afterwards fades must be immediate so
  // swapping titles don't lag behind by the stagger delay.
  const [introDone, setIntroDone] = useState(false);
  useEffect(() => {
    if (!started) {
      setIntroDone(false);
      return;
    }
    const timer = setTimeout(() => setIntroDone(true), index * 80 + 800);
    return () => clearTimeout(timer);
  }, [started, index]);

  const handleEnter = useCallback(() => {
    hoveredRef.current = true;
    document.body.style.cursor = "pointer";
  }, []);

  const handleLeave = useCallback(() => {
    hoveredRef.current = false;
    document.body.style.cursor = "default";
  }, []);

  const handleClick = useCallback(() => {
    onSelect(shown);
  }, [onSelect, shown]);

  // Safety cleanup: never leave the cursor stuck on unmount.
  useEffect(() => {
    return () => {
      document.body.style.cursor = "default";
    };
  }, []);

  const interactive = started && !swapping;

  return (
    <group ref={groupRef}>
      <Html
        center
        distanceFactor={isMobile ? 7 : 9}
        zIndexRange={[20, 0]}
        occlude={false}
        pointerEvents={interactive ? "auto" : "none"}
      >
        <span
          className="poem-label"
          dir="rtl"
          lang="ar"
          role="button"
          tabIndex={interactive ? 0 : -1}
          aria-label={`افتح قصيدة ${shown.title}`}
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
            opacity: interactive ? 1 : 0,
            pointerEvents: interactive ? "auto" : "none",
            transitionDelay: introDone ? "0s" : `${index * 0.08}s`,
            fontSize: isMobile ? "1rem" : "1.35rem",
          }}
        >
          {shown.title}
        </span>
      </Html>
    </group>
  );
}

export default memo(PoemTitle);
