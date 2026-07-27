import { useMemo } from "react";
import type { RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { poems } from "../data/poems";
import type { Poem } from "../types/poem";
import { buildHeartCurve } from "../utils/heartCurve";
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
  const curve = useMemo(
    () => buildHeartCurve(isMobile ? 9 : 11, 256),
    [isMobile]
  );

  return (
    <Canvas
      className="absolute inset-0"
      camera={{ position: [0, 0, 22], fov: 45 }}
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

      <HeartPath points={curve.linePoints} pausedRef={pausedRef} />

      {poems.map((poem, index) => (
        <PoemTitle
          key={poem.id}
          poem={poem}
          index={index}
          total={poems.length}
          curve={curve}
          baseSpeed={BASE_SPEED}
          pausedRef={pausedRef}
          started={started}
          isMobile={isMobile}
          onSelect={onSelectPoem}
        />
      ))}

      <CameraController
        started={started}
        isMobile={isMobile}
        pausedRef={pausedRef}
      />
    </Canvas>
  );
}
