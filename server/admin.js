'use strict';
// Админ-панель: /admin (страница) и /admin/api/* (данные). Вход — по паролю ADMIN_PASSWORD
// или автоматически, если игрок вошёл в игру через Telegram и его id указан в ADMIN_IDS.
const path = require('path');
const crypto = require('crypto');
const express = require('express');

const HEROES = ['mage', 'tank', 'asn', 'sam'];
const SLOTS = ['weapon', 'helm', 'armor', 'gloves', 'belt', 'pants', 'boots', 'cloak', 'amulet', 'ring'];
const PETS = ['hound', 'boar', 'bat', 'fairy', 'wolf', 'imp', 'direwolf', 'griffin', 'wisp', 'dragon', 'icefairy', 'jaguar', 'succubus', 'ghostwolf', 'unicorn', 'phoenix', 'ancient'];
const CAPES = ['travel', 'ranger', 'crimson', 'frost', 'archmage', 'shadow', 'dragonslayer', 'celestial'];
const POTS = ['atk', 'def', 'aps', 'run', 'crit', 'xp', 'gold'];
const PACKS = ['starter', 'epic', 'legendary'];

module.exports = function admin(pool, { password, adminIds, sign, readToken, getCookie, cookieOpts }) {
  const ids = new Set(String(adminIds || '').split(/[\s,]+/).filter(Boolean));
  const isAdminId = id => !!id && ids.has(String(id));
  const COOKIE = 'adm', TTL = 12 * 3600;
  const token = () => { const b = `adm.${Math.floor(Date.now() / 1000) + TTL}`; return `${b}.${sign(b)}`; };
  const tokenOk = t => { const m = /^adm\.(\d{1,12})\.([\w-]{43})$/.exec(t || ''); if (!m) return false;
    const exp = sign(`adm.${m[1]}`); return crypto.timingSafeEqual(Buffer.from(exp), Buffer.from(m[2])) && +m[1] > Date.now() / 1000; };
  function who(req) {
    if (tokenOk(getCookie(req, COOKIE))) return 'password';
    const h = req.headers.authorization || '', id = readToken(h.startsWith('Bearer ') ? h.slice(7) : getCookie(req, 'sid'));
    return isAdminId(id) ? `tg:${id}` : null;
  }
  const guard = (req, res, next) => { const w = who(req); if (!w) return res.status(401).json({ error: 'unauthorized' }); req.admin = w; next(); };

  const r = express.Router();
  r.get('/', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'index.html')));
  const api = express.Router();
  api.use(express.json({ limit: '64kb' }));
  api.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });

  // вход по паролю (с задержкой при ошибке — против перебора)
  const fails = new Map();
  api.post('/login', async (req, res) => {
    const ip = req.ip, f = fails.get(ip) || { n: 0, t: 0 };
    if (f.n >= 5 && Date.now() - f.t < 10 * 60e3) return res.status(429).json({ error: 'too many attempts, wait 10 min' });
    const p = String((req.body || {}).password || '');
    const ok = !!password && p.length === password.length && crypto.timingSafeEqual(Buffer.from(p), Buffer.from(password));
    if (!ok) { fails.set(ip, { n: f.n + 1, t: Date.now() }); await new Promise(s => setTimeout(s, 800)); return res.status(401).json({ error: 'wrong password' }); }
    fails.delete(ip);
    res.cookie(COOKIE, token(), { ...cookieOpts(req), maxAge: TTL * 1000 });
    res.json({ ok: true });
  });
  api.post('/logout', (req, res) => { res.clearCookie(COOKIE, cookieOpts(req)); res.json({ ok: true }); });
  api.get('/me', (req, res) => { const w = who(req); res.status(w ? 200 : 401).json({ admin: w, passwordLogin: !!password }); });
  api.use(guard);

  const NAME = p => `COALESCE(NULLIF(${p}.first_name, ''), '@' || ${p}.username, 'Игрок')`;
  const isId = v => /^\d{1,18}$/.test(String(v ?? ''));

  /* ---------- обзор ---------- */
  api.get('/stats', async (req, res, next) => {
    try {
      const q = sql => pool.query(sql).then(r => r.rows);
      const [[pl], [act], [gram], [pay], [buy], [chat], [ref], days, top] = await Promise.all([
        q(`SELECT count(*) total, count(*) FILTER (WHERE created_at > now() - interval '1 day') d1,
             count(*) FILTER (WHERE created_at > now() - interval '7 days') d7, coalesce(sum(gram), 0) gram FROM players`),
        q(`SELECT count(*) FILTER (WHERE updated_at > now() - interval '15 minutes') online,
             count(*) FILTER (WHERE updated_at > now() - interval '1 day') d1, count(*) FILTER (WHERE updated_at > now() - interval '7 days') d7 FROM player_saves`),
        q(`SELECT coalesce(sum(amount) FILTER (WHERE amount > 0 AND reason LIKE 'topup:%'), 0) bought,
             coalesce(-sum(amount) FILTER (WHERE amount < 0), 0) spent FROM gram_tx`),
        q(`SELECT count(*) n, coalesce(sum(amount_nano), 0) nano, count(DISTINCT tg_id) payers FROM gram_orders WHERE status = 'paid'`),
        q(`SELECT count(*) n FROM shop_purchases WHERE price > 0`),
        q(`SELECT count(*) n, count(*) FILTER (WHERE created_at > now() - interval '1 day') d1 FROM chat_messages`),
        q(`SELECT count(*) n FROM referrals`),
        q(`SELECT to_char(d, 'DD.MM') AS day, (SELECT count(*) FROM players WHERE created_at::date = d) reg,
             (SELECT count(*) FROM gram_orders WHERE status = 'paid' AND paid_at::date = d) pays
           FROM generate_series(current_date - 13, current_date, interval '1 day') d ORDER BY d`),
        q(`SELECT s.state->>'hero' hero, count(*) n FROM player_saves s GROUP BY 1 ORDER BY 2 DESC`),
      ]);
      res.json({ players: pl, active: act, gram, payments: { ...pay, ton: Number(pay.nano) / 1e9 }, purchases: buy, chat, referrals: ref, days, heroes: top });
    } catch (e) { next(e); }
  });

  /* ---------- игроки ---------- */
  const SORT = { last: 'coalesce(s.updated_at, p.last_login) DESC', new: 'p.created_at DESC', gram: 'p.gram DESC',
    lvl: `(s.state->>'lvl')::int DESC NULLS LAST`, bm: `(s.state->>'bm')::bigint DESC NULLS LAST`, refs: 'refs DESC' };
  api.get('/users', async (req, res, next) => {
    try {
      const q = String(req.query.q || '').trim().slice(0, 64), sort = SORT[req.query.sort] || SORT.last;
      const page = Math.max(0, parseInt(req.query.page, 10) || 0), args = [];
      let where = 'WHERE p.tg_id <> 0';   // 0 — системный «📢 Администрация»
      if (q) { args.push(isId(q) ? q : null, `%${q.replace(/^@/, '').replace(/[%_\\]/g, '\\$&')}%`);
        where += ` AND (p.tg_id = $1::bigint OR p.first_name ILIKE $2 OR p.last_name ILIKE $2 OR p.username ILIKE $2)`; }
      const { rows } = await pool.query(`SELECT p.tg_id, ${NAME('p')} AS name, p.username, p.gram, p.created_at, p.last_login, p.chat_banned, p.ton_address,
          s.updated_at, s.state->>'hero' hero, s.state->>'lvl' lvl, s.state->>'best' best, s.state->>'bm' bm, s.state->>'gold' gold,
          (SELECT count(*) FROM referrals WHERE referrer_id = p.tg_id) refs, (SELECT referrer_id FROM referrals WHERE invitee_id = p.tg_id) ref_by
        FROM players p LEFT JOIN player_saves s ON s.tg_id = p.tg_id ${where} ORDER BY ${sort} LIMIT 51 OFFSET ${page * 50}`, args);
      res.json({ users: rows.slice(0, 50), more: rows.length > 50 });
    } catch (e) { next(e); }
  });
  api.get('/users/:id', async (req, res, next) => {
    try {
      const id = req.params.id; if (!isId(id)) return res.status(400).json({ error: 'bad id' });
      const one = (sql, a = [id]) => pool.query(sql, a).then(r => r.rows);
      const [[p], [save], invited, [by], ledger, purchases, orders, msgs, blocks] = await Promise.all([
        one(`SELECT tg_id, ${NAME('players')} name, first_name, last_name, username, photo_url, gram, ton_address, chat_banned, created_at, last_login FROM players WHERE tg_id = $1`),
        one('SELECT state, rev, updated_at FROM player_saves WHERE tg_id = $1'),
        one(`SELECT r.invitee_id id, ${NAME('p')} name, r.created_at, s.state->>'lvl' lvl, s.state->>'bm' bm FROM referrals r
             JOIN players p ON p.tg_id = r.invitee_id LEFT JOIN player_saves s ON s.tg_id = r.invitee_id WHERE r.referrer_id = $1 ORDER BY r.created_at DESC`),
        one(`SELECT r.referrer_id id, ${NAME('p')} name FROM referrals r JOIN players p ON p.tg_id = r.referrer_id WHERE r.invitee_id = $1`),
        one('SELECT amount, reason, created_at FROM gram_tx WHERE tg_id = $1 ORDER BY id DESC LIMIT 100'),
        one('SELECT id, item, price, granted, created_at FROM shop_purchases WHERE tg_id = $1 ORDER BY id DESC LIMIT 100'),
        one('SELECT id, package, amount_nano, gram, status, tx_hash, created_at, paid_at FROM gram_orders WHERE tg_id = $1 ORDER BY id DESC LIMIT 50'),
        one(`SELECT c.id, c.text, c.to_tg_id, ${NAME('tp')} to_name, c.created_at FROM chat_messages c LEFT JOIN players tp ON tp.tg_id = c.to_tg_id
             WHERE c.tg_id = $1 ORDER BY c.id DESC LIMIT 100`),
        one(`SELECT b.blocked_id id, ${NAME('p')} name FROM chat_blocks b JOIN players p ON p.tg_id = b.blocked_id WHERE b.tg_id = $1`),
      ]);
      if (!p) return res.status(404).json({ error: 'not found' });
      res.json({ player: p, save: save || null, invited, invitedBy: by || null, ledger, purchases, orders, messages: msgs, blocks });
    } catch (e) { next(e); }
  });

  /* ---------- выдача ---------- */
  // GRAM — сразу на баланс; игровые ценности — через «невыданные покупки»: игра выдаст их при входе (или в течение минуты онлайн)
  api.post('/users/:id/gram', async (req, res, next) => {
    const id = req.params.id, amount = Math.trunc(Number((req.body || {}).amount)), note = String((req.body || {}).note || '').slice(0, 100);
    if (!isId(id) || !amount || Math.abs(amount) > 1e9) return res.status(400).json({ error: 'bad amount' });
    const c = await pool.connect();
    try {
      await c.query('BEGIN');
      const up = await c.query('UPDATE players SET gram = greatest(0, gram + $2) WHERE tg_id = $1 RETURNING gram', [id, amount]);
      if (!up.rows[0]) { await c.query('ROLLBACK'); return res.status(404).json({ error: 'not found' }); }
      await c.query('INSERT INTO gram_tx (tg_id, amount, reason) VALUES ($1, $2, $3)', [id, amount, `admin:${req.admin}${note ? ':' + note : ''}`]);
      await c.query('COMMIT');
      res.json({ gram: Number(up.rows[0].gram) });
    } catch (e) { await c.query('ROLLBACK').catch(() => {}); next(e); } finally { c.release(); }
  });
  function giveItem(b) {
    const n = Math.trunc(Number(b.amount)) || 1, k = b.kind;
    if (['gold', 'stones', 'scr', 'safe'].includes(k)) return n > 0 && n <= 1e12 ? `give:${k}:${n}` : null;
    if (k === 'pot' && POTS.includes(b.id) && n > 0 && n <= 999) return `give:pot:${b.id}:${n}`;
    if (k === 'pet' && PETS.includes(b.id)) return `pet:${b.id}`;
    if (k === 'cape' && CAPES.includes(b.id)) return `cape:${b.id}`;
    if (k === 'pack' && PACKS.includes(b.id)) return `pack:${b.id}`;
    if (k === 'item' && HEROES.includes(b.cls) && SLOTS.includes(b.slot) && Number.isInteger(+b.rar) && +b.rar >= 0 && +b.rar <= 5)
      return `give:item:${b.cls}:${b.slot}:${+b.rar}:${Math.max(1, Math.min(9999, Math.trunc(+b.lvl) || 1))}`;
    return null;
  }
  api.post('/users/:id/give', async (req, res, next) => {
    try {
      const id = req.params.id, item = giveItem(req.body || {});
      if (!isId(id) || !item) return res.status(400).json({ error: 'bad item' });
      const { rows } = await pool.query(`INSERT INTO shop_purchases (tg_id, item, price) SELECT tg_id, $2, 0 FROM players WHERE tg_id = $1 RETURNING id`, [id, item]);
      if (!rows[0]) return res.status(404).json({ error: 'not found' });
      res.json({ id: Number(rows[0].id), item });
    } catch (e) { next(e); }
  });
  api.post('/users/:id/chatban', async (req, res, next) => {
    try {
      const id = req.params.id; if (!isId(id)) return res.status(400).json({ error: 'bad id' });
      await pool.query('UPDATE players SET chat_banned = $2 WHERE tg_id = $1', [id, !!(req.body || {}).ban]);
      res.json({ ok: true });
    } catch (e) { next(e); }
  });

  /* ---------- чат ---------- */
  api.get('/chat', async (req, res, next) => {
    try {
      const args = [], cond = [];
      if (isId(req.query.before)) { args.push(req.query.before); cond.push(`c.id < $${args.length}`); }
      if (isId(req.query.uid)) { args.push(req.query.uid); cond.push(`(c.tg_id = $${args.length} OR c.to_tg_id = $${args.length})`); }
      if (req.query.dm === 'public') cond.push('c.to_tg_id IS NULL'); else if (req.query.dm === 'private') cond.push('c.to_tg_id IS NOT NULL');
      if (req.query.q) { args.push(`%${String(req.query.q).slice(0, 64).replace(/[%_\\]/g, '\\$&')}%`); cond.push(`c.text ILIKE $${args.length}`); }
      const { rows } = await pool.query(`SELECT c.id, c.tg_id uid, ${NAME('p')} name, p.chat_banned banned, c.text, c.to_tg_id, ${NAME('tp')} to_name, c.created_at
        FROM chat_messages c JOIN players p ON p.tg_id = c.tg_id LEFT JOIN players tp ON tp.tg_id = c.to_tg_id
        ${cond.length ? 'WHERE ' + cond.join(' AND ') : ''} ORDER BY c.id DESC LIMIT 100`, args);
      res.json({ messages: rows });
    } catch (e) { next(e); }
  });
  api.delete('/chat/:id', async (req, res, next) => {
    try { if (!isId(req.params.id)) return res.status(400).json({ error: 'bad id' });
      await pool.query('DELETE FROM chat_messages WHERE id = $1', [req.params.id]); res.json({ ok: true }); } catch (e) { next(e); }
  });
  api.post('/chat', async (req, res, next) => {   // объявление от администрации (от имени игрока-админа или системного)
    try {
      const text = String((req.body || {}).text || '').replace(/\s+/g, ' ').trim().slice(0, 140); if (!text) return res.status(400).json({ error: 'empty' });
      await pool.query(`INSERT INTO players (tg_id, first_name) VALUES (0, '📢 Администрация') ON CONFLICT (tg_id) DO UPDATE SET first_name = '📢 Администрация'`);
      const { rows } = await pool.query('INSERT INTO chat_messages (tg_id, text) VALUES (0, $1) RETURNING id', [text]);
      res.json({ id: Number(rows[0].id) });
    } catch (e) { next(e); }
  });

  /* ---------- платежи ---------- */
  api.get('/payments', async (req, res, next) => {
    try {
      const [orders, purchases] = await Promise.all([
        pool.query(`SELECT o.id, o.tg_id, ${NAME('p')} name, o.package, o.amount_nano, o.gram, o.status, o.tx_hash, o.created_at, o.paid_at
          FROM gram_orders o JOIN players p ON p.tg_id = o.tg_id ORDER BY o.id DESC LIMIT 100`),
        pool.query(`SELECT s.id, s.tg_id, ${NAME('p')} name, s.item, s.price, s.granted, s.created_at
          FROM shop_purchases s JOIN players p ON p.tg_id = s.tg_id ORDER BY s.id DESC LIMIT 100`),
      ]);
      res.json({ orders: orders.rows, purchases: purchases.rows });
    } catch (e) { next(e); }
  });

  r.use('/api', api);
  return { router: r, isAdminId };
};
