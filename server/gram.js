'use strict';
// GRAM — премиальная валюта. Баланс и цены только на сервере; пополнение переводом TON с проверкой в блокчейне.
const crypto = require('crypto');
const express = require('express');

/* ---------- цены (в GRAM) ---------- */
const RAR_PRICE = [25, 60, 150, 400, 900, 2000];   // питомцы и плащи по редкости
const PETS = { hound: 0, boar: 0, bat: 0, fairy: 1, wolf: 1, imp: 1, direwolf: 2, griffin: 2, wisp: 2, dragon: 3, icefairy: 3,
  jaguar: 3, succubus: 4, ghostwolf: 4, unicorn: 4, phoenix: 5, ancient: 5 };
const CAPES = { travel: 0, ranger: 1, crimson: 2, frost: 3, archmage: 3, shadow: 4, dragonslayer: 4, celestial: 5 };
const POTS = ['atk', 'def', 'aps', 'run', 'crit', 'xp', 'gold'];
const POT_PRICE = 10;
const PACKS = { starter: { price: 99, once: true }, epic: { price: 349 }, legendary: { price: 899 } };
const CATALOG = {};
for (const id in PETS) CATALOG[`pet:${id}`] = RAR_PRICE[PETS[id]];
for (const id in CAPES) CATALOG[`cape:${id}`] = RAR_PRICE[CAPES[id]];
for (const id of POTS) CATALOG[`pot:${id}`] = POT_PRICE;
for (const id in PACKS) CATALOG[`pack:${id}`] = PACKS[id].price;

/* ---------- пополнение: пакеты TON → GRAM ---------- */
const TOPUP = [{ id: 't1', ton: 1, bonus: 0 }, { id: 't3', ton: 3, bonus: 10 }, { id: 't5', ton: 5, bonus: 20 }, { id: 't10', ton: 10, bonus: 30 }];
const ORDER_TTL_H = 24;   // сколько часов ждём оплату заказа

