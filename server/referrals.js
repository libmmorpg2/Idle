'use strict';
// Реферальная система: ссылка ref_<tg_id>, награды осколками души, список друзей.
const express = require('express');

const REWARD = { join: 5, welcome: 3, lvl10: 10 };   // пригласившему за друга / другу за вход / пригласившему за 10 ур. друга
const LVL_GOAL = 10;
const parseRef = p => { const m = /^(?:ref_)?(\d{1,18})$/.exec(String(p || '')); return m ? m[1] : null; };

module.exports = function referrals(pool, { links }) {
  const lvlDone = new Set();   // кому уже начислили за 10-й уровень (кэш, чтобы не ходить в базу на каждое сохранение)

  // Новый игрок вошёл: ref — из start_param / ?ref= / ожидающего /start в боте
  async function onNewPlayer(tgId, refParam) {
    let ref = parseRef(refParam);
    const pend = await pool.query('DELETE FROM referral_pending WHERE tg_id = $1 RETURNING referrer_id', [tgId]);
    if (!ref && pend.rows[0]) ref = String(pend.rows[0].referrer_id);
    if (!ref || ref === String(tgId)) return;
    const ok = await pool.query(
      `INSERT INTO referrals (invitee_id, referrer_id) SELECT $1, tg_id FROM players WHERE tg_id = $2
       ON CONFLICT DO NOTHING RETURNING referrer_id`, [tgId, ref]);
    if (!ok.rows[0]) return;
    await pool.query(
      `INSERT INTO referral_rewards (tg_id, reason, ref_id, stones) VALUES ($1, 'join', $2, $3), ($2, 'welcome', $1, $4)
       ON CONFLICT DO NOTHING`, [ref, tgId, REWARD.join, REWARD.welcome]);
  }
  // /start ref_… в боте до первого входа в игру
  async function rememberPending(tgId, refParam) {
    const ref = parseRef(refParam);
    if (!ref || ref === String(tgId)) return false;
    const known = await pool.query('SELECT 1 FROM players WHERE tg_id = $1', [tgId]);
    if (known.rows[0]) return false;   // уже играет — приглашение не засчитывается
    await pool.query(`INSERT INTO referral_pending (tg_id, referrer_id) VALUES ($1, $2)
      ON CONFLICT (tg_id) DO UPDATE SET referrer_id = $2, created_at = now()`, [tgId, ref]);
    return true;
  }
  // При сохранении: друг дошёл до 10 уровня → награда пригласившему
  function onSave(tgId, state) {
    if (lvlDone.has(tgId) || !(Number(state && state.lvl) >= LVL_GOAL)) return;
    lvlDone.add(tgId);
    pool.query(`INSERT INTO referral_rewards (tg_id, reason, ref_id, stones)
      SELECT referrer_id, 'lvl10', invitee_id, $2 FROM referrals WHERE invitee_id = $1 ON CONFLICT DO NOTHING`,
      [tgId, REWARD.lvl10]).catch(e => { lvlDone.delete(tgId); console.error(e.message); });
  }

  const router = express.Router();
  router.get('/', async (req, res, next) => {
    try {
      const me = req.tgId;
      const [fr, rw, by] = await Promise.all([
        pool.query(`SELECT r.invitee_id, COALESCE(NULLIF(p.first_name, ''), '@' || p.username) AS name, p.photo_url,
            s.state->>'lvl' AS lvl, s.state->>'bm' AS bm, s.state->>'hero' AS hero, r.created_at
          FROM referrals r JOIN players p ON p.tg_id = r.invitee_id LEFT JOIN player_saves s ON s.tg_id = r.invitee_id
          WHERE r.referrer_id = $1 ORDER BY r.created_at DESC LIMIT 100`, [me]),
        pool.query(`SELECT COALESCE(sum(stones) FILTER (WHERE claimed_at IS NULL), 0) AS pending,
            COALESCE(sum(stones), 0) AS total FROM referral_rewards WHERE tg_id = $1`, [me]),
        pool.query(`SELECT COALESCE(NULLIF(p.first_name, ''), '@' || p.username) AS name FROM referrals r
          JOIN players p ON p.tg_id = r.referrer_id WHERE r.invitee_id = $1`, [me]),
      ]);
      const int = v => (v != null && /^\d+$/.test(v) ? Number(v) : null);
      res.json({
        link: links(me), reward: REWARD, goal: LVL_GOAL,
        pending: Number(rw.rows[0].pending), total: Number(rw.rows[0].total),
        invitedBy: by.rows[0] ? by.rows[0].name : null,
        friends: fr.rows.map(f => ({ id: Number(f.invitee_id), name: f.name || '—', lvl: int(f.lvl), bm: int(f.bm),
          hero: f.hero, since: new Date(f.created_at).getTime(), goal: (int(f.lvl) || 0) >= LVL_GOAL })),
      });
    } catch (e) { next(e); }
  });
  router.post('/claim', async (req, res, next) => {
    try {
      const { rows } = await pool.query(`UPDATE referral_rewards SET claimed_at = now()
        WHERE tg_id = $1 AND claimed_at IS NULL RETURNING stones`, [req.tgId]);
      res.json({ stones: rows.reduce((a, r) => a + r.stones, 0) });
    } catch (e) { next(e); }
  });

  return { router, onNewPlayer, rememberPending, onSave, parseRef, REWARD, LVL_GOAL };
};
