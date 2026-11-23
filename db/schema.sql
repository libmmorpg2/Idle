-- Выполняется сервером при старте (идемпотентно).

-- Игроки = пользователи Telegram.
CREATE TABLE IF NOT EXISTS players (
  tg_id      bigint      PRIMARY KEY,
  username   text,
  first_name text,
  last_name  text,
  photo_url  text,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_login timestamptz NOT NULL DEFAULT now()
);

-- Сохранение игры (одно на игрока).
CREATE TABLE IF NOT EXISTS player_saves (
  tg_id      bigint      PRIMARY KEY REFERENCES players (tg_id) ON DELETE CASCADE,
  state      jsonb       NOT NULL,
  rev        integer     NOT NULL DEFAULT 1,      -- версия для защиты от перезаписи из старой вкладки
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Общий чат.
CREATE TABLE IF NOT EXISTS chat_messages (
  id         bigserial   PRIMARY KEY,
  tg_id      bigint      NOT NULL REFERENCES players (tg_id) ON DELETE CASCADE,
  text       text        NOT NULL CHECK (char_length(text) BETWEEN 1 AND 140),
  hero       text,
  lvl        integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Личные сообщения (to_tg_id) и ответы (reply_to).
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS to_tg_id bigint REFERENCES players (tg_id) ON DELETE CASCADE;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS reply_to bigint REFERENCES chat_messages (id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS chat_messages_dm ON chat_messages (to_tg_id, tg_id) WHERE to_tg_id IS NOT NULL;

-- Кого игрок заблокировал: его сообщения не показываются, писать в личку он не может.
CREATE TABLE IF NOT EXISTS chat_blocks (
  tg_id      bigint      NOT NULL REFERENCES players (tg_id) ON DELETE CASCADE,
  blocked_id bigint      NOT NULL REFERENCES players (tg_id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tg_id, blocked_id)
);

-- Подключённый TON-кошелёк (адрес в user-friendly формате, без проверки владения).
ALTER TABLE players ADD COLUMN IF NOT EXISTS ton_address text;

-- Рефералы: кто кого пригласил (только новые игроки).
CREATE TABLE IF NOT EXISTS referrals (
  invitee_id  bigint      PRIMARY KEY REFERENCES players (tg_id) ON DELETE CASCADE,
  referrer_id bigint      NOT NULL REFERENCES players (tg_id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS referrals_referrer ON referrals (referrer_id);
-- Приглашение из /start в боте, пока игрок ещё не открыл игру.
CREATE TABLE IF NOT EXISTS referral_pending (
  tg_id       bigint      PRIMARY KEY,
  referrer_id bigint      NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
-- Награды за друзей (осколки души); забираются в профиле → «Друзья».
CREATE TABLE IF NOT EXISTS referral_rewards (
  id         bigserial   PRIMARY KEY,
  tg_id      bigint      NOT NULL REFERENCES players (tg_id) ON DELETE CASCADE,
  reason     text        NOT NULL,           -- join | welcome | lvl10
  ref_id     bigint      NOT NULL,           -- второй участник
  stones     integer     NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  claimed_at timestamptz,
  UNIQUE (tg_id, reason, ref_id)
);
