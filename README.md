# AI Models Platform

Современная веб-платформа для работы с AI моделями, построенная на React + TypeScript + Vite.

## 🚀 Особенности

- **React 18.3** с TypeScript
- **Vite** для быстрой разработки и сборки
- **Tailwind CSS** для стилизации
- **Shadcn UI** компоненты (Radix UI)
- **React Router** для навигации
- **TanStack Query** для управления состоянием сервера
- **React Hook Form** с валидацией Zod
- **Vitest** для тестирования

## 📦 Страницы и функционал

- **Главная страница** (`/`)
- **Каталог моделей** (`/models`, `/models/:slug`)
- **Цены** (`/pricing`)
- **Блог** (`/blog`, `/blog/:slug`)
- **Новости** (`/news`, `/news/:slug`)
- **Аутентификация** (`/login`, `/signup`, `/forgot-password`, `/reset-password/:token`)
- **Чат** (`/chat`)
- **Панель управления** (`/dashboard`)
- **Админ-панель** (`/admin`)

## 🛠️ Установка

```bash
# Установка зависимостей
npm install

# Запуск режима разработки
npm run dev

# Сборка проекта
npm run build

# Запуск линтера
npm run lint

# Запуск тестов
npm run test
```

## 🏗️ Структура проекта

```
├── src/
│   ├── components/     # UI компоненты
│   ├── pages/          # Страницы приложения
│   ├── hooks/          # Кастомные хуки
│   ├── lib/            # Утилиты и конфигурации
│   ├── services/       # API сервисы
│   └── assets/         # Статические ресурсы
├── server/             # Серверный код
├── public/             # Публичные файлы
└── index.html          # HTML шаблон
```

## 📝 Технологии

- **Frontend:** React, TypeScript, Vite
- **Стили:** Tailwind CSS, shadcn/ui
- **Роутинг:** React Router DOM
- **Формы:** React Hook Form, Zod
- **HTTP клиент:** Axios
- **Тестирование:** Vitest, Testing Library
- **UI библиотеки:** Radix UI, Lucide Icons, Recharts

## 🔧 Конфигурация

Проект использует следующие конфигурационные файлы:

- `vite.config.ts` - настройка Vite
- `tailwind.config.ts` - настройка Tailwind CSS
- `tsconfig.json` - настройка TypeScript
- `eslint.config.js` - линтинг
- `vitest.config.ts` - настройка тестов

## 📄 Лицензия

MIT
