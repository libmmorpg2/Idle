'use strict';
// Общий чат: сообщения в PostgreSQL, клиент опрашивает GET /api/chat?after=<id>.
const express = require('express');

const MAX_LEN = 140;
const PAGE = 50;            // сколько сообщений отдаём за раз (при первом запросе — вдвое больше)
const KEEP = 2000;          // сколько сообщений храним (старые удаляются)
const MIN_GAP_MS = 1500;    // не чаще одного сообщения в 1,5 с
const PER_MIN = 15;         // и не больше 15 в минуту
const HEROES = new Set(['mage', 'tank', 'asn', 'sam']);
const SLOTS = ['weapon', 'helm', 'armor', 'gloves', 'belt', 'pants', 'boots', 'cloak', 'amulet', 'ring'];
const STATS = ['dmg', 'hp', 'spd', 'crit', 'gold'];
const smallInt = (v, max) => (Number.isInteger(v) && v >= 0 && v <= max ? v : null);
// Экипировка из сохранения: только известные поля и значения (данные пишет клиент — не доверяем)
function cleanEq(eq) {
  if (!eq || typeof eq !== 'object') return {};
  const out = {};
  for (const slot of SLOTS) {
    const it = eq[slot];
    if (!it || typeof it !== 'object' || !HEROES.has(it.cls) || smallInt(it.rar, 5) == null) continue;
    const st = {};
    for (const k of STATS) { const v = it.st && it.st[k]; if (Number.isFinite(v) && v >= 0 && v < 1e9) st[k] = Math.round(v); }
    out[slot] = { cls: it.cls, slot, rar: it.rar, lvl: smallInt(it.lvl, 1e6) || 1, en: smallInt(it.en, 9) || 0, st };
  }
  return out;
}

