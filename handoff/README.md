# Handoff: Imagination.ai — UI Redesign (5 страниц)

## Overview

Это дизайн-пакет для редизайна платформы **Imagination.ai** (AI модели: Midjourney, Sora, Flux, Veo и т.д.).
Охватывает 5 ключевых разделов: **Главная**, **Каталог моделей**, **Чат-студия**, **Тарифы**, **Блог**, **Новости**.

Цель редизайна — уйти от generic-вида текущего AI-SaaS в сторону **editorial/journal-эстетики** с акцентом на:
- реальные обложки и превью генераций (не иконки и градиенты),
- крупную serif-типографику (Instrument Serif) на ключевых заголовках,
- плотные информационные карточки со стоимостью/скоростью/тегами,
- единый «тёмный минимал + фиолет» стиль, уже присутствующий в токенах репозитория.

## About the Design Files

Файлы в пакете — **дизайн-референсы**, сделанные в HTML + React + inline Tailwind + собственный набор токенов.
**Это не production-код для копирования.** Задача — **воссоздать** эти макеты в существующем стеке проекта
`for4four4/video-gen` (React 18 + TypeScript + Vite + Tailwind + shadcn/ui + React Router).

Все значения дизайн-токенов в макетах **уже соответствуют** `src/index.css` проекта
(`--accent: 270 95% 70%` = `#b478fd`, `--background: 0 0% 4%` и т.д.), так что маппинг прямой.

## Fidelity

**High-fidelity.** Макеты с финальными цветами, типографикой, spacing'ом и состояниями.
Интерактивность (hover-карусели превью, фильтры, калькулятор, drag-зоны чата) показана рабочими
прототипами — её нужно воспроизвести в React.

Допустимые отклонения:
- Картинки-заглушки (цветные градиенты в макетах) → заменить на реальные превью генераций из БД.
- Hero-видео на главной — оставить текущее видео пользователя, которое уже стоит в live-версии.

---

## Дизайн-токены (уже есть в `src/index.css`)

Все значения ниже — HSL. Перечислено, что используют макеты — **ничего добавлять в `:root` не нужно**, всё уже есть.

```css
--background: 0 0% 4%;      /* #0a0a0a  — основной фон */
--foreground: 0 0% 98%;     /* #fafafa  — основной текст */
--card: 0 0% 6%;            /* #0f0f10  — поверхность карточек */
--muted: 0 0% 9%;           /* #171717  — приглушённые поверхности */
--muted-foreground: 0 0% 62%; /* #9e9e9e — второстепенный текст */
--accent: 270 95% 70%;      /* #b478fd  — фирменный фиолет */
--border: 0 0% 14%;         /* #242424  — границы */
--primary: 0 0% 98%;        /* #fafafa  — CTA заливка (белая) */
--primary-foreground: 0 0% 6%; /* #0f0f10 */
--radius: 0.875rem;         /* 14px */
```

### Дополнительные частоиспользуемые значения (есть в макетах)

| Имя в макете       | HSL / CSS                              | Где      |
|--------------------|-----------------------------------------|----------|
| `textDim`          | `hsl(0 0% 98% / 0.42)`                  | подписи, даты, мета |
| `borderStrong`     | `hsl(0 0% 100% / 0.14)`                 | активные бордеры, хедеры таблиц |
| accent-soft        | `hsl(270 95% 70% / 0.12)`               | pill-подложки |
| accent-border      | `hsl(270 95% 70% / 0.3)`                | border у accent-pills |
| card-hover         | `hsl(0 0% 9%)`                          | hover на карточках |

### Типографика

