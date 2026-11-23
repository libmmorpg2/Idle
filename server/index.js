'use strict';
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const { Pool } = require('pg');
const { verifyWebApp, verifyWidget } = require('./telegram');
const chatRouter = require('./chat');

const env = process.env;
const PORT = +env.PORT || 3000;
const BOT_TOKEN = env.BOT_TOKEN;
const BOT_USERNAME = (env.BOT_USERNAME || '').replace(/^@/, '');
const SESSION_DAYS = 30;
const COOKIE = 'sid';

for (const k of ['DATABASE_URL', 'BOT_TOKEN']) {
  if (!env[k]) { console.error(`Не задана переменная окружения ${k}`); process.exit(1); }
}
// Ключ подписи сессий. Если SESSION_SECRET не задан — выводится из токена бота.
const SESSION_KEY = crypto.createHmac('sha256', env.SESSION_SECRET || BOT_TOKEN).update('idle-session').digest();

// Railway: внутренний адрес базы (*.railway.internal) — без SSL, публичный — с SSL.
const ssl = env.DATABASE_SSL ? env.DATABASE_SSL === 'true'
  : !/\.railway\.internal|localhost|127\.0\.0\.1/.test(env.DATABASE_URL);
const pool = new Pool({ connectionString: env.DATABASE_URL, ssl: ssl ? { rejectUnauthorized: false } : false });

/* ---------- сессии: подписанный токен "tgId.exp.sig" ---------- */
const sign = s => crypto.createHmac('sha256', SESSION_KEY).update(s).digest('base64url');
function makeToken(tgId) {
  const body = `${tgId}.${Math.floor(Date.now() / 1000) + SESSION_DAYS * 86400}`;
  return `${body}.${sign(body)}`;
}
function readToken(tok) {
  const m = /^(\d{1,20})\.(\d{1,12})\.([\w-]{43})$/.exec(tok || '');
  if (!m) return null;
  const expect = sign(`${m[1]}.${m[2]}`);
  if (!crypto.timingSafeEqual(Buffer.from(expect), Buffer.from(m[3]))) return null;
  if (+m[2] < Date.now() / 1000) return null;
  return m[1];   // tg_id строкой (bigint)
}
function getCookie(req, name) {
  const c = (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith(name + '='));
  return c ? decodeURIComponent(c.slice(name.length + 1)) : null;
}
// В Telegram Web мини-приложение открыто во фрейме, поэтому на https кука SameSite=None.
const cookieOpts = req => req.secure
  ? { httpOnly: true, secure: true, sameSite: 'none', path: '/' }
  : { httpOnly: true, sameSite: 'lax', path: '/' };

function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const id = readToken(h.startsWith('Bearer ') ? h.slice(7) : getCookie(req, COOKIE));
  if (!id) return res.status(401).json({ error: 'unauthorized' });
  req.tgId = id;
  next();
}

/* ---------- приложение ---------- */
const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.get('/healthz', (req, res) => res.send('ok'));

const api = express.Router();
api.use(express.json({ limit: '2mb' }));
api.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });

api.get('/config', (req, res) => res.json({ botUsername: BOT_USERNAME }));

// Вход: { initData } из Mini App или { widget: {...} } из Telegram Login Widget.
api.post('/auth/telegram', async (req, res, next) => {
  try {
    const b = req.body || {};
    const u = b.initData ? verifyWebApp(b.initData, BOT_TOKEN) : verifyWidget(b.widget, BOT_TOKEN);
    if (!u) return res.status(401).json({ error: 'bad telegram signature' });
    const str = v => (typeof v === 'string' ? v.slice(0, 256) : null);
    await pool.query(
      `INSERT INTO players (tg_id, username, first_name, last_name, photo_url) VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (tg_id) DO UPDATE SET username = $2, first_name = $3, last_name = $4,
         photo_url = COALESCE($5, players.photo_url), last_login = now()`,
      [u.id, str(u.username), str(u.first_name), str(u.last_name), str(u.photo_url)]);
    const token = makeToken(u.id);
    res.cookie(COOKIE, token, { ...cookieOpts(req), maxAge: SESSION_DAYS * 86400 * 1000 });
    res.json({ token, user: { id: u.id, username: u.username || null, firstName: u.first_name || '' } });
  } catch (e) { next(e); }
});

api.post('/logout', (req, res) => { res.clearCookie(COOKIE, cookieOpts(req)); res.json({ ok: true }); });

api.get('/me', auth, async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT tg_id, username, first_name FROM players WHERE tg_id = $1', [req.tgId]);
    if (!rows[0]) return res.status(401).json({ error: 'unauthorized' });
    res.json({ user: { id: Number(rows[0].tg_id), username: rows[0].username, firstName: rows[0].first_name || '' } });
  } catch (e) { next(e); }
});

// Загрузка сохранения: { state: {...} | null, rev }
api.get('/save', auth, async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT state, rev FROM player_saves WHERE tg_id = $1', [req.tgId]);
    res.json(rows[0] ? { state: rows[0].state, rev: rows[0].rev } : { state: null, rev: 0 });
  } catch (e) { next(e); }
});

// Запись: { state, rev } — rev должен совпадать с последней известной версией, иначе 409.
api.put('/save', auth, async (req, res, next) => {
  try {
    const { state, rev } = req.body || {};
    if (!state || typeof state !== 'object' || Array.isArray(state) || !Number.isInteger(rev) || rev < 0)
      return res.status(400).json({ error: 'bad request' });
    const { rows } = rev === 0
      ? await pool.query(
          `INSERT INTO player_saves (tg_id, state) VALUES ($1, $2)
           ON CONFLICT (tg_id) DO NOTHING RETURNING rev`, [req.tgId, state])
      : await pool.query(
          `UPDATE player_saves SET state = $2, rev = rev + 1, updated_at = now()
           WHERE tg_id = $1 AND rev = $3 RETURNING rev`, [req.tgId, state, rev]);
    if (!rows[0]) return res.status(409).json({ error: 'conflict' });
    res.json({ rev: rows[0].rev });
  } catch (e) { next(e); }
});

api.use('/chat', chatRouter(pool, auth));
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
  app.listen(PORT, () => console.log(`Сервер слушает порт ${PORT}`));
})().catch(e => { console.error('Не удалось подключиться к базе:', e.message); process.exit(1); });
