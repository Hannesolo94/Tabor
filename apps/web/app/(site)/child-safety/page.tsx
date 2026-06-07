import { LegalPage, Section } from "@/components/site/Legal";

export const metadata = { title: "Child Safety Standards", description: "TABOR's standards against child sexual abuse and exploitation." };

export default function ChildSafety() {
  return (
    <LegalPage title="Child Safety Standards" updated="June 2026">
      <Section h="Our commitment">
        TABOR has <strong>zero tolerance for child sexual abuse and exploitation (CSAE)</strong>. TABOR is an adults-only (18+) community, and we work to keep it free of any content that endangers children.
      </Section>

      <Section h="What is prohibited">
        Strictly forbidden: child sexual abuse material (CSAM); sexualisation of minors in any form; grooming, solicitation, or any attempt to exploit a child; and links to such material. Violations result in immediate removal, a permanent ban, and reporting to authorities.
      </Section>

      <Section h="How we prevent & respond">
        <ul style={ul}>
          <li>An <strong>18+ age gate</strong> at signup and an 18+ store rating.</li>
          <li>In-app <strong>reporting and blocking</strong> on all content and users, with a moderation team reviewing reports.</li>
          <li>On becoming aware of CSAM, we <strong>report it to the National Center for Missing &amp; Exploited Children (NCMEC) CyberTipline</strong> (and equivalent authorities) as required by law, preserve related data as required, and cooperate with law enforcement.</li>
        </ul>
      </Section>

      <Section h="How to report">
        Report any child-safety concern immediately:
        <ul style={ul}>
          <li>In the app: hold the message → <strong>Report</strong>, or use the Safety Center.</li>
          <li>Email our child-safety point of contact: <strong>safety@tabor.quest</strong>.</li>
        </ul>
        If a child is in immediate danger, contact your local emergency services first.
      </Section>

      <Section h="Point of contact">
        Child-safety contact: <strong>safety@tabor.quest</strong>. This standards page is published in compliance with Google Play's child-safety requirements for social and UGC apps.
      </Section>
    </LegalPage>
  );
}

const ul: React.CSSProperties = { margin: "8px 0 0", paddingLeft: 20 };
