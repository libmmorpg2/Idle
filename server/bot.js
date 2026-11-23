'use strict';
// Telegram-бот: webhook, /start (в т.ч. /start ref_<id>), кнопка меню «Играть», команды и описание.
const crypto = require('crypto');
const express = require('express');

const TEXT = {
  ru: {
    hello: n => `⚔️ <b>Rampage: idle rpg</b>\n\nПривет, ${n}! Собери отряд героев — маг, викинг, убийца и лучник — и прорубись сквозь орды монстров пяти локаций.\n\n🗡 Бой идёт сам, даже когда ты офлайн\n💎 Экипировка, заточка, питомцы и плащи\n👥 Общий чат и друзья`,
    invited: s => `\n\n🎁 Тебя пригласил друг — при первом входе получишь <b>${s} осколка души</b>!`,
    play: '🎮 Играть', invite: '👥 Пригласить друзей',
    share: 'Залетай в Rampage — idle RPG прямо в Telegram! ⚔️',
    other: 'Нажми «Играть», чтобы открыть игру 👇',
    cmd: 'Начать игру', menu: 'Играть',
    desc: 'Rampage — idle RPG в Telegram: собери героев, сражайся с ордами монстров, прокачивайся даже офлайн и приглашай друзей.',
    short: 'Idle RPG: герои, монстры, лут и друзья ⚔️',
  },
  en: {
    hello: n => `⚔️ <b>Rampage: idle rpg</b>\n\nHi, ${n}! Gather a squad of heroes — a mage, a viking, an assassin and an archer — and cut through monster hordes across five lands.\n\n🗡 Battles go on by themselves, even while you're offline\n💎 Gear, enhancement, pets and cloaks\n👥 Global chat and friends`,
    invited: s => `\n\n🎁 A friend invited you — you'll get <b>${s} soul shards</b> on your first login!`,
    play: '🎮 Play', invite: '👥 Invite friends',
    share: 'Join me in Rampage — an idle RPG right in Telegram! ⚔️',
    other: 'Tap «Play» to open the game 👇',
    cmd: 'Start the game', menu: 'Play',
    desc: 'Rampage is an idle RPG in Telegram: gather heroes, fight monster hordes, level up even offline and invite friends.',
    short: 'Idle RPG: heroes, monsters, loot and friends ⚔️',
  },
};
const langOf = code => (['ru', 'uk', 'be', 'kk'].includes(String(code || '').slice(0, 2)) ? 'ru' : 'en');
const escHtml = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

module.exports = function bot({ token, publicUrl, apiBase, referrals, links }) {
  const call = async (method, body) => {
    const r = await fetch(`${apiBase}/bot${token}/${method}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    const j = await r.json().catch(() => ({}));
    if (!j.ok) throw new Error(`${method}: ${j.description || r.status}`);
    return j.result;
  };
  const secret = crypto.createHmac('sha256', token).update('webhook').digest('hex').slice(0, 48);
  const shareUrl = (id, L) => `https://t.me/share/url?url=${encodeURIComponent(links(id))}&text=${encodeURIComponent(L.share)}`;
  const keyboard = (id, L) => ({ inline_keyboard: [
    [{ text: L.play, web_app: { url: publicUrl } }],
    [{ text: L.invite, url: shareUrl(id, L) }],
  ] });

  async function onMessage(msg) {
    if (!msg || !msg.from || !msg.chat || msg.chat.type !== 'private' || typeof msg.text !== 'string') return;
    const L = TEXT[langOf(msg.from.language_code)], id = msg.from.id;
    const m = /^\/start(?:@\w+)?(?:\s+(\S+))?/.exec(msg.text);
    if (!m) return call('sendMessage', { chat_id: id, text: L.other, reply_markup: keyboard(id, L) });
    const invited = m[1] ? await referrals.rememberPending(id, m[1]).catch(() => false) : false;
    const text = L.hello(escHtml(msg.from.first_name || 'герой')) + (invited ? L.invited(referrals.REWARD.welcome) : '');
    const opts = { chat_id: id, parse_mode: 'HTML', reply_markup: keyboard(id, L) };
    try { await call('sendPhoto', { ...opts, photo: `${publicUrl}/assets/img/promo.jpg`, caption: text }); }
    catch (e) { await call('sendMessage', { ...opts, text }); }   // картинка недоступна — просто текст
  }

  const router = express.Router();
  router.post('/', express.json({ limit: '256kb' }), (req, res) => {
    if (req.get('X-Telegram-Bot-Api-Secret-Token') !== secret) return res.sendStatus(401);
    res.sendStatus(200);   // отвечаем сразу, Telegram не ждёт обработки
    onMessage((req.body || {}).message).catch(e => console.error('bot:', e.message));
  });

  async function setup() {
    if (!publicUrl) { console.warn('Бот: не задан PUBLIC_URL (и нет RAILWAY_PUBLIC_DOMAIN) — webhook не настроен'); return; }
    if (!/^https:\/\//.test(publicUrl)) { console.warn(`Бот: ${publicUrl} не https — Telegram не примет webhook`); return; }
    const steps = [
      ['setWebhook', { url: `${publicUrl}/tg/webhook`, secret_token: secret, allowed_updates: ['message'] }],
      ['setMyCommands', { commands: [{ command: 'start', description: TEXT.en.cmd }] }],
      ['setMyCommands', { commands: [{ command: 'start', description: TEXT.ru.cmd }], language_code: 'ru' }],
      ['setChatMenuButton', { menu_button: { type: 'web_app', text: TEXT.ru.menu, web_app: { url: publicUrl } } }],
      ['setMyDescription', { description: TEXT.en.desc }],
      ['setMyDescription', { description: TEXT.ru.desc, language_code: 'ru' }],
      ['setMyShortDescription', { short_description: TEXT.en.short }],
      ['setMyShortDescription', { short_description: TEXT.ru.short, language_code: 'ru' }],
    ];
    for (const [m, b] of steps) { try { await call(m, b); } catch (e) { console.error('Бот:', e.message); } }
    console.log(`Бот: webhook ${publicUrl}/tg/webhook`);
  }

  return { router, setup };
};
