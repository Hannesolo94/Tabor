import { LegalPage, Section } from "@/components/site/Legal";

export const metadata = { title: "Delete Your Account", description: "How to delete your TABOR account and data." };

export default function DeleteAccount() {
  return (
    <LegalPage title="Delete Your Account" updated="June 2026">
      <Section h="Delete from inside the app (fastest)">
        Open the TABOR app → <strong>Status → Settings → Danger Zone → Delete my account</strong>. Confirm, and your account and personal data are erased immediately.
      </Section>

      <Section h="Request by email">
        If you can't access the app, email <strong>support@tabor.quest</strong> from the address on your account with the subject "Delete my account". We will verify and complete the deletion within 30 days and confirm when done.
      </Section>

      <Section h="What gets deleted">
        Your profile, progress (quests, streaks, workouts, routines, prayers, bookmarks), guild memberships, friends, messages you authored, notifications, and your login are permanently removed.
      </Section>

      <Section h="What we may keep, and for how long">
        We retain only what the law requires — for example, financial/order records for donations and purchases — for the period required by tax and accounting law, after which they are deleted. These records are kept separately from your community profile.
      </Section>

      <Section h="Questions">
        Contact <strong>support@tabor.quest</strong>.
      </Section>
    </LegalPage>
  );
}
