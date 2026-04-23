import SiteLayout from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, Image as ImageIcon, Video as VideoIcon } from "lucide-react";
import { useEffect } from "react";

export type Model = {
  slug: string;
  name: string;
  type: "image" | "video";
  vendor: string;
  pricePoints: number;
  description: string;
  longDescription: string;
  tags: string[];
};

export const MODELS: Model[] = [
  { slug: "midjourney-v7", name: "Midjourney v7", type: "image", vendor: "Midjourney", pricePoints: 12, description: "Эталон фотореалистичной и художественной генерации.", longDescription: "Midjourney v7 — флагманская модель с непревзойдённым уровнем художественности. Идеальна для постеров, концепт-арта, fashion и редакторских иллюстраций.", tags: ["фотореализм", "арт", "постеры"] },
  { slug: "flux-pro", name: "Flux Pro", type: "image", vendor: "Black Forest Labs", pricePoints: 8, description: "Молниеносная генерация с филигранной детализацией.", longDescription: "Flux Pro — быстрая модель с отличной читаемостью текста на изображениях и точностью композиции.", tags: ["скорость", "текст", "детали"] },
  { slug: "dalle-3", name: "DALL·E 3", type: "image", vendor: "OpenAI", pricePoints: 10, description: "Понимает сложные промпты буквально.", longDescription: "DALL·E 3 отлично интерпретирует длинные промпты, сохраняя все детали — от композиции до конкретных объектов.", tags: ["промпт", "иллюстрация"] },
  { slug: "stable-diffusion-xl", name: "Stable Diffusion XL", type: "image", vendor: "Stability AI", pricePoints: 5, description: "Открытая модель с безграничной кастомизацией.", longDescription: "SDXL — мощная open-source модель с поддержкой LoRA и тонкой настройкой стиля.", tags: ["open-source", "стиль"] },
  { slug: "sora", name: "Sora", type: "video", vendor: "OpenAI", pricePoints: 80, description: "Кинематографичное видео из текста.", longDescription: "Sora — флагманская text-to-video модель OpenAI. До 20 секунд видео с консистентной физикой и сюжетом.", tags: ["text-to-video", "кино"] },
  { slug: "veo-3", name: "Veo 3", type: "video", vendor: "Google DeepMind", pricePoints: 90, description: "1080p видео с синхронным звуком.", longDescription: "Veo 3 от Google DeepMind генерирует видео с естественным движением камеры и встроенной аудиодорожкой.", tags: ["1080p", "звук"] },
  { slug: "kling-2", name: "Kling 2", type: "video", vendor: "Kuaishou", pricePoints: 60, description: "Реалистичное движение и динамика.", longDescription: "Kling славится плавностью движения людей и животных. Отличный выбор для коротких рекламных роликов.", tags: ["движение", "реклама"] },
  { slug: "runway-gen3", name: "Runway Gen-3", type: "video", vendor: "Runway", pricePoints: 70, description: "Кинематограф для творцов.", longDescription: "Runway Gen-3 даёт полный контроль над камерой и стилем. Используется в продакшене кино и клипов.", tags: ["клипы", "контроль"] },
];

export const ModelsList = () => {
  useEffect(() => { document.title = "Модели ИИ — Imagination AI"; }, []);
  const images = MODELS.filter(m => m.type === "image");
  const videos = MODELS.filter(m => m.type === "video");

  return (
    <SiteLayout ambient="models">
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">Каталог</p>
            <h1 className="font-display text-5xl md:text-7xl tracking-tight mb-4">
              Все <span className="italic text-gradient-brand">модели</span> в одном месте
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Лучшие нейросети для изображений и видео. Цена в поинтах включает наш сервисный коэффициент.
            </p>
          </div>

          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <ImageIcon className="h-5 w-5 text-accent" />
              <h2 className="text-2xl font-medium">Изображения</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {images.map((m) => <ModelCard key={m.slug} m={m} />)}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-6">
              <VideoIcon className="h-5 w-5 text-accent" />
              <h2 className="text-2xl font-medium">Видео</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {videos.map((m) => <ModelCard key={m.slug} m={m} />)}
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

const ModelCard = ({ m }: { m: Model }) => (
  <Link to={`/models/${m.slug}`} className="group block rounded-2xl border border-white/10 bg-card p-5 hover:border-accent/40 hover:bg-card/80 transition-all">
    <div className="flex items-start justify-between mb-3">
      <div>
        <p className="text-xs text-muted-foreground mb-1">{m.vendor}</p>
        <h3 className="font-medium text-lg">{m.name}</h3>
      </div>
      <span className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 text-muted-foreground">
        {m.pricePoints} пт
      </span>
    </div>
    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{m.description}</p>
    <span className="text-xs text-accent flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      Подробнее <ArrowRight className="h-3 w-3" />
    </span>
  </Link>
);

export const ModelDetail = () => {
  const { slug } = useParams();
  const model = MODELS.find(m => m.slug === slug);

  useEffect(() => {
    if (model) document.title = `${model.name} — Imagination AI`;
  }, [model]);

  if (!model) {
    return (
      <SiteLayout ambient="models">
        <div className="container py-32 text-center">
          <h1 className="text-2xl mb-4">Модель не найдена</h1>
          <Button asChild variant="outlineGlow"><Link to="/models">К каталогу</Link></Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout ambient="models">
      <section className="py-20">
        <div className="container max-w-4xl">
          <Link to="/models" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-8">
            ← Все модели
          </Link>

          <p className="text-sm text-muted-foreground mb-2">{model.vendor} · {model.type === "image" ? "Изображения" : "Видео"}</p>
          <h1 className="font-display text-5xl md:text-7xl tracking-tight mb-6">{model.name}</h1>
          <p className="text-xl text-muted-foreground mb-8">{model.description}</p>

          <div className="flex flex-wrap gap-2 mb-10">
            {model.tags.map(t => (
              <span key={t} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10">{t}</span>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-card p-8 mb-10">
            <p className="leading-relaxed text-foreground/90">{model.longDescription}</p>
          </div>

          <div className="rounded-2xl border border-accent/20 bg-accent/5 p-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Цена за генерацию</p>
              <p className="font-display text-3xl">{model.pricePoints} <span className="text-base text-muted-foreground">поинтов</span></p>
            </div>
            <Button asChild variant="glow" size="lg">
              <Link to="/chat">Попробовать в чате <ArrowRight /></Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};
