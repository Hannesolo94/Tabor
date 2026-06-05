import { LegalPage, Section } from "@/components/site/Legal";

export const metadata = { title: "Privacy Policy · TABOR" };

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy" updated="June 2026">
      <Section h="Who we are">
        TABOR (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is a South Africa based apparel and gear brand operating tabor.quest. This policy explains what personal information we collect, why, and your rights over it. We comply with the Protection of Personal Information Act (POPIA) and, for international customers, the principles of the GDPR.
      </Section>
      <Section h="What we collect">
        We collect only what we need: the email address you give us when you join our list or claim a discount; your name, shipping address, and contact details when you place an order; and basic order details. If you create an account, we store your profile and progress. We use first-party analytics to understand site traffic (pages viewed, sessions) using anonymous identifiers. We do NOT store your card or payment details: payments are handled by our payment provider.
      </Section>
      <Section h="How we use it">
        To fulfil and ship your orders, provide support, send you updates and offers you have opted into, improve the site, and meet legal obligations. We never sell your personal information.
      </Section>
      <Section h="Who we share it with">
        Trusted providers that help us operate: our database and storage provider (Supabase), our fulfilment partners (Printful internationally and a South African print-on-demand partner locally) who receive only what they need to make and ship your order, our email platform for newsletters you opt into, and our payment provider for processing payments. Each handles your data under their own privacy terms.
      </Section>
      <Section h="Cookies and tracking">
        We use essential cookies and lightweight first-party analytics. If we run advertising, we may use marketing pixels (such as Meta or Google) to measure and improve ads. You can control cookies in your browser.
      </Section>
      <Section h="Your rights">
        You may request access to, correction of, or deletion of your personal information at any time. We honour deletion requests fully: contact us and we will erase your data from our systems. You may also unsubscribe from marketing emails at any time using the link in any email.
      </Section>
      <Section h="Retention">
        We keep personal information only as long as needed for the purposes above or as required by law (for example, order records for tax purposes), then delete it.
      </Section>
      <Section h="Contact">
        For any privacy request or question, contact us through the details on our site. We will respond within a reasonable period.
      </Section>
    </LegalPage>
  );
}
