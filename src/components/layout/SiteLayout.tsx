import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import SideAmbient from "./SideAmbient";

type Props = {
  children: ReactNode;
  /** Боковые ambient-анимации для внутренних страниц */
  ambient?: "models" | "blog" | "news";
};

const SiteLayout = ({ children, ambient }: Props) => {
  return (
    <div className="relative min-h-screen flex flex-col bg-background overflow-x-clip">
      {ambient && <SideAmbient variant={ambient} />}
      <Header />
      <main className="relative z-10 flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
};

export default SiteLayout;
