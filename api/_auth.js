const crypto = require('node:crypto');
const COOKIE = 'astra_studio_session';

function sign(value) {
  return crypto.createHmac('sha256', process.env.STUDIO_SECRET || '').update(value).digest('base64url');
}

function isAuthed(req) {
  if (!process.env.STUDIO_SECRET) return false;
  const raw = req.headers.cookie || '';
  const hit = raw.split(';').map(x => x.trim()).find(x => x.startsWith(`${COOKIE}=`));
  const token = hit ? decodeURIComponent(hit.slice(COOKIE.length + 1)) : '';
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;
  const a = Buffer.from(signature), b = Buffer.from(sign(payload));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return Boolean(data.exp) && data.exp >= Math.floor(Date.now() / 1000);
  } catch { return false; }
}

module.exports = { isAuthed };