module.exports = function gram(pool, { receiver, rate, toncenter, apiKey }) {
  const packages = TOPUP.map(p => ({ ...p, gram: Math.round(p.ton * rate * (1 + p.bonus / 100)), nano: String(Math.round(p.ton * 1e9)) }));
  const enabled = !!receiver;

  async function balance(tgId) { const { rows } = await pool.query('SELECT gram FROM players WHERE tg_id = $1', [tgId]); return Number(rows[0] ? rows[0].gram : 0); }

  /* ---------- проверка оплат в блокчейне (toncenter API v2) ---------- */
  let lastCheck = 0, checking = null;
  async function checkPayments(force) {
    if (!enabled) return;
    if (checking) return checking;
    if (!force && Date.now() - lastCheck < 4000) return;
    lastCheck = Date.now();
    checking = (async () => {
      const pend = await pool.query(`SELECT id, tg_id, amount_nano, gram, comment FROM gram_orders
        WHERE status = 'pending' AND created_at > now() - interval '${ORDER_TTL_H} hours'`);
      if (!pend.rows.length) return;
      const byComment = new Map(pend.rows.map(o => [o.comment, o]));
      const url = `${toncenter}/getTransactions?address=${encodeURIComponent(receiver)}&limit=100&archival=true`;
      const r = await fetch(url, { headers: apiKey ? { 'X-API-Key': apiKey } : {} });
      const j = await r.json();
      if (!j.ok) throw new Error('toncenter: ' + (j.error || r.status));
      for (const tx of j.result || []) {
        const m = tx.in_msg; if (!m || !m.source || typeof m.message !== 'string') continue;
        const o = byComment.get(m.message.trim()); if (!o) continue;
        if (BigInt(m.value || 0) < BigInt(o.amount_nano)) { console.warn(`GRAM: заказ ${o.id} оплачен не полностью: ${m.value}`); continue; }
        await credit(o, tx.transaction_id && tx.transaction_id.hash, m.source);
      }
    })().catch(e => console.error('GRAM check:', e.message)).finally(() => { checking = null; });
    return checking;
  }
  async function credit(o, hash, from) {
    const c = await pool.connect();
    try {
      await c.query('BEGIN');
      const up = await c.query(`UPDATE gram_orders SET status = 'paid', tx_hash = $2, paid_at = now()
        WHERE id = $1 AND status = 'pending' RETURNING id`, [o.id, hash || `order-${o.id}`]);
      if (up.rows[0]) {
        await c.query('UPDATE players SET gram = gram + $2 WHERE tg_id = $1', [o.tg_id, o.gram]);
        await c.query('INSERT INTO gram_tx (tg_id, amount, reason) VALUES ($1, $2, $3)', [o.tg_id, o.gram, `topup:${o.id}`]);
        console.log(`GRAM: +${o.gram} игроку ${o.tg_id} (заказ ${o.id}, от ${from})`);
      }
      await c.query('COMMIT');
    } catch (e) { await c.query('ROLLBACK').catch(() => {}); if (e.code !== '23505') throw e; }   // 23505 — эта транзакция уже засчитана
    finally { c.release(); }
  }
  if (enabled) setInterval(() => checkPayments(true), 20000).unref();

  const router = express.Router();
  // баланс, цены, пакеты пополнения, невыданные покупки
  router.get('/', async (req, res, next) => {
    try {
      const [bal, once, ung] = await Promise.all([
        balance(req.tgId),
        pool.query(`SELECT item FROM shop_purchases WHERE tg_id = $1 AND item = ANY($2)`, [req.tgId, Object.keys(PACKS).filter(k => PACKS[k].once).map(k => `pack:${k}`)]),
        pool.query(`SELECT id, item FROM shop_purchases WHERE tg_id = $1 AND NOT granted ORDER BY id`, [req.tgId]),
      ]);
      res.json({ balance: bal, prices: CATALOG, topup: enabled ? packages.map(({ id, ton, bonus, gram }) => ({ id, ton, bonus, gram })) : null,
        bought: once.rows.map(r => r.item), ungranted: ung.rows.map(r => ({ id: Number(r.id), item: r.item })) });
    } catch (e) { next(e); }
  });
  // покупка: цена берётся только из каталога сервера
  router.post('/buy', async (req, res, next) => {
    const item = String((req.body || {}).item || ''), price = CATALOG[item];
    if (!price) return res.status(400).json({ error: 'unknown item' });
    const c = await pool.connect();
    try {
      await c.query('BEGIN');
      const up = await c.query('UPDATE players SET gram = gram - $2 WHERE tg_id = $1 AND gram >= $2 RETURNING gram', [req.tgId, price]);
      if (!up.rows[0]) { await c.query('ROLLBACK'); return res.status(402).json({ error: 'not enough gram', balance: await balance(req.tgId) }); }
      const p = await c.query('INSERT INTO shop_purchases (tg_id, item, price) VALUES ($1, $2, $3) RETURNING id', [req.tgId, item, price]);
      await c.query('INSERT INTO gram_tx (tg_id, amount, reason) VALUES ($1, $2, $3)', [req.tgId, -price, `buy:${item}`]);
      await c.query('COMMIT');
      res.json({ id: Number(p.rows[0].id), item, balance: Number(up.rows[0].gram) });
    } catch (e) {
      await c.query('ROLLBACK').catch(() => {});
      if (e.code === '23505') return res.status(409).json({ error: 'already bought' });   // стартовый пак — один раз
      next(e);
    } finally { c.release(); }
  });
  // игра выдала покупку и сохранилась
  router.post('/ack', async (req, res, next) => {
    try {
      const ids = ((req.body || {}).ids || []).filter(Number.isSafeInteger).slice(0, 50);
      if (ids.length) await pool.query('UPDATE shop_purchases SET granted = true WHERE tg_id = $1 AND id = ANY($2)', [req.tgId, ids]);
      res.json({ ok: true });
    } catch (e) { next(e); }
  });
  // заказ на пополнение: адрес, сумма в нанотонах и уникальный комментарий для перевода
  router.post('/order', async (req, res, next) => {
    try {
      if (!enabled) return res.status(503).json({ error: 'topup disabled' });
      const p = packages.find(x => x.id === (req.body || {}).package); if (!p) return res.status(400).json({ error: 'bad package' });
      const n = await pool.query(`SELECT count(*) FROM gram_orders WHERE tg_id = $1 AND status = 'pending' AND created_at > now() - interval '1 hour'`, [req.tgId]);
      if (Number(n.rows[0].count) >= 10) return res.status(429).json({ error: 'too many orders' });
      const comment = `RMP-${req.tgId.slice(-6)}-${crypto.randomBytes(4).toString('hex')}`;
      const { rows } = await pool.query(`INSERT INTO gram_orders (tg_id, package, amount_nano, gram, comment) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [req.tgId, p.id, p.nano, p.gram, comment]);
      res.json({ id: Number(rows[0].id), address: receiver, amount: p.nano, comment, gram: p.gram, validUntil: Math.floor(Date.now() / 1000) + 15 * 60 });
    } catch (e) { next(e); }
  });
  router.get('/order/:id', async (req, res, next) => {
    try {
      if (!/^\d{1,18}$/.test(req.params.id)) return res.status(400).json({ error: 'bad id' });
      await checkPayments(false);
      const { rows } = await pool.query('SELECT status, gram, created_at FROM gram_orders WHERE id = $1 AND tg_id = $2', [req.params.id, req.tgId]);
      if (!rows[0]) return res.status(404).json({ error: 'not found' });
      const expired = rows[0].status === 'pending' && Date.now() - new Date(rows[0].created_at) > ORDER_TTL_H * 3600e3;
      res.json({ status: expired ? 'expired' : rows[0].status, gram: Number(rows[0].gram), balance: await balance(req.tgId) });
    } catch (e) { next(e); }
  });

  return { router, checkPayments };
};
