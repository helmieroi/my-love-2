import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, LayoutGrid } from "lucide-react";
import type { Poem } from "../types/poem";
import { poems } from "../data/poems";
import { useIsMobile } from "../hooks/useIsMobile";
import AudioControl from "./AudioControl";
import IntroScreen from "./IntroScreen";
import LoadingScreen from "./LoadingScreen";
import PoemDialog from "./PoemDialog";
import PoemIndex from "./PoemIndex";

// Lazy-load the heavy WebGL scene so the intro paints instantly.
const LoveScene = lazy(() => import("./LoveScene"));

/**
 * Top-level orchestrator: owns the intro / selected-poem / index state and
 * composes the scene, header, intro overlay, index panel and poem dialog. The
 * dialog, index and intro all live outside the WebGL canvas.
 */
export default function LoveExperience() {
  const isMobile = useIsMobile();
  const [started, setStarted] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [indexOpen, setIndexOpen] = useState(false);

  const selectedIndex =
    selectedId === null ? -1 : poems.findIndex((p) => p.id === selectedId);
  const selectedPoem = selectedIndex >= 0 ? poems[selectedIndex] : null;

  // Shared, render-free flag read inside useFrame loops to slow animations
  // while an overlay is open (and to hold the title rotation steady).
  const pausedRef = useRef(false);
  useEffect(() => {
    pausedRef.current = selectedPoem !== null || indexOpen;
  }, [selectedPoem, indexOpen]);

  // Reading a poem picked from the index should return there on close, so a
  // visitor never loses their place in the collection.
  const returnToIndexRef = useRef(false);

  const handleSelectFromScene = useCallback((poem: Poem) => {
    returnToIndexRef.current = false;
    setSelectedId(poem.id);
  }, []);

  const handleSelectFromIndex = useCallback((poem: Poem) => {
    returnToIndexRef.current = true;
    setIndexOpen(false);
    setSelectedId(poem.id);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setSelectedId(null);
    if (returnToIndexRef.current) {
      returnToIndexRef.current = false;
      setIndexOpen(true);
    }
  }, []);

  // Step through the collection, wrapping at both ends.
  const step = useCallback((delta: number) => {
    setSelectedId((current) => {
      if (current === null) return current;
      const i = poems.findIndex((p) => p.id === current);
      if (i < 0) return current;
      return poems[(i + delta + poems.length) % poems.length].id;
    });
  }, []);

  const showPrev = useCallback(() => step(-1), [step]);
  const showNext = useCallback(() => step(1), [step]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Suspense fallback={<LoadingScreen />}>
        <LoveScene
          started={started}
          isMobile={isMobile}
          pausedRef={pausedRef}
          onSelectPoem={handleSelectFromScene}
        />
      </Suspense>

      {/* Minimal transparent header */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between px-5 py-4 sm:px-8">
        <div className="flex items-center gap-2" style={{ direction: "ltr" }}>
          <Heart
            className="h-5 w-5 text-rose fill-rose/40 drop-shadow-[0_0_12px_rgba(225,29,72,0.7)]"
            aria-hidden="true"
          />
          <span className="text-lg font-extrabold tracking-tight text-white/90">
            MyLove Layla & Roly
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          {started && (
            <button
              type="button"
              onClick={() => setIndexOpen(true)}
              aria-label="فهرس القصائد"
              dir="rtl"
              lang="ar"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm text-pink-soft backdrop-blur-sm transition-colors hover:border-rose/60 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-soft"
            >
              <LayoutGrid className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">الفهرس</span>
            </button>
          )}
          <AudioControl />
        </div>
      </header>

      {/* Gentle hint once the experience is running */}
      <AnimatePresence>
        {started && !selectedPoem && !indexOpen && (
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
            انقر على عنوان قصيدة لقراءتها، أو افتح الفهرس لكل القصائد
          </motion.p>
        )}
      </AnimatePresence>

      {/* Intro overlay */}
      <AnimatePresence>
        {!started && (
          <IntroScreen key="intro" onStart={() => setStarted(true)} />
        )}
      </AnimatePresence>

      {/* Searchable index of every poem */}
      <AnimatePresence>
        {indexOpen && (
          <PoemIndex
            key="index"
            poems={poems}
            activeId={selectedId}
            onSelect={handleSelectFromIndex}
            onClose={() => setIndexOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Poem modal — stable key so navigating doesn't remount it */}
      <AnimatePresence>
        {selectedPoem && (
          <PoemDialog
            key="poem-dialog"
            poem={selectedPoem}
            position={selectedIndex + 1}
            total={poems.length}
            onClose={handleCloseDialog}
            onPrev={showPrev}
            onNext={showNext}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
