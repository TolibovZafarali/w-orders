// Generic helpers. Zero dependencies.

/** Coerce to finite number; NaN/Infinity → 0 */
export function toNumber(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}
  
/** Return non-negative number */
export function nonNeg(v) {
    return Math.max(0, toNumber(v));
}
  
/** Clamp to [min, max] */
export function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
}
  
/** Round to fixed decimals (default 2) */
export function round(v, decimals = 2) {
    const p = 10 ** decimals;
    return Math.round((toNumber(v) + Number.EPSILON) * p) / p;
}
  
/**
 * Convert a 0–100 score to a verdict label using thresholds.
* @param {number} score 0–100
* @param {{accept:number, maybe:number}} thresholds
* @returns {"ACCEPT"|"MAYBE"|"SKIP"}
*/
export function scoreToVerdict(score, thresholds) {
    const s = toNumber(score);
    if (s >= thresholds.accept) return "ACCEPT";
    if (s >= thresholds.maybe) return "MAYBE";
    return "SKIP";
}
  
/** Guard for division by zero; returns 0 if denom<=0 */
export function safeDiv(numer, denom) {
    const d = toNumber(denom);
    if (!(d > 0)) return 0;
    return toNumber(numer) / d;
}
  