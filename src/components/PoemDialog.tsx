import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Heart, X } from "lucide-react";
import type { Poem } from "../types/poem";
import { toArabicDigits } from "../utils/arabic";
import { useFocusTrap } from "../hooks/useFocusTrap";

type PoemDialogProps = {
  poem: Poem;
  /** 1-based position of this poem in the collection. */
  position: number;
  total: number;
  onClose: () => void;
  /** Show the previous poem (wraps around). */
  onPrev: () => void;
  /** Show the next poem (wraps around). */
  onNext: () => void;
};

/**
 * Accessible, animated poem modal rendered outside the WebGL canvas.
 *
 * Stays mounted while navigating so the whole collection can be read straight
 * through — only the poem body cross-fades. Closes via the button, the Escape
 * key, or a backdrop click; ← / → step between poems.
 */
export default function PoemDialog({
  poem,
  position,
  total,
  onClose,
  onPrev,
  onNext,
}: PoemDialogProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useFocusTrap(dialogRef);

  // Escape closes; arrows navigate. In RTL, "next" sits to the left.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowLeft") onNext();
      else if (event.key === "ArrowRight") onPrev();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNext, onPrev]);

  // Move focus into the dialog when it first opens.
  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  const titleId = `poem-title-${poem.id}`;
  const contentId = `poem-content-${poem.id}`;

  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
    >
      {/* Backdrop — darken & blur the scene; click to dismiss */}
      <div
        className="absolute inset-0 bg-[#0a0206]/70 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={contentId}
        dir="rtl"
        lang="ar"
        initial={{ opacity: 0, scale: 0.9, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex max-h-[85dvh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-rose/40 bg-gradient-to-b from-[#2a0512]/85 to-[#12030a]/90 shadow-[0_0_50px_rgba(225,29,72,0.35)] backdrop-blur-2xl"
      >
        {/* Rose glow accent */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-rose/30 blur-3xl"
          aria-hidden="true"
        />

        <header className="relative flex items-center justify-between gap-4 px-6 pt-6">
          <div className="flex min-w-0 items-center gap-2">
            <Heart
              className="h-5 w-5 shrink-0 text-rose fill-rose/40"
              aria-hidden="true"
            />
            <h2
              id={titleId}
              className="truncate text-2xl font-extrabold text-white drop-shadow-[0_0_16px_rgba(251,113,133,0.6)] sm:text-3xl"
            >
              {poem.title}
            </h2>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="إغلاق القصيدة"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-pink-soft transition-colors hover:border-rose/60 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-soft"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <div className="mx-6 mt-4 h-px shrink-0 bg-gradient-to-l from-transparent via-rose/50 to-transparent" />

        <div className="no-scrollbar overflow-y-auto px-6 py-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={poem.id}
              id={contentId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="text-center text-xl leading-loose text-pink-soft/95 sm:text-2xl"
              style={{ whiteSpace: "pre-line" }}
            >
              {poem.content}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Read straight through without hunting for the next label */}
        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-white/10 bg-black/20 px-4 py-3">
          <button
            type="button"
            onClick={onPrev}
            aria-label="القصيدة السابقة"
            className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 py-2 pe-4 ps-3 text-sm text-pink-soft transition-colors hover:border-rose/60 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-soft"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
            السابقة
          </button>

          <span
            className="shrink-0 text-xs text-pink-soft/60 tabular-nums"
            aria-live="polite"
          >
            {toArabicDigits(position)} / {toArabicDigits(total)}
          </span>

          <button
            type="button"
            onClick={onNext}
            aria-label="القصيدة التالية"
            className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 py-2 pe-3 ps-4 text-sm text-pink-soft transition-colors hover:border-rose/60 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-soft"
          >
            التالية
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        </footer>
      </motion.div>
    </motion.div>
  );
}
