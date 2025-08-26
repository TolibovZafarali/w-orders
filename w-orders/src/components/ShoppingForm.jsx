import { useState, useEffect, useMemo } from "react";
import NumberInput from "./NumberInput.jsx";
import Toggle from "./Toggle.jsx";

const INITIAL_HEAVY = { qWater: 0, qLitter: 0, qDog: 0, qSoda: 0, qHeavyOther: 0 };

export default function ShoppingForm({ onWorthIt, onReset }) {
  const [payout, setPayout] = useState(0);
  const [dOut, setDOut] = useState(0);
  const [sameBack, setSameBack] = useState(true);
  const [dBack, setDBack] = useState(0);
  const [customers, setCustomers] = useState(2);

  // NEW: distinct items vs total quantity
  const [itemCount, setItemCount] = useState(0);   // distinct SKUs
  const [totalQty, setTotalQty] = useState(0);     // includes heavies & repeats
  const [heavy, setHeavy] = useState(INITIAL_HEAVY);

  const [showHeavies, setShowHeavies] = useState(false); // Quick by default

  // keep dBack mirrored when toggle is on
  useEffect(() => { if (sameBack) setDBack(dOut || 0); }, [sameBack, dOut]);

  const updateHeavy = (key) => (v) => setHeavy((h) => ({ ...h, [key]: Math.max(0, v) }));

  // Sum heavies and compute light qty automatically (never negative)
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
      dOut: Math.max(0, dOut),
      dBack: Math.max(0, sameBack ? dOut : dBack),
      customers: Math.max(1, Math.floor(customers || 1)),
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
    setDOut(0);
    setSameBack(true);
    setDBack(0);
    setCustomers(2);
    setItemCount(0);
    setTotalQty(0);
    setHeavy(INITIAL_HEAVY);
    onReset?.();
  };

  return (
    <section className="panel">
      <h2 className="visually-hidden">Shopping — Inputs</h2>
      <form className="form-grid" onSubmit={submit}>
        {/* money + distance */}
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
          label="Distance Out (store → last)"
          value={dOut}
          onChange={setDOut}
          suffix="mi"
          icon="near_me"
          step={0.1}
          placeholder="Out miles"
        />

        <Toggle label="Return = Out" checked={sameBack} onChange={setSameBack} />
        <NumberInput
          label="Distance Back (last → store)"
          value={sameBack ? dOut : dBack}
          onChange={setDBack}
          suffix="mi"
          icon="u_turn_left"
          step={0.1}
          disabled={sameBack}
          placeholder="Back miles"
        />

        <NumberInput
          label="Customers"
          value={customers}
          onChange={setCustomers}
          step={1}
          icon="group"
          placeholder="Customers"
        />

        {/* distinct vs total */}
        <NumberInput
          label="Item Count (distinct)"
          value={itemCount}
          onChange={setItemCount}
          step={1}
          icon="format_list_numbered"
          placeholder="Items"
        />
        <NumberInput
          label="Total Quantity (units)"
          value={totalQty}
          onChange={setTotalQty}
          step={1}
          icon="inventory_2"
          placeholder="Units"
        />

        {/* Quick/Advanced heavies */}
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
            <NumberInput
              label="Water cases"
              value={heavy.qWater}
              onChange={updateHeavy("qWater")}
              step={1}
              icon="water_drop"
              placeholder="Water"
            />
            <NumberInput
              label="Cat litter"
              value={heavy.qLitter}
              onChange={updateHeavy("qLitter")}
              step={1}
              icon="pets"
              placeholder="Litter"
            />
            <NumberInput
              label="Dog food (large)"
              value={heavy.qDog}
              onChange={updateHeavy("qDog")}
              step={1}
              icon="pets"
              placeholder="Dog food"
            />
            <NumberInput
              label="Soda cases"
              value={heavy.qSoda}
              onChange={updateHeavy("qSoda")}
              step={1}
              icon="local_drink"
              placeholder="Soda"
            />
            <NumberInput
              label="Other heavy"
              value={heavy.qHeavyOther}
              onChange={updateHeavy("qHeavyOther")}
              step={1}
              icon="inventory"
              placeholder="Other heavy"
            />
          </>
        )}
      </form>

      {/* helper line */}
      {showHeavies && (
        <div className="kv" style={{ marginTop: 6 }}>
          Light qty auto: <b>{qLight}</b> (Total {totalQty} − Heavies {heavySum})
        </div>
      )}

      <div className="actions">
        <button className="btn primary" onClick={submit}>Worth It?</button>
        <button className="btn ghost" onClick={reset}>Reset</button>
      </div>
    </section>
  );
}
