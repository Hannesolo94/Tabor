"use client";

// Pricing block for the product editor.
//
// The USD field is the base price; everything else in the world derives from it.
// The ZAR field is a MANUAL OVERRIDE stored in product_prices, because South
// African print cost is not a conversion of the US cost. "Auto" fills it with
// the FX-derived figure as a starting point, which you are then expected to
// adjust to the local cost base. Leave it at 0 and ZA falls back to the
// converted price like every other currency.
import { useState } from "react";
import { roundPrice, type RoundRule } from "@/lib/currency";
import { GOLD, MONO, BODY } from "@/lib/ui";

const lbl: React.CSSProperties = { fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.13em", textTransform: "uppercase", marginBottom: 5, display: "block" };
const inp: React.CSSProperties = { fontFamily: BODY, fontSize: 13, color: "#E8E2D5", background: "rgba(15,15,20,0.6)", border: `1px solid ${GOLD}33`, borderRadius: 10, padding: "10px 12px", width: "100%" };

export interface ZarFx {
  rate: number;        // ZAR per 1 USD
  bufferPct: number;
  rule: RoundRule;
  fetchedAt: string | null;
}

function ago(iso: string | null): string {
  if (!iso) return "never";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return hrs < 48 ? `${hrs}h ago` : `${Math.floor(hrs / 24)}d ago`;
}

export function PriceFields({ baseUsd, cost, zar, fx }: {
  baseUsd: number;
  cost: number;
  zar: number;
  fx: ZarFx | null;
}) {
  const [usd, setUsd] = useState(String(baseUsd ?? 0));
  const [zarPrice, setZarPrice] = useState(String(zar ?? 0));

  const usdNum = Number(usd) || 0;
  const suggested = fx && usdNum > 0
    ? roundPrice(usdNum * fx.rate * (1 + fx.bufferPct / 100), fx.rule)
    : null;

  const zarNum = Number(zarPrice) || 0;
  const usingOverride = zarNum > 0;
  const drift = usingOverride && suggested ? Math.round(((zarNum - suggested) / suggested) * 100) : 0;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={lbl}>Price (USD) · base</label>
          <input name="base_price" type="number" step="0.01" min="0" value={usd} onChange={(e) => setUsd(e.target.value)} style={inp} />
        </div>
        <div>
          <label style={lbl}>Cost (for margin)</label>
          <input name="cost" type="number" step="0.01" min="0" defaultValue={cost ?? 0} style={inp} />
        </div>
      </div>

      <div>
        <label style={lbl}>SA price (ZAR) · 0 = use the converted price</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input name="price_zar" type="number" step="1" min="0" value={zarPrice} onChange={(e) => setZarPrice(e.target.value)} style={{ ...inp, flex: 1 }} />
          <button
            type="button"
            onClick={() => suggested && setZarPrice(String(suggested))}
            disabled={!suggested}
            title={suggested ? `Fill with the live converted price` : "No FX rate available"}
            style={{
              fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase",
              color: suggested ? "#1a1408" : "#8A847A",
              background: suggested ? "linear-gradient(180deg, #f0d89a, #c9a961)" : "rgba(255,255,255,0.05)",
              border: "none", borderRadius: 10, padding: "0 16px",
              cursor: suggested ? "pointer" : "not-allowed", whiteSpace: "nowrap",
            }}
          >
            Auto
          </button>
        </div>

        <div style={{ fontFamily: MONO, fontSize: 10, color: "#8A847A", letterSpacing: "0.04em", marginTop: 7, lineHeight: 1.6 }}>
          {fx ? (
            <>
              Converted: <span style={{ color: GOLD }}>R{suggested?.toLocaleString("en-US") ?? "—"}</span>
              {" · "}R{fx.rate.toFixed(2)}/$ +{fx.bufferPct}% buffer · rates {ago(fx.fetchedAt)}
            </>
          ) : (
            <span style={{ color: "#C08A3A" }}>No ZAR rate stored yet. Run the FX refresh.</span>
          )}
          <br />
          {usingOverride
            ? <>Using your manual price{suggested ? <> · <span style={{ color: drift < 0 ? "#4ADE80" : "#C08A3A" }}>{drift > 0 ? "+" : ""}{drift}% vs converted</span></> : null}</>
            : <>No override. South Africa sees the converted price.</>}
        </div>
      </div>
    </div>
  );
}
