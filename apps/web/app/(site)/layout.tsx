// Storefront chrome: cart provider, header, footer, cart drawer, promo popup.
// Wraps every public-facing page. Admin pages are outside this group.
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { AnnouncementBar } from "@/components/site/AnnouncementBar";
import { VersesPopup } from "@/components/site/VersesPopup";
import { Tracker } from "@/components/site/Tracker";
import { Pixels } from "@/components/site/Pixels";
import { PromoPopup } from "@/components/promo/PromoPopup";
import { getAnnouncements } from "@/lib/announcements-db";
import { getPixels } from "@/lib/pixels-db";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [announcements, pixels] = await Promise.all([getAnnouncements(), getPixels()]);
  return (
    <CartProvider>
      <Pixels ids={pixels} />
      <a href="#main" className="skip-link">Skip to content</a>
      <AnnouncementBar items={announcements} />
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
      <CartDrawer />
      <PromoPopup />
      <VersesPopup />
      <Tracker />
    </CartProvider>
  );
}
