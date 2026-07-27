import { Heart } from "lucide-react";
import { useWebGLSupport } from "./hooks/useWebGLSupport";
import LoveExperience from "./components/LoveExperience";

/**
 * App root. Verifies WebGL availability before mounting the 3D experience and
 * shows a graceful fallback message when it is unavailable.
 */
export default function App() {
  const webgl = useWebGLSupport();

  if (webgl === "unsupported") {
    return (
      <main
        className="flex h-full w-full flex-col items-center justify-center gap-4 px-6 text-center"
        dir="rtl"
        lang="ar"
      >
        <Heart
          className="h-12 w-12 text-rose fill-rose/40 drop-shadow-[0_0_18px_rgba(225,29,72,0.7)]"
          aria-hidden="true"
        />
        <h1 className="text-2xl font-extrabold text-white">
          المتصفح لا يدعم العرض ثلاثي الأبعاد
        </h1>
        <p className="max-w-sm text-pink-soft/80">
          يبدو أن تقنية WebGL غير متاحة في متصفحك. جرّب متصفحاً حديثاً أو فعّل
          تسريع الرسوميات لعرض قصائد الحب ثلاثية الأبعاد.
        </p>
      </main>
    );
  }

  if (webgl === "pending") {
    // Brief, silent gate while we probe for WebGL.
    return <main className="h-full w-full" aria-hidden="true" />;
  }

  return <LoveExperience />;
}
