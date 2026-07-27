import { useEffect, useState } from "react";

export type WebGLSupport = "pending" | "supported" | "unsupported";

/**
 * Detects whether the current browser can create a WebGL context.
 * Returns "pending" for the first render, then "supported" / "unsupported".
 */
export function useWebGLSupport(): WebGLSupport {
  const [support, setSupport] = useState<WebGLSupport>("pending");

  useEffect(() => {
    let ok = false;
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl");
      ok = Boolean(gl);
      // Release the probe context if the extension is available.
      if (gl && "getExtension" in gl) {
        const lose = (gl as WebGLRenderingContext).getExtension(
          "WEBGL_lose_context"
        );
        lose?.loseContext();
      }
    } catch {
      ok = false;
    }
    setSupport(ok ? "supported" : "unsupported");
  }, []);

  return support;
}
