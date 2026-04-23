import SiteLayout from "@/components/layout/SiteLayout";
import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import Showcase from "@/components/sections/Showcase";
import ChatSlider from "@/components/sections/ChatSlider";
import Pricing from "@/components/sections/Pricing";
import Testimonials from "@/components/sections/Testimonials";
import FAQ from "@/components/sections/FAQ";
import CTA from "@/components/sections/CTA";
import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    document.title = "Imagination AI — Чат с ИИ для генерации видео и изображений";

    // JSON-LD
    const ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Imagination AI",
      url: window.location.origin,
      description: "Единый чат с десятками ИИ-моделей для генерации изображений и видео.",
    });
    document.head.appendChild(ld);
    return () => { document.head.removeChild(ld); };
  }, []);

  return (
    <SiteLayout>
      <Hero />
      <Features />
      <Showcase />
      <ChatSlider />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CTA />
    </SiteLayout>
  );
};

export default Index;
