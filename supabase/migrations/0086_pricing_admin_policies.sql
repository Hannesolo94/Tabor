-- Admin write access for the pricing tables. 0085 created them with public read
-- only, which is right for the storefront but leaves the product editor unable
-- to save an override.

drop policy if exists product_prices_admin on public.product_prices;
create policy product_prices_admin on public.product_prices
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists currencies_admin on public.currencies;
create policy currencies_admin on public.currencies
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists fx_rates_admin on public.fx_rates;
create policy fx_rates_admin on public.fx_rates
  for all using (public.is_admin()) with check (public.is_admin());

-- supplier_costs stays service-role only: what we pay is not public, and it is
-- written by the Printful sync rather than the browser.
