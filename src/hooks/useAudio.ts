import { useCallback, useEffect, useRef, useState } from "react";

type UseAudioResult = {
  /** Whether audio is currently playing. */
  isPlaying: boolean;
  /** Whether the audio source loaded successfully and can be played. */
  isAvailable: boolean;
  /** Toggle between play and pause. Safe to call when unavailable. */
  toggle: () => void;
};

/**
 * Reusable background-audio hook.
 *
 * - Never autoplays: playback only starts when {@link UseAudioResult.toggle}
 *   is called (i.e. from a user gesture).
 * - Loops quietly and gracefully handles a missing/broken audio file.
 * - Cleans up the underlying <audio> element on unmount.
 */
export function useAudio(src: string, volume = 0.5): UseAudioResult {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = volume;
    audioRef.current = audio;

    const handleError = () => {
      // Missing or unsupported file — disable the control instead of crashing.
      setIsAvailable(false);
      setIsPlaying(false);
    };
    const handleCanPlay = () => setIsAvailable(true);
    const handleEnded = () => setIsPlaying(false);
    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    audio.addEventListener("error", handleError);
    audio.addEventListener("canplaythrough", handleCanPlay);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);

    // Assigning src last ensures the listeners catch load results.
    audio.src = src;

    return () => {
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("canplaythrough", handleCanPlay);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("play", handlePlay);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [src, volume]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !isAvailable) return;

    if (audio.paused) {
      const playback = audio.play();
      if (playback && typeof playback.then === "function") {
        playback.catch(() => {
          // Autoplay/policy rejection — keep the UI consistent.
          setIsPlaying(false);
        });
      }
    } else {
      audio.pause();
    }
  }, [isAvailable]);

  return { isPlaying, isAvailable, toggle };
}
