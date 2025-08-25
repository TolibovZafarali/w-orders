import { payoutForTargetScore } from "../lib/formulas.js";

const fmtMoney = (v) =>
  new Intl.NumberFormat(undefined, { style:"currency", currency:"USD", maximumFractionDigits:2 }).format(v ?? 0);
const fmtNum = (v, d = 2) => (Number.isFinite(v) ? v.toFixed(d) : "0.00");

export default function ResultCard({ result }) {
  if (!result) {
    return (
      <section className="panel">
        <h2 className="visually-hidden">Result</h2>
        <p className="kv">No calculation yet. Enter your numbers and tap <b>Worth It?</b></p>
      </section>
    );
  }
  if (result.pending) {
    return (
      <section className="panel">
        <h2 className="visually-hidden">Result</h2>
        <div className="result">
          <div className="score-badge">…</div>
          <div className="kv">Calculating…</div>
        </div>
      </section>
    );
  }

  const { kind, verdict, score, breakdown, inputs, paramsUsed, valid } = result;
  const verdictClass = verdict === "ACCEPT" ? "accept" : verdict === "MAYBE" ? "maybe" : "skip";
  const map = paramsUsed?.cfg ?? { R_BAD: 1, R_GREAT: 3 };
  const need60 = payoutForTargetScore(breakdown.EqMi, 60, map);
  const need75 = payoutForTargetScore(breakdown.EqMi, 75, map);

  return (
    <section className="panel">
      <h2 className="visually-hidden">Result</h2>

      {!valid ? (
        <p className="kv">Check inputs — equivalent miles came out as 0 or less.</p>
      ) : (
        <>
          <div className="result">
            <div className={`score-badge ${verdictClass}`}>
              {score}
              <div className={`verdict ${verdictClass}`} style={{ marginTop: 6 }}>
                {verdict}
              </div>
            </div>

            <div className="kv-grid">
              <div className="kv">Mode: <b>{kind === "shopping" ? "Shopping" : "Pickup"}</b></div>
              <div className="kv">Payout: <b>{fmtMoney(inputs.payout)}</b></div>
              <div className="kv">EqMi: <b>{fmtNum(breakdown.EqMi, 2)} mi</b></div>
              <div className="kv">Rate: <b>{fmtMoney(breakdown.R)}/eq-mi</b></div>

              {kind === "shopping" ? (
                <>
                  <div className="kv">Out / Back: <b>{fmtNum(inputs.dOut, 2)} / {fmtNum(inputs.dBack, 2)} mi</b></div>
                  <div className="kv">Customers: <b>{inputs.customers}</b></div>
                  <div className="kv">Item Count: <b>{inputs.itemCount ?? 0}</b></div>
                  <div className="kv">Total Qty: <b>{breakdown.qTotalUnits ?? 0}</b></div>
                  <div className="kv">Weighted Qty: <b>{fmtNum(breakdown.Qw, 2)}</b></div>
                  <div className="kv">Path Effort: <b>{fmtNum(breakdown.Epath, 2)} eq-mi</b></div>
                  <div className="kv">Carry Effort: <b>{fmtNum(breakdown.Ecarry, 2)} eq-mi</b></div>
                </>
              ) : (
                <>
                  <div className="kv">Route / Back: <b>{fmtNum(inputs.dRoute, 2)} / {fmtNum(inputs.dBack, 2)} mi</b></div>
                  <div className="kv">Stops: <b>{inputs.stops}</b></div>
                  <div className="kv">Weighted Qty: <b>{fmtNum(breakdown.Qw, 2)}</b></div>
                </>
              )}
            </div>
          </div>

          <div className="helper">
            <div className="kv">Target **60** → need about <b>{fmtMoney(need60)}</b>.</div>
            <div className="kv">Target **75** → need about <b>{fmtMoney(need75)}</b>.</div>
            <div className="kv small">(Rate map R_BAD={fmtNum(map.R_BAD,2)} → R_GREAT={fmtNum(map.R_GREAT,2)}.)</div>
          </div>
        </>
      )}
    </section>
  );
}
