# Интеграция с Polza.ai

## Обзор

Этот документ описывает интеграцию проекта с polza.ai для получения моделей (чат, изображения, видео), управления балансом и хранения истории генераций.

## Структура проекта

```
server/
├── src/
│   ├── services/
│   │   └── polza.ts          # Сервис для работы с Polza.ai API
│   ├── routes/
│   │   ├── chat.ts           # Роуты для чата и генераций
│   │   ├── admin.ts          # Админские роуты (обновлено)
│   │   └── auth.ts           # Аутентификация
│   ├── database/
│   │   └── init.ts           # Инициализация БД (обновлено)
│   └── index.ts              # Главный файл сервера (обновлено)
```

## Основные возможности

### 1. Получение моделей из Polza.ai

- Эндпоинт: `GET /api/v1/models/catalog`
- Модели кешируются в БД в таблице `model_coefficients`
- Для новых моделей автоматически устанавливается коэффициент 1.5
- Коэффициенты хранятся в БД и кешируются в памяти

### 2. Управление коэффициентами

- Коэффициенты хранятся в БД (таблица `model_coefficients`)
- Админ может менять коэффициенты через админку
- При обновлении коэффициента кэш очищается
- Для новых моделей по умолчанию используется коэффициент 1.5

### 3. Баланс пользователя

- Баланс хранится в БД (таблица `users`, поле `points_balance`)
- Проверка баланса происходит перед каждой генерацией
- Списание баллов происходит транзакционно
- История списаний сохраняется в `generations`

### 4. История чатов/генераций

- Все генерации сохраняются в таблицу `generations`
- Картинки и видео хранятся на стороне Polza.ai (URL сохраняется в БД)
- История доступна через API: `GET /api/chat/history`

## API Endpoints

### Чат и генерации

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/chat/send` | Отправить сообщение в чат |
| POST | `/api/chat/image` | Сгенерировать изображение |
| POST | `/api/chat/video` | Сгенерировать видео |
| GET | `/api/chat/models` | Получить список моделей |
| GET | `/api/chat/history` | Получить историю чатов |
| GET | `/api/chat/balance` | Получить баланс |

### Админка

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/admin/models` | Получить коэффициенты моделей |
| PATCH | `/api/admin/models/:slug` | Обновить коэффициент |
| POST | `/api/admin/models/sync` | Синхронизировать модели из Polza.ai |

## Настройка

### 1. Переменные окружения

Создайте файл `.env` в папке `server/`:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/imagination_ai

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Server
PORT=3001
FRONTEND_URL=http://localhost:5173

# Admin credentials
ADMIN_EMAIL=admin@imagination.ai
ADMIN_PASSWORD=Admin123!

# Polza.ai API
POLZA_API_BASE_URL=https://polza.ai/api
POLZA_API_KEY=your-polza-api-key-here
```

### 2. Установка зависимостей

```bash
cd server
npm install
```

### 3. Запуск сервера

```bash
npm run dev
```

## Структура БД

### Таблица `model_coefficients`

```sql
CREATE TABLE model_coefficients (
  slug VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  vendor VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL,
  base_price_usd DECIMAL(10, 4) NOT NULL,
  coefficient DECIMAL(5, 2) DEFAULT 1.5,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Таблица `generations`

```sql
CREATE TABLE generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  model_slug VARCHAR(100) REFERENCES model_coefficients(slug),
  points_spent INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'running',
  prompt TEXT,
  result_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Логика работы

### 1. Синхронизация моделей

1. Админ нажимает "Синхронизировать модели"
2. Сервер запрашивает `/api/v1/models/catalog` у Polza.ai
3. Новые модели добавляются в БД с коэффициентом 1.5
4. Существующие модели обновляются (цена, название)
5. Кэш коэффициентов очищается

### 2. Генерация (чат/изображение/видео)

1. Пользователь отправляет запрос
2. Сервер проверяет баланс в БД
3. Сервер получает коэффициент модели (из кэша или БД)
4. Рассчитывается стоимость: `basePrice * coefficient`
5. Если баланс достаточный:
   - Запрос отправляется в Polza.ai
   - Баллы списываются из БД
   - Результат сохраняется в историю
   - URL картинки/видео сохраняется в БД

### 3. Обновление коэффициента

1. Админ меняет коэффициент в админке
2. Коэффициент обновляется в БД
3. Кэш коэффициентов очищается
4. Следующий запрос получит обновленный коэффициент

## Примеры использования

### Получить список моделей

```bash
curl http://localhost:3001/api/chat/models?type=chat
```

### Отправить сообщение в чат

```bash
curl -X POST http://localhost:3001/api/chat/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "anthropic/claude-3-5-sonnet",
    "messages": [{"role": "user", "content": "Привет!"}]
  }'
```

### Сгенерировать изображение

```bash
curl -X POST http://localhost:3001/api/chat/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "midjourney/midjourney-v7",
    "prompt": "красивый закат над горами"
  }'
```

### Получить историю

```bash
curl http://localhost:3001/api/chat/history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Важные замечания

1. **Картинки и видео** хранятся на стороне Polza.ai, в БД сохраняется только URL
2. **Баланс** всегда берется из БД, никаких кэшей
3. **Коэффициенты** кешируются для производительности, но кэш очищается при обновлении
4. **Новые модели** автоматически получают коэффициент 1.5
5. **Транзакции** используются для списания баллов чтобы избежать race conditions
