'use strict';
// Общий чат: сообщения в PostgreSQL, клиент опрашивает GET /api/chat?after=<id>.
const express = require('express');

const MAX_LEN = 140;
const PAGE = 50;            // сколько последних сообщений отдаём при первом запросе
const KEEP = 2000;          // сколько сообщений храним (старые удаляются)
const MIN_GAP_MS = 1500;    // не чаще одного сообщения в 1,5 с
const PER_MIN = 15;         // и не больше 15 в минуту
const HEROES = new Set(['mage', 'tank', 'asn', 'sam']);

module.exports = function chatRouter(pool, auth) {
  const r = express.Router();
  const recent = new Map();   // tg_id → [время отправки, ...] за последнюю минуту
  let inserts = 0;

  const row = m => ({
    id: Number(m.id), uid: Number(m.tg_id), name: m.name, text: m.text,
    hero: m.hero, lvl: m.lvl, ts: new Date(m.created_at).getTime(),
  });
  const SELECT = `SELECT c.id, c.tg_id, c.text, c.hero, c.lvl, c.created_at,
      COALESCE(NULLIF(p.first_name, ''), '@' || p.username, 'Игрок') AS name
    FROM chat_messages c JOIN players p USING (tg_id)`;

  r.get('/', auth, async (req, res, next) => {
    try {
      const after = /^\d{1,18}$/.test(req.query.after || '') ? req.query.after : null;
      const { rows } = after
        ? await pool.query(`${SELECT} WHERE c.id > $1 ORDER BY c.id LIMIT ${PAGE}`, [after])
        : await pool.query(`SELECT * FROM (${SELECT} ORDER BY c.id DESC LIMIT ${PAGE}) t ORDER BY id`);
      res.json({ me: Number(req.tgId), messages: rows.map(row) });
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
      times.push(now); recent.set(req.tgId, times);

      const hero = HEROES.has(b.hero) ? b.hero : null;
      const lvl = Number.isInteger(b.lvl) && b.lvl > 0 && b.lvl < 1e6 ? b.lvl : null;
      const ins = await pool.query(
        'INSERT INTO chat_messages (tg_id, text, hero, lvl) VALUES ($1, $2, $3, $4) RETURNING id',
        [req.tgId, text, hero, lvl]);
      const { rows } = await pool.query(`${SELECT} WHERE c.id = $1`, [ins.rows[0].id]);
      res.json({ message: row(rows[0]) });

      if (++inserts % 100 === 0) {
        pool.query('DELETE FROM chat_messages WHERE id <= (SELECT max(id) FROM chat_messages) - $1', [KEEP]).catch(() => {});
        for (const [k, v] of recent) if (!v.some(t => now - t < 60000)) recent.delete(k);
      }
    } catch (e) { next(e); }
  });

  return r;
};
