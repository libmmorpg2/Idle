'use strict';
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const { Pool } = require('pg');

const PORT = +process.env.PORT || 3000;
const COOKIE = 'pid';
const COOKIE_MAX_AGE = 10 * 365 * 24 * 3600 * 1000;   // 10 лет
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL не задан (пример: postgres://user:pass@localhost:5432/idle)');
  process.exit(1);
}
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

// Игрок определяется httpOnly-кукой со случайным UUID — в браузерном хранилище ничего не лежит.
function playerId(req, res) {
  const raw = (req.headers.cookie || '').split(';').map(s => s.trim())
    .find(s => s.startsWith(COOKIE + '='));
  const v = raw && decodeURIComponent(raw.slice(COOKIE.length + 1));
  if (v && UUID_RE.test(v)) return v;
  const id = crypto.randomUUID();
  res.cookie(COOKIE, id, { httpOnly: true, sameSite: 'lax', secure: req.secure, maxAge: COOKIE_MAX_AGE, path: '/' });
  return id;
}

const api = express.Router();
api.use(express.json({ limit: '2mb' }));
api.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });

// Загрузка сохранения: { state: {...} | null, rev: number }
api.get('/save', async (req, res, next) => {
  try {
    const id = playerId(req, res);
    const { rows } = await pool.query('SELECT state, rev FROM saves WHERE player_id = $1', [id]);
    res.json(rows[0] ? { state: rows[0].state, rev: rows[0].rev } : { state: null, rev: 0 });
  } catch (e) { next(e); }
});

// Запись: { state, rev } — rev должен совпадать с последней известной версией, иначе 409.
api.put('/save', async (req, res, next) => {
  try {
    const id = playerId(req, res);
    const { state, rev } = req.body || {};
    if (!state || typeof state !== 'object' || Array.isArray(state) || !Number.isInteger(rev) || rev < 0)
      return res.status(400).json({ error: 'bad request' });
    const { rows } = rev === 0
      ? await pool.query(
          `INSERT INTO saves (player_id, state) VALUES ($1, $2)
           ON CONFLICT (player_id) DO NOTHING RETURNING rev`, [id, state])
      : await pool.query(
          `UPDATE saves SET state = $2, rev = rev + 1, updated_at = now()
           WHERE player_id = $1 AND rev = $3 RETURNING rev`, [id, state, rev]);
    if (!rows[0]) return res.status(409).json({ error: 'conflict' });
    res.json({ rev: rows[0].rev });
  } catch (e) { next(e); }
});

app.use('/api', api);
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'too large' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'bad json' });
  console.error(err);
  res.status(500).json({ error: 'server error' });
});

(async () => {
  await pool.query(fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8'));
  app.listen(PORT, () => console.log(`Сервер: http://localhost:${PORT}`));
})().catch(e => { console.error('Не удалось подключиться к базе:', e.message); process.exit(1); });
