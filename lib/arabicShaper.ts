/**
 * Arabic text shaper for @react-pdf/renderer.
 *
 * react-pdf does NOT do Unicode Arabic text shaping — it renders each code-point
 * independently, so letters appear isolated and disconnected.
 *
 * This module pre-processes Arabic strings using the `arabic-reshaper` package
 * so that letter-joining and ligature substitution happen before the PDF engine
 * ever sees the text.
 */

// @ts-expect-error type missing for this library: arabic-reshaper types are incomplete
import { convertArabic } from 'arabic-reshaper'

/**
 * Reshape a string that may contain Arabic text.
 * Safe to call on any string (non-Arabic characters are returned unchanged).
 */
export function reshapeArabic(text: string): string {
  if (!text) return text
  try {
    return convertArabic(text)
  } catch {
    return text
  }
}

