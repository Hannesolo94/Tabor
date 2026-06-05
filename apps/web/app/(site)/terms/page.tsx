import { LegalPage, Section } from "@/components/site/Legal";

export const metadata = { title: "Terms of Service · TABOR" };

export default function Terms() {
  return (
    <LegalPage title="Terms of Service" updated="June 2026">
      <Section h="Agreement">
        By using tabor.quest or placing an order, you agree to these Terms. If you do not agree, please do not use the site.
      </Section>
      <Section h="Our products">
        Our items are made to order through print-on-demand. This means each item is produced for you after you order it. Because of this, production and delivery take longer than off-the-shelf stock, and made-to-order items are generally not eligible for change-of-mind returns (see our Refund &amp; Returns Policy).
      </Section>
      <Section h="Pricing and currency">
        Prices are shown in the currency for your region. The price, applicable taxes, and shipping are confirmed at checkout based on your shipping address, which determines the final price and the fulfilment partner. Regional pricing may differ; the price that applies to your order is the one for your delivery destination at checkout.
      </Section>
      <Section h="Orders">
        An order is an offer to buy. We may accept or decline any order, and may cancel and refund an order if an item is unavailable, mispriced, or the order appears fraudulent. You are responsible for giving accurate shipping details.
      </Section>
      <Section h="Accounts">
        If you create an account, keep your login secure. You are responsible for activity under your account. You may delete your account and data at any time.
      </Section>
      <Section h="Intellectual property">
        The TABOR name, marks, designs, and content are our property and may not be copied, resold, or used without permission. Brand art is original; no third-party game or franchise IP is used.
      </Section>
      <Section h="Acceptable use">
        Do not misuse the site, attempt to breach security, scrape data, or upload unlawful or infringing content (including in reviews). We may remove content and suspend access for violations.
      </Section>
      <Section h="Limitation of liability">
        The site and products are provided on a reasonable-efforts basis. To the extent permitted by law, we are not liable for indirect or consequential loss. Nothing here limits rights you have under applicable consumer law.
      </Section>
      <Section h="Governing law">
        These Terms are governed by the laws of South Africa. We may update these Terms; continued use after changes means you accept them.
      </Section>
    </LegalPage>
  );
}
