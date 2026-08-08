/**
 * Sanitize strings for payment gateway compatibility.
 *
 * GetEpay (and many Indian PGs) reject payloads that contain
 * non-ASCII characters. Student names sometimes include Greek / Cyrillic
 * look-alike characters (e.g. Ε instead of E) from copy-paste.
 *
 * This helper:
 *  1. Maps common Greek and Cyrillic homoglyphs → Latin equivalents
 *  2. Applies Unicode NFKD normalisation to decompose accented chars
 *  3. Strips any remaining non-ASCII code-points
 *  4. Collapses multiple spaces
 */

const HOMOGLYPH_MAP: Record<string, string> = {
  // Greek → Latin
  "\u0391": "A", // Α → A
  "\u0392": "B", // Β → B
  "\u0395": "E", // Ε → E
  "\u0396": "Z", // Ζ → Z
  "\u0397": "H", // Η → H
  "\u0399": "I", // Ι → I
  "\u039A": "K", // Κ → K
  "\u039C": "M", // Μ → M
  "\u039D": "N", // Ν → N
  "\u039F": "O", // Ο → O
  "\u03A1": "P", // Ρ → P
  "\u03A4": "T", // Τ → T
  "\u03A5": "Y", // Υ → Y
  "\u03A7": "X", // Χ → X
  "\u03B1": "a", // α → a (lowercase)
  "\u03B5": "e", // ε → e
  "\u03B9": "i", // ι → i
  "\u03BA": "k", // κ → k
  "\u03BD": "n", // ν → n
  "\u03BF": "o", // ο → o
  "\u03C1": "p", // ρ → p
  "\u03C4": "t", // τ → t
  "\u03C5": "y", // υ → y
  "\u03C7": "x", // χ → x
  // Cyrillic → Latin
  "\u0410": "A", // А → A
  "\u0412": "B", // В → B
  "\u0415": "E", // Е → E
  "\u041A": "K", // К → K
  "\u041C": "M", // М → M
  "\u041D": "H", // Н → H
  "\u041E": "O", // О → O
  "\u0420": "P", // Р → P
  "\u0421": "C", // С → C
  "\u0422": "T", // Т → T
  "\u0423": "Y", // У → Y
  "\u0425": "X", // Х → X
  "\u0430": "a", // а → a
  "\u0435": "e", // е → e
  "\u043E": "o", // о → o
  "\u0440": "p", // р → p
  "\u0441": "c", // с → c
  "\u0443": "y", // у → y
  "\u0445": "x", // х → x
};

/**
 * Replace non-ASCII look-alikes and strip remaining non-printable / non-ASCII
 * characters so that the value is safe for Indian payment gateways.
 */
export function sanitizeForGateway(value: string): string {
  if (!value) return value;

  let sanitized = value;

  // 1. Replace known homoglyphs
  for (const [glyph, replacement] of Object.entries(HOMOGLYPH_MAP)) {
    sanitized = sanitized.replaceAll(glyph, replacement);
  }

  // 2. NFKD normalise — decomposes accented chars (é → e + combining accent)
  sanitized = sanitized.normalize("NFKD");

  // 3. Strip combining diacritics (U+0300 – U+036F)
  sanitized = sanitized.replace(/[\u0300-\u036f]/g, "");

  // 4. Strip anything outside printable ASCII (0x20-0x7E)
  sanitized = sanitized.replace(/[^\x20-\x7E]/g, "");

  // 5. Collapse multiple spaces
  sanitized = sanitized.replace(/\s{2,}/g, " ").trim();

  return sanitized;
}

/**
 * Safely parse a JSON string that may be double-encoded.
 *
 * GetEpay sometimes returns a JSON string inside a JSON string for
 * redirect responses, causing `JSON.parse` to yield a string instead
 * of an object.  This helper detects that case and parses again.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function safeJsonParse(text: string): Record<string, any> {
  let parsed: unknown = JSON.parse(text);

  // Guard: if the first parse returns a string, the payload was
  // double-encoded — parse once more.
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      // second parse failed — treat the string as the final value
    }
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error(
      "Decrypted gateway response could not be parsed into a valid object.",
    );
  }

  return parsed as Record<string, unknown>;
}
