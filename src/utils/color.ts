/**
 * Packs an RGBA color into a signed int32.
 * @param r red channel 0-255
 * @param g green channel 0-255
 * @param b blue channel 0-255
 * @param alphaFraction alpha as 0-1 fraction
 */
export function rgbaArrayToInt(r: number, g: number, b: number, alphaFraction: number): number {
  const a = Math.round(alphaFraction * 255);
  return ((Math.round(r) << 24) | (Math.round(g) << 16) | (Math.round(b) << 8) | a) | 0;
}

/**
 * Converts an int32 RGBA color to a CSS hex string (#rrggbb), ignoring alpha.
 */
export function rgbaIntToHex(color: number): string {
  const r = (color >>> 24) & 0xFF;
  const g = (color >>> 16) & 0xFF;
  const b = (color >>> 8) & 0xFF;
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Converts an int32 RGBA color to a CSS rgba() string.
 */
export function rgbaIntToCss(color: number): string {
  const r = (color >>> 24) & 0xFF;
  const g = (color >>> 16) & 0xFF;
  const b = (color >>> 8) & 0xFF;
  const a = color & 0xFF;
  return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
}

/**
 * Extracts RGB components from a packed int32 color (ignoring alpha).
 */
export function extractTagRgb(color: number): [number, number, number] {
  return [(color >>> 24) & 0xFF, (color >>> 16) & 0xFF, (color >>> 8) & 0xFF];
}

/**
 * Calculates a contrasting text color (using HSL color space) for the given RGB background.
 */
export function tagTextColor(r: number, g: number, b: number): string {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn), d = max - min;
  let h = 0;
  if (d > 0) {
    if (max === rn) h = ((gn - bn) / d + 6) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h /= 6;
  }
  const L = 0.38, S = 0.65;
  const C = (1 - Math.abs(2 * L - 1)) * S;
  const X = C * (1 - Math.abs((h * 6) % 2 - 1));
  const m = L - C / 2;
  let r1 = 0, g1 = 0, b1 = 0;
  const seg = h * 6;
  if (seg < 1) { r1 = C; g1 = X; }
  else if (seg < 2) { r1 = X; g1 = C; }
  else if (seg < 3) { g1 = C; b1 = X; }
  else if (seg < 4) { g1 = X; b1 = C; }
  else if (seg < 5) { r1 = X; b1 = C; }
  else { r1 = C; b1 = X; }
  return `rgb(${Math.round((r1 + m) * 255)}, ${Math.round((g1 + m) * 255)}, ${Math.round((b1 + m) * 255)})`;
}
