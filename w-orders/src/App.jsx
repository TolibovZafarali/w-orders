import { useState } from "react";
import Tabs from "./components/Tabs.jsx";
import ShoppingForm from "./components/ShoppingForm.jsx";
import PickupForm from "./components/PickupForm.jsx";
import ResultCard from "./components/ResultCard.jsx";
import { calcShoppingScore, calcPickupScore } from "./lib/formulas.js";

export default function App() {
  const [tab, setTab] = useState("shopping"); // 'shopping' | 'pickup'
  const [result, setResult] = useState(null);

  const handleWorthIt = ({ kind, input }) => {
    if (kind === "shopping") {
      const r = calcShoppingScore(input);
      setResult(r);
    } else if (kind === "pickup") {
      const r = calcPickupScore(input);
      setResult(r);
    } else {
      setResult({ pending: true, kind });
    }
  };

  const handleReset = () => setResult(null);

  return (
    <div className="app">
      <header className="app__header">
        <h1>Is This Spark Offer Worth It?</h1>
        <p className="subtitle">Quick calculator for Shopping &amp; Pickup runs</p>
      </header>

      <Tabs
        value={tab}
        onChange={(v) => {
          setTab(v);
          setResult(null);
        }}
        tabs={[
          { id: "shopping", label: "Shopping" },
          { id: "pickup", label: "Pickup" },
        ]}
      />

      <main className="app__main">
        {tab === "shopping" ? (
          <ShoppingForm onWorthIt={handleWorthIt} onReset={handleReset} />
        ) : (
          <PickupForm onWorthIt={handleWorthIt} onReset={handleReset} />
        )}

        <ResultCard result={result} />
      </main>

      <footer className="app__footer">
        <small>v0.1 • No data stored. Values are estimates. Tune weights later.</small>
      </footer>
    </div>
  );
}
