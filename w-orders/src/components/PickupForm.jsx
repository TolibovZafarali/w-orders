import { useState, useEffect } from "react";
import NumberInput from "./NumberInput.jsx";
import Toggle from "./Toggle.jsx";

const INITIAL_QTY = { qLight: 0, qWater: 0, qLitter: 0, qDog: 0, qSoda: 0, qHeavyOther: 0 };

export default function PickupForm({ onWorthIt, onReset }) {
  const [payout, setPayout] = useState(0);
  const [dRoute, setDRoute] = useState(0);
  const [sameBack, setSameBack] = useState(true);
  const [dBack, setDBack] = useState(0);
  const [stops, setStops] = useState(3);
  const [qty, setQty] = useState(INITIAL_QTY);

  useEffect(() => {
    if (sameBack) setDBack(dRoute || 0);
  }, [sameBack, dRoute]);

  const updateQty = (key) => (v) => setQty((q) => ({ ...q, [key]: Math.max(0, v) }));

  const submit = (e) => {
    e?.preventDefault?.();
    const input = {
      payout: Math.max(0, payout),
      dRoute: Math.max(0, dRoute),
      dBack: Math.max(0, sameBack ? dRoute : dBack),
      stops: Math.max(1, Math.floor(stops || 1)),
      qty: {
        qLight: Math.max(0, qty.qLight),
        qWater: Math.max(0, qty.qWater),
        qLitter: Math.max(0, qty.qLitter),
        qDog: Math.max(0, qty.qDog),
        qSoda: Math.max(0, qty.qSoda),
        qHeavyOther: Math.max(0, qty.qHeavyOther),
      },
    };
    onWorthIt?.({ kind: "pickup", input });
  };

  const reset = () => {
    setPayout(0);
    setDRoute(0);
    setSameBack(true);
    setDBack(0);
    setStops(3);
    setQty(INITIAL_QTY);
    onReset?.();
  };

  return (
    <section className="panel">
      <h2>Pickup — Inputs</h2>
      <form className="form-grid" onSubmit={submit}>
        <NumberInput label="Payout" value={payout} onChange={setPayout} prefix="$" step={0.01} />
        <NumberInput label="Total Route Distance (store → C1 → C2 → C3)" value={dRoute} onChange={setDRoute} suffix="mi" step={0.1} />

        <Toggle
          label="Return distance equals route distance"
          checked={sameBack}
          onChange={setSameBack}
        />
        <NumberInput
          label="Distance Back (last customer → same store)"
          value={sameBack ? dRoute : dBack}
          onChange={setDBack}
          suffix="mi"
          step={0.1}
          disabled={sameBack}
        />

        <NumberInput label="Stops / Customers" value={stops} onChange={setStops} step={1} />

        {/* Quantities (bag counts are intentionally ignored; use true quantities) */}
        <NumberInput label="Qty — Light (non-heavy)" value={qty.qLight} onChange={updateQty("qLight")} step={1} />
        <NumberInput label="Qty — Water cases" value={qty.qWater} onChange={updateQty("qWater")} step={1} />
        <NumberInput label="Qty — Cat litter" value={qty.qLitter} onChange={updateQty("qLitter")} step={1} />
        <NumberInput label="Qty — Dog food (large)" value={qty.qDog} onChange={updateQty("qDog")} step={1} />
        <NumberInput label="Qty — Soda cases" value={qty.qSoda} onChange={updateQty("qSoda")} step={1} />
        <NumberInput label="Qty — Other heavy" value={qty.qHeavyOther} onChange={updateQty("qHeavyOther")} step={1} />
      </form>

      <div className="actions">
        <button className="btn primary" onClick={submit}>Worth It?</button>
        <button className="btn ghost" onClick={reset}>Reset</button>
      </div>
    </section>
  );
}
