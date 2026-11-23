# Rampage: idle rpg

Idle-RPG в браузере: canvas-бой, улучшения, умения, снаряжение, питомцы, плащи, выбор героя.

## Как это устроено

- Прогресс хранится в **PostgreSQL**, в браузере ничего не сохраняется.
- Вход — **через Telegram**:
  - в **Telegram Mini App** автоматически: сервер проверяет подпись `initData`;
  - в обычном браузере — кнопка **Telegram Login Widget**.
- После входа сервер выдаёт подписанный токен сессии (30 дней): он хранится в памяти страницы
  и в httpOnly-куке `sid`.

## Бот и друзья

Сервер сам настраивает бота при запуске (нужен https-адрес: `PUBLIC_URL` или домен Railway):
webhook `/tg/webhook` (проверяется секретом), команда `/start`, кнопка меню «Играть», описание бота.
`/start` отвечает картинкой `assets/img/promo.jpg`, приветствием и кнопками «🎮 Играть» и «👥 Пригласить друзей».
Отключить настройку бота: `BOT_WEBHOOK=off`.

**Рефералы.** Ссылка игрока — `https://t.me/<бот>/<app>?startapp=ref_<id>` (если задан `TG_APP_URL`,
открывает игру сразу) или `https://t.me/<бот>?start=ref_<id>` (через /start в боте). Засчитываются
только новые игроки. Награды в осколках души (`server/referrals.js`, `REWARD`):
+5 пригласившему за друга, +3 другу за вход, +10 пригласившему, когда друг достигнет 10 уровня.
Забираются в профиле → «Друзья». Таблицы: `referrals`, `referral_pending`, `referral_rewards`.

## Языки

Русский и английский. Язык выбирается в профиле (сохраняется в куке `lang`), по умолчанию —
язык Telegram, иначе язык браузера. Тексты в коде пишутся по-русски и оборачиваются в `T('…')`,
переводы лежат в `public/js/i18n/en.js` (ключ — русский текст). Статичная разметка `index.html`
переводится автоматически (`i18nDom`).

Добавили новый текст:
1. оберните строку в `T('…')` (или прогоните файл через `python3 tools/i18n_wrap.py public/js/<файл>.js`);
2. `node tools/i18n_keys.js` покажет строки без перевода — добавьте их в `en.js`.

Новый язык: добавить его в `LANGS` в `public/js/i18n/i18n.js` и файл `public/js/i18n/<код>.js` с `I18N.<код>={…}`.

## TON-кошелёк

В профиле — подключение кошелька через [TON Connect](https://github.com/ton-connect/sdk/tree/main/packages/ui)
(`@tonconnect/ui` 5.0.2 с jsDelivr, грузится только при открытии профиля). Манифест отдаёт сервер:
`/tonconnect-manifest.json`. Адрес подключённого кошелька сохраняется в `players.ton_address`
(владение адресом не проверяется — для выплат понадобится проверка `ton_proof`).

## Монстры

Спрайты монстров — набор [0x72 «16x16 DungeonTileset II»](https://0x72.itch.io/dungeontileset-ii) (CC0).
Атлас `public/assets/img/monsters.png` и кадры `public/js/data/monsters.js` собираются скриптом
`tools/pack0x72.py` из оригинального `0x72_DungeonTilesetII_v1.7.png` + `tile_list_v1.7`.
Список монстров, их имена, способ передвижения и перекраска для локаций — в `public/js/world/bestiary.js`,
какие монстры и боссы в какой локации — в `public/js/world/locations.js`.

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
   | `PUBLIC_URL`     | необязательно: адрес игры (`https://…`). На Railway берётся сам из `RAILWAY_PUBLIC_DOMAIN` |
   | `TG_APP_URL`     | необязательно: ссылка на Mini App (`https://t.me/<бот>/<app>`) — куда TON-кошелёк вернёт игрока после подтверждения |

   `PORT` Railway задаёт сам. SSL к базе включается автоматически для публичного адреса
   и выключается для внутреннего `*.railway.internal` (можно задать явно: `DATABASE_SSL=true|false`).
3. **Settings → Networking → Generate Domain** — получите адрес вида `https://xxx.up.railway.app`.
4. В @BotFather:
   - `/setdomain` → выберите бота → укажите домен Railway (без `https://`) — иначе кнопка входа на сайте не заработает;
   - для Mini App: `/newapp` (или **Bot Settings → Menu Button**) → укажите URL `https://xxx.up.railway.app`.

Таблицы `players`, `player_saves` и `chat_messages` создаются автоматически при старте (`db/schema.sql`).
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
| GET   | `/api/friends`       | реферальная ссылка, друзья, награды |
| POST  | `/api/friends/claim` | забрать награды → `{ stones }` |
| POST  | `/api/wallet`        | `{ address }` — адрес TON-кошелька или `null` |
| GET   | `/tonconnect-manifest.json` | манифест TON Connect |
| POST  | `/api/logout`        | выход (сбрасывает куку) |
| GET   | `/api/save`          | → `{ state \| null, rev }` |
| PUT   | `/api/save`          | `{ state, rev }` → `{ rev }`; `409`, если игра открыта в другой вкладке/устройстве |
| GET   | `/api/chat?after=id` | новые сообщения чата (без `after` — последние 50) |
| POST  | `/api/chat`          | `{ text, hero, lvl, to?, replyTo? }` → `{ message }`; `to` — личное сообщение; `429` — слишком часто (1 раз в 1,5 с, до 15 в минуту); `403` — получатель вас заблокировал |
| POST  | `/api/chat/block`    | `{ id, block }` — заблокировать / разблокировать игрока |
| GET   | `/api/chat/player/:id` | карточка игрока: имя, герой, уровень, БМ, экипировка, рекорд, даты |

Авторизация: `Authorization: Bearer <token>` или кука `sid`.

## Структура

```
server/index.js         сервер: раздаёт public/, вход и API сохранений
server/telegram.js      проверка подписи данных Telegram
server/chat.js          API общего чата
server/referrals.js     реферальная система
server/bot.js           Telegram-бот: webhook, /start, меню
db/schema.sql           схема таблиц players, player_saves, chat_messages, chat_blocks
public/index.html       разметка + подключение стилей и скриптов
public/css/style.css    все стили
public/assets/img/      графика (атлас спрайтов героев, портреты, иконки HUD)
public/js/
  data/                 данные: пути к картинкам, кадры героев и монстров, пиксель-карты питомцев
  core/                 хелперы, состояние и сохранение на сервер, вход через Telegram, загрузка атласа
  world/                темы, бестиарий (монстры), локации, фоновая жизнь
  render/               canvas, слои фона, отрисовка кадра
  game/                 баланс, герои и умения, банки, бой, питомцы, плащи, оффлайн-награда
  audio/sound.js        процедурные звуки и музыка (Web Audio)
  items/                снаряжение, иконки предметов, инвентарь и дроп
  ui/                   HUD, сумка, локации, навигация, магазин, панель, выбор героя
  net/chat.js           общий чат (сообщения на сервере, опрос раз в 2,5–5 с)
  net/ton.js            подключение TON-кошелька
  net/friends.js        профиль → «Друзья»
  i18n/                 языки: T(), словарь en.js
  splash/splash.js      анимированная заставка при загрузке
  main.js               игровой цикл и старт
```

Скрипты — обычные (не ES-модули) и делят общую глобальную область видимости,
поэтому **порядок `<script>` в `public/index.html` важен**: файл может использовать на верхнем
уровне только то, что объявлено в файлах выше. Внутри функций — что угодно.
