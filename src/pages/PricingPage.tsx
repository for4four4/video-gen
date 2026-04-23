import SiteLayout from "@/components/layout/SiteLayout";
import Pricing from "@/components/sections/Pricing";
import FAQ from "@/components/sections/FAQ";
import { useEffect } from "react";

const PricingPage = () => {
  useEffect(() => { document.title = "Тарифы — Imagination AI"; }, []);
  return (
    <SiteLayout>
      <div className="pt-10"><Pricing /></div>
      <FAQ />
    </SiteLayout>
  );
};

export default PricingPage;
