/**
 * Utility functions for Arabic text processing
 */

// Arabic Tashkeel (diacritics / harakat) Unicode ranges:
// \u064B-\u0652: Fathatan, Dammatan, Kasratan, Fatha, Damma, Kasra, Shaddah, Sukun
// \u0653-\u065F: Maddah, Hamza above, and other diacritics
// \u0670: Superscript Alef (Dagger Alef)
// \u0617-\u061A: Quranic diacritics
const TASHKEEL_REGEX = /[\u0617-\u061A\u064B-\u065F\u0670]/g;

export function removeTashkeel(text: string): string {
  if (!text) return '';
  return text.replace(TASHKEEL_REGEX, '');
}