module.exports = function chatRouter(pool, auth) {
  const r = express.Router();
  const recent = new Map();   // tg_id → [время отправки, ...] за последнюю минуту
  let inserts = 0;

  const row = m => ({
    id: Number(m.id), uid: Number(m.tg_id), name: m.name, text: m.text,
    hero: m.hero, lvl: m.lvl, ts: new Date(m.created_at).getTime(),
    to: m.to_tg_id == null ? null : Number(m.to_tg_id), toName: m.to_name || null,
    reply: m.reply_to == null ? null : { id: Number(m.reply_to), uid: m.r_uid == null ? null : Number(m.r_uid), name: m.r_name, text: m.r_text },
  });
  const NAME = p => `COALESCE(NULLIF(${p}.first_name, ''), '@' || ${p}.username, 'Игрок')`;
  const SELECT = `SELECT c.id, c.tg_id, c.text, c.hero, c.lvl, c.created_at, c.to_tg_id, c.reply_to,
      ${NAME('p')} AS name, ${NAME('tp')} AS to_name, rm.tg_id AS r_uid, rm.text AS r_text, ${NAME('rp')} AS r_name
    FROM chat_messages c JOIN players p ON p.tg_id = c.tg_id
    LEFT JOIN players tp ON tp.tg_id = c.to_tg_id
    LEFT JOIN chat_messages rm ON rm.id = c.reply_to LEFT JOIN players rp ON rp.tg_id = rm.tg_id`;
  // общий канал + личные сообщения, где игрок отправитель или получатель; без заблокированных
  const VISIBLE = `(c.to_tg_id IS NULL OR c.to_tg_id = $1 OR c.tg_id = $1)
    AND c.tg_id NOT IN (SELECT blocked_id FROM chat_blocks WHERE tg_id = $1)`;
  const blockedOf = async id => (await pool.query('SELECT blocked_id FROM chat_blocks WHERE tg_id = $1', [id])).rows.map(r => Number(r.blocked_id));
  const isId = v => /^\d{1,18}$/.test(String(v ?? ''));

  r.get('/', auth, async (req, res, next) => {
    try {
      const after = isId(req.query.after) ? req.query.after : null;
      const { rows } = after
        ? await pool.query(`${SELECT} WHERE c.id > $2 AND ${VISIBLE} ORDER BY c.id LIMIT ${PAGE}`, [req.tgId, after])
        : await pool.query(`SELECT * FROM (${SELECT} WHERE ${VISIBLE} ORDER BY c.id DESC LIMIT ${PAGE * 2}) t ORDER BY id`, [req.tgId]);
      res.json({ me: Number(req.tgId), blocked: await blockedOf(req.tgId), messages: rows.map(row) });
    } catch (e) { next(e); }
  });

  r.post('/', auth, async (req, res, next) => {
    try {
      const b = req.body || {};
      const text = String(b.text || '').replace(/[\u0000-\u001f\u007f\u200b-\u200f\u2028-\u202e\u2066-\u2069]/g, '')
        .replace(/\s+/g, ' ').trim().slice(0, MAX_LEN);
      if (!text) return res.status(400).json({ error: 'empty' });
      const now = Date.now();
      const times = (recent.get(req.tgId) || []).filter(t => now - t < 60000);
      if (times.length && now - times[times.length - 1] < MIN_GAP_MS || times.length >= PER_MIN)
        return res.status(429).json({ error: 'too fast' });

      const ban = await pool.query('SELECT chat_banned FROM players WHERE tg_id = $1', [req.tgId]);
      if (ban.rows[0] && ban.rows[0].chat_banned) return res.status(403).json({ error: 'banned' });
      let to = null, replyTo = null;
      if (b.to != null) {
        if (!isId(b.to) || String(b.to) === String(req.tgId) || String(b.to) === '0') return res.status(400).json({ error: 'bad recipient' });
        const { rows } = await pool.query(
          `SELECT p.tg_id, EXISTS (SELECT 1 FROM chat_blocks WHERE tg_id = p.tg_id AND blocked_id = $2) AS blocked_me
           FROM players p WHERE p.tg_id = $1`, [b.to, req.tgId]);
        if (!rows[0]) return res.status(404).json({ error: 'no such player' });
        if (rows[0].blocked_me) return res.status(403).json({ error: 'blocked' });
        to = b.to;
      }
      if (b.replyTo != null && isId(b.replyTo)) {
        const { rows } = await pool.query(`SELECT c.id FROM chat_messages c WHERE c.id = $2 AND (c.to_tg_id IS NULL OR c.to_tg_id = $1 OR c.tg_id = $1)`, [req.tgId, b.replyTo]);
        if (rows[0]) replyTo = b.replyTo;
      }
      times.push(now); recent.set(req.tgId, times);

      const hero = HEROES.has(b.hero) ? b.hero : null;
      const lvl = Number.isInteger(b.lvl) && b.lvl > 0 && b.lvl < 1e6 ? b.lvl : null;
      const ins = await pool.query(
        'INSERT INTO chat_messages (tg_id, text, hero, lvl, to_tg_id, reply_to) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [req.tgId, text, hero, lvl, to, replyTo]);
      const { rows } = await pool.query(`${SELECT} WHERE c.id = $1`, [ins.rows[0].id]);
      res.json({ message: row(rows[0]) });

      if (++inserts % 100 === 0) {
        pool.query('DELETE FROM chat_messages WHERE id <= (SELECT max(id) FROM chat_messages) - $1', [KEEP]).catch(() => {});
        for (const [k, v] of recent) if (!v.some(t => now - t < 60000)) recent.delete(k);
      }
    } catch (e) { next(e); }
  });

  // Заблокировать / разблокировать: { id, block: true|false }
  r.post('/block', auth, async (req, res, next) => {
    try {
      const { id, block } = req.body || {};
      if (!isId(id) || String(id) === String(req.tgId)) return res.status(400).json({ error: 'bad id' });
      if (block === false) await pool.query('DELETE FROM chat_blocks WHERE tg_id = $1 AND blocked_id = $2', [req.tgId, id]);
      else await pool.query(`INSERT INTO chat_blocks (tg_id, blocked_id) SELECT $1, tg_id FROM players WHERE tg_id = $2 ON CONFLICT DO NOTHING`, [req.tgId, id]);
      res.json({ blocked: await blockedOf(req.tgId) });
    } catch (e) { next(e); }
  });

  // Карточка игрока: имя, герой, уровень, рекорд, дата регистрации
  r.get('/player/:id', auth, async (req, res, next) => {
    try {
      if (!isId(req.params.id)) return res.status(400).json({ error: 'bad id' });
      const { rows } = await pool.query(
        `SELECT p.tg_id, p.username, p.photo_url, p.created_at, ${NAME('p')} AS name, p.last_name,
           s.state->>'hero' AS hero, s.state->>'lvl' AS lvl, s.state->>'best' AS best, s.state->>'bm' AS bm, s.updated_at,
           s.state->'inv'->'eq'->(s.state->>'hero') AS eq,
           (SELECT count(*) FROM chat_messages WHERE tg_id = p.tg_id AND to_tg_id IS NULL) AS msgs,
           EXISTS (SELECT 1 FROM chat_blocks WHERE tg_id = $2 AND blocked_id = p.tg_id) AS blocked
         FROM players p LEFT JOIN player_saves s ON s.tg_id = p.tg_id WHERE p.tg_id = $1`, [req.params.id, req.tgId]);
      const p = rows[0];
      if (!p) return res.status(404).json({ error: 'not found' });
      const int = v => (v != null && /^\d+$/.test(v) ? Number(v) : null);
      res.json({
        id: Number(p.tg_id), name: p.name + (p.last_name ? ' ' + p.last_name : ''), username: p.username,
        photo: /^https:\/\//.test(p.photo_url || '') ? p.photo_url : null,
        hero: HEROES.has(p.hero) ? p.hero : null, lvl: int(p.lvl), best: int(p.best), bm: int(p.bm), eq: cleanEq(p.eq),
        since: new Date(p.created_at).getTime(), seen: p.updated_at ? new Date(p.updated_at).getTime() : null,
        msgs: Number(p.msgs), blocked: p.blocked, me: String(p.tg_id) === String(req.tgId),
      });
    } catch (e) { next(e); }
  });

  return r;
};
