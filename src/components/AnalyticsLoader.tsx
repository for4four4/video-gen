import { useEffect, useState } from "react";
import { isAnalyticsConsented, isMarketingConsented } from "./CookieBanner";

/**
 * AnalyticsLoader — loads Yandex.Metrika and marketing pixels
 * ONLY after user has consented to the corresponding cookie category.
 * 
 * For Russia: analytics scripts must NOT load until the user
 * explicitly consents to the "Аналитические" category.
 */
const AnalyticsLoader = () => {
  const [analyticsLoaded, setAnalyticsLoaded] = useState(false);
  const [marketingLoaded, setMarketingLoaded] = useState(false);

  const checkAndLoad = () => {
    // Analytics: Yandex.Metrika
    if (!analyticsLoaded && isAnalyticsConsented()) {
      loadYandexMetrika();
      setAnalyticsLoaded(true);
    }

    // Marketing pixels
    if (!marketingLoaded && isMarketingConsented()) {
      // Add marketing pixel loading here when needed
      setMarketingLoaded(true);
    }
  };

  useEffect(() => {
    // Check on mount
    checkAndLoad();

    // Listen for consent changes
    const handler = () => checkAndLoad();
    window.addEventListener('cookie_consent_updated', handler);
    return () => window.removeEventListener('cookie_consent_updated', handler);
  }, [analyticsLoaded, marketingLoaded]);

  return null;
};

function loadYandexMetrika() {
  // Don't load twice
  if ((window as any).ym) return;

  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.text = `
    (function(m,e,t,r,i,k,a){
      m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
      m[i].l=1*new Date();
      for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
      k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
    })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=108756233', 'ym');
    ym(108756233, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
  `;
  document.head.appendChild(script);

  // noscript fallback
  const noscript = document.createElement('noscript');
  const div = document.createElement('div');
  const img = document.createElement('img');
  img.src = 'https://mc.yandex.ru/watch/108756233';
  img.style.position = 'absolute';
  img.style.left = '-9999px';
  img.alt = '';
  div.appendChild(img);
  noscript.appendChild(div);
  document.body.appendChild(noscript);
}

export default AnalyticsLoader;
