import SiteLayout from "@/components/layout/SiteLayout";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBlogList, getBlogPost, type BlogPost as BlogPostType } from "@/lib/api";

// ─── Gradient placeholder ─────────────────────────────────────────────────
const GRADIENTS = [
  "linear-gradient(135deg, #2a1b4e 0%, #6b2a8a 40%, #c65d8e 100%)",
  "linear-gradient(145deg, #0f2a44 0%, #2e6ca8 50%, #a8d8e8 100%)",
  "linear-gradient(135deg, #1a1a1a 0%, #3d2817 50%, #c6833f 100%)",
  "linear-gradient(140deg, #0d2818 0%, #2d6b47 50%, #9fd4a8 100%)",
  "linear-gradient(135deg, #2a0a1c 0%, #8a2a4e 50%, #f4a5c0 100%)",
  "linear-gradient(150deg, #1c1c2e 0%, #4a4a7a 50%, #b0b0d0 100%)",
];
const gradFor = (seed: string) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = ((h * 31 + seed.charCodeAt(i)) >>> 0);
  return GRADIENTS[h % GRADIENTS.length];
};
const Placeholder = ({ seed, aspect = "1/1", className = "" }: { seed: string; aspect?: string; className?: string }) => (
  <div className={`relative overflow-hidden ${className}`} style={{ aspectRatio: aspect, background: gradFor(seed) }}>
    <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 8px)" }} />
  </div>
);

/** Detect if string contains HTML tags */
const isHTML = (str: string) => /<[a-z][\s\S]*>/i.test(str || '');

