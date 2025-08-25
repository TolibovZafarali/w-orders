import { payoutForTargetScore } from "../lib/formulas.js";

function fmtMoney(v) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(v ?? 0);
  } catch {
    return `$${(v ?? 0).toFixed(2)}`;
  }
}
function fmtNum(v, d = 2) {
  return Number.isFinite(v) ? v.toFixed(d) : "0.00";
}

export default function ResultCard({ result }) {
  if (!result) {
    return (
      <section className="panel">
        <h2>Result</h2>
        <p className="kv">No calculation yet. Enter your numbers and hit <b>Worth It?</b></p>
      </section>
    );
  }

  if (result.pending) {
    return (
      <section className="panel">
        <h2>Result</h2>
        <div className="result">
          <div className="score-badge">…</div>
          <div className="kv">Calculating…</div>
        </div>
      </section>
    );
  }

  const { kind, verdict, score, breakdown, inputs, paramsUsed, valid } = result;
  const verdictClass =
    verdict === "ACCEPT" ? "accept" : verdict === "MAYBE" ? "maybe" : "skip";

  const map = paramsUsed?.cfg ?? { R_BAD: 1, R_GREAT: 3 };
  const need60 = payoutForTargetScore(breakdown.EqMi, 60, map);
  const need75 = payoutForTargetScore(breakdown.EqMi, 75, map);

  return (
    <section className="panel">
      <h2>Result</h2>

      {!valid ? (
        <p className="kv">
          Please check your inputs — equivalent miles came out as 0 or less.
        </p>
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
              <div className="kv">
                Mode: <b>{kind === "shopping" ? "Shopping" : "Pickup"}</b>
              </div>
              <div className="kv">
                Payout: <b>{fmtMoney(inputs.payout)}</b>
              </div>
              <div className="kv">
                EqMi: <b>{fmtNum(breakdown.EqMi, 2)} mi</b>
              </div>
              <div className="kv">
                Rate: <b>{fmtMoney(breakdown.R)}/eq-mi</b>
              </div>

              {/* Kind-specific bits */}
              {kind === "shopping" ? (
                    <>
                        <div className="kv">
                        Out / Back:{" "}
                        <b>
                            {fmtNum(inputs.dOut, 2)} / {fmtNum(inputs.dBack, 2)} mi
                        </b>
                        </div>
                        <div className="kv">
                        Customers: <b>{inputs.customers}</b>
                        </div>
                        <div className="kv">
                        Item Count (distinct): <b>{inputs.itemCount ?? 0}</b>
                        </div>
                        <div className="kv">
                        Total Quantity (units): <b>{breakdown.qTotalUnits ?? 0}</b>
                        </div>
                        <div className="kv">
                        Weighted Qty (Qw): <b>{fmtNum(breakdown.Qw, 2)}</b>
                        </div>
                        <div className="kv">
                        Item Effort — Path: <b>{fmtNum(breakdown.Epath, 2)} eq-mi</b>
                        </div>
                        <div className="kv">
                        Item Effort — Carry: <b>{fmtNum(breakdown.Ecarry, 2)} eq-mi</b>
                        </div>
                        <div className="kv">
                        Item Effort — Total: <b>{fmtNum(breakdown.Eitems, 2)} eq-mi</b>
                        </div>
                    </>
                    ) : (
                <>
                  <div className="kv">
                    Route / Back:{" "}
                    <b>
                      {fmtNum(inputs.dRoute, 2)} / {fmtNum(inputs.dBack, 2)} mi
                    </b>
                  </div>
                  <div className="kv">
                    Stops: <b>{inputs.stops}</b>
                  </div>
                  <div className="kv">
                    Weighted Qty (Qw): <b>{fmtNum(breakdown.Qw, 2)}</b>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="helper">
            <div className="kv">
              Want a borderline **60**? You’d need about <b>{fmtMoney(need60)}</b>.
            </div>
            <div className="kv">
              Insta-accept **75**? You’d need about <b>{fmtMoney(need75)}</b>.
            </div>
            <div className="kv small">
              (These targets use your mode’s rate map R_BAD={fmtNum(map.R_BAD,2)} → R_GREAT={fmtNum(map.R_GREAT,2)}.)
            </div>
          </div>
        </>
      )}
    </section>
  );
}
