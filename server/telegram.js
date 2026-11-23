'use strict';
// Проверка подписи данных Telegram.
//  * Mini App (WebApp.initData):  https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
//  * Login Widget:                https://core.telegram.org/widgets/login#checking-authorization
const crypto = require('crypto');

const MAX_AGE_SEC = 24 * 3600;   // данные входа старше суток не принимаем

function safeEqHex(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
}
function fresh(authDate) {
  const t = Number(authDate);
  return Number.isFinite(t) && Math.abs(Date.now() / 1000 - t) <= MAX_AGE_SEC;
}
const checkString = entries => entries
  .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  .map(([k, v]) => `${k}=${v}`).join('\n');

// Возвращает пользователя Telegram {id, first_name, ...} или null.
function verifyWebApp(initData, botToken) {
  if (typeof initData !== 'string' || initData.length > 8192) return null;
  const p = new URLSearchParams(initData);
  const hash = p.get('hash');
  p.delete('hash');
  const secret = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calc = crypto.createHmac('sha256', secret).update(checkString([...p.entries()])).digest('hex');
  if (!safeEqHex(calc, hash) || !fresh(p.get('auth_date'))) return null;
  try {
    const u = JSON.parse(p.get('user'));
    if (u && Number.isSafeInteger(u.id)) u._startParam = p.get('start_param');   // ?startapp=… из ссылки на Mini App
    return u && Number.isSafeInteger(u.id) ? u : null;
  } catch { return null; }
}

function verifyWidget(data, botToken) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const { hash, ...rest } = data;
  const entries = Object.entries(rest);
  if (entries.length > 10 || entries.some(([, v]) => !['string', 'number'].includes(typeof v))) return null;
  const secret = crypto.createHash('sha256').update(botToken).digest();
  const calc = crypto.createHmac('sha256', secret).update(checkString(entries)).digest('hex');
  if (!safeEqHex(calc, hash) || !fresh(rest.auth_date)) return null;
  const id = Number(rest.id);
  return Number.isSafeInteger(id) ? { ...rest, id } : null;
}

module.exports = { verifyWebApp, verifyWidget };