// ─── BlogList ─────────────────────────────────────────────────────────────
export const BlogList = () => {
  useEffect(() => { document.title = "Блог — Imagination AI"; }, []);
  const [hover, setHover] = useState<string | null>(null);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog'],
    queryFn: getBlogList,
  });

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <SiteLayout ambient="blog">
      <section className="relative py-20">
        <div className="max-w-[1200px] mx-auto px-10">

          <div className="pb-8 mb-10" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-[10px] tracking-[0.4em] uppercase mb-3" style={{ color: "rgba(250,250,250,0.42)" }}>
                  Imagination · Журнал
                </div>
                <h1 className="font-display tracking-tight leading-[0.9]" style={{ fontSize: "clamp(72px, 9vw, 120px)", fontWeight: 400 }}>
                  The<br /><em className="text-accent not-italic">Journal</em>
                </h1>
              </div>
              <div className="text-right text-[13px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                <div>{posts.length} материалов</div>
              </div>
            </div>
          </div>

          {isLoading && (
            <div className="text-center py-20 text-muted-foreground">Загрузка...</div>
          )}

          {!isLoading && posts.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">Статьи пока не опубликованы</div>
          )}

          {featured && (
            <Link to={`/blog/${featured.slug}`} className="block group mb-16">
              <div className="flex items-start gap-8">
                <div className="flex-1">
                  <div className="text-[10px] tracking-[0.3em] uppercase mb-4" style={{ color: "hsl(var(--accent))" }}>→ Сегодня читают</div>
                  <h2 className="font-display tracking-tight leading-[0.98] mb-6 transition-colors group-hover:text-accent" style={{ fontSize: "clamp(40px, 5vw, 64px)", fontWeight: 400 }}>
                    {featured.title}
                  </h2>
                  <p className="text-[17px] leading-relaxed max-w-xl mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>{featured.excerpt}</p>
                  <div className="flex items-center gap-4 text-[12px]" style={{ color: "rgba(250,250,250,0.42)" }}>
                    <span>{featured.author}</span>
                    {featured.category && <><span>·</span><span>{featured.category}</span></>}
                    <span>·</span><span>{featured.read_minutes} мин</span>
                    <span>·</span><span>{featured.published_at?.slice(0, 10) || featured.created_at?.slice(0, 10)}</span>
                  </div>
                </div>
                {featured.cover_image
                  ? <img src={featured.cover_image} alt={featured.title} className="w-[300px] shrink-0 object-cover" style={{ aspectRatio: "3/4" }} />
                  : <Placeholder seed={featured.slug} aspect="3/4" className="w-[300px] shrink-0" />
                }
              </div>
            </Link>
          )}

          {rest.length > 0 && (
            <>
              <div className="flex items-center gap-4 mb-8">
                <span className="text-[11px] tracking-[0.3em] uppercase" style={{ color: "rgba(250,250,250,0.42)" }}>Все материалы</span>
                <div className="flex-1 h-px" style={{ background: "hsl(var(--border))" }} />
              </div>

              <div style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                {rest.map((p, i) => (
                  <Link key={p.slug} to={`/blog/${p.slug}`}
                    className="grid gap-6 py-7 items-center cursor-pointer transition-colors"
                    style={{ gridTemplateColumns: "1fr 7fr 2fr 2fr", borderTop: "1px solid hsl(var(--border))" }}
                    onMouseEnter={() => setHover(p.slug)}
                    onMouseLeave={() => setHover(null)}
                  >
                    <span className="text-[11px] font-mono" style={{ color: "rgba(250,250,250,0.42)" }}>{String(i + 2).padStart(2, "0")}</span>
                    <div>
                      <h3 className="font-display tracking-tight transition-all" style={{ fontSize: 32, fontWeight: 400, lineHeight: 1.1, color: hover === p.slug ? "hsl(var(--accent))" : "hsl(var(--foreground))", fontStyle: hover === p.slug ? "italic" : "normal" }}>
                        {p.title}
                      </h3>
                      <p className="mt-2 text-[13px] max-w-lg" style={{ color: "hsl(var(--muted-foreground))" }}>{p.excerpt}</p>
                    </div>
                    <div className="text-[11px]" style={{ color: "rgba(250,250,250,0.42)" }}>
                      <div className="uppercase tracking-widest mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>{p.category}</div>
                      <div>{p.read_minutes} мин · {p.author}</div>
                    </div>
                    {p.cover_image
                      ? <img src={p.cover_image} alt={p.title} className="rounded" style={{ aspectRatio: "4/3", objectFit: "cover", opacity: hover === p.slug ? 1 : 0.6 }} />
                      : <Placeholder seed={p.slug} aspect="4/3" className="rounded" />
                    }
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </SiteLayout>
  );
};

// ─── BlogPost ─────────────────────────────────────────────────────────────
export const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['blog', slug],
    queryFn: () => getBlogPost(slug!),
    enabled: !!slug,
  });

  useEffect(() => { if (post) document.title = `${post.title} — Imagination AI Блог`; }, [post]);

  if (isLoading) return <SiteLayout ambient="blog"><div className="container py-32 text-center text-muted-foreground">Загрузка...</div></SiteLayout>;
  if (isError || !post) return <SiteLayout ambient="blog"><div className="container py-32 text-center">Статья не найдена</div></SiteLayout>;

  const contentIsHTML = isHTML(post.content);

  return (
    <SiteLayout ambient="blog">
      <article className="py-20">
        <div className="container max-w-3xl">
          <Link to="/blog" className="text-sm mb-8 inline-block transition-colors hover:text-accent" style={{ color: "hsl(var(--muted-foreground))" }}>
            ← Все статьи
          </Link>
          <div className="flex items-center gap-3 text-[11px] mb-4" style={{ color: "rgba(250,250,250,0.42)" }}>
            {post.category && <span className="px-2 py-0.5 rounded-full" style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--accent))" }}>{post.category}</span>}
            <span>·</span><span>{post.read_minutes} мин</span>
            <span>·</span><span>{post.published_at?.slice(0, 10) || post.created_at?.slice(0, 10)}</span>
          </div>
          <h1 className="font-display tracking-tight mb-8" style={{ fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 400, lineHeight: 1.05 }}>
            {post.title}
          </h1>
          <p className="text-xl mb-10 leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>{post.excerpt}</p>
          {post.cover_image
            ? <img src={post.cover_image} alt={post.title} className="w-full rounded-[14px] mb-10 object-cover"/>
            : <Placeholder seed={post.slug} aspect="16/9" className="rounded-[14px] mb-10" />
          }
          
          {/* Content: render as HTML if contains tags, otherwise as plain text */}
          {post.content && (
            contentIsHTML ? (
              <div 
                className="article-content" 
                dangerouslySetInnerHTML={{ __html: post.content }} 
              />
            ) : (
              <div className="article-content whitespace-pre-wrap">{post.content}</div>
            )
          )}
        </div>
      </article>
    </SiteLayout>
  );
};
