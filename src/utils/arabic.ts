/** Arabic-Indic digits, indexed 0–9. */
const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

/** Render a number with Arabic-Indic digits (e.g. 12 → "١٢"). */
export function toArabicDigits(value: number): string {
  return String(value).replace(/\d/g, (d) => ARABIC_DIGITS[Number(d)]);
}

/** Harakat, tatweel and superscript alef — all ignorable when searching. */
const DIACRITICS = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;

/**
 * Fold an Arabic string into a forgiving search key: strips diacritics and
 * tatweel, then unifies letter shapes visitors are unlikely to type exactly
 * (أ/إ/آ → ا, ى → ي, ة → ه, ؤ/ئ → و/ي).
 *
 * This lets "احبك" match the poem titled "أحبكِ".
 */
export function normalizeArabic(input: string): string {
  return input
    .replace(DIACRITICS, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ئ/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}
