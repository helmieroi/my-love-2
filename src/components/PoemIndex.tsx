import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import type { Poem } from "../types/poem";
import { normalizeArabic, toArabicDigits } from "../utils/arabic";
import { useFocusTrap } from "../hooks/useFocusTrap";

type PoemIndexProps = {
  poems: Poem[];
  /** Currently open poem, highlighted in the grid. */
  activeId: number | null;
  onSelect: (poem: Poem) => void;
  onClose: () => void;
};

/**
 * Full catalogue of poems as a searchable grid.
 *
 * The heart only orbits a handful of titles at a time, so this panel is how
 * every poem stays reachable. Search is diacritic-insensitive and covers both
 * titles and bodies.
 */
export default function PoemIndex({
  poems,
  activeId,
  onSelect,
  onClose,
}: PoemIndexProps) {
  const [query, setQuery] = useState("");
  const panelRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  useFocusTrap(panelRef);

  // Close on Escape; focus the search field as soon as the panel opens.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    searchRef.current?.focus();
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Pre-fold every poem once, then match against the folded query.
  const haystack = useMemo(
    () =>
      poems.map((poem) => ({
        poem,
        key: normalizeArabic(`${poem.title} ${poem.content}`),
      })),
    [poems]
  );

  const results = useMemo(() => {
    const needle = normalizeArabic(query);
    if (!needle) return poems;
    return haystack.filter((e) => e.key.includes(needle)).map((e) => e.poem);
  }, [haystack, poems, query]);

  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-start justify-center p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Backdrop — click to dismiss */}
      <div
        className="absolute inset-0 bg-[#0a0206]/80 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="فهرس القصائد"
        dir="rtl"
        lang="ar"
        initial={{ opacity: 0, y: -18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.98 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative mt-14 flex max-h-[80dvh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-rose/40 bg-gradient-to-b from-[#2a0512]/90 to-[#12030a]/95 shadow-[0_0_50px_rgba(225,29,72,0.3)] backdrop-blur-2xl"
      >
        <header className="flex shrink-0 items-center gap-3 px-5 pt-5 sm:px-6">
          <div className="relative flex-1">
            {/* Logical inset: `start` is the right edge under dir="rtl". */}
            <Search
              className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-pink-soft/50"
              aria-hidden="true"
            />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ابحث عن قصيدة…"
              aria-label="ابحث في القصائد"
              className="w-full rounded-full border border-white/15 bg-white/5 py-2.5 pe-10 ps-10 text-base text-white placeholder:text-pink-soft/45 focus:border-rose/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-soft/70"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  searchRef.current?.focus();
                }}
                aria-label="مسح البحث"
                className="absolute end-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-pink-soft/60 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-soft"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق الفهرس"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-pink-soft transition-colors hover:border-rose/60 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-soft"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <p
          className="px-5 pt-3 text-xs text-pink-soft/60 sm:px-6"
          aria-live="polite"
        >
          {query
            ? `${toArabicDigits(results.length)} من ${toArabicDigits(poems.length)} قصيدة`
            : `${toArabicDigits(poems.length)} قصيدة`}
        </p>

        <div className="mx-5 mt-3 h-px shrink-0 bg-gradient-to-l from-transparent via-rose/50 to-transparent sm:mx-6" />

        <div className="no-scrollbar overflow-y-auto px-5 py-4 sm:px-6">
          {results.length === 0 ? (
            <p className="py-10 text-center text-pink-soft/70">
              لا توجد قصيدة بهذا الاسم
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {results.map((poem) => {
                const active = poem.id === activeId;
                return (
                  <li key={poem.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(poem)}
                      aria-current={active ? "true" : undefined}
                      className={`flex w-full items-center gap-2 rounded-2xl border px-3 py-2.5 text-right transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-soft ${
                        active
                          ? "border-rose/70 bg-rose/20 text-white"
                          : "border-white/10 bg-white/5 text-pink-soft/90 hover:border-rose/50 hover:bg-rose/10 hover:text-white"
                      }`}
                    >
                      <span className="shrink-0 text-[0.7rem] text-pink-soft/45">
                        {toArabicDigits(poem.id)}
                      </span>
                      <span className="truncate text-sm font-bold">
                        {poem.title}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
