const crypto = require('node:crypto');

const COOKIE = 'astra_studio_session';
// Persistent admin login: the browser stays authorized for one year.
// Logging out or clearing site cookies invalidates the local session.
const MAX_AGE = 60 * 60 * 24 * 365;
const attempts = new Map();

function secret() {
  return process.env.STUDIO_SECRET || '';
}

function sign(value) {
  return crypto.createHmac('sha256', secret()).update(value).digest('base64url');
}

function parseCookies(req) {
  const raw = req.headers.cookie || '';
  return Object.fromEntries(raw.split(';').filter(Boolean).map(part => {
    const i = part.indexOf('=');
    return [part.slice(0, i).trim(), decodeURIComponent(part.slice(i + 1).trim())];
  }));
}

function safeEqual(a, b) {
  const aa = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

function clientKey(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  if (!secret() || !process.env.STUDIO_PASSWORD) return res.status(500).json({ ok: false, error: 'Studio authentication is not configured' });

  const key = clientKey(req);
  const now = Date.now();
  const state = attempts.get(key) || { fails: 0, blockedUntil: 0 };
  if (state.blockedUntil > now) return res.status(429).json({ ok: false, error: 'Слишком много попыток. Попробуйте позже.' });
  if (state.blockedUntil && state.blockedUntil <= now) {
    state.fails = 0;
    state.blockedUntil = 0;
  }

  let password = '';
  try {
    password = typeof req.body === 'string' ? JSON.parse(req.body).password : req.body?.password;
  } catch {}

  if (!safeEqual(password || '', process.env.STUDIO_PASSWORD)) {
    state.fails += 1;
    if (state.fails >= 5) {
      state.blockedUntil = now + 15 * 60 * 1000;
      state.fails = 0;
    }
    attempts.set(key, state);
    return res.status(401).json({ ok: false, error: 'Неверный пароль' });
  }

  attempts.delete(key);
  const payload = Buffer.from(JSON.stringify({ exp: Math.floor(now / 1000) + MAX_AGE, nonce: crypto.randomBytes(18).toString('hex') })).toString('base64url');
  const token = `${payload}.${sign(payload)}`;
  res.setHeader('Set-Cookie', `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${MAX_AGE}`);
  return res.status(200).json({ ok: true });
};
