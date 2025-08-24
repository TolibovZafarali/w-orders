export const VERDICT_THRESHOLDS = {
    accept: 60, // >= 60 → "ACCEPT"
    maybe: 45,  // 45–59 → "MAYBE", else "SKIP"
};
  
// Heavies used by both shopping & pickup
export const HEAVY_MULTIPLIERS = {
    water: 2.0,       // cases of bottled water
    litter: 1.7,      // cat litter
    dog: 1.8,         // large dog food bags
    soda: 1.3,        // soda cases
    heavyOther: 1.5,  // detergent, oil, etc.
};
  
// Shopping (behavior-tuned)
export const SHOPPING_DEFAULTS = {
    // item tiering (super-linear pain past 30/60)
    tier1Limit: 30,
    tier2Limit: 60,
    tier1Cost: 0.20, // eq-mi per unit (0–30)
    tier2Cost: 0.40, // eq-mi per unit (31–60)
    tier3Cost: 0.80, // eq-mi per unit (61+)
  
    customerOverhead: 1.0, // eq-mi per extra customer beyond first
  
    // score mapping
    R_BAD: 0.75,
    R_GREAT: 2.10,
};
  
// Pickup (bag-agnostic)
export const PICKUP_DEFAULTS = {
    alphaPick: 0.18,     // eq-mi per weighted unit
    stopOverhead: 1.0,   // eq-mi per extra stop beyond first
    R_BAD: 1.10,
    R_GREAT: 3.00,
};
  