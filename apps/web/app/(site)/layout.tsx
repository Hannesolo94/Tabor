// Storefront chrome: cart provider, header, footer, cart drawer, promo popup.
// Wraps every public-facing page. Admin pages are outside this group.
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PromoPopup } from "@/components/promo/PromoPopup";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
      <CartDrawer />
      <PromoPopup />
    </CartProvider>
  );
}
