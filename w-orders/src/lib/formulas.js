// Pure scoring engines for Shopping & Pickup.
// Import into UI components; they do not touch React state.

import { clamp, nonNeg, safeDiv, round, toNumber, scoreToVerdict } from "./util.js";
import {
  HEAVY_MULTIPLIERS,
  SHOPPING_DEFAULTS,
  PICKUP_DEFAULTS,
  VERDICT_THRESHOLDS,
} from "./defaults.js";

/**
 * @typedef {Object} QuantityInput
 * @property {number} qLight
 * @property {number} qWater
 * @property {number} qLitter
 * @property {number} qDog
 * @property {number} qSoda
 * @property {number} qHeavyOther
 */

/** Normalize all qty fields to non-negative numbers */
function normalizeQty(q = {}) {
  return {
    qLight: nonNeg(q.qLight),
    qWater: nonNeg(q.qWater),
    qLitter: nonNeg(q.qLitter),
    qDog: nonNeg(q.qDog),
    qSoda: nonNeg(q.qSoda),
    qHeavyOther: nonNeg(q.qHeavyOther),
  };
}

/**
 * Weighted quantity using heavy multipliers.
 * @param {QuantityInput} q
 * @param {{water:number, litter:number, dog:number, soda:number, heavyOther:number}} mult
 */
export function weightedQuantity(q, mult = HEAVY_MULTIPLIERS) {
  const n = normalizeQty(q);
  return (
    n.qLight +
    mult.water * n.qWater +
    mult.litter * n.qLitter +
    mult.dog * n.qDog +
    mult.soda * n.qSoda +
    mult.heavyOther * n.qHeavyOther
  );
}

/**
 * Tiered item effort for shopping:
 *  0–tier1Limit at tier1Cost, next up to tier2Limit at tier2Cost, remainder at tier3Cost.
 */
export function shoppingItemEffort(Qw, cfg = SHOPPING_DEFAULTS) {
  const q = Math.max(0, toNumber(Qw));
  const t1 = Math.min(q, cfg.tier1Limit);
  const t2 = Math.min(Math.max(q - cfg.tier1Limit, 0), cfg.tier2Limit - cfg.tier1Limit);
  const t3 = Math.max(q - cfg.tier2Limit, 0);
  return t1 * cfg.tier1Cost + t2 * cfg.tier2Cost + t3 * cfg.tier3Cost;
}

/**
 * Compute score from rate R with linear mapping between R_BAD and R_GREAT, clamped 1–100.
 */
export function scoreFromRate(R, R_BAD, R_GREAT) {
  const ratio = safeDiv(toNumber(R) - R_BAD, R_GREAT - R_BAD);
  return clamp(Math.round(100 * ratio), 1, 100);
}

/**
 * SHOPPING SCORE
 * @param {Object} input
 * @param {number} input.payout  total payout ($)
 * @param {number} input.dOut    one-way miles store→last customer
 * @param {number} input.dBack   miles last customer→same store
 * @param {number} input.customers number of customers (>=1)
 * @param {QuantityInput} input.qty  quantities by type
 * @param {Object} [opts]
 * @param {typeof HEAVY_MULTIPLIERS} [opts.multipliers]
 * @param {typeof SHOPPING_DEFAULTS} [opts.cfg]
 * @param {typeof VERDICT_THRESHOLDS} [opts.thresholds]
 */