| Роль                      | Шрифт                | Размер / Вес      |
|---------------------------|----------------------|-------------------|
| Мега-заголовок (hero)     | Instrument Serif     | 84–128px / 400    |
| Заголовок страницы        | Instrument Serif     | 56–72px / 400     |
| Заголовок раздела         | Instrument Serif     | 28–48px / 400     |
| Заголовок карточки        | Instrument Serif     | 22–30px / 400     |
| Основной текст            | Inter                | 14–17px / 400     |
| Метаданные / подписи      | Inter                | 11–13px / 400–500 |
| Eyebrow (UPPERCASE)       | Inter                | 10–11px / 400, letter-spacing 0.28–0.4em |
| Код / цифры цен / даты    | JetBrains Mono       | 10–16px           |

Использовать `em { font-style: italic }` для **акцентных слов** в serif-заголовках
(`<em>модели</em>` → курсив в фиолетовом акценте). Паттерн: крупный заголовок + одно-два слова курсивом в `text-accent`.

### Spacing / rhythm

Tailwind scale по умолчанию. Базовые значения в макетах:
- Контейнер: `max-w-[1320px]` + `px-8` (Главная/Каталог) или `max-w-[1200px]` + `px-10` (Блог/Тарифы/Новости)
- Радиусы: `rounded-md` (6), `rounded-lg` (12), `rounded-[14px]`, `rounded-[18px]`, `rounded-[20px]`, `rounded-[24px]`
- Большие gap'ы между секциями: `py-16` ... `py-24`
- Grid gaps: 3–6 (12–24px) для карточек, 8–10 (32–40px) для крупных колонок

---

## Общие компоненты

### `<BrandHeader>` (глобальная шапка)

Фиксированная, с `backdrop-filter: blur(18px)` и фоном `hsl(0 0% 4% / 0.72)`.

Структура (слева → справа):
1. **Лого** — `w-5 h-5 rounded-full` с `conic-gradient(from 120deg, #b478fd, #ff6ba9, #6adfff, #b478fd)` + текст `Imagination.ai` (Instrument Serif 17px, `.ai` в accent).
2. **Навигация** — 4 пункта: Модели / Тарифы / Блог / Новости. Активный — foreground, остальные — muted-foreground. Размер 13px.
3. **Справа** — pill «Баланс 1 240 пт» (rounded-md, border, bg `white/0.04`) + кнопка «Открыть чат» (primary, размер 12px, `px-3 py-1.5`).

Высота: `h-14`. Border-bottom: `hsl(0 0% 100% / 0.08)`.

### Placeholder для генераций

В макетах это компонент `<Placeholder>` с градиентной заливкой + diagonal stripes (8%) + SVG-noise (15% overlay).
**В проде** заменить на `<img>` с реальной генерацией из базы + lazy loading.
На fallback (пока грузится) можно оставить 12 градиентов-плашек из макета (`shared.jsx`).

---

## Screens / Views

### 1. Главная (`/`) — см. `pages-home.jsx` → `HomeV1`

**Выбран вариант V1.**

#### Hero (высота 780px)
- **Фон**: текущее hero-видео пользователя (`<video>` full-bleed, `object-cover`, autoplay muted loop). **Не менять.**
- Поверх видео: radial-gradient overlay `radial-gradient(ellipse at 50% 60%, rgba(10,10,10,0.4), rgba(10,10,10,0.85) 70%)` для читаемости текста.
- Вокруг контента — 4 плавающие карточки-превью генераций с ротацией (`rotate(-8deg|6deg|4deg|-4deg)`) и большой тенью `0 20px 60px rgba(0,0,0,0.5)`. Маска `radial-gradient` чтобы карточки «таяли» к центру.
- Центрированный контент (`text-center`, `pt-32 pb-24`):
  - Pill «Veo 3 и Midjourney v7 — в чате» (accent-soft bg, accent dot).
  - H1 на 128px Instrument Serif, 2 строки: `Все AI-модели в `<em class="text-accent">одном</em>` чате`.
  - Подзаголовок: «Midjourney, Sora, Flux, Veo, Kling. Одна цена в поинтах. Без подписок и VPN.» (18px, muted).
  - 2 кнопки: primary «Попробовать бесплатно →» + glass «Смотреть галерею».
  - Микрокопия под кнопками: «50 поинтов в подарок · без карты · ~3 минуты до первой картинки» (12px, dim).

