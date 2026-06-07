import { LegalPage, Section } from "@/components/site/Legal";

export const metadata = { title: "Privacy Policy", description: "How TABOR collects, uses, and protects your data." };

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy" updated="June 2026">
      <Section h="Draft notice">
        This is a working draft prepared for review. Have it checked by a qualified data-protection attorney before public launch, especially for EU (GDPR) and South African (POPIA) compliance.
      </Section>

      <Section h="Who we are">
        TABOR ("we", "us") operates the TABOR mobile app and the tabor.quest website (the "Service"). We are the data controller for your personal information.
        Contact: <strong>support@tabor.quest</strong>. POPIA Information Officer and EU representative details will be published here before launch.
      </Section>

      <Section h="What we collect">
        <ul style={ul}>
          <li><strong>Account:</strong> email address, display name, and a chosen handle.</li>
          <li><strong>Profile:</strong> your faith status, class, training level, goals, birth year (for age verification), streaks, XP, and progress.</li>
          <li><strong>Content you create:</strong> guild messages, posts, prayers, reviews. <strong>Direct messages are end-to-end encrypted</strong> and can only be read on your device and the recipient's; we store only ciphertext and cannot read them.</li>
          <li><strong>Commerce:</strong> orders, shipping address, and donation records (handled by our payment provider; we do not store full card details).</li>
          <li><strong>Usage &amp; device:</strong> basic analytics and diagnostics, only where you have consented.</li>
        </ul>
      </Section>

      <Section h="How we use it & lawful basis">
        <ul style={ul}>
          <li><strong>To provide the Service</strong> (your account, the app's features, orders) — basis: performance of a contract.</li>
          <li><strong>Safety &amp; moderation</strong> (preventing abuse, enforcing our rules) — basis: legitimate interest and legal obligation.</li>
          <li><strong>Analytics</strong> and <strong>marketing email</strong> — basis: your consent, which you may withdraw at any time.</li>
          <li><strong>Legal compliance</strong> (e.g. retaining financial records, responding to lawful requests).</li>
        </ul>
      </Section>

      <Section h="Who we share it with (sub-processors)">
        We use trusted providers who process data on our behalf under data-processing agreements:
        <ul style={ul}>
          <li><strong>Supabase</strong> — database, authentication, storage.</li>
          <li><strong>Vercel</strong> — website and API hosting.</li>
          <li><strong>Resend</strong> — transactional and announcement email.</li>
          <li><strong>Printful</strong> and print partners — order fulfilment.</li>
          <li><strong>Payment provider</strong> — processing purchases and donations.</li>
        </ul>
        Where data leaves your region, we rely on appropriate safeguards (e.g. Standard Contractual Clauses). We do not sell your personal information.
      </Section>

      <Section h="Your rights">
        You can <strong>access, export, correct, or delete</strong> your data, and object to or withdraw consent for processing. In the app: Settings → Privacy &amp; Data (Download my data) and Settings → Delete my account. You may also email <strong>support@tabor.quest</strong>. We respond within one month and at no charge.
      </Section>

      <Section h="How we protect your data">
        All traffic is encrypted in transit (TLS). Data is encrypted at rest. Access is restricted by row-level security so users can only reach their own data. Direct messages are end-to-end encrypted. The master service key is held server-side only and never shipped in the app.
      </Section>

      <Section h="Retention">
        We keep your data while your account is active. On deletion we erase your personal data, except records we are legally required to keep (e.g. financial/order records for tax), which are retained only as long as the law requires and then deleted.
      </Section>

      <Section h="Children">
        TABOR is for adults aged 18 and over. We do not knowingly collect data from anyone under 18. If you believe a minor has registered, contact support@tabor.quest and we will remove the account.
      </Section>

      <Section h="Cookies & analytics">
        The website uses essential cookies to function and, only with your consent, analytics. You can manage consent in the app (Settings) and via the website's consent notice.
      </Section>

      <Section h="Breach notification & changes">
        In the event of a data breach affecting your rights, we will notify the relevant regulator and, where required, affected users without undue delay. We may update this policy; material changes will be announced in-app or by email.
      </Section>
    </LegalPage>
  );
}

const ul: React.CSSProperties = { margin: "8px 0 0", paddingLeft: 20 };
