import SiteLayout from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Coins, Image as ImageIcon, Loader2, Video, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchUserBalance, fetchGenerationHistory, type GenerationHistoryItem } from "@/lib/chatApi";

const Personal = () => {
  useEffect(() => { document.title = "Личный кабинет — Imagination AI"; }, []);
  const [amount, setAmount] = useState(500);
  const [balance, setBalance] = useState<number | null>(null);
  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    fetchUserBalance()
      .then(b => setBalance(b.points))
      .catch(() => setBalance(0));

    fetchGenerationHistory(100)
      .then(h => setHistory(h))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, []);

  const isVideoUrl = (url?: string) => url ? /\.(mp4|webm|mov)(\?|$)/i.test(url) : false;

  return (
    <SiteLayout>
      <section className="py-12">
        <div className="container max-w-5xl">
          <h1 className="font-display text-4xl md:text-5xl mb-2">Личный кабинет</h1>
          <p className="text-muted-foreground mb-10">Добро пожаловать в Imagination</p>

          <div className="grid md:grid-cols-3 gap-4 mb-10">
            <div className="md:col-span-2 rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 to-transparent p-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Coins className="h-4 w-4" /> Баланс
              </div>
              {balance === null
                ? <Loader2 className="h-6 w-6 animate-spin text-accent" />
                : <p className="font-display text-6xl mb-4">{balance} <span className="text-2xl text-muted-foreground">пт</span></p>
              }
              <Button asChild variant="hero">
                <Link to="/chat">Начать генерацию</Link>
              </Button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-card p-6">
              <p className="text-sm text-muted-foreground mb-1">Генераций</p>
              {historyLoading
                ? <Loader2 className="h-6 w-6 animate-spin text-accent mb-4" />
                : <p className="font-display text-4xl mb-4">{history.length}</p>
              }
              <p className="text-xs text-muted-foreground">Всего создано работ</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-card p-8 mb-10">
            <h2 className="text-xl font-medium mb-2">Докупить поинты</h2>
            <p className="text-sm text-muted-foreground mb-6">100 ₽ = 100 поинтов. Минимум — 100 поинтов.</p>
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Сумма (поинтов)</label>
                <Input type="number" min={100} step={100} value={amount} onChange={e => setAmount(Math.max(100, +e.target.value))} className="w-40 mt-1" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">К оплате</label>
                <p className="font-display text-3xl">{amount} ₽</p>
              </div>
              <Button variant="glow" onClick={() => toast.info("Оплата подключится позже")}>Оплатить</Button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-card p-8">
            <div className="flex items-center gap-2 mb-6">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-xl font-medium">История генераций</h2>
              {!historyLoading && history.length > 0 && (
                <span className="ml-auto text-sm text-muted-foreground">{history.length} работ</span>
              )}
            </div>

            {historyLoading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
              </div>
            )}

            {!historyLoading && history.length === 0 && (
              <div className="text-center py-16">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-30" />
                <p className="text-muted-foreground">Ваши работы появятся здесь после первой генерации.</p>
                <Button asChild variant="outline" className="mt-4">
                  <Link to="/chat">Перейти в чат</Link>
                </Button>
              </div>
            )}

            {!historyLoading && history.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="group relative rounded-xl overflow-hidden border border-white/5 bg-black/20"
                    style={{ aspectRatio: "1/1" }}
                  >
                    {item.resultUrl ? (
                      isVideoUrl(item.resultUrl) ? (
                        <video
                          src={item.resultUrl}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                          onMouseEnter={e => (e.target as HTMLVideoElement).play()}
                          onMouseLeave={e => { const v = e.target as HTMLVideoElement; v.pause(); v.currentTime = 0; }}
                        />
                      ) : (
                        <img
                          src={item.resultUrl}
                          alt={item.prompt}
                          className="w-full h-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/[0.03]">
                        {isVideoUrl(item.resultUrl)
                          ? <Video className="h-8 w-8 text-muted-foreground opacity-30" />
                          : <ImageIcon className="h-8 w-8 text-muted-foreground opacity-30" />
                        }
                      </div>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                      <p className="text-[11px] text-white leading-tight line-clamp-2 mb-1">{item.prompt}</p>
                      <div className="flex items-center justify-between text-[9px] text-white/50">
                        <span className="font-mono">{item.modelSlug?.split('/')?.[1] || item.modelSlug}</span>
                        <span className="flex items-center gap-0.5">
                          <Calendar className="h-2.5 w-2.5" />
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString("ru") : ""}
                        </span>
                      </div>
                      {item.cost > 0 && (
                        <div className="text-[9px] font-mono mt-1" style={{ color: "hsl(var(--accent))" }}>
                          {item.cost} пт
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Personal;