#### Модель-марки (marquee)
Полоса `py-10 border-y` с бесконечной лентой названий моделей. Каждая запись: `w-8 h-8` плашка + serif-название + pill с ценой в `пт`. Анимация `marquee 40s linear infinite` (уже есть в `tailwind.config.ts`).

Использовать класс `.marquee` (уже определён в `src/index.css`) для fade-маски с боков.

#### Секция «Почему Imagination»
3 карточки в grid, `rounded-[20px] p-7 bg-card border`:
- Cover image 16:10
- H3 serif 28px
- Абзац 14px muted

Тексты:
1. **Одна цена** — «Платите поинтами. 1 пт = 1 ₽. Midjourney — 12 пт, Sora — 80 пт, Flux — 8 пт.»
2. **Без VPN** — «Российские реквизиты, СБП, карты. Работает из любой точки.»
3. **История и права** — «Всё в одной ленте. Коммерческие права на все генерации.»

#### Галерея
Masonry-ish grid 4 колонки, чередование aspect-ratio (`3/4`, `1/1`, `4/3`). Каждая плашка — rounded-[12px] с label-пилюлей модели внизу.
Заголовок: «Свежие работы сообщества» + ссылка «Вся галерея →» (accent).

#### CTA-блок
`rounded-[24px] p-14`, фон `linear-gradient(135deg, #1a0a2e, #2d0a4e, #6b2a8a)` + noise + radial glow.
H2 64px serif «Генерируйте <em>сейчас</em>» + текст + primary-кнопка «Начать бесплатно →».

---

### 2. Каталог моделей (`/models`) — см. `pages-models.jsx` → `ModelsV1`

**Выбран вариант V1.**

#### Шапка раздела
- Eyebrow: «Каталог · 10 моделей»
- H1 72px serif: «Все <em>модели</em> в одном чате»
- Подзаголовок muted.

#### Sticky filter bar
`sticky top-14` (под глобальной шапкой) с backdrop-blur.
- Segmented control тип: Все / Изображения / Видео
- Select вендора
- В конце: сортировка (Популярные / Дешёвые / Быстрые) — text buttons, активный с bg `white/0.06`

#### Секция «Флагманы»
Divider «★ Флагманы» (accent, uppercase, tracking-wider) + горизонтальная линия.
Grid 2 колонки, карточки `rounded-[20px] bg-card`:
- **Carousel превью** сверху (aspect 16:10, 4 слайда с auto-rotate каждые 2.8–4с, точки-навигация в правом нижнем углу).
  Реализация: `<PreviewCarousel seed count aspect />`. В проде — реальные URL'ы превью из массива `previews: string[]` модели.
- В футере карточки:
  - Слева: вендор (11px uppercase dim) + название модели serif 30px.
  - Справа: цена (mono 20px accent) + «за генерацию» (10px uppercase dim).
  - Описание 14px muted.
  - Теги (pills: `text-[10px] px-2 py-0.5 rounded-full bg-white/0.05 border`).
  - Actions: primary «Попробовать →» + ghost «Сравнить».

#### Секция «Все модели»
Grid 3 колонки, компактные карточки `rounded-[16px]`:
- Carousel превью 4:3 (3 слайда).
- Вендор + pill-тип (IMG/VID).
- Название 16px medium.
- Описание 12px muted, line-clamp-2.
- Футер: цена mono + скорость dim.

#### Live-demo CTA
`rounded-[20px] p-8` с градиентным фоном `linear-gradient(135deg, rgba(180,120,253,0.12), rgba(106,223,255,0.06))`.
- Слева: eyebrow «Live demo» + H3 serif 28px + текст.
- Справа: inline input + кнопка «Запустить» (accent bg, `#1a0a2a` text).

