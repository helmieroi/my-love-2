import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";
import type { Poem } from "../types/poem";
import { useIsMobile } from "../hooks/useIsMobile";
import AudioControl from "./AudioControl";
import IntroScreen from "./IntroScreen";
import LoadingScreen from "./LoadingScreen";
import PoemDialog from "./PoemDialog";

// Lazy-load the heavy WebGL scene so the intro paints instantly.
const LoveScene = lazy(() => import("./LoveScene"));

/**
 * Top-level orchestrator: owns the intro/selected-poem state and composes the
 * scene, header, intro overlay and poem dialog. The dialog + intro live
 * outside the WebGL canvas.
 */
export default function LoveExperience() {
  const isMobile = useIsMobile();
  const [started, setStarted] = useState(false);
  const [selectedPoem, setSelectedPoem] = useState<Poem | null>(null);

  // Shared, render-free flag read inside useFrame loops to slow animations
  // while a dialog is open.
  const pausedRef = useRef(false);
  useEffect(() => {
    pausedRef.current = selectedPoem !== null;
  }, [selectedPoem]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Suspense fallback={<LoadingScreen />}>
        <LoveScene
          started={started}
          isMobile={isMobile}
          pausedRef={pausedRef}
          onSelectPoem={setSelectedPoem}
        />
      </Suspense>

      {/* Minimal transparent header */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between px-5 py-4 sm:px-8">
        <div
          className="flex items-center gap-2"
          style={{ direction: "ltr" }}
        >
          <Heart
            className="h-5 w-5 text-rose fill-rose/40 drop-shadow-[0_0_12px_rgba(225,29,72,0.7)]"
            aria-hidden="true"
          />
          <span className="text-lg font-extrabold tracking-tight text-white/90">
            MyLove
          </span>
        </div>

        <div className="pointer-events-auto">
          <AudioControl />
        </div>
      </header>

      {/* Gentle hint once the experience is running */}
      <AnimatePresence>
        {started && !selectedPoem && (
          <motion.p
            key="hint"
            dir="rtl"
            lang="ar"
            className="pointer-events-none absolute inset-x-0 bottom-6 z-20 text-center text-sm text-pink-soft/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.6, duration: 1 }}
          >
            انقر على عنوان قصيدة لقراءتها
          </motion.p>
        )}
      </AnimatePresence>

      {/* Intro overlay */}
      <AnimatePresence>
        {!started && (
          <IntroScreen key="intro" onStart={() => setStarted(true)} />
        )}
      </AnimatePresence>

      {/* Poem modal */}
      <AnimatePresence>
        {selectedPoem && (
          <PoemDialog
            key={selectedPoem.id}
            poem={selectedPoem}
            onClose={() => setSelectedPoem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
