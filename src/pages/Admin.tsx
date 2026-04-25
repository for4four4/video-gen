import SiteLayout from "@/components/layout/SiteLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Users, CreditCard, Eye, Image as ImageIcon, TrendingUp,
  RefreshCw, Settings as SettingsIcon, Activity, Sparkles,
  Newspaper, BookOpen, Tag, Plus, Trash2, Edit2, Check, X,
  ChevronDown, ChevronUp, Upload,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  fetchOverview, fetchUsers, fetchPayments, fetchModelCoefficients,
  fetchGenerations, fetchSettings, updateModel, updateUser,
  updateSettings, syncModelsFromPolza, uploadFile,
  type OverviewMetrics, type UserRow, type PaymentRow,
  type ModelCoefficient, type GenerationLog, type AdminSettings, type Range,
} from "@/lib/adminApi";
import {
  adminGetNews, adminCreateNews, adminUpdateNews, adminDeleteNews,
  adminGetBlog, adminCreateBlogPost, adminUpdateBlogPost, adminDeleteBlogPost,
  adminGetPricing, adminCreatePlan, adminUpdatePlan, adminDeletePlan,
  adminGetModelExamples, adminAddModelExample, adminDeleteModelExample,
  type NewsItem, type BlogPost, type PricingPlan,
} from "@/lib/api";

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('ru-RU') : '—';

// ── Inline editable field ─────────────────────────────────────────────────────
const EditableRow = ({ label, value, onSave, type = "text" }: {
  label: string; value: string; onSave: (v: string) => void; type?: string;
}) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-muted-foreground w-32 shrink-0">{label}</span>
      {editing ? (
        <>
          <Input type={type} value={val} onChange={e => setVal(e.target.value)} className="h-7 text-[13px]" autoFocus />
          <button onClick={() => { onSave(val); setEditing(false); }} className="text-accent"><Check className="w-4 h-4" /></button>
          <button onClick={() => { setVal(value); setEditing(false); }} className="text-muted-foreground"><X className="w-4 h-4" /></button>
        </>
      ) : (
        <>
          <span className="text-[13px] flex-1 truncate">{val || '—'}</span>
          <button onClick={() => setEditing(true)} className="text-muted-foreground hover:text-foreground"><Edit2 className="w-3.5 h-3.5" /></button>
        </>
      )}
    </div>
  );
};

// ── Modal / Drawer для создания/редактирования ────────────────────────────────
interface FormDrawerProps {
  title: string;
  onClose: () => void;
  onSave: () => void;
  children: React.ReactNode;
}
const FormDrawer = ({ title, onClose, onSave, children }: FormDrawerProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}>
    <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-8" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium">{title}</h2>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
      </div>
      <div className="space-y-4">{children}</div>
      <div className="flex gap-2 mt-6">
        <Button variant="hero" onClick={onSave}>Сохранить</Button>
        <Button variant="outlineGlow" onClick={onClose}>Отмена</Button>
      </div>
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════════════════════════
// MAIN ADMIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════════