### Данные моделей

Массив `MODELS` в `shared.jsx` — 8 моделей. Каждая:
```ts
{
  slug: string;
  name: string;
  type: 'image' | 'video';
  vendor: string;
  price: number;         // в поинтах
  speed: 'fast' | 'medium' | 'slow';
  desc: string;          // одна строка
  long: string;          // для детальной страницы
  tags: string[];
  featured?: boolean;
  popularity: number;    // 0-100
}
```

Маппинг на бэкенд-модель скорее всего уже существует в `src/services/`. Поле `previews: string[]` нужно добавить (4 URL-а превью на флагмана, 3 на остальных).

---

### 3. Чат-студия (`/chat`) — см. `pages-chat.jsx` → `ChatV1`

**Выбран вариант V1.** 3-колоночный layout, `grid-cols-[240px_1fr_280px]`, `min-h-[900px]`, gap 4.

#### Левый сайдбар (история) — 240px
- Primary-кнопка «+ Новая генерация» (accent bg, `#1a0a2a` text).
- Поиск в истории (input, bg `black/0.3`).
- Список чатов: каждый item — w-10 h-10 thumbnail (первая генерация из сессии) + title + мета (модель · время). Активный — bg `accent/0.1`.
- Внизу — «Баланс 1 240 пт» карточка (accent-soft bg, accent-border) + кнопка «Пополнить».

#### Центральная область
- **Model picker** (горизонтальный scroll) — pills `<ModelPill>`:
  - w-7 h-7 thumbnail модели + название 12px + мета (цена пт · IMG/VID) 10px mono.
  - Активная — accent-border + accent-soft bg.
- **Conversation**:
  - Юзерская реплика — справа, rounded-tr-sm, bg `white/0.05`, border. Мини-pills настроек (ratio/quality/style) внизу сообщения.
  - Ассистент — слева, avatar 8px conic-gradient. Строка мета: «Midjourney v7 · сгенерировано 4 варианта · 48 пт».
  - **Сетка 2×2 вариантов** `rounded-[12px] overflow-hidden border`. На hover — оверлей с V1-V4 + кнопки (↑ upscale / ⤢ fullscreen / ↓ download).
  - Панель действий под сеткой: «Upscale V1-V4 / Вариации / Remix» (pills).
- **Input bar**:
  - rounded-[14px] bg `black/0.3` border.
  - Ряд 1: кнопка `+` (attach) + подсказка `/imagine или вставьте референс` + справа «будет списано **48 пт**» (accent).
  - Textarea 2 rows.
  - Ряд подсказок клавиатуры: `Enter` отправить / `/` команды + primary-кнопка «Генерировать →».

#### Правый сайдбар (настройки) — 280px
- Верх: thumbnail выбранной модели + название + вендор.
- Секции с pill-радио:
  - **Соотношение**: 1:1, 16:9, 9:16, 4:5, 21:9
  - **Качество**: Draft / Standard / High / Max
  - **Вариантов**: 1 / 2 / 4
  - **Стиль**: Auto / Photo / Illustration / 3D / Cinematic
- **Seed** — text input mono.
- **Референс** — drop-zone, dashed border.
- Внизу: «Стоимость» + `price × variants × quality_multiplier`, cумма мономразмером 16px accent.

#### Формулы стоимости (важно!)
```ts
const totalPoints = model.price * variantCount * (quality === 'Max' ? 1.5 : 1)
```
Обновляется реактивно при изменении любого dial'а.

### Slash-команды (паттерн)
Пользователь пишет `/` → показать popover со списком: `/imagine`, `/upscale`, `/vary`, `/extend`, `/remix`, `/describe`, `/preset`.

---

### 4. Тарифы (`/pricing`) — см. `pages-pricing.jsx` → `PricingV1`

**Выбран вариант V1.**

