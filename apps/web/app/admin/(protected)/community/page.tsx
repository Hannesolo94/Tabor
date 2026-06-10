// Broadcast moved into the Content Studio (its own tab). This route stays so old
// links and moderator bookmarks keep working.
import { redirect } from "next/navigation";

export default function CommunityPage() {
  redirect("/admin/blog/broadcast");
}
