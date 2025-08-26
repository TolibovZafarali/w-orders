import { useState, useMemo } from "react";
import NumberInput from "./NumberInput.jsx";

/** Heavy fields hidden by default for speed */
const INITIAL_HEAVY = { qWater: 0, qLitter: 0, qDog: 0, qSoda: 0, qHeavyOther: 0 };

export default function PickupForm({ onWorthIt, onReset }) {
  const [payout, setPayout] = useState(0);
  const [routeMiles, setRouteMiles] = useState(0); // single distance: store→C1→C2→C3 total (one field)
  const [stops, setStops] = useState(3);           // 1, 2, or 3

  // Items vs Units (bags ignored). Units will be split into light/heavy.
  const [itemCount, setItemCount] = useState(0);   // distinct SKUs (for info; formula stays bag-agnostic)
  const [totalUnits, setTotalUnits] = useState(0); // all units incl. heavies & repeats

  const [showHeavies, setShowHeavies] = useState(false);
  const [heavy, setHeavy] = useState(INITIAL_HEAVY);
  const updateHeavy = (k) => (v) => setHeavy((h) => ({ ...h, [k]: Math.max(0, v) }));

  const heavySum = useMemo(
    () =>
      Math.max(
        0,
        (heavy.qWater ?? 0) +
          (heavy.qLitter ?? 0) +
          (heavy.qDog ?? 0) +
          (heavy.qSoda ?? 0) +
          (heavy.qHeavyOther ?? 0)
      ),
    [heavy]
  );
  const qLight = Math.max(0, (totalUnits ?? 0) - heavySum);

  const submit = (e) => {
    e?.preventDefault?.();
    const input = {
      payout: Math.max(0, payout),
      dRoute: Math.max(0, routeMiles), // formulas treat missing dBack as 0
      dBack: 0,
      stops,                            // 1/2/3
      // itemCount is captured, but pickup formula remains bag-agnostic (no path effort)
      qty: {
        qLight,
        qWater: Math.max(0, heavy.qWater),
        qLitter: Math.max(0, heavy.qLitter),
        qDog: Math.max(0, heavy.qDog),
        qSoda: Math.max(0, heavy.qSoda),
        qHeavyOther: Math.max(0, heavy.qHeavyOther),
      },
    };
    onWorthIt?.({ kind: "pickup", input });
  };

  const reset = () => {
    setPayout(0);
    setRouteMiles(0);
    setStops(3);
    setItemCount(0);
    setTotalUnits(0);
    setHeavy(INITIAL_HEAVY);
    setShowHeavies(false);
    onReset?.();
  };

  return (
    <section className="panel">
      {/* Customer selector (1/2/3) */}
      <div className="tabs" role="tablist" aria-label="Stops" style={{ marginBottom: 8 }}>
        {[1, 2, 3].map((n) => (
          <button
            key={n}
            role="tab"
            className="tab-btn"
            aria-selected={stops === n}
            aria-label={`${n} stop${n > 1 ? "s" : ""}`}
            title={`${n} stop${n > 1 ? "s" : ""}`}
            onClick={() => setStops(n)}
          >
            <span className="ms">{n === 1 ? "person" : n === 2 ? "group" : "groups"}</span>
          </button>
        ))}
      </div>

      <form className="form-grid" onSubmit={submit}>
        {/* money + single route distance */}
        <NumberInput
          label="Payout"
          value={payout}
          onChange={setPayout}
          prefix="$"
          icon="attach_money"
          step={0.01}
          placeholder="Payout"
        />
        <NumberInput
          label="Total Route Distance (store → drops)"
          value={routeMiles}
          onChange={setRouteMiles}
          suffix="mi"
          icon="route"
          step={0.1}
          placeholder="Route miles"
        />

        {/* Items vs Units (info + for light/heavy split) */}
        <NumberInput
          label="Item Count (distinct)"
          value={itemCount}
          onChange={setItemCount}
          step={1}
          icon="format_list_numbered"
          placeholder="Items"
        />
        <NumberInput
          label="Total Units (all quantities)"
          value={totalUnits}
          onChange={setTotalUnits}
          step={1}
          icon="inventory_2"
          placeholder="Units"
        />

        {/* Heavy items toggle + fields (bags still ignored—true units only) */}
        <label className="tog" style={{ marginTop: 2 }}>
          <input
            type="checkbox"
            className="tog-input"
            checked={showHeavies}
            onChange={(e) => setShowHeavies(e.target.checked)}
          />
          <span className="tog-slider" aria-hidden="true" />
          <span className="tog-label">Heavy items</span>
        </label>

        {showHeavies && (
          <>
            <NumberInput label="Water cases" value={heavy.qWater} onChange={updateHeavy("qWater")} step={1} icon="water_drop" placeholder="Water" />
            <NumberInput label="Cat litter" value={heavy.qLitter} onChange={updateHeavy("qLitter")} step={1} icon="pets" placeholder="Litter" />
            <NumberInput label="Dog food (large)" value={heavy.qDog} onChange={updateHeavy("qDog")} step={1} icon="pets" placeholder="Dog food" />
            <NumberInput label="Soda cases" value={heavy.qSoda} onChange={updateHeavy("qSoda")} step={1} icon="local_drink" placeholder="Soda" />
            <NumberInput label="Other heavy" value={heavy.qHeavyOther} onChange={updateHeavy("qHeavyOther")} step={1} icon="inventory" placeholder="Other heavy" />
          </>
        )}
      </form>

      {showHeavies && (
        <div className="kv" style={{ marginTop: 6 }}>
          Light units auto: <b>{qLight}</b> (Units {totalUnits} − Heavies {heavySum})
        </div>
      )}

      <div className="actions">
        <button className="btn primary" onClick={submit}>Worth It?</button>
        <button className="btn ghost" onClick={reset}>Reset</button>
      </div>
    </section>
  );
}