#### Hero (по центру)
Eyebrow «Тарифы · Pay-as-you-go» → H1 84px serif `Плати за <em>картинки</em>, не за подписку`.

#### Калькулятор (главный блок)
`rounded-[24px] p-10 bg-card border-[borderStrong]`, grid 12 колонок:

**Левая колонка (7/12)**:
- Eyebrow «Калькулятор · двигайте слайдер» (accent).
- Мега-число: `{pts}` serif 96px + «поинтов».
- Строка мета: `цена {pts} ₽` + при pts ≥ 500/1000/5000 — pill «+ бонус {bonus} пт ({%})»:
  - 500 → 5%, 1000 → 10%, 5000 → 15%.
- Range input (`min=100 max=10000 step=100`, `accent-color: #b478fd`).
- Под слайдером — 6 быстрых якорей (100 / 500 / 1000 / 2500 / 5000 / 10000). Клик — `setPts(v)`. Выбранный — accent.
- Grid 2×2 фич: «Поинты не сгорают / Без подписки / Коммерческие права / Все модели в одном чате» (с ✓ accent).

**Правая колонка (5/12)** — «Что получите»:
```ts
// Живой список:
const breakdown = [
  { name: 'Midjourney v7', price: 12, each: Math.floor(total / 12) + ' генераций' },
  { name: 'Flux Pro', price: 8, each: Math.floor(total / 8) + ' генераций' },
  { name: 'Sora (видео)', price: 80, each: Math.floor(total / 80) + ' роликов' },
  { name: 'Veo 3 (видео)', price: 90, each: Math.floor(total / 90) + ' роликов' },
];
```
Каждая строка: thumbnail w-1/5 + (название + `{price} пт / ген.`) + справа огромная цифра (`serif 24px accent`) + подпись.

Снизу — primary-кнопка `Купить {total} поинтов за {price} ₽ →`.

#### Сравнение с вендорами
Таблица 4 колонки (Модель / У вендора / Цена у вендора / В Imagination).
Данные — массив `VENDOR_COMPARE` (5 строк):
```ts
[
  { model: 'Midjourney v7', ours: 12, vendorPlan: 'MJ Pro $60/мес', vendorRate: '≈48 ₽/генерация' },
  { model: 'Sora',          ours: 80, vendorPlan: 'ChatGPT Plus $20', vendorRate: 'ограниченный доступ' },
  { model: 'Veo 3',         ours: 90, vendorPlan: 'Google AI Ultra $250/мес', vendorRate: '≈95 ₽/генерация' },
  { model: 'Flux Pro',      ours: 8,  vendorPlan: 'Pay-as-you-go', vendorRate: '≈12 ₽/генерация' },
  { model: 'Runway Gen-3',  ours: 70, vendorPlan: 'Standard $15/мес', vendorRate: '≈80 ₽/генерация' },
]
```
Правая колонка — mono accent `{ours} пт = {ours} ₽`.

#### Use-cases (3 карточки)
- «Студент-дизайнер» / 500 пт / «≈60 образов в Midjourney для мудборда»
- «Маркетолог-одиночка» / 1000 пт / «100 обложек + 10 роликов в неделю»
- «Продакшн-студия» / 5000 пт / «60 видео-роликов Sora + 400 hero-шотов»

---

### 5. Блог (`/blog`) — см. `pages-blog.jsx` → `BlogV2`

**Выбран вариант V2** (editorial asymmetric list).

#### Masthead
- Eyebrow mono-style: «Vol. 04 · 2025 · Журнал Imagination»
- H1 120px serif в 2 строки: `The` / `<em>Journal</em>`
- Справа: `{BLOG.length} материалов` / `обновлено {дата}`
- `border-b pb-8`

#### Featured (горизонтальная полоса)
- Слева: eyebrow accent «→ Сегодня читают» / H2 64px serif / абзац 17px / мета (автор · категория · N мин · дата).
- Справа: обложка `aspect-[3/4]`, width 300px, `rounded-[4px]` (специально не-округлённая, чтоб выглядеть как журнальное фото).

