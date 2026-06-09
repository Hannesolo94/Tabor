import { LegalPage, Section } from "@/components/site/Legal";

export const metadata = { title: "Shipping · TABOR" };

export default function Shipping() {
  return (
    <LegalPage title="Shipping" updated="June 2026">
      <Section h="Print on demand">
        Orders are made to order and then shipped. Total delivery time is production time plus shipping time. Production typically takes a few business days; shipping time depends on your destination and the carrier.
      </Section>
      <Section h="Where we ship from">
        We fulfil locally and internationally to keep delivery fast and costs fair. South African orders are produced and shipped by our local print-on-demand partner. International orders are produced and shipped by Printful from their nearest facility. Your shipping address at checkout decides which partner fulfils your order and the shipping cost shown.
      </Section>
      <Section h="Shipping costs and times">
        International orders ship at a flat 11.99 USD worldwide, and shipping is free on United States orders over 100 USD. South African orders ship at a flat local rate, free over R1800. Your total is shown in full before you pay. Delivery windows are estimates, not guarantees, and can be affected by carriers, customs, and peak periods.
      </Section>
      <Section h="Customs and duties">
        For international orders, your country may charge import duties or taxes on delivery. These are set by your local authorities and are your responsibility. South African orders shipped locally are not subject to import duties.
      </Section>
      <Section h="Tracking">
        Where tracking is available, we will share it once your order ships. If your tracking has not updated or your parcel seems lost, contact us and we will help.
      </Section>
      <Section h="Wrong address">
        Please double-check your shipping details. Parcels returned or lost due to an incorrect address may require a reship at additional cost.
      </Section>
    </LegalPage>
  );
}
