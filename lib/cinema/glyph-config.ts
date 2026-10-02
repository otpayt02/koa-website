export const SGAW_GLYPHS = [
  "က", "ခ", "ဂ", "ဃ", "င", "စ", "ဆ", "ဇ", "ည", "တ", "ထ", "ဒ", "ဓ", "န",
  "ပ", "ဖ", "ဗ", "ဘ", "မ", "ယ", "ရ", "လ", "ဝ", "သ", "ဟ", "အ",
  "ၢ", "ၣ", "ၤ", "ၥ", "ၦ", "ၧ", "ၨ", "ၩ", "ၪ", "ၫ", "ၬ", "ၭ", "ၮ", "ၯ",
  "ၰ", "ၱ", "ၲ", "ၳ", "ၴ", "ၵ", "ၶ", "ၷ", "ၸ", "ၹ", "ၺ", "ၻ", "ၼ", "ၽ", "ၾ", "ၿ",
] as const;

export const SGAW_GLYPH_STRING = SGAW_GLYPHS.join("");

export const MYANMAR_NUMERALS = ["၀", "၁", "၂", "၃", "၄", "၅", "၆", "၇", "၈", "၉"] as const;

export const GLYPH_QUALITY = {
  desktop: { ambient: 176, formation: 264, ditherCell: 9, dpr: 1.5, fps: 60 },
  mobile: { ambient: 92, formation: 156, ditherCell: 12, dpr: 1, fps: 30 },
  reduced: { ambient: 24, formation: 72, ditherCell: 16, dpr: 1, fps: 0 },
} as const;

export function seededUnit(seed: number) {
  let value = Math.imul(seed + 1, 374761393);
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
}

export function glyphForSeed(seed: number) {
  return SGAW_GLYPHS[Math.floor(seededUnit(seed) * SGAW_GLYPHS.length) % SGAW_GLYPHS.length];
}
