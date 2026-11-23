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