export function calcShoppingScore(input, opts = {}) {
  const multipliers = { ...HEAVY_MULTIPLIERS, ...(opts.multipliers || {}) };
  const cfg = { ...SHOPPING_DEFAULTS, ...(opts.cfg || {}) };
  const thresholds = { ...VERDICT_THRESHOLDS, ...(opts.thresholds || {}) };

  const payout = nonNeg(input.payout);
  const dOut = nonNeg(input.dOut);
  const dBack = nonNeg(input.dBack);
  const customers = Math.max(1, Math.floor(toNumber(input.customers) || 1));
  const qty = normalizeQty(input.qty);

  const Qw = weightedQuantity(qty, multipliers);
  const Eitems = shoppingItemEffort(Qw, cfg);
  const EqMi = dOut + dBack + Eitems + cfg.customerOverhead * (customers - 1);

  const R = safeDiv(payout, EqMi);
  const score = scoreFromRate(R, cfg.R_BAD, cfg.R_GREAT);
  const verdict = scoreToVerdict(score, thresholds);

  return {
    kind: "shopping",
    inputs: { payout, dOut, dBack, customers, qty },
    paramsUsed: { multipliers, cfg, thresholds },
    breakdown: {
      Qw: round(Qw, 2),
      Eitems: round(Eitems, 2),
      EqMi: round(EqMi, 2),
      R: round(R, 2),
    },
    score,
    verdict,
    valid: EqMi > 0,
  };
}

/**
 * PICKUP SCORE
 * @param {Object} input
 * @param {number} input.payout  total payout ($)
 * @param {number} input.dRoute  total miles (store→C1→C2→C3). Do NOT split per customer.
 * @param {number} input.dBack   miles last customer→same store
 * @param {number} input.stops   number of customers/stops (>=1)
 * @param {QuantityInput} input.qty  quantities by type (ignore bag counts)
 * @param {Object} [opts]
 * @param {typeof HEAVY_MULTIPLIERS} [opts.multipliers]
 * @param {typeof PICKUP_DEFAULTS} [opts.cfg]
 * @param {typeof VERDICT_THRESHOLDS} [opts.thresholds]
 */
export function calcPickupScore(input, opts = {}) {
  const multipliers = { ...HEAVY_MULTIPLIERS, ...(opts.multipliers || {}) };
  const cfg = { ...PICKUP_DEFAULTS, ...(opts.cfg || {}) };
  const thresholds = { ...VERDICT_THRESHOLDS, ...(opts.thresholds || {}) };

  const payout = nonNeg(input.payout);
  const dRoute = nonNeg(input.dRoute);
  const dBack = nonNeg(input.dBack);
  const stops = Math.max(1, Math.floor(toNumber(input.stops) || 1));
  const qty = normalizeQty(input.qty);

  const Qw = weightedQuantity(qty, multipliers);
  const EqMi = dRoute + dBack + cfg.alphaPick * Qw + cfg.stopOverhead * (stops - 1);

  const R = safeDiv(payout, EqMi);
  const score = scoreFromRate(R, cfg.R_BAD, cfg.R_GREAT);
  const verdict = scoreToVerdict(score, thresholds);

  return {
    kind: "pickup",
    inputs: { payout, dRoute, dBack, stops, qty },
    paramsUsed: { multipliers, cfg, thresholds },
    breakdown: {
      Qw: round(Qw, 2),
      EqMi: round(EqMi, 2),
      R: round(R, 2),
    },
    score,
    verdict,
    valid: EqMi > 0,
  };
}

/**
 * Helper: What payout is needed to reach a target score?
 * @param {number} eqMi
 * @param {number} targetScore 1–100
 * @param {{R_BAD:number,R_GREAT:number}} map
 * @returns {number} dollars needed (>=0)
 */
export function payoutForTargetScore(eqMi, targetScore, map) {
  const s = clamp(toNumber(targetScore), 1, 100) / 100;
  const R = map.R_BAD + s * (map.R_GREAT - map.R_BAD);
  return round(Math.max(0, toNumber(eqMi) * R), 2);
}

// --- Tiny self-checks ---
// console.log(
//   calcShoppingScore({
//     payout: 24.95, dOut: 5.8, dBack: 5.8, customers: 2,
//     qty: { qLight: 16, qWater: 0, qLitter: 0, qDog: 0, qSoda: 0, qHeavyOther: 0 }
//   })
// );
