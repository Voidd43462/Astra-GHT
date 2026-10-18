const { isAuthed } = require('./_auth');
const { db } = require('./_db');
const tg = require('./_telegram');

const sameChat = chat => {
  const want = String(tg.channel() || '').toLowerCase();
  return Boolean(want) && (String(chat.id) === want || `@${(chat.username || '').toLowerCase()}` === want);
};

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // GET (только владелец, из Studio-сессии): зарегистрировать вебхук
  if (req.method === 'GET') {
    if (!isAuthed(req)) return res.status(401).json({ ok: false, error: 'Unauthorized' });
    try {
      const host = req.headers['x-forwarded-host'] || req.headers.host;
      await tg.call('setWebhook', {
        url: `https://${host}/api/telegram`,
        secret_token: process.env.TELEGRAM_WEBHOOK_SECRET,
        allowed_updates: ['channel_post', 'edited_channel_post']
      });
      return res.status(200).json({ ok: true, webhook: `https://${host}/api/telegram` });
    } catch (e) { return res.status(500).json({ ok: false, error: e.message }); }
  }

  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  if (!process.env.TELEGRAM_WEBHOOK_SECRET || req.headers['x-telegram-bot-api-secret-token'] !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return res.status(401).json({ ok: false });
  }

  try {
    const update = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const msg = update.channel_post || update.edited_channel_post;
    if (!msg || !sameChat(msg.chat)) return res.status(200).json({ ok: true, ignored: true });
    const work = tg.parse(msg);
    if (!work) return res.status(200).json({ ok: true, ignored: true });

    const sql = await db();
    const found = await sql`SELECT id, data FROM works WHERE tg_message_id = ${msg.message_id}`;
    if (found.length) {
      const merged = JSON.stringify({ ...found[0].data, ...work, features: found[0].data.features || [], id: found[0].id });
      await sql`UPDATE works SET data = ${merged}::jsonb, updated_at = now() WHERE id = ${found[0].id}`;
    } else {
      const id = `tg${msg.message_id}`;
      const [{ n }] = await sql`SELECT COALESCE(MAX(position), -1) + 1 AS n FROM works`;
      const json = JSON.stringify({ ...work, id });
      await sql`INSERT INTO works (id, position, tg_message_id, data) VALUES (${id}, ${n}, ${msg.message_id}, ${json}::jsonb)`;
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    // 200, чтобы Telegram не повторял запрос бесконечно
    return res.status(200).json({ ok: false, error: e.message });
  }
};
