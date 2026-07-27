import { Heart } from "lucide-react";

/**
 * Full-screen fallback shown while the lazy 3D scene / fonts load.
 * Intentionally lightweight so it renders instantly.
 */
export default function LoadingScreen() {
  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-[#0a0206]/90 text-pink-soft"
      role="status"
      aria-live="polite"
      dir="rtl"
      lang="ar"
    >
      <Heart
        className="h-12 w-12 animate-pulse text-rose fill-rose/40 drop-shadow-[0_0_18px_rgba(225,29,72,0.7)]"
        aria-hidden="true"
      />
      <p className="text-lg font-bold tracking-wide text-pink-soft/90">
        جارٍ تهيئة القصائد…
      </p>
      <span className="sr-only">جارٍ التحميل</span>
    </div>
  );
}
