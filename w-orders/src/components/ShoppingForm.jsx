import { useState, useMemo } from "react";
import NumberInput from "./NumberInput.jsx";

/** Minimal heavy fields are hidden by default for speed */
const INITIAL_HEAVY = { qWater: 0, qLitter: 0, qDog: 0, qSoda: 0, qHeavyOther: 0 };

export default function ShoppingForm({ onWorthIt, onReset }) {
  const [payout, setPayout] = useState(0);
  const [distance, setDistance] = useState(0);     // one-way only (store → last customer)
  const [customers, setCustomers] = useState(2);   // 1 or 2

  // Distinct items vs total units
  const [itemCount, setItemCount] = useState(0);   // distinct SKUs
  const [totalQty, setTotalQty] = useState(0);     // all units incl. heavies & repeats

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
  const qLight = Math.max(0, (totalQty ?? 0) - heavySum);

  const submit = (e) => {
    e?.preventDefault?.();
    const input = {
      payout: Math.max(0, payout),
      dOut: Math.max(0, distance),   // formulas already treat missing dBack as 0
      dBack: 0,
      customers: customers,          // 1 or 2
      itemCount: Math.max(0, Math.floor(itemCount || 0)),
      qty: {
        qLight,
        qWater: Math.max(0, heavy.qWater),
        qLitter: Math.max(0, heavy.qLitter),
        qDog: Math.max(0, heavy.qDog),
        qSoda: Math.max(0, heavy.qSoda),
        qHeavyOther: Math.max(0, heavy.qHeavyOther),
      },
    };
    onWorthIt?.({ kind: "shopping", input });
  };

  const reset = () => {
    setPayout(0);
    setDistance(0);
    setCustomers(2);
    setItemCount(0);
    setTotalQty(0);
    setHeavy(INITIAL_HEAVY);
    setShowHeavies(false);
    onReset?.();
  };

  return (
    <section className="panel">
      {/* Customer selector (1 or 2) */}
      <div className="tabs" role="tablist" aria-label="Customers" style={{ marginBottom: 8 }}>
        {[1, 2].map((n) => (
          <button
            key={n}
            role="tab"
            className="tab-btn"
            aria-selected={customers === n}
            aria-label={`${n} customer${n > 1 ? "s" : ""}`}
            title={`${n} customer${n > 1 ? "s" : ""}`}
            onClick={() => setCustomers(n)}
          >
            <span className="ms">{n === 1 ? "person" : "group"}</span>
          </button>
        ))}
      </div>

      <form className="form-grid" onSubmit={submit}>
        {/* money + one-way distance */}
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
          label="Distance one-way"
          value={distance}
          onChange={setDistance}
          suffix="mi"
          icon="near_me"
          step={0.1}
          placeholder="Distance"
        />

        {/* distinct items & total units */}
        <NumberInput
          label="Item Count (distinct SKUs)"
          value={itemCount}
          onChange={setItemCount}
          step={1}
          icon="format_list_numbered"
          placeholder="Items"
        />
        <NumberInput
          label="Total Units (all quantities)"
          value={totalQty}
          onChange={setTotalQty}
          step={1}
          icon="inventory_2"
          placeholder="Units"
        />

        {/* Heavy items toggle + fields */}
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
          Light units auto: <b>{qLight}</b> (Units {totalQty} − Heavies {heavySum})
        </div>
      )}

      <div className="actions">
        <button className="btn primary" onClick={submit}>Worth It?</button>
        <button className="btn ghost" onClick={reset}>Reset</button>
      </div>
    </section>
  );
}
