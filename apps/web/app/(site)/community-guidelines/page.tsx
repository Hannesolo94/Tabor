import { LegalPage, Section } from "@/components/site/Legal";

export const metadata = { title: "Community Guidelines", description: "The covenant every brother keeps in TABOR." };

export default function CommunityGuidelines() {
  return (
    <LegalPage title="The Covenant" updated="June 2026">
      <Section h="Walk in honor">
        TABOR is a brotherhood built on Christ. Every brother is welcome, and every brother is held to a standard. Treat one another with honor, patience, and truth. Iron sharpens iron.
      </Section>

      <Section h="Brothers across traditions">
        We are Catholic, Orthodox, Anglican, Pentecostal, and Protestant. We worship differently, and that is welcome here. We are brothers in Christ first. Debate honestly and charitably if you must, but do not divide over secondary doctrine, mock another man's tradition, or tell a brother he does not belong. The one who tears at the brotherhood over what is not essential answers for it.
      </Section>

      <Section h="Zero tolerance">
        These are not allowed, ever:
        <ul style={ul}>
          <li>Hate, slurs, or contempt for any person or group.</li>
          <li>Harassment, bullying, threats, or intimidation.</li>
          <li>Sexual, obscene, or pornographic content. Anything sexualising a minor is forbidden and reported to authorities.</li>
          <li>Violence, promotion of self-harm, or encouraging harm to others.</li>
          <li>Spam, scams, impersonation, or deception.</li>
          <li>Illegal content of any kind.</li>
        </ul>
      </Section>

      <Section h="How it's enforced">
        An automated guardian watches the guild channels. If a message breaks these rules it is <strong>removed instantly</strong> and the sender is <strong>silenced</strong> while a member of our team reviews it. A human always makes the final call: a warning, a longer silence, or a permanent ban. Direct messages are end-to-end encrypted and private; if you receive something harmful there, <strong>report it</strong> and your copy is shared with our team so we can act.
      </Section>

      <Section h="Report and block">
        You are part of keeping this place holy. Press and hold any message to <strong>report</strong> it, or <strong>block</strong> anyone from reaching you. Reports go straight to our team. When in doubt, report it.
      </Section>

      <Section h="Repeat offenders">
        Grace is real, but so are consequences. Repeated or severe violations end in a permanent ban. This is a brotherhood, not a free-for-all. Guard it.
      </Section>
    </LegalPage>
  );
}

const ul: React.CSSProperties = { margin: "8px 0 0", paddingLeft: 20 };
