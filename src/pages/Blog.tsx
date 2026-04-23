import SiteLayout from "@/components/layout/SiteLayout";
import { Link, useParams } from "react-router-dom";
import { useEffect } from "react";
import { Calendar } from "lucide-react";

export type Post = { slug: string; title: string; excerpt: string; content: string; date: string; category: string };

export const BLOG_POSTS: Post[] = [
  { slug: "midjourney-vs-flux", title: "Midjourney vs Flux: что выбрать в 2025", excerpt: "Сравниваем две топовые модели по качеству, скорости и цене.", content: "Midjourney v7 остаётся эталоном художественности, но Flux Pro выигрывает в скорости и детализации мелких объектов. В этой статье разберём, в каких сценариях какая модель лучше...", date: "2025-04-01", category: "Сравнения" },
  { slug: "video-ai-guide", title: "Гид по видео-нейросетям: Sora, Veo, Kling", excerpt: "Полный обзор актуальных моделей для генерации видео.", content: "Sora от OpenAI задаёт стандарт кинематографичности, Veo 3 добавляет звук, а Kling 2 лидирует по плавности движений...", date: "2025-03-25", category: "Гайды" },
  { slug: "prompt-engineering", title: "Промпт-инжиниринг для изображений", excerpt: "Как правильно описывать сцены, чтобы получать нужный результат.", content: "Хороший промпт — это 80% успеха. Структурируйте описание: субъект, действие, окружение, стиль, освещение, ракурс...", date: "2025-03-18", category: "Туториалы" },
  { slug: "commercial-use", title: "Можно ли использовать AI-арт коммерчески", excerpt: "Разбираемся с правами на генерации.", content: "В Imagination все права на сгенерированные материалы передаются пользователю. Но есть нюансы по моделям...", date: "2025-03-10", category: "Право" },
];

export const BlogList = () => {
  useEffect(() => { document.title = "Блог — Imagination AI"; }, []);
  return (
    <SiteLayout ambient="blog">
      <section className="py-20">
        <div className="container max-w-5xl">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">Блог</p>
            <h1 className="font-display text-5xl md:text-7xl tracking-tight">
              Идеи и <span className="italic text-gradient-brand">инсайты</span>
            </h1>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {BLOG_POSTS.map(p => (
              <Link key={p.slug} to={`/blog/${p.slug}`} className="group rounded-2xl border border-white/10 bg-card p-6 hover:border-accent/40 transition-all">
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">{p.category}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{p.date}</span>
                </div>
                <h2 className="font-display text-2xl mb-2 group-hover:text-accent transition-colors">{p.title}</h2>
                <p className="text-sm text-muted-foreground">{p.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export const BlogPost = () => {
  const { slug } = useParams();
  const post = BLOG_POSTS.find(p => p.slug === slug);

  useEffect(() => {
    if (post) document.title = `${post.title} — Imagination AI Блог`;
  }, [post]);

  if (!post) return <SiteLayout ambient="blog"><div className="container py-32 text-center">Статья не найдена</div></SiteLayout>;

  return (
    <SiteLayout ambient="blog">
      <article className="py-20">
        <div className="container max-w-3xl">
          <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground mb-8 inline-block">← Все статьи</Link>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">{post.category}</span>
            <span>{post.date}</span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl tracking-tight mb-8">{post.title}</h1>
          <p className="text-xl text-muted-foreground mb-10 leading-relaxed">{post.excerpt}</p>
          <div className="prose prose-invert max-w-none text-foreground/90 leading-relaxed">{post.content}</div>
        </div>
      </article>
    </SiteLayout>
  );
};
