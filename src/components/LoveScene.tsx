import { useEffect, useMemo, useState } from "react";
import type { RefObject } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { poems } from "../data/poems";
import type { Poem } from "../types/poem";
import { buildHeartCurve, fitHeartSize } from "../utils/heartCurve";
import BackgroundParticles from "./BackgroundParticles";
import CameraController from "./CameraController";
import HeartPath from "./HeartPath";
import PoemTitle from "./PoemTitle";

type LoveSceneProps = {
  started: boolean;
  isMobile: boolean;
  pausedRef: RefObject<boolean>;
  onSelectPoem: (poem: Poem) => void;
};

/** Base traversal speed (progress per second) — one slow loop ≈ 25s. */
const BASE_SPEED = 0.04;

/**
 * How many titles orbit at once. The heart only has so much room before labels
 * collide, and every orbiting label is a live DOM node transformed each frame —
 * so the ring stays small and rotates its contents instead of showing all 100.
 */
const VISIBLE_DESKTOP = 10;
const VISIBLE_MOBILE = 6;

/** How long a batch of titles stays on the heart before the next fades in. */
const CYCLE_MS = 11000;

const CAMERA_FOV = 45;

/** Where CameraController settles once the intro is dismissed. */
const CAMERA_Z_STARTED = 18;

type HeartContentsProps = LoveSceneProps;

/**
 * The heart outline plus its ring of orbiting titles.
 *
 * Lives inside the <Canvas/> so it can size the curve against the real drawing
 * buffer — a tall phone screen shows far fewer world units across than a
 * desktop one, and a fixed size would run off the sides.
 */
function HeartContents({
  started,
  isMobile,
  pausedRef,
  onSelectPoem,
}: HeartContentsProps) {
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);

  const curve = useMemo(
    () =>
      buildHeartCurve(
        fitHeartSize(width / height, CAMERA_Z_STARTED, CAMERA_FOV),
        256
      ),
    [width, height]
  );

  const visibleCount = Math.min(
    isMobile ? VISIBLE_MOBILE : VISIBLE_DESKTOP,
    poems.length
  );

  // Index of the first poem in the batch currently on the heart.
  const [batchStart, setBatchStart] = useState(0);

  useEffect(() => {
    if (!started || poems.length <= visibleCount) return;
    const id = setInterval(() => {
      // Don't swap titles out from under someone who is reading.
      if (pausedRef.current) return;
      setBatchStart((prev) => (prev + visibleCount) % poems.length);
    }, CYCLE_MS);
    return () => clearInterval(id);
  }, [started, visibleCount, pausedRef]);

  return (
    <>
      <HeartPath points={curve.linePoints} pausedRef={pausedRef} />

      {/*
        One permanent slot per orbit position, keyed by slot rather than poem:
        the slots keep gliding while the poems they carry rotate underneath.
      */}
      {Array.from({ length: visibleCount }, (_, slot) => (
        <PoemTitle
          key={slot}
          poem={poems[(batchStart + slot) % poems.length]}
          index={slot}
          total={visibleCount}
          curve={curve}
          baseSpeed={BASE_SPEED}
          pausedRef={pausedRef}
          started={started}
          isMobile={isMobile}
          onSelect={onSelectPoem}
        />
      ))}
    </>
  );
}

/**
 * The full-screen React Three Fiber scene: heart outline, orbiting poem
 * titles, glowing particles, a star field and the eased camera.
 * Default-exported so it can be `React.lazy`-loaded.
 */
export default function LoveScene({
  started,
  isMobile,
  pausedRef,
  onSelectPoem,
}: LoveSceneProps) {
  return (
    <Canvas
      className="absolute inset-0"
      camera={{ position: [0, 0, 22], fov: CAMERA_FOV }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#0a0206"]} />
      <fog attach="fog" args={["#12030a", 20, 46]} />

      {/* Soft romantic lighting */}
      <ambientLight intensity={0.35} color="#ffd9e6" />
      <pointLight position={[0, 6, 10]} intensity={40} color="#fb7185" />
      <pointLight position={[-8, -6, 6]} intensity={22} color="#f5c563" />

      {/* Subtle star field */}
      <Stars
        radius={60}
        depth={40}
        count={isMobile ? 900 : 2200}
        factor={3}
        saturation={0}
        fade
        speed={0.5}
      />

      <BackgroundParticles count={isMobile ? 250 : 600} />

      <HeartContents
        started={started}
        isMobile={isMobile}
        pausedRef={pausedRef}
        onSelectPoem={onSelectPoem}
      />

      <CameraController
        started={started}
        isMobile={isMobile}
        pausedRef={pausedRef}
      />
    </Canvas>
  );
}
