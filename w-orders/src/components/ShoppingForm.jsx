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

  // NEW
  const [itemCount, setItemCount] = useState(0);   // distinct SKUs
  const [totalQty, setTotalQty] = useState(0);     // includes heavies & repeats
  const [heavy, setHeavy] = useState(INITIAL_HEAVY);

  useEffect(() => {
    if (sameBack) setDBack(dOut || 0);
  }, [sameBack, dOut]);

  const updateHeavy = (key) => (v) => setHeavy((h) => ({ ...h, [key]: Math.max(0, v) }));

  // Sum heavies and compute light qty automatically (never negative)
  const heavySum = useMemo(
    () => Math.max(0, (heavy.qWater ?? 0) + (heavy.qLitter ?? 0) + (heavy.qDog ?? 0) + (heavy.qSoda ?? 0) + (heavy.qHeavyOther ?? 0)),
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
      itemCount: Math.max(0, Math.floor(itemCount || 0)), // NEW
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
      <h2>Shopping — Inputs</h2>
      <form className="form-grid" onSubmit={submit}>
        <NumberInput label="Payout" value={payout} onChange={setPayout} prefix="$" step={0.01} />
        <NumberInput label="Distance Out (store → last customer)" value={dOut} onChange={setDOut} suffix="mi" step={0.1} />

        <Toggle
          label="Return distance equals out distance"
          checked={sameBack}
          onChange={setSameBack}
        />
        <NumberInput
          label="Distance Back (last customer → same store)"
          value={sameBack ? dOut : dBack}
          onChange={setDBack}
          suffix="mi"
          step={0.1}
          disabled={sameBack}
        />

        <NumberInput label="Customers" value={customers} onChange={setCustomers} step={1} />

        {/* NEW: distinct items vs total quantity */}
        <NumberInput label="Item Count (distinct SKUs)" value={itemCount} onChange={setItemCount} step={1} />
        <NumberInput label="Total Quantity (all units incl. heavies & repeats)" value={totalQty} onChange={setTotalQty} step={1} />

        {/* Heavies — we auto-compute Light = Total - sum(heavies) */}
        <NumberInput label="Qty — Water cases" value={heavy.qWater} onChange={updateHeavy("qWater")} step={1} />
        <NumberInput label="Qty — Cat litter" value={heavy.qLitter} onChange={updateHeavy("qLitter")} step={1} />
        <NumberInput label="Qty — Dog food (large)" value={heavy.qDog} onChange={updateHeavy("qDog")} step={1} />
        <NumberInput label="Qty — Soda cases" value={heavy.qSoda} onChange={updateHeavy("qSoda")} step={1} />
        <NumberInput label="Qty — Other heavy" value={heavy.qHeavyOther} onChange={updateHeavy("qHeavyOther")} step={1} />
      </form>

      {/* Small helper line */}
      <div className="kv" style={{ marginTop: 6 }}>
        Light quantity auto: <b>{qLight}</b> (Total {totalQty} − Heavies {heavySum})
      </div>

      <div className="actions">
        <button className="btn primary" onClick={submit}>Worth It?</button>
        <button className="btn ghost" onClick={reset}>Reset</button>
      </div>
    </section>
  );
}
