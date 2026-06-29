import { getPublicBrandLogos } from "@/lib/brand";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLogin() {
  const logo = await getPublicBrandLogos();
  return <LoginForm logo={logo} />;
}
