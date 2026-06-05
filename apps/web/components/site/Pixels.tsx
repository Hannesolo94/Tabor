// Injects marketing pixels on the storefront when configured in admin Settings.
// Meta Pixel + Google (GA4 / Google Ads via gtag, and GTM). Server component
// that renders the scripts; loads after interactive so it never blocks the page.
import Script from "next/script";
import type { Pixels as PixelIds } from "@/lib/pixels-db";

export function Pixels({ ids }: { ids: PixelIds }) {
  const gtagId = ids.ga4 || ids.gads;
  return (
    <>
      {ids.meta && (
        <Script id="meta-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
          (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init','${ids.meta}');fbq('track','PageView');
        `}</Script>
      )}

      {gtagId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`} strategy="afterInteractive" />
          <Script id="gtag-init" strategy="afterInteractive">{`
            window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());
            ${ids.ga4 ? `gtag('config','${ids.ga4}');` : ""}
            ${ids.gads ? `gtag('config','${ids.gads}');` : ""}
          `}</Script>
        </>
      )}

      {ids.gtm && (
        <Script id="gtm" strategy="afterInteractive">{`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
          var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;
          j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${ids.gtm}');
        `}</Script>
      )}
    </>
  );
}
