import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Heart, X } from "lucide-react";
import type { Poem } from "../types/poem";

type PoemDialogProps = {
  poem: Poem;
  onClose: () => void;
};

/**
 * Accessible, animated poem modal rendered outside the WebGL canvas.
 * Closes via the button, the Escape key, or a backdrop click.
 */
export default function PoemDialog({ poem, onClose }: PoemDialogProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  // Close on Escape + move focus to the dialog when it opens.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

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
          <div className="flex items-center gap-2">
            <Heart
              className="h-5 w-5 text-rose fill-rose/40"
              aria-hidden="true"
            />
            <h2
              id={titleId}
              className="text-2xl font-extrabold text-white drop-shadow-[0_0_16px_rgba(251,113,133,0.6)] sm:text-3xl"
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
          <p
            id={contentId}
            className="text-center text-xl leading-loose text-pink-soft/95 sm:text-2xl"
            style={{ whiteSpace: "pre-line" }}
          >
            {poem.content}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
