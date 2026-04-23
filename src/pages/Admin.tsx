import SiteLayout from "@/components/layout/SiteLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Users,
  CreditCard,
  Eye,
  Image as ImageIcon,
  TrendingUp,
  RefreshCw,
  Settings as SettingsIcon,
  Activity,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  fetchOverview,
  fetchUsers,
  fetchPayments,
  fetchModelCoefficients,
  fetchGenerations,
  fetchSettings,
  updateModel,
  updateUser,
  updateSettings,
  syncModelsFromPolza,
  type OverviewMetrics,
  type UserRow,
  type PaymentRow,
  type ModelCoefficient,
  type GenerationLog,
  type AdminSettings,
  type Range,
} from "@/lib/adminApi";

const Admin = () => {
  useEffect(() => {
    document.title = "Админ — Imagination AI";
  }, []);

  const [range, setRange] = useState<Range>("30d");
  const [overview, setOverview] = useState<OverviewMetrics | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [models, setModels] = useState<ModelCoefficient[]>([]);
  const [gens, setGens] = useState<GenerationLog[]>([]);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [syncing, setSyncing] = useState(false);

  const loadAll = async () => {
    const [o, u, p, m, g, s] = await Promise.all([
      fetchOverview(range),
      fetchUsers(),
      fetchPayments(),
      fetchModelCoefficients(),
      fetchGenerations(),
      fetchSettings(),
    ]);
    setOverview(o);
    setUsers(u);
    setPayments(p);
    setModels(m);
    setGens(g);
    setSettings(s);
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const handleSync = async () => {
    setSyncing(true);
    const res = await syncModelsFromPolza();
    setSyncing(false);
    toast.success(`Синхронизировано моделей: ${res.updated}`);
    const m = await fetchModelCoefficients();
    setModels(m);
  };

  const updateCoef = async (slug: string, coefficient: number) => {
    setModels(curr =>
      curr.map(m =>
        m.slug === slug
          ? { ...m, coefficient, pointsPrice: Math.round(m.basePriceUsd * 100 * coefficient) }
          : m,
      ),
    );
    await updateModel(slug, { coefficient });
  };

  const toggleModel = async (slug: string, enabled: boolean) => {
    setModels(curr => curr.map(m => (m.slug === slug ? { ...m, enabled } : m)));
    await updateModel(slug, { enabled });
    toast.success(enabled ? "Модель включена" : "Модель выключена");
  };

  const toggleUser = async (id: string, status: "active" | "blocked") => {
    setUsers(curr => curr.map(u => (u.id === id ? { ...u, status } : u)));
    await updateUser(id, { status });
    toast.success(status === "blocked" ? "Пользователь заблокирован" : "Разблокирован");
  };

  const saveSettings = async () => {
    if (!settings) return;
    await updateSettings(settings);
    toast.success("Настройки сохранены");
  };

  const stats = overview
    ? [
        { icon: Eye, label: "Посещения", value: overview.visits.total.toLocaleString("ru"), change: `+${overview.visits.change}%` },
        { icon: Users, label: "Пользователи", value: overview.users.total.toLocaleString("ru"), change: `+${overview.users.change}` },
        { icon: ImageIcon, label: "Генераций", value: overview.generations.total.toLocaleString("ru"), change: `+${overview.generations.change}` },
        { icon: CreditCard, label: "Оплат, ₽", value: overview.revenueRub.total.toLocaleString("ru"), change: `+${overview.revenueRub.change}%` },
      ]
    : [];

  return (
    <SiteLayout>
      <section className="py-12">
        <div className="container max-w-7xl">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3 mb-10">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">Admin</p>
              <h1 className="font-display text-4xl md:text-5xl">Панель управления</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-white/10 bg-card p-1">
                {(["24h", "7d", "30d", "90d"] as Range[]).map(r => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                      range === r ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <Button variant="outlineGlow" onClick={loadAll}>
                <TrendingUp className="h-4 w-4" /> Обновить
              </Button>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {stats.map(s => (
              <div key={s.label} className="rounded-2xl border border-white/10 bg-card p-6">
                <div className="flex items-center justify-between mb-3">
                  <s.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-accent">{s.change}</span>
                </div>
                <p className="font-display text-3xl mb-1">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="models" className="w-full">
            <TabsList className="bg-card border border-white/10 mb-6">
              <TabsTrigger value="models"><Sparkles className="h-3.5 w-3.5 mr-1.5" />Модели</TabsTrigger>
              <TabsTrigger value="users"><Users className="h-3.5 w-3.5 mr-1.5" />Пользователи</TabsTrigger>
              <TabsTrigger value="payments"><CreditCard className="h-3.5 w-3.5 mr-1.5" />Оплаты</TabsTrigger>
              <TabsTrigger value="generations"><Activity className="h-3.5 w-3.5 mr-1.5" />Генерации</TabsTrigger>
              <TabsTrigger value="settings"><SettingsIcon className="h-3.5 w-3.5 mr-1.5" />Настройки</TabsTrigger>
            </TabsList>

            {/* MODELS */}
            <TabsContent value="models">
              <div className="rounded-2xl border border-white/10 bg-card p-8">
                <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
                  <div>
                    <h2 className="text-xl font-medium mb-1">Коэффициенты моделей</h2>
                    <p className="text-sm text-muted-foreground">
                      Поинты = базовая цена (USD) × 100 × коэффициент. Источник цен — polza.ai.
                    </p>
                  </div>
                  <Button variant="outlineGlow" onClick={handleSync} disabled={syncing}>
                    <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
                    Sync polza.ai
                  </Button>
                </div>

                <div className="space-y-1">
                  <div className="grid grid-cols-12 text-xs text-muted-foreground px-3 pb-2 border-b border-white/5">
                    <div className="col-span-4">Модель</div>
                    <div className="col-span-2">Тип</div>
                    <div className="col-span-2">База ($)</div>
                    <div className="col-span-2">Коэф.</div>
                    <div className="col-span-1 text-right">Поинтов</div>
                    <div className="col-span-1 text-right">Вкл.</div>
                  </div>
                  {models.map(m => (
                    <div key={m.slug} className="grid grid-cols-12 items-center px-3 py-2.5 hover:bg-white/[0.02] rounded-lg">
                      <div className="col-span-4">
                        <p className="text-sm font-medium">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.vendor}</p>
                      </div>
                      <div className="col-span-2">
                        <Badge variant="outline" className="text-xs">{m.type === "image" ? "Image" : "Video"}</Badge>
                      </div>
                      <div className="col-span-2 text-sm">${m.basePriceUsd.toFixed(2)}</div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          min={1}
                          step={0.1}
                          value={m.coefficient}
                          onChange={e => updateCoef(m.slug, +e.target.value)}
                          className="h-8 w-24 text-sm"
                        />
                      </div>
                      <div className="col-span-1 text-right font-medium text-accent">{m.pointsPrice}</div>
                      <div className="col-span-1 flex justify-end">
                        <Switch checked={m.enabled} onCheckedChange={v => toggleModel(m.slug, v)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* USERS */}
            <TabsContent value="users">
              <div className="rounded-2xl border border-white/10 bg-card p-8">
                <h2 className="text-xl font-medium mb-6">Пользователи</h2>
                <div className="space-y-1">
                  <div className="grid grid-cols-12 text-xs text-muted-foreground px-3 pb-2 border-b border-white/5">
                    <div className="col-span-4">Email</div>
                    <div className="col-span-2">Регистрация</div>
                    <div className="col-span-2 text-right">Баланс</div>
                    <div className="col-span-1 text-right">Ген.</div>
                    <div className="col-span-2 text-right">Потрачено ₽</div>
                    <div className="col-span-1 text-right">Статус</div>
                  </div>
                  {users.map(u => (
                    <div key={u.id} className="grid grid-cols-12 items-center px-3 py-2.5 hover:bg-white/[0.02] rounded-lg text-sm">
                      <div className="col-span-4 font-medium truncate">{u.email}</div>
                      <div className="col-span-2 text-muted-foreground text-xs">{u.createdAt}</div>
                      <div className="col-span-2 text-right text-accent">{u.pointsBalance} пт</div>
                      <div className="col-span-1 text-right text-muted-foreground">{u.generations}</div>
                      <div className="col-span-2 text-right">{u.totalSpentRub.toLocaleString("ru")} ₽</div>
                      <div className="col-span-1 flex justify-end">
                        <button
                          onClick={() => toggleUser(u.id, u.status === "active" ? "blocked" : "active")}
                          className="text-xs"
                        >
                          <Badge variant={u.status === "active" ? "outline" : "destructive"}>{u.status}</Badge>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* PAYMENTS */}
            <TabsContent value="payments">
              <div className="rounded-2xl border border-white/10 bg-card p-8">
                <h2 className="text-xl font-medium mb-6">Оплаты</h2>
                <div className="space-y-1">
                  <div className="grid grid-cols-12 text-xs text-muted-foreground px-3 pb-2 border-b border-white/5">
                    <div className="col-span-3">ID</div>
                    <div className="col-span-3">Email</div>
                    <div className="col-span-2 text-right">Сумма ₽</div>
                    <div className="col-span-2 text-right">Поинтов</div>
                    <div className="col-span-2 text-right">Статус</div>
                  </div>
                  {payments.map(p => (
                    <div key={p.id} className="grid grid-cols-12 items-center px-3 py-2.5 hover:bg-white/[0.02] rounded-lg text-sm">
                      <div className="col-span-3 font-mono text-xs text-muted-foreground">{p.id}</div>
                      <div className="col-span-3 truncate">{p.userEmail}</div>
                      <div className="col-span-2 text-right">{p.amountRub.toLocaleString("ru")}</div>
                      <div className="col-span-2 text-right text-accent">{p.points}</div>
                      <div className="col-span-2 flex justify-end">
                        <Badge
                          variant={
                            p.status === "succeeded" ? "default" : p.status === "pending" ? "outline" : "destructive"
                          }
                        >
                          {p.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* GENERATIONS */}
            <TabsContent value="generations">
              <div className="rounded-2xl border border-white/10 bg-card p-8">
                <h2 className="text-xl font-medium mb-6">Лог генераций</h2>
                <div className="space-y-1">
                  <div className="grid grid-cols-12 text-xs text-muted-foreground px-3 pb-2 border-b border-white/5">
                    <div className="col-span-3">ID</div>
                    <div className="col-span-3">Email</div>
                    <div className="col-span-3">Модель</div>
                    <div className="col-span-1 text-right">Поинтов</div>
                    <div className="col-span-2 text-right">Статус</div>
                  </div>
                  {gens.map(g => (
                    <div key={g.id} className="grid grid-cols-12 items-center px-3 py-2.5 hover:bg-white/[0.02] rounded-lg text-sm">
                      <div className="col-span-3 font-mono text-xs text-muted-foreground">{g.id}</div>
                      <div className="col-span-3 truncate">{g.userEmail}</div>
                      <div className="col-span-3 text-muted-foreground">{g.modelSlug}</div>
                      <div className="col-span-1 text-right text-accent">{g.pointsSpent}</div>
                      <div className="col-span-2 flex justify-end">
                        <Badge
                          variant={
                            g.status === "success" ? "default" : g.status === "running" ? "outline" : "destructive"
                          }
                        >
                          {g.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* SETTINGS */}
            <TabsContent value="settings">
              <div className="rounded-2xl border border-white/10 bg-card p-8 max-w-2xl">
                <h2 className="text-xl font-medium mb-6">Настройки платформы</h2>
                {settings && (
                  <div className="space-y-5">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1.5">Курс: 1 поинт = ₽</label>
                      <Input
                        type="number"
                        step={0.1}
                        value={settings.pointToRubRate}
                        onChange={e => setSettings({ ...settings, pointToRubRate: +e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1.5">Бонус при регистрации, поинты</label>
                      <Input
                        type="number"
                        value={settings.signupBonusPoints}
                        onChange={e => setSettings({ ...settings, signupBonusPoints: +e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1.5">Минимальная докупка, поинты</label>
                      <Input
                        type="number"
                        value={settings.minTopUpPoints}
                        onChange={e => setSettings({ ...settings, minTopUpPoints: +e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1.5">polza.ai API base URL</label>
                      <Input
                        value={settings.polzaApiBaseUrl}
                        onChange={e => setSettings({ ...settings, polzaApiBaseUrl: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button variant="hero" onClick={saveSettings}>Сохранить</Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Admin;
