import { LegalPage, Section } from "@/components/site/Legal";

export const metadata = { title: "Terms & Community Guidelines", description: "The terms of use and community guidelines for TABOR." };

export default function Terms() {
  return (
    <LegalPage title="Terms & Covenant" updated="June 2026">
      <Section h="Draft notice">
        This is a working draft for review. Have it reviewed by a qualified attorney before launch.
      </Section>

      <Section h="1. Acceptance & eligibility">
        By creating an account or using TABOR (the "Service") you agree to these Terms and our Community Guidelines below. You must be <strong>18 years or older</strong> to use TABOR. If you do not agree, do not use the Service.
      </Section>

      <Section h="2. The Service">
        TABOR provides a faith, fitness, and brotherhood community: daily quests, scripture, training tools, guilds and messaging, plus links to our apparel store and a way to support the mission. Features may change over time.
      </Section>

      <Section h="3. Your account">
        Keep your login credentials secure; you are responsible for activity on your account. Tell us immediately at support@tabor.quest if you suspect unauthorised use.
      </Section>

      <Section h="4. Community Guidelines — zero tolerance">
        TABOR has <strong>zero tolerance for objectionable content and abusive behaviour</strong>. You agree NOT to post, send, or upload anything that is:
        <ul style={ul}>
          <li>Hateful, harassing, threatening, or bullying;</li>
          <li>Sexual, obscene, or pornographic; any content sexualising minors is strictly forbidden and will be reported to authorities;</li>
          <li>Violent, illegal, or promoting self-harm or harm to others;</li>
          <li>Spam, scams, impersonation, or deceptive content;</li>
          <li>Infringing on others' rights or privacy.</li>
        </ul>
        Treat every member with honour. We may remove content and <strong>suspend or permanently ban</strong> any user who breaks these rules, typically acting on reports within 24 hours.
      </Section>

      <Section h="5. Reporting & blocking">
        You can <strong>report</strong> any message or user and <strong>block</strong> anyone from contacting you (these tools are in the app). Reports are reviewed by our team. Because direct messages are end-to-end encrypted, reporting a DM includes the content from the reporting user's device so we can act on it.
      </Section>

      <Section h="6. Your content">
        You own the content you create. You grant TABOR a licence to host and display it as needed to run the Service. You are responsible for your content and confirm you have the right to share it. We may remove content that violates these Terms.
      </Section>

      <Section h="7. Store & donations">
        Apparel and gear purchases are governed by our Shipping and Returns policies. Donations are processed on our website by our payment provider. We are transparent about the split: a stated percentage of each gift goes to the charities our community chooses, and the remainder supports TABOR's operations. <strong>The portion retained for operations is not a tax-deductible donation.</strong> Donating does not unlock any in-app features.
      </Section>

      <Section h="8. Termination & deletion">
        You may delete your account at any time (Settings → Delete my account), which erases your personal data. We may suspend or terminate accounts that violate these Terms.
      </Section>

      <Section h="9. Disclaimers & liability">
        The Service is provided "as is". Fitness content is general information, not medical advice — consult a professional before starting any program. To the maximum extent permitted by law, TABOR is not liable for indirect or consequential damages.
      </Section>

      <Section h="10. Governing law & contact">
        These Terms are governed by the laws of the Republic of South Africa (to be confirmed for your operating entity). Questions: <strong>support@tabor.quest</strong>. We may update these Terms; continued use means acceptance of the changes.
      </Section>
    </LegalPage>
  );
}

const ul: React.CSSProperties = { margin: "8px 0 0", paddingLeft: 20 };
