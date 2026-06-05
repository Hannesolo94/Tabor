# Commerce: Geo-Routing & Multi-Supplier Fulfillment

The website is fully custom (Next.js on Vercel), so we control region detection, pricing,
and which print-on-demand supplier fulfils each order. This is a core requirement, not an add-on.

## Suppliers
- **Printful** — international orders (US/EU facilities). Default for everywhere outside Africa.
- **SA PoD** (a South African print-on-demand provider, TBD) — South Africa (and optionally
  neighbouring African countries). Faster, cheaper, no customs for local buyers, VAT handled locally.
- Confirm the SA provider has an **API** for order submission AND **live shipping rates**.
  If no rate API: fall back to a flat-rate SA shipping table (by region/weight) in the ZA price book.

## Region detection (the rule)
1. **Initial display** uses geo-IP via **Vercel Edge Middleware** (`request.geo.country`). Map country
   → region config. Render localized prices, currency, and "ships from" copy with no flicker.
2. **Always show a manual region/currency switcher** (VPNs, travellers, roaming make IP unreliable).
3. **Source of truth is the shipping address at checkout** — it decides the real supplier, final price,
   shipping cost, and tax. Never let the IP guess override the address.

## Region config (data, not hardcoded)
```
ZA   → { supplier: "sa-pod",   currency: "ZAR", priceBook: "za",   tax: "VAT 15% inclusive" }
intl → { supplier: "printful", currency: "USD", priceBook: "intl", tax: "duties on delivery" }
```
- **Price books** live in the DB (`price_books` / per-variant region prices), never hardcoded.
- Each SKU maps to a variant ID in **every** supplier: `sku → { printful_variant_id, sapod_variant_id }`.

## Order flow
1. Cart built from region price book.
2. At checkout, read shipping country → pick supplier + price book.
3. Call that supplier's **shipping-rate API** (or flat-rate table) for the real shipping cost.
4. Payment (Stripe multi-currency, or Shopify storefront) → on success, submit order to the
   correct supplier's order API (`printful-order` or `sapod-order` Edge Function).
5. Store in `orders` with `supplier`, `region`, `currency`, fulfilment status synced back.

## Caveats to handle
- **Garment parity**: providers use different blanks (colour/size/weight/print quality differ).
  Pick closest-matching blanks across suppliers; order samples; set expectations.
- **Print files**: same artwork exported to each provider's template spec (DPI/dimensions/placement).
- **Tax**: ZA VAT 15% inclusive in the ZA price book; international = duties on delivery.
- **Currency**: display local currency; be clear what you actually charge/settle in (Stripe handles presentment).
- **Margins**: region-aware pricing so each price book stays healthy after that supplier's costs.

## MVP option
Launch on Printful globally first, add the SA router once African volume justifies the second
integration — OR, if early customers are SA, start SA-first + Printful for international from day one.
Build the router abstraction now either way so adding a supplier is config, not a rewrite.
