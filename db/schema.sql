-- Сохранения игроков. Выполняется сервером при старте (идемпотентно).
CREATE TABLE IF NOT EXISTS saves (
  player_id  uuid        PRIMARY KEY,
  state      jsonb       NOT NULL,
  rev        integer     NOT NULL DEFAULT 1,      -- версия для защиты от перезаписи из старой вкладки
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
