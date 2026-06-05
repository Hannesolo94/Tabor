import { LegalPage, Section } from "@/components/site/Legal";

export const metadata = { title: "Refund & Returns · TABOR" };

export default function Returns() {
  return (
    <LegalPage title="Refund & Returns" updated="June 2026">
      <Section h="Made to order">
        Every TABOR piece is printed for you when you order it. Because items are custom-made and not held in stock, we do not accept returns or refunds for change of mind or buyer&rsquo;s remorse. Please choose carefully and use the size guide on each product before ordering.
      </Section>
      <Section h="Damaged, defective, or wrong items">
        We stand behind quality. If your item arrives damaged, defective, or is not what you ordered, we will replace it free of charge. Contact us within 30 days of delivery with your order number and clear photos of the issue (and the packaging where relevant). Once confirmed, we arrange a reprint and reship at no cost to you.
      </Section>
      <Section h="Sizing and exchanges">
        Because items are made to order, we cannot offer free size exchanges. To avoid sizing issues, check the size guide on the product page before ordering. Where an exchange is possible, it is at your cost, or we may offer store credit at our discretion.
      </Section>
      <Section h="Non-returnable items">
        For hygiene and custom-production reasons, certain items (such as final-sale, personalised, or intimate items) cannot be returned except where faulty.
      </Section>
      <Section h="Lost or delayed parcels">
        If a parcel is lost in transit or significantly delayed beyond the carrier&rsquo;s estimate, contact us and we will work with the fulfilment partner to resolve it, including a replacement where appropriate.
      </Section>
      <Section h="How to claim">
        Reach out through the contact details on our site with your order number and photos. We aim to respond quickly and make it right. This policy does not affect any rights you have under the Consumer Protection Act or other applicable law.
      </Section>
    </LegalPage>
  );
}
