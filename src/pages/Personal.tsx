import SiteLayout from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Coins, Image as ImageIcon, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchUserBalance } from "@/lib/chatApi";

const Personal = () => {
  useEffect(() => { document.title = "Личный кабинет — Imagination AI"; }, []);
  const [amount, setAmount] = useState(500);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    fetchUserBalance()
      .then(b => setBalance(b.points))
      .catch(() => setBalance(0));
  }, []);

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
              <p className="font-display text-4xl mb-4">0</p>
              <p className="text-xs text-muted-foreground">Создавайте, чтобы видеть статистику</p>
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
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-xl font-medium">История генераций</h2>
            </div>
            <p className="text-sm text-muted-foreground">Ваши работы появятся здесь.</p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Personal;
