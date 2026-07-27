import { motion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";

type IntroScreenProps = {
  onStart: () => void;
};

/**
 * Animated welcome overlay. Fades/scales out (handled by the parent's
 * <AnimatePresence/>) when the visitor chooses to explore the poems.
 */
export default function IntroScreen({ onStart }: IntroScreenProps) {
  return (
    <motion.div
      className="absolute inset-0 z-40 flex flex-col items-center justify-center px-6 text-center"
      dir="rtl"
      lang="ar"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
      transition={{ duration: 1 }}
    >
      {/* Dim + blur the live scene behind the intro */}
      <div className="absolute inset-0 -z-10 bg-[#0a0206]/55 backdrop-blur-[3px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-6"
      >
        <motion.div
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Heart
            className="h-16 w-16 text-rose fill-rose/40 drop-shadow-[0_0_28px_rgba(225,29,72,0.8)]"
            aria-hidden="true"
          />
        </motion.div>

        <h1
          className="bg-gradient-to-b from-white via-pink-soft to-rose-soft bg-clip-text text-6xl font-extrabold tracking-tight text-transparent drop-shadow-[0_0_30px_rgba(251,113,133,0.5)] sm:text-7xl"
          style={{ direction: "ltr" }}
        >
          MyLove
        </h1>

        <p className="max-w-md text-xl font-bold text-pink-soft/90 sm:text-2xl">
 من رولي
        </p>

        <motion.button
          type="button"
          onClick={onStart}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          className="group mt-2 inline-flex items-center gap-2 rounded-full border border-rose/50 bg-gradient-to-b from-rose/25 to-burgundy/40 px-8 py-3 text-lg font-bold text-white shadow-[0_0_25px_rgba(225,29,72,0.45)] backdrop-blur-md transition-colors hover:border-rose hover:from-rose/40 hover:to-burgundy/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-soft focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        >
          <Sparkles
            className="h-5 w-5 text-gold transition-transform group-hover:rotate-12"
            aria-hidden="true"
          />
          اكتشف 
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