#### Divider
`[Все материалы ──────── 05 / 06]` (tracking-widest uppercase + mono счётчик).

#### Список (divide-y)
Grid `grid-cols-12 gap-6 py-7 items-center`:
1. `col-span-1`: номер mono (`02`, `03`, ...)
2. `col-span-7`: H3 serif 32px → **курсив accent на hover**. Под ним — excerpt 13px muted.
3. `col-span-2`: категория (accent-like uppercase widest) + `N мин · автор`
4. `col-span-2`: thumbnail 4:3, `rounded` — opacity 0.6 по дефолту, 1.0 + scale(1.03) на hover.

Hover — вся строка становится кликабельной, заголовок → italic + accent, thumbnail подсвечивается.

#### Данные
Массив `BLOG` (6 постов) с полями:
```ts
{ slug, title, excerpt, date, category, read, author, featured? }
```

---

### 6. Новости (`/news`) — см. `pages-news.jsx` → `NewsV2`

**Выбран вариант V2.**

#### Ticker
Тонкая полоса `border-y py-2.5` с бегущей лентой (все новости × 2 для бесконечности). Каждая запись: accent-точка + mono-дата + заголовок. Анимация `ticker 40s linear infinite` (keyframes добавить в `src/index.css`, либо переиспользовать `marquee`).

#### Masthead
Eyebrow mono «News · Changelog · Releases» → H1 112px serif `Свежие <em>апдейты</em>`.

#### Latest — hero-card
`rounded-[20px] bg-card border`, grid 6/6:
- **Слева**: pill «NEW · RELEASE» (accent) + дата · H2 48px serif · абзац (длинный, не короткий excerpt) · 2 кнопки (primary «Попробовать в чате →» + ghost «Читать полностью»).
- **Справа**: обложка 16:11 с label «veo 3 · 1080p · sound».

#### Остальные — grid 2 колонки
Карточки `rounded-[14px] p-5 bg-card border`:
- Ряд тегов: pill (NEW/UPDATE/PLATFORM с цветом — см. `tagColor()`) + название модели muted + mono-дата справа.
- H3 17px medium → `hover:text-[accent]`.
- Excerpt 13px muted.

**Теги**:
| tag        | bg                   | fg         | border                    |
|------------|----------------------|------------|---------------------------|
| release    | `accent/0.12`        | `#c49bff`  | `accent/0.3`              |
| update     | `#6adfff/0.1`        | `#8feaff`  | `#6adfff/0.25`            |
| platform   | `white/0.05`         | `#d4d4d4`  | `white/0.14`              |

Label через функцию: release → `NEW`, update → `UPDATE`, platform → `PLATFORM`.

#### Данные
Массив `NEWS` (6 записей):
```ts
{ slug, title, excerpt, date, tag: 'release' | 'update' | 'platform', model?: string }
```

---

## Interactions & Behavior

### Общие анимации
- Hover на ссылках/кнопках: `transition-colors` / `transition-all` (150ms), при group-hover стрелки `→` получают `translate-x-1`.
- Карточки: `hover:-translate-y-1` + тени.
- `transition-smooth`: `cubic-bezier(0.22, 1, 0.36, 1)` (уже в токенах).

### Каталог моделей
- Carousel превью: setInterval 2800–4000ms (варьируется по seed модели, чтобы карточки не синхронизировались), ресет при hover — `onMouseEnter` → `clearInterval`. Клик на точку — мгновенный переход к слайду.
- Фильтр + сортировка работают над массивом `MODELS` клиент-сайд (filter → sort → render). Если будет > 100 моделей — ввести виртуализацию.
- Sticky filter bar: при скролле страницы бар «прилипает» сразу под `<BrandHeader>`.

