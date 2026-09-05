const crypto = require('node:crypto');
const COOKIE = 'astra_studio_session';

function sign(value) {
  return crypto.createHmac('sha256', process.env.STUDIO_SECRET || '').update(value).digest('base64url');
}

function cookie(req) {
  const raw = req.headers.cookie || '';
  const hit = raw.split(';').map(x => x.trim()).find(x => x.startsWith(`${COOKIE}=`));
  return hit ? decodeURIComponent(hit.slice(COOKIE.length + 1)) : '';
}

module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'GET') return res.status(405).json({ ok: false });
  if (!process.env.STUDIO_SECRET) return res.status(500).json({ ok: false, error: 'Studio authentication is not configured' });

  const token = cookie(req);
  const [payload, signature] = token.split('.');
  if (!payload || !signature || signature !== sign(payload)) return res.status(401).json({ ok: false });

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data.exp || data.exp < Math.floor(Date.now() / 1000)) return res.status(401).json({ ok: false });
    return res.status(200).json({ ok: true, expiresAt: data.exp });
  } catch {
    return res.status(401).json({ ok: false });
  }
};
