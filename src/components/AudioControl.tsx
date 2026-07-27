import { Volume2, VolumeX } from "lucide-react";
import { useAudio } from "../hooks/useAudio";

const MUSIC_SRC = "/audio/background-music.mp3";

/**
 * Background-music toggle. Self-contained: owns its own <audio> element via
 * {@link useAudio}. Degrades gracefully (disabled) when the file is missing.
 */
export default function AudioControl() {
  const { isPlaying, isAvailable, toggle } = useAudio(MUSIC_SRC, 0.45);

  const label = !isAvailable
    ? "الموسيقى غير متوفرة"
    : isPlaying
      ? "إيقاف الموسيقى"
      : "تشغيل الموسيقى";

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!isAvailable}
      aria-label={label}
      title={label}
      aria-pressed={isPlaying}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rose/40 bg-white/5 text-pink-soft backdrop-blur-md transition-colors hover:border-rose/70 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-soft disabled:cursor-not-allowed disabled:opacity-40"
    >
      {isPlaying ? (
        <Volume2 className="h-5 w-5" aria-hidden="true" />
      ) : (
        <VolumeX className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
}