### Чат
- Model picker — горизонтальный scroll (overflow-x-auto). На клике — `setActiveModel(slug)` → правая панель обновляется (название, цена, иконка).
- Изменение любого dial'а справа → live-пересчёт стоимости в input bar и в правой секции «Стоимость».
- Дроп-зона референса: обычный `<input type="file">` + drag&drop (`onDragEnter` → dashed border становится accent). Хранить preview в state.
- После «Генерировать» → показать **skeleton-сетку** 2×2 с shimmer-анимацией (класс `.shimmer` есть в tailwind.config), → заменить на реальные URL'ы по мере готовности из API.

### Тарифы — калькулятор
- Range input: `onChange` → пересчитать bonus + total + breakdown (все 4 модели одновременно).
- Быстрые якори — просто `setPts(value)`.
- Формула бонуса:
```ts
const bonus = pts >= 5000 ? Math.round(pts * 0.15)
            : pts >= 1000 ? Math.round(pts * 0.10)
            : pts >= 500  ? Math.round(pts * 0.05)
            : 0;
const total = pts + bonus;
```

### Блог
- Список: `onMouseEnter/Leave` на `<a>` → управляет подсветкой заголовка (italic + accent) и thumbnail'а.
- Клик — `<Link to={"/blog/${slug}"}>` (React Router).

### Новости
- Ticker: CSS-only анимация `translateX(0) → translateX(-50%)` при удвоенном контенте.
- Карточки: стандартный hover-accent.

---

## State Management

Проект уже использует **TanStack Query** для серверного state. Следовать существующим паттернам.

Минимальный набор хуков:

| Хук                      | Назначение |
|--------------------------|-----------|
| `useModels(filters)`     | Каталог моделей (с sort/filter); клиент-сайд ок для 8-20 моделей |
| `useModel(slug)`         | Детальная для `/models/:slug` |
| `useChatSessions()`      | Список в левом сайдбаре чата |
| `useChatSession(id)`     | Одна сессия с сообщениями |
| `useGenerate()`          | Mutation: POST /generations — запуск генерации |
| `useBalance()`           | Текущий баланс поинтов (для шапки и чата) |
| `usePurchasePoints()`    | Mutation: покупка поинтов из калькулятора |
| `useBlogPosts(category)` | Лента блога |
| `useNews()`              | Лента новостей + changelog |

Локальный state (useState/useReducer):
- Чат: активная модель, настройки (ratio/quality/variants/style/seed), референс, текст промпта.
- Калькулятор: `pts` (число).
- Блог V2: `hoverSlug` для подсветки.
- Models V1: `type`, `vendor`, `sort`.

---

## Assets