const Admin = () => {
  useEffect(() => { document.title = "Админ — Imagination AI"; }, []);

  const [range, setRange] = useState<Range>("30d");
  const [overview, setOverview] = useState<OverviewMetrics | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [models, setModels] = useState<ModelCoefficient[]>([]);
  const [gens, setGens] = useState<GenerationLog[]>([]);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Content state
  const [news, setNews] = useState<NewsItem[]>([]);
  const [blog, setBlog] = useState<BlogPost[]>([]);
  const [pricing, setPricing] = useState<PricingPlan[]>([]);

  // Modals
  const [newsModal, setNewsModal] = useState<Partial<NewsItem> | null>(null);
  const [blogModal, setBlogModal] = useState<Partial<BlogPost> | null>(null);
  const [pricingModal, setPricingModal] = useState<Partial<PricingPlan> | null>(null);

  // File upload temp state — preview URL shown until saved
  const [newsCoverFile, setNewsCoverFile] = useState<{ url: string; file: File } | null>(null);
  const [blogCoverFile, setBlogCoverFile] = useState<{ url: string; file: File } | null>(null);
  const [newsCoverUploading, setNewsCoverUploading] = useState(false);
  const [blogCoverUploading, setBlogCoverUploading] = useState(false);

  // Model examples
  const [examplesSlug, setExamplesSlug] = useState<string | null>(null);
  const [examples, setExamples] = useState<any[]>([]);
  const [newExampleUrl, setNewExampleUrl] = useState('');
  const [newExamplePrompt, setNewExamplePrompt] = useState('');

  // User balance edit
  const [editBalanceId, setEditBalanceId] = useState<string | null>(null);
  const [editBalanceVal, setEditBalanceVal] = useState('');

  // Icon upload for models
  const [uploadingSlug, setUploadingSlug] = useState<string | null>(null);

  const handleIconUpload = async (slug: string, file: File) => {
    try {
      setUploadingSlug(slug);
      const url = await uploadFile(file);
      await updateModel(slug, { icon_url: url });
      setModels(curr => curr.map(m => m.slug === slug ? { ...m, iconUrl: url } : m));
      toast.success('Иконка обновлена');
    } catch { toast.error('Ошибка загрузки'); }
    setUploadingSlug(null);
  };

  const handleCoverUpload = async (slug: string, file: File) => {
    try {
      setUploadingSlug(slug);
      const url = await uploadFile(file);
      await updateModel(slug, { cover_image: url });
      setModels(curr => curr.map(m => m.slug === slug ? { ...m, coverImage: url } : m));
      toast.success('Обложка обновлена');
    } catch { toast.error('Ошибка загрузки'); }
    setUploadingSlug(null);
  };

  const loadAll = async () => {
    try {
      const [o, u, p, m, g, s] = await Promise.all([
        fetchOverview(range), fetchUsers(), fetchPayments(),
        fetchModelCoefficients(), fetchGenerations(), fetchSettings(),
      ]);
      setOverview(o); setUsers(u); setPayments(p);
      setModels(m); setGens(g); setSettings(s);
    } catch (e) { toast.error('Ошибка загрузки данных'); }
  };

  const loadContent = async () => {
    try {
      const [n, b, pr] = await Promise.all([adminGetNews(), adminGetBlog(), adminGetPricing()]);
      setNews(n as any); setBlog(b as any); setPricing(pr as any);
    } catch (e) { toast.error('Ошибка загрузки контента'); }
  };

  useEffect(() => { loadAll(); loadContent(); }, [range]);

  // ── Models ──────────────────────────────────────────────────────────────────

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await syncModelsFromPolza();
      toast.success(`Синхронизировано: ${res.updated} моделей`);
      const m = await fetchModelCoefficients();
      setModels(m);
    } catch { toast.error('Ошибка синхронизации'); }
    setSyncing(false);
  };

  const updateCoef = async (slug: string, coefficient: number) => {
    setModels(curr => curr.map(m => m.slug === slug ? { ...m, coefficient, pointsPrice: Math.round(m.basePriceUsd * coefficient) } : m));
    try { await updateModel(slug, { coefficient }); }
    catch { toast.error('Ошибка сохранения'); }
  };

  const toggleModel = async (slug: string, enabled: boolean) => {
    setModels(curr => curr.map(m => m.slug === slug ? { ...m, enabled } : m));
    await updateModel(slug, { enabled });
    toast.success(enabled ? 'Модель включена' : 'Выключена');
  };

  const openExamples = async (slug: string) => {
    setExamplesSlug(slug);
    try {
      const ex = await adminGetModelExamples(slug);
      setExamples(ex as any[]);
    } catch { setExamples([]); }
  };

  const addExample = async () => {
    if (!examplesSlug || !newExampleUrl.trim()) return;
    try {
      await adminAddModelExample(examplesSlug, { image_url: newExampleUrl.trim(), prompt: newExamplePrompt.trim() });
      toast.success('Пример добавлен');
      setNewExampleUrl(''); setNewExamplePrompt('');
      openExamples(examplesSlug);
    } catch { toast.error('Ошибка'); }
  };

  const deleteExample = async (id: string) => {
    try {
      await adminDeleteModelExample(id);
      setExamples(prev => prev.filter(e => e.id !== id));
      toast.success('Удалено');
    } catch { toast.error('Ошибка'); }
  };

  // ── Users ───────────────────────────────────────────────────────────────────

  const toggleUser = async (id: string, status: 'active' | 'blocked') => {
    setUsers(curr => curr.map(u => u.id === id ? { ...u, status } : u));
    await updateUser(id, { status });
    toast.success(status === 'blocked' ? 'Заблокирован' : 'Разблокирован');
  };

  const saveBalance = async (id: string) => {
    const val = parseInt(editBalanceVal);
    if (isNaN(val)) return;
    await updateUser(id, { pointsBalance: val });
    setUsers(curr => curr.map(u => u.id === id ? { ...u, pointsBalance: val } : u));
    setEditBalanceId(null);
    toast.success('Баланс обновлён');
  };

  // ── News ────────────────────────────────────────────────────────────────────

  const uploadCover = async (file: File): Promise<string> => {
    const url = await uploadFile(file);
    return url;
  };

  const saveNews = async () => {
    if (!newsModal) return;
    try {
      // Upload file-based cover image if selected
      if (newsCoverFile) {
        setNewsCoverUploading(true);
        const url = await uploadCover(newsCoverFile.file);
        newsModal.cover_image = url;
        setNewsCoverFile(null);
      }
      setNewsCoverUploading(false);
      if ((newsModal as any).id) {
        await adminUpdateNews((newsModal as any).id, newsModal);
        toast.success('Новость обновлена');
      } else {
        await adminCreateNews(newsModal);
        toast.success('Новость создана');
      }
      setNewsModal(null);
      loadContent();
    } catch (e: any) { toast.error(e.message || 'Ошибка'); }
    setNewsCoverUploading(false);
  };

  const deleteNews = async (id: string) => {
    if (!confirm('Удалить?')) return;
    await adminDeleteNews(id);
    setNews(prev => prev.filter(n => n.id !== id));
    toast.success('Удалено');
  };

  // ── Blog ────────────────────────────────────────────────────────────────────

  const saveBlog = async () => {
    if (!blogModal) return;
    try {
      // Upload file-based cover image if selected
      if (blogCoverFile) {
        setBlogCoverUploading(true);
        const url = await uploadCover(blogCoverFile.file);
        blogModal.cover_image = url;
        setBlogCoverFile(null);
      }
      setBlogCoverUploading(false);
      if ((blogModal as any).id) {
        await adminUpdateBlogPost((blogModal as any).id, blogModal);
        toast.success('Статья обновлена');
      } else {
        await adminCreateBlogPost(blogModal);
        toast.success('Статья создана');
      }
      setBlogModal(null);
      loadContent();
    } catch (e: any) { toast.error(e.message || 'Ошибка'); }
    setBlogCoverUploading(false);
  };

  const deleteBlog = async (id: string) => {
    if (!confirm('Удалить?')) return;
    await adminDeleteBlogPost(id);
    setBlog(prev => prev.filter(p => p.id !== id));
    toast.success('Удалено');
  };

  // ── Pricing ─────────────────────────────────────────────────────────────────

  const savePricing = async () => {
    if (!pricingModal) return;
    try {
      if ((pricingModal as any).id) {
        await adminUpdatePlan((pricingModal as any).id, pricingModal);
        toast.success('Тариф обновлён');
      } else {
        await adminCreatePlan(pricingModal);
        toast.success('Тариф создан');
      }
      setPricingModal(null);
      loadContent();
    } catch (e: any) { toast.error(e.message || 'Ошибка'); }
  };

  const deletePricing = async (id: string) => {
    if (!confirm('Удалить?')) return;
    await adminDeletePlan(id);
    setPricing(prev => prev.filter(p => p.id !== id));
    toast.success('Удалено');
  };

  // ── Settings ────────────────────────────────────────────────────────────────

  const saveSettings = async () => {
    if (!settings) return;
    await updateSettings(settings);
    toast.success('Настройки сохранены');
  };

  // ── Stats ───────────────────────────────────────────────────────────────────

  const stats = overview ? [
    { icon: Eye, label: "Посещения", value: overview.visits.total.toLocaleString('ru'), change: `+${overview.visits.change}%` },
    { icon: Users, label: "Пользователи", value: overview.users.total.toLocaleString('ru'), change: `+${overview.users.change}` },
    { icon: ImageIcon, label: "Генерации", value: overview.generations.total.toLocaleString('ru'), change: `+${overview.generations.change}` },
    { icon: CreditCard, label: "Доход ₽", value: overview.revenueRub.total.toLocaleString('ru'), change: `+${overview.revenueRub.change}%` },
  ] : [];

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════════

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
                {(['24h', '7d', '30d', '90d'] as Range[]).map(r => (
                  <button key={r} onClick={() => setRange(r)}
                    className={`px-3 py-1.5 text-xs rounded-md transition-colors ${range === r ? 'bg-white/10 text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>{r}</button>
                ))}
              </div>
              <Button variant="outlineGlow" onClick={loadAll}><TrendingUp className="h-4 w-4" />Обновить</Button>
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
            <TabsList className="bg-card border border-white/10 mb-6 flex-wrap h-auto gap-1 p-1">
              <TabsTrigger value="models"><Sparkles className="h-3.5 w-3.5 mr-1.5" />Модели</TabsTrigger>
              <TabsTrigger value="users"><Users className="h-3.5 w-3.5 mr-1.5" />Пользователи</TabsTrigger>
              <TabsTrigger value="payments"><CreditCard className="h-3.5 w-3.5 mr-1.5" />Оплаты</TabsTrigger>
              <TabsTrigger value="generations"><Activity className="h-3.5 w-3.5 mr-1.5" />Генерации</TabsTrigger>
              <TabsTrigger value="news"><Newspaper className="h-3.5 w-3.5 mr-1.5" />Новости</TabsTrigger>
              <TabsTrigger value="blog"><BookOpen className="h-3.5 w-3.5 mr-1.5" />Блог</TabsTrigger>
              <TabsTrigger value="pricing"><Tag className="h-3.5 w-3.5 mr-1.5" />Тарифы</TabsTrigger>
              <TabsTrigger value="settings"><SettingsIcon className="h-3.5 w-3.5 mr-1.5" />Настройки</TabsTrigger>
            </TabsList>

            {/* ── MODELS ───────────────────────────────────────────────── */}
            <TabsContent value="models">
              <div className="rounded-2xl border border-white/10 bg-card p-6">
                <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
                  <div>
                    <h2 className="text-xl font-medium mb-1">Коэффициенты моделей</h2>
                    <p className="text-sm text-muted-foreground">Цена (пт) = базовая цена (₽) × коэффициент</p>
                  </div>
                  <Button variant="outlineGlow" onClick={handleSync} disabled={syncing}>
                    <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />Sync polza.ai
                  </Button>
                </div>

                <div className="space-y-1">
                  <div className="grid grid-cols-12 text-xs text-muted-foreground px-3 pb-2 border-b border-white/5">
                    <div className="col-span-3">Модель</div>
                    <div className="col-span-2">Тип</div>
                    <div className="col-span-2">Баз. цена ₽</div>
                    <div className="col-span-2">Коэф.</div>
                    <div className="col-span-1 text-right">Пт</div>
                    <div className="col-span-1 text-center">Вкл</div>
                    <div className="col-span-1 text-right">Примеры</div>
                  </div>

                  {models.map(m => (
                    <div key={m.slug}>
                      <div className="grid grid-cols-12 items-center px-3 py-2.5 hover:bg-white/[0.02] rounded-lg">
                        <div className="col-span-3">
                          <div className="flex items-center gap-2">
                            {m.iconUrl ? (
                              <img src={m.iconUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs">
                                {m.type === 'image' ? '🖼' : '🎬'}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{m.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{m.vendor}</p>
                            </div>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <Badge variant="outline" className="text-xs">{m.type === 'image' ? '🖼 Image' : '🎬 Video'}</Badge>
                        </div>
                        <div className="col-span-2 text-sm">{m.basePriceUsd?.toFixed(2)} ₽</div>
                        <div className="col-span-2">
                          <Input type="number" min={0.1} step={0.1} value={m.coefficient}
                            onChange={e => updateCoef(m.slug, +e.target.value)}
                            className="h-8 w-20 text-sm" />
                        </div>
                        <div className="col-span-1 text-right font-medium text-accent text-sm">{m.pointsPrice}</div>
                        <div className="col-span-1 flex justify-center">
                          <Switch checked={m.enabled} onCheckedChange={v => toggleModel(m.slug, v)} />
                        </div>
                        <div className="col-span-1 flex justify-end gap-1">
                          <label
                            className="text-xs px-2 py-1 rounded cursor-pointer text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                            title="Загрузить иконку"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <input
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) handleIconUpload(m.slug, file);
                                e.target.value = '';
                              }}
                            />
                          </label>
                          <button onClick={() => examplesSlug === m.slug ? setExamplesSlug(null) : openExamples(m.slug)}
                            className="text-xs px-1 py-1 rounded text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
                            {examplesSlug === m.slug ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Examples panel */}
                      {examplesSlug === m.slug && (
                        <div className="mx-3 mb-3 rounded-xl p-4" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid hsl(var(--border))" }}>
                          <p className="text-xs text-muted-foreground mb-3">Примеры картинок для <strong>{m.name}</strong></p>

                          {/* Existing examples */}
                          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-4">
                            {examples.map(ex => (
                              <div key={ex.id} className="relative group rounded-lg overflow-hidden" style={{ aspectRatio: "1/1" }}>
                                <img src={ex.image_url} alt={ex.prompt || ''} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <button onClick={() => deleteExample(ex.id)} className="text-red-400 hover:text-red-300">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                {ex.prompt && <div className="absolute bottom-0 left-0 right-0 p-1 text-[9px] text-white/70 bg-black/50 truncate">{ex.prompt}</div>}
                              </div>
                            ))}
                            {examples.length === 0 && <p className="text-xs text-muted-foreground col-span-5">Нет примеров</p>}
                          </div>

                          {/* Add new example — file upload */}
                          <div className="flex gap-2 items-center">
                            <label className="flex-1">
                              <div className="h-8 flex items-center px-3 rounded-md text-xs cursor-pointer hover:bg-white/5 transition-colors border" style={{ borderColor: "hsl(var(--border))" }}>
                                {newExampleUrl ? `✓ ${newExampleUrl}` : 'Выбрать файл...'}
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    try {
                                      const url = await uploadFile(file);
                                      setNewExampleUrl(url);
                                    } catch {
                                      toast.error('Ошибка загрузки файла');
                                    }
                                  }
                                  e.target.value = '';
                                }}
                              />
                            </label>
                            <Input placeholder="Промпт (опционально)" value={newExamplePrompt} onChange={e => setNewExamplePrompt(e.target.value)} className="h-8 text-xs flex-1" />
                            <Button variant="outlineGlow" onClick={addExample} className="h-8 text-xs px-3" disabled={!newExampleUrl}>
                              <Plus className="w-3.5 h-3.5" />Добавить
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* ── USERS ────────────────────────────────────────────────── */}
            <TabsContent value="users">
              <div className="rounded-2xl border border-white/10 bg-card p-6">
                <h2 className="text-xl font-medium mb-6">Пользователи ({users.length})</h2>
                <div className="space-y-1">
                  <div className="grid grid-cols-12 text-xs text-muted-foreground px-3 pb-2 border-b border-white/5">
                    <div className="col-span-4">Email</div>
                    <div className="col-span-2">Дата</div>
                    <div className="col-span-2 text-right">Баланс</div>
                    <div className="col-span-1 text-right">Ген.</div>
                    <div className="col-span-2 text-right">Потрачено ₽</div>
                    <div className="col-span-1 text-right">Статус</div>
                  </div>
                  {users.map(u => (
                    <div key={u.id} className="grid grid-cols-12 items-center px-3 py-2.5 hover:bg-white/[0.02] rounded-lg text-sm">
                      <div className="col-span-4 font-medium truncate">{u.email}</div>
                      <div className="col-span-2 text-muted-foreground text-xs">{fmtDate(u.createdAt)}</div>
                      <div className="col-span-2 text-right">
                        {editBalanceId === u.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <Input type="number" value={editBalanceVal} onChange={e => setEditBalanceVal(e.target.value)}
                              className="h-6 w-20 text-xs text-right" autoFocus onKeyDown={e => e.key === 'Enter' && saveBalance(u.id)} />
                            <button onClick={() => saveBalance(u.id)} className="text-accent"><Check className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setEditBalanceId(null)} className="text-muted-foreground"><X className="w-3.5 h-3.5" /></button>
                          </div>
                        ) : (
                          <button onClick={() => { setEditBalanceId(u.id); setEditBalanceVal(String(u.pointsBalance)); }}
                            className="text-accent hover:underline font-mono">{u.pointsBalance} пт</button>
                        )}
                      </div>
                      <div className="col-span-1 text-right text-muted-foreground">{u.generations}</div>
                      <div className="col-span-2 text-right">{u.totalSpentRub?.toLocaleString('ru')} ₽</div>
                      <div className="col-span-1 flex justify-end">
                        <button onClick={() => toggleUser(u.id, u.status === 'active' ? 'blocked' : 'active')}>
                          <Badge variant={u.status === 'active' ? 'outline' : 'destructive'} className="text-xs cursor-pointer">{u.status}</Badge>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* ── PAYMENTS ─────────────────────────────────────────────── */}
            <TabsContent value="payments">
              <div className="rounded-2xl border border-white/10 bg-card p-6">
                <h2 className="text-xl font-medium mb-6">Оплаты ({payments.length})</h2>
                <div className="space-y-1">
                  <div className="grid grid-cols-12 text-xs text-muted-foreground px-3 pb-2 border-b border-white/5">
                    <div className="col-span-3">Email</div>
                    <div className="col-span-2">Дата</div>
                    <div className="col-span-2 text-right">Сумма ₽</div>
                    <div className="col-span-2 text-right">Поинтов</div>
                    <div className="col-span-2 text-right">Провайдер</div>
                    <div className="col-span-1 text-right">Статус</div>
                  </div>
                  {payments.map(p => (
                    <div key={p.id} className="grid grid-cols-12 items-center px-3 py-2.5 hover:bg-white/[0.02] rounded-lg text-sm">
                      <div className="col-span-3 truncate">{p.userEmail}</div>
                      <div className="col-span-2 text-xs text-muted-foreground">{fmtDate(p.createdAt)}</div>
                      <div className="col-span-2 text-right">{p.amountRub?.toLocaleString('ru')}</div>
                      <div className="col-span-2 text-right text-accent font-mono">{p.points}</div>
                      <div className="col-span-2 text-right text-muted-foreground text-xs">{p.provider}</div>
                      <div className="col-span-1 flex justify-end">
                        <Badge variant={p.status === 'succeeded' ? 'default' : p.status === 'pending' ? 'outline' : 'destructive'} className="text-xs">{p.status}</Badge>
                      </div>
                    </div>
                  ))}
                  {payments.length === 0 && <p className="text-sm text-muted-foreground px-3 py-4">Нет оплат</p>}
                </div>
              </div>
            </TabsContent>

            {/* ── GENERATIONS ──────────────────────────────────────────── */}
            <TabsContent value="generations">
              <div className="rounded-2xl border border-white/10 bg-card p-6">
                <h2 className="text-xl font-medium mb-6">Лог генераций</h2>
                <div className="space-y-1">
                  <div className="grid grid-cols-12 text-xs text-muted-foreground px-3 pb-2 border-b border-white/5">
                    <div className="col-span-3">Email</div>
                    <div className="col-span-4">Модель</div>
                    <div className="col-span-2">Дата</div>
                    <div className="col-span-1 text-right">Пт</div>
                    <div className="col-span-2 text-right">Статус</div>
                  </div>
                  {gens.map(g => (
                    <div key={g.id} className="grid grid-cols-12 items-center px-3 py-2.5 hover:bg-white/[0.02] rounded-lg text-sm">
                      <div className="col-span-3 truncate">{g.userEmail}</div>
                      <div className="col-span-4 text-muted-foreground text-xs truncate">{g.modelSlug}</div>
                      <div className="col-span-2 text-xs text-muted-foreground">{fmtDate(g.createdAt)}</div>
                      <div className="col-span-1 text-right text-accent font-mono text-xs">{g.pointsSpent}</div>
                      <div className="col-span-2 flex justify-end">
                        <Badge variant={g.status === 'success' ? 'default' : g.status === 'running' ? 'outline' : 'destructive'} className="text-xs">{g.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* ── NEWS ─────────────────────────────────────────────────── */}
            <TabsContent value="news">
              <div className="rounded-2xl border border-white/10 bg-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-medium">Новости ({news.length})</h2>
                  <Button variant="outlineGlow" onClick={() => setNewsModal({ tag: 'update', published: false })}>
                    <Plus className="h-4 w-4" />Добавить
                  </Button>
                </div>

                <div className="space-y-2">
                  {news.map(n => (
                    <div key={n.id} className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/[0.02]" style={{ border: "1px solid hsl(var(--border))" }}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${n.published ? 'bg-green-500/15 text-green-400' : 'bg-white/5 text-muted-foreground'}`}>
                            {n.published ? 'ОПУБЛ.' : 'ЧЕРНОВИК'}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{n.tag?.toUpperCase()}</span>
                          {n.model_name && <span className="text-[10px] text-accent">{n.model_name}</span>}
                        </div>
                        <p className="font-medium text-sm truncate">{n.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{n.excerpt}</p>
                      </div>
                      <div className="text-xs text-muted-foreground shrink-0">{fmtDate(n.created_at)}</div>
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => setNewsModal(n)} className="p-1.5 rounded hover:bg-white/5 text-muted-foreground hover:text-foreground"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteNews(n.id)} className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                  {news.length === 0 && <p className="text-sm text-muted-foreground py-4">Новостей нет. Создайте первую.</p>}
                </div>
              </div>
            </TabsContent>

            {/* ── BLOG ─────────────────────────────────────────────────── */}
            <TabsContent value="blog">
              <div className="rounded-2xl border border-white/10 bg-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-medium">Блог ({blog.length})</h2>
                  <Button variant="outlineGlow" onClick={() => setBlogModal({ read_minutes: 5, published: false, featured: false })}>
                    <Plus className="h-4 w-4" />Добавить
                  </Button>
                </div>

                <div className="space-y-2">
                  {blog.map(p => (
                    <div key={p.id} className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/[0.02]" style={{ border: "1px solid hsl(var(--border))" }}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${p.published ? 'bg-green-500/15 text-green-400' : 'bg-white/5 text-muted-foreground'}`}>
                            {p.published ? 'ОПУБЛ.' : 'ЧЕРНОВИК'}
                          </span>
                          {p.featured && <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent/15 text-accent font-mono">FEATURED</span>}
                          {p.category && <span className="text-[10px] text-muted-foreground">{p.category}</span>}
                        </div>
                        <p className="font-medium text-sm truncate">{p.title}</p>
                        <p className="text-xs text-muted-foreground">{p.author} · {p.read_minutes} мин</p>
                      </div>
                      <div className="text-xs text-muted-foreground shrink-0">{fmtDate(p.created_at)}</div>
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => setBlogModal(p)} className="p-1.5 rounded hover:bg-white/5 text-muted-foreground hover:text-foreground"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteBlog(p.id)} className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                  {blog.length === 0 && <p className="text-sm text-muted-foreground py-4">Статей нет. Создайте первую.</p>}
                </div>
              </div>
            </TabsContent>

            {/* ── PRICING ──────────────────────────────────────────────── */}
            <TabsContent value="pricing">
              <div className="rounded-2xl border border-white/10 bg-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-medium">Тарифные планы</h2>
                    <p className="text-sm text-muted-foreground">Управление пакетами поинтов</p>
                  </div>
                  <Button variant="outlineGlow" onClick={() => setPricingModal({ bonus_points: 0, popular: false, enabled: true })}>
                    <Plus className="h-4 w-4" />Добавить
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {pricing.map(p => (
                    <div key={p.id} className={`relative rounded-2xl p-5 border ${p.popular ? 'border-accent/40 bg-accent/5' : 'border-white/10 bg-white/[0.02]'}`}>
                      {p.popular && <div className="absolute -top-2 left-4 px-2 py-0.5 rounded-full bg-accent text-[10px] font-medium text-black">Популярный</div>}
                      <div className="font-display text-3xl mb-1">{p.points?.toLocaleString('ru')}<span className="text-base text-muted-foreground ml-1">пт</span></div>
                      {p.bonus_points > 0 && <div className="text-xs text-accent mb-2">+{p.bonus_points} бонус</div>}
                      <div className="text-2xl font-medium mb-3">{p.price_rub?.toLocaleString('ru')} ₽</div>
                      <div className="text-sm font-medium mb-4 truncate">{p.name}</div>
                      <div className="flex gap-1.5">
                        <button onClick={() => setPricingModal(p)} className="flex-1 text-xs py-1.5 rounded-md text-center hover:bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground transition-colors">
                          <Edit2 className="w-3 h-3 inline mr-1" />Изм.
                        </button>
                        <button onClick={() => deletePricing(p.id)} className="text-xs py-1.5 px-2 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {pricing.length === 0 && <p className="text-sm text-muted-foreground col-span-4 py-4">Нет тарифов</p>}
                </div>
              </div>
            </TabsContent>

            {/* ── SETTINGS ─────────────────────────────────────────────── */}
            <TabsContent value="settings">
              <div className="rounded-2xl border border-white/10 bg-card p-8 max-w-2xl">
                <h2 className="text-xl font-medium mb-6">Настройки платформы</h2>
                {settings && (
                  <div className="space-y-5">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1.5">Курс: 1 поинт = ₽</label>
                      <Input type="number" step={0.1} value={settings.pointToRubRate} onChange={e => setSettings({ ...settings, pointToRubRate: +e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1.5">Бонус при регистрации (поинты)</label>
                      <Input type="number" value={settings.signupBonusPoints} onChange={e => setSettings({ ...settings, signupBonusPoints: +e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1.5">Минимальная покупка (поинты)</label>
                      <Input type="number" value={settings.minTopUpPoints} onChange={e => setSettings({ ...settings, minTopUpPoints: +e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1.5">polza.ai API base URL</label>
                      <Input value={settings.polzaApiBaseUrl} onChange={e => setSettings({ ...settings, polzaApiBaseUrl: e.target.value })} />
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button variant="hero" onClick={saveSettings}>Сохранить настройки</Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* ── NEWS MODAL ───────────────────────────────────────────────────────── */}
      {newsModal && (
        <FormDrawer title={(newsModal as any).id ? 'Редактировать новость' : 'Новая новость'} onClose={() => setNewsModal(null)} onSave={saveNews}>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Заголовок *</label>
            <Input value={newsModal.title || ''} onChange={e => setNewsModal({ ...newsModal, title: e.target.value })} placeholder="Заголовок новости" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Slug * (URL)</label>
            <Input value={newsModal.slug || ''} onChange={e => setNewsModal({ ...newsModal, slug: e.target.value })} placeholder="my-news-slug" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Краткое описание</label>
            <Textarea value={newsModal.excerpt || ''} onChange={e => setNewsModal({ ...newsModal, excerpt: e.target.value })} rows={2} placeholder="Короткий анонс..." />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Полный текст</label>
            <Textarea value={newsModal.content || ''} onChange={e => setNewsModal({ ...newsModal, content: e.target.value })} rows={5} placeholder="Текст статьи..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Тег</label>
              <select value={newsModal.tag || 'update'} onChange={e => setNewsModal({ ...newsModal, tag: e.target.value as any })}
                className="w-full h-10 px-3 rounded-md text-sm outline-none" style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}>
                <option value="release">release</option>
                <option value="update">update</option>
                <option value="platform">platform</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Название модели</label>
              <Input value={newsModal.model_name || ''} onChange={e => setNewsModal({ ...newsModal, model_name: e.target.value })} placeholder="Midjourney v7" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Обложка</label>
            {/* Preview if cover_image set */}
            {newsModal.cover_image && (
              <img src={newsModal.cover_image} alt="" className="w-full h-32 object-cover rounded-md mb-2" style={{ border: "1px solid hsl(var(--border))" }} />
            )}
            <div className="flex gap-2">
              <Input value={newsModal.cover_image || ''} onChange={e => setNewsModal({ ...newsModal, cover_image: e.target.value })} placeholder="https://..." className="flex-1" />
              <label className="shrink-0">
                <div className="h-10 px-3 rounded-md text-xs flex items-center cursor-pointer transition-colors hover:bg-white/10" style={{ background: "hsl(var(--foreground))", color: "hsl(var(--background))" }}>
                  {newsCoverUploading ? '...' : 'Файл'}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setNewsCoverFile({ file, url: URL.createObjectURL(file) });
                        setNewsModal({ ...newsModal, cover_image: URL.createObjectURL(file) });
                      }
                      e.target.value = '';
                    }}
                  />
                </div>
              </label>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">SEO заголовок</label>
            <Input value={newsModal.seo_title || ''} onChange={e => setNewsModal({ ...newsModal, seo_title: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">SEO описание</label>
            <Textarea value={newsModal.seo_description || ''} onChange={e => setNewsModal({ ...newsModal, seo_description: e.target.value })} rows={2} />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={newsModal.published || false} onCheckedChange={v => setNewsModal({ ...newsModal, published: v })} />
            <span className="text-sm">Опубликовать</span>
          </div>
        </FormDrawer>
      )}

      {/* ── BLOG MODAL ───────────────────────────────────────────────────────── */}
      {blogModal && (
        <FormDrawer title={(blogModal as any).id ? 'Редактировать статью' : 'Новая статья'} onClose={() => setBlogModal(null)} onSave={saveBlog}>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Заголовок *</label>
            <Input value={blogModal.title || ''} onChange={e => setBlogModal({ ...blogModal, title: e.target.value })} placeholder="Заголовок статьи" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Slug * (URL)</label>
            <Input value={blogModal.slug || ''} onChange={e => setBlogModal({ ...blogModal, slug: e.target.value })} placeholder="my-article-slug" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Автор</label>
              <Input value={blogModal.author || ''} onChange={e => setBlogModal({ ...blogModal, author: e.target.value })} placeholder="Имя автора" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Категория</label>
              <Input value={blogModal.category || ''} onChange={e => setBlogModal({ ...blogModal, category: e.target.value })} placeholder="Гайды" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Время чтения (мин)</label>
            <Input type="number" min={1} value={blogModal.read_minutes || 5} onChange={e => setBlogModal({ ...blogModal, read_minutes: +e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Краткое описание</label>
            <Textarea value={blogModal.excerpt || ''} onChange={e => setBlogModal({ ...blogModal, excerpt: e.target.value })} rows={2} placeholder="Анонс..." />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Текст статьи</label>
            <Textarea value={blogModal.content || ''} onChange={e => setBlogModal({ ...blogModal, content: e.target.value })} rows={6} placeholder="Полный текст..." />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Обложка</label>
            {blogModal.cover_image && (
              <img src={blogModal.cover_image} alt="" className="w-full h-32 object-cover rounded-md mb-2" style={{ border: "1px solid hsl(var(--border))" }} />
            )}
            <div className="flex gap-2">
              <Input value={blogModal.cover_image || ''} onChange={e => setBlogModal({ ...blogModal, cover_image: e.target.value })} placeholder="https://..." className="flex-1" />
              <label className="shrink-0">
                <div className="h-10 px-3 rounded-md text-xs flex items-center cursor-pointer transition-colors hover:bg-white/10" style={{ background: "hsl(var(--foreground))", color: "hsl(var(--background))" }}>
                  {blogCoverUploading ? '...' : 'Файл'}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setBlogCoverFile({ file, url: URL.createObjectURL(file) });
                        setBlogModal({ ...blogModal, cover_image: URL.createObjectURL(file) });
                      }
                      e.target.value = '';
                    }}
                  />
                </div>
              </label>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">SEO заголовок</label>
            <Input value={blogModal.seo_title || ''} onChange={e => setBlogModal({ ...blogModal, seo_title: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">SEO описание</label>
            <Textarea value={blogModal.seo_description || ''} onChange={e => setBlogModal({ ...blogModal, seo_description: e.target.value })} rows={2} />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={blogModal.featured || false} onCheckedChange={v => setBlogModal({ ...blogModal, featured: v })} />
              <span className="text-sm">Featured</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={blogModal.published || false} onCheckedChange={v => setBlogModal({ ...blogModal, published: v })} />
              <span className="text-sm">Опубликовать</span>
            </div>
          </div>
        </FormDrawer>
      )}

      {/* ── PRICING MODAL ────────────────────────────────────────────────────── */}
      {pricingModal && (
        <FormDrawer title={(pricingModal as any).id ? 'Редактировать тариф' : 'Новый тариф'} onClose={() => setPricingModal(null)} onSave={savePricing}>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Название *</label>
            <Input value={pricingModal.name || ''} onChange={e => setPricingModal({ ...pricingModal, name: e.target.value })} placeholder="Популярный" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Поинтов *</label>
              <Input type="number" min={1} value={pricingModal.points || ''} onChange={e => setPricingModal({ ...pricingModal, points: +e.target.value })} placeholder="1000" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Цена ₽ *</label>
              <Input type="number" min={1} value={pricingModal.price_rub || ''} onChange={e => setPricingModal({ ...pricingModal, price_rub: +e.target.value })} placeholder="1000" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Бонус поинтов</label>
            <Input type="number" min={0} value={pricingModal.bonus_points || 0} onChange={e => setPricingModal({ ...pricingModal, bonus_points: +e.target.value })} placeholder="100" />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={pricingModal.popular || false} onCheckedChange={v => setPricingModal({ ...pricingModal, popular: v })} />
              <span className="text-sm">Популярный</span>
            </div>
          </div>
        </FormDrawer>
      )}
    </SiteLayout>
  );
};

export default Admin;
