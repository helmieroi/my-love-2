import { useEffect, useState } from "react";

/**
 * Reactively tracks whether the viewport is at a mobile/tablet size.
 * Uses a media query with a properly cleaned-up listener.
 */
export function useIsMobile(breakpoint = 768): boolean {
  const query = `(max-width: ${breakpoint}px)`;

  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mql = window.matchMedia(query);
    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    // Sync immediately in case it changed before the effect ran.
    setIsMobile(mql.matches);
    mql.addEventListener("change", handleChange);

    return () => {
      mql.removeEventListener("change", handleChange);
    };
  }, [query]);

  return isMobile;
}