### Шрифты
Уже подключены в проекте (`tailwind.config.ts` → `fontFamily.sans: Inter`, `fontFamily.display: Instrument Serif`). В макетах используется JetBrains Mono — **добавить в проект**, если ещё нет:
```html
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Hero-видео
Пользователь оставляет **текущее видео** на главной (уже подключено в live-версии). Путь: `uploads/hero-bg.mp4` в проекте handoff — **только референс**. В проде — то, что уже стоит.

### Превью генераций
- Для каталога/чата/галереи — реальные URL из БД.
- На fallback/skeleton — один из 12 градиентов-плашек (см. `PLACEHOLDER_GRADIENTS` в `shared.jsx`). Можно утилитой генерить детерминированно по slug:
```ts
const gradFor = (seed: string) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return PLACEHOLDER_GRADIENTS[h % PLACEHOLDER_GRADIENTS.length];
};
```

### Иконки
Использовать **Lucide Icons** (уже в проекте). В макетах я рисовал стрелки ASCII (`→`, `↓`, `+`) — заменить на Lucide: `ArrowRight`, `ArrowUp`, `Plus`, `Sparkles`, `Check` и т.д.

---

## Files in handoff bundle

| File                               | Описание                                           |
|------------------------------------|----------------------------------------------------|
| `Imagination AI — Redesign.html`   | Главный HTML с design_canvas (все 12 артбордов + Tweaks) |
| `shared.jsx`                       | Токены (`TOKENS`), `<BrandHeader>`, `<Placeholder>`, массивы `MODELS` / `BLOG` / `NEWS` |
| `pages-home.jsx`                   | `HomeV1` + `HomeV2`                                |
| `pages-models.jsx`                 | `ModelsV1` (выбран) + `ModelsV2` + `<PreviewCarousel>` |
| `pages-chat.jsx`                   | `ChatV1` (выбран) + `ChatV2` + `<ModelPill>`       |
| `pages-pricing.jsx`                | `PricingV1` (выбран) + `PricingV2` + данные `VENDOR_COMPARE`, `USE_CASES`, `PACKS` |
| `pages-blog.jsx`                   | `BlogV1` + `BlogV2` (выбран)                       |
| `pages-news.jsx`                   | `NewsV1` + `NewsV2` (выбран)                       |
| `design-canvas.jsx`                | Служебная обёртка для дизайн-канваса (не нужно в проде) |
| `tweaks-panel.jsx`                 | Служебная панель твиков (не нужно в проде)         |

## Выбранные варианты (итоговые)

| Страница        | Выбрано | Файл                |
|-----------------|---------|---------------------|
| Главная         | как есть (hero-видео не трогать) | `pages-home.jsx` → `HomeV1` с учётом текущего видео |
| Каталог моделей | **V1**  | `pages-models.jsx` → `ModelsV1` |
| Чат             | **V1**  | `pages-chat.jsx`   → `ChatV1`   |
| Тарифы          | **V1**  | `pages-pricing.jsx`→ `PricingV1`|
| Блог            | **V2**  | `pages-blog.jsx`   → `BlogV2`   |
| Новости         | **V2**  | `pages-news.jsx`   → `NewsV2`   |

---

## Имплементационный чек-лист (для Claude Code)

1. [ ] Добавить JetBrains Mono в глобальные шрифты, если отсутствует.
2. [ ] Рефакторить `src/components/Header.tsx` (или создать, если нет) под `<BrandHeader>` — глобальная шапка с accent-точкой, балансом, CTA.
3. [ ] `src/pages/Index.tsx` (главная): сохранить hero-видео, добавить 4 плавающие превью-карточки + marquee + grid фич + галерея + CTA-блок.
4. [ ] `src/pages/Models.tsx`: sticky filter bar + секция флагманов + grid остальных + live-demo CTA. Добавить `<PreviewCarousel>` компонент.
5. [ ] `src/pages/Chat.tsx`: 3-колоночный layout, `<ModelPill>` picker, grid 2×2 результатов с hover-оверлеем, правая панель настроек, формула стоимости.
6. [ ] `src/pages/PricingPage.tsx`: калькулятор с range input + bonus-логика + live breakdown + таблица сравнения с вендорами + use-cases.
7. [ ] `src/pages/Blog.tsx`: editorial V2 — masthead, featured-полоса, список с hover-подсветкой.
8. [ ] `src/pages/News.tsx`: ticker вверху + latest hero-card + grid остальных с таг-пилюлями.
9. [ ] Проверить, что все тексты/метки/формулы совпадают с макетами (цены, бонусы, слоганы).
10. [ ] Реальные превью моделей — добавить поле `previews: string[]` в модель API и заменить `<Placeholder>` на `<img>` с fallback на градиент.

---

## Что НЕ нужно переносить из макетов
- Inline-стили — в проде использовать Tailwind классы и CSS-переменные из `index.css`.
- Кастомный `TOKENS` объект из `shared.jsx` — переменные уже есть в `:root`.
- `<BrandHeader compact>` — прод-шапка нужна нормальная, с React Router `NavLink`.
- Placeholder-градиенты как декорация — только как fallback для пустых превью.
