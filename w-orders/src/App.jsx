import { useState } from "react";
import Tabs from "./components/Tabs.jsx";
import ShoppingForm from "./components/ShoppingForm.jsx";
import PickupForm from "./components/PickupForm.jsx";
import ResultCard from "./components/ResultCard.jsx";
import { calcShoppingScore, calcPickupScore } from "./lib/formulas.js";

export default function App() {
  const [tab, setTab] = useState("shopping");
  const [result, setResult] = useState(null);

  const handleWorthIt = ({ kind, input }) => {
    setResult(kind === "shopping" ? calcShoppingScore(input) : calcPickupScore(input));
  };
  const handleReset = () => setResult(null);

  return (
    <div className="app">
      <header className="app__header">
        <h1>Worth It?</h1>
        <p className="subtitle">Spark Driver quick calculator</p>
      </header>

      <Tabs value={tab} onChange={(v)=>{ setTab(v); setResult(null); }} />

      <main className="app__main">
        {tab === "shopping"
          ? <ShoppingForm onWorthIt={handleWorthIt} onReset={handleReset} />
          : <PickupForm   onWorthIt={handleWorthIt} onReset={handleReset} />
        }
        <ResultCard result={result} />
      </main>
    </div>
  );
}
