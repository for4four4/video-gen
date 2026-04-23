import SiteLayout from "@/components/layout/SiteLayout";
import { Link, useParams } from "react-router-dom";
import { useEffect } from "react";

export const NEWS = [
  { slug: "veo3-launch", title: "Veo 3 теперь в Imagination", excerpt: "Подключили флагманскую видео-модель Google DeepMind с поддержкой звука.", date: "2025-04-15" },
  { slug: "midjourney-v7", title: "Midjourney v7 — новый эталон", excerpt: "Обновили модель до v7. Качество выросло, цена осталась прежней.", date: "2025-04-08" },
  { slug: "flux-pro-update", title: "Flux Pro: ускорение в 2 раза", excerpt: "Чёрный лес апдейтнул архитектуру. Генерация теперь быстрее.", date: "2025-03-30" },
  { slug: "kling-2", title: "Kling 2 в каталоге", excerpt: "Добавили обновлённую версию Kling с улучшенной физикой движения.", date: "2025-03-22" },
];

export const NewsList = () => {
  useEffect(() => { document.title = "Новости — Imagination AI"; }, []);
  return (
    <SiteLayout ambient="news">
      <section className="py-20">
        <div className="container max-w-3xl">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">Новости</p>
            <h1 className="font-display text-5xl md:text-7xl tracking-tight">
              Что <span className="italic text-gradient-brand">нового</span>
            </h1>
          </div>

          <div className="space-y-3">
            {NEWS.map(n => (
              <Link key={n.slug} to={`/news/${n.slug}`} className="group flex items-start gap-6 p-5 rounded-2xl border border-white/10 bg-card hover:border-accent/40 transition-all">
                <span className="text-xs text-muted-foreground shrink-0 w-24">{n.date}</span>
                <div>
                  <h2 className="font-medium text-lg mb-1 group-hover:text-accent transition-colors">{n.title}</h2>
                  <p className="text-sm text-muted-foreground">{n.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export const NewsItem = () => {
  const { slug } = useParams();
  const n = NEWS.find(x => x.slug === slug);
  useEffect(() => { if (n) document.title = `${n.title} — Imagination AI`; }, [n]);
  if (!n) return <SiteLayout ambient="news"><div className="container py-32 text-center">Новость не найдена</div></SiteLayout>;
  return (
    <SiteLayout ambient="news">
      <article className="py-20">
        <div className="container max-w-3xl">
          <Link to="/news" className="text-sm text-muted-foreground hover:text-foreground mb-8 inline-block">← Все новости</Link>
          <p className="text-xs text-muted-foreground mb-3">{n.date}</p>
          <h1 className="font-display text-4xl md:text-6xl tracking-tight mb-6">{n.title}</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">{n.excerpt}</p>
        </div>
      </article>
    </SiteLayout>
  );
};
