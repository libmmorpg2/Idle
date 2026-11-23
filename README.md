# Rampage: idle rpg

Idle-RPG в браузере: canvas-бой, улучшения, умения, снаряжение, питомцы, плащи, выбор героя.

## Как это устроено

- Прогресс хранится в **PostgreSQL**, в браузере ничего не сохраняется.
- Вход — **через Telegram**:
  - в **Telegram Mini App** автоматически: сервер проверяет подпись `initData`;
  - в обычном браузере — кнопка **Telegram Login Widget**.
- После входа сервер выдаёт подписанный токен сессии (30 дней): он хранится в памяти страницы
  и в httpOnly-куке `sid`.

## Заставка

Пока игра грузится, показывается анимированная сцена «Герои» (`js/splash/splash.js`):
крупные планы героев, которые по очереди бьют монстров.

## Деплой на Railway

1. В проекте Railway должен быть сервис **PostgreSQL** и сервис из этого репозитория.
2. В переменных сервиса игры (**Variables**):

   | Переменная       | Значение |
   |------------------|----------|
   | `DATABASE_URL`   | `${{Postgres.DATABASE_URL}}` (ссылка на базу) |
   | `BOT_TOKEN`      | токен бота от @BotFather |
   | `BOT_USERNAME`   | имя бота без `@` (нужно для кнопки входа на сайте) |
   | `SESSION_SECRET` | необязательно, любая длинная случайная строка |

   `PORT` Railway задаёт сам. SSL к базе включается автоматически для публичного адреса
   и выключается для внутреннего `*.railway.internal` (можно задать явно: `DATABASE_SSL=true|false`).
3. **Settings → Networking → Generate Domain** — получите адрес вида `https://xxx.up.railway.app`.
4. В @BotFather:
   - `/setdomain` → выберите бота → укажите домен Railway (без `https://`) — иначе кнопка входа на сайте не заработает;
   - для Mini App: `/newapp` (или **Bot Settings → Menu Button**) → укажите URL `https://xxx.up.railway.app`.

Таблицы `players` и `player_saves` создаются автоматически при старте (`db/schema.sql`).
Healthcheck: `GET /healthz` (настроен в `railway.json`).

## Локальный запуск

```sh
npm install
cp .env.example .env        # заполните DATABASE_URL, BOT_TOKEN, BOT_USERNAME
export $(grep -v '^#' .env | xargs)
npm start                   # http://localhost:3000
```

Или `BOT_TOKEN=... BOT_USERNAME=... docker compose up --build` — поднимет и PostgreSQL.
Кнопка входа работает только на домене, указанном в `/setdomain`, поэтому локально
удобнее проверять через туннель (ngrok и т.п.).

### API

| Метод | Путь                 | Описание |
|-------|----------------------|----------|
| POST  | `/api/auth/telegram` | `{ initData }` (Mini App) или `{ widget: {...} }` (Login Widget) → `{ token, user }` |
| GET   | `/api/me`            | текущий пользователь |
| POST  | `/api/logout`        | выход (сбрасывает куку) |
| GET   | `/api/save`          | → `{ state \| null, rev }` |
| PUT   | `/api/save`          | `{ state, rev }` → `{ rev }`; `409`, если игра открыта в другой вкладке/устройстве |

Авторизация: `Authorization: Bearer <token>` или кука `sid`.

## Структура

```
server/index.js         сервер: раздаёт public/, вход и API сохранений
server/telegram.js      проверка подписи данных Telegram
db/schema.sql           схема таблиц players и player_saves
public/index.html       разметка + подключение стилей и скриптов
public/css/style.css    все стили
public/assets/img/      графика (атлас спрайтов героев, портреты, иконки HUD)
public/js/
  data/                 данные: пути к картинкам, кадры анимаций, пиксель-карты питомцев
  core/                 хелперы, состояние и сохранение на сервер, вход через Telegram, загрузка атласа
  world/                темы, бестиарий (монстры), локации, фоновая жизнь
  render/               canvas, слои фона, отрисовка кадра
  game/                 баланс, герои и умения, банки, бой, питомцы, плащи, оффлайн-награда
  audio/sound.js        процедурные звуки и музыка (Web Audio)
  items/                снаряжение, иконки предметов, инвентарь и дроп
  ui/                   HUD, сумка, локации, навигация, магазин, панель, выбор героя
  net/chat.js           общий чат (работает только внутри Claude Artifact)
  splash/splash.js      анимированная заставка при загрузке
  main.js               игровой цикл и старт
```

Скрипты — обычные (не ES-модули) и делят общую глобальную область видимости,
поэтому **порядок `<script>` в `public/index.html` важен**: файл может использовать на верхнем
уровне только то, что объявлено в файлах выше. Внутри функций — что угодно.
