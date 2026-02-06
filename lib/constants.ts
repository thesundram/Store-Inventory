export const ALPHABET_ITEM_CODES = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))

export const UNIT_OPTIONS = ["no", "pcs", "kg", "pkt", "Ton", "Ltr"]

export const ITEM_CODE_DESCRIPTIONS: Record<string, string> = {
  A: "APPLE",
  B: "BALL",
  C: "CAT",
  D: "DOG",
  E: "EAR DROP",
  F: "FACE CREAM",
  G: "GUN",
  H: "HAT",
  I: "INKPOT",
  J: "JAMUN",
  K: "KITE",
  L: "LEMON",
  M: "MENTOS",
}

export const VENDOR_OPTIONS = ["AB Company", "XY Supplier", "PQ Store"]

// Alias for register screens
export const VENDORS = VENDOR_OPTIONS
