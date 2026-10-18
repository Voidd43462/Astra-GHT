const { isAuthed } = require('./_auth');
const { db } = require('./_db');
const tg = require('./_telegram');

function clean(p, i) {
  const list = v => (Array.isArray(v) ? v.map(x => String(x).slice(0, 200)).slice(0, 40) : []);
  return {
    id: String(p.id || `w${Date.now()}${i}`).slice(0, 64),
    title: String(p.title || 'Без названия').slice(0, 200),
    short: String(p.short || '').slice(0, 300),
    text: String(p.text || '').slice(0, 3000),
    tags: list(p.tags),
    features: list(p.features),
    demos: (Array.isArray(p.demos) ? p.demos : [])
      .filter(d => d && /^https?:\/\//i.test(d.url))
      .map(d => ({
        name: String(d.name || d.url).slice(0, 100),
        url: String(d.url).slice(0, 500),
        images: (Array.isArray(d.images) ? d.images : []).filter(u => /^(img\/|https?:\/\/)/.test(u)).map(u => String(u).slice(0, 500)).slice(0, 10)
      }))
      .slice(0, 10),
    private: Boolean(p.private),
    tg: Boolean(p.tg) && !p.private
  };
}

const opts = { parse_mode: 'HTML', link_preview_options: { is_disabled: true } };

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  try {
    const sql = await db();

    if (req.method === 'GET') {
      const rows = await sql`SELECT id, data FROM works ORDER BY position, updated_at`;
      return res.status(200).json({ ok: true, works: rows.map(r => ({ ...r.data, id: r.id })) });
    }

    if (req.method !== 'PUT') return res.status(405).json({ ok: false, error: 'Method not allowed' });
    if (!isAuthed(req)) return res.status(401).json({ ok: false, error: 'Unauthorized' });

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!Array.isArray(body?.works)) return res.status(400).json({ ok: false, error: 'works[] required' });
    const works = body.works.slice(0, 100).map(clean);

    const existing = await sql`SELECT id, tg_message_id FROM works`;
    const msgOf = new Map(existing.map(r => [r.id, r.tg_message_id ? Number(r.tg_message_id) : null]));
    const keep = new Set(works.map(w => w.id));
    const warnings = [];
    const canTg = Boolean(process.env.TELEGRAM_BOT_TOKEN && tg.channel());

    for (const row of existing) {
      if (keep.has(row.id)) continue;
      if (row.tg_message_id && canTg) {
        try { await tg.call('deleteMessage', { chat_id: tg.channel(), message_id: Number(row.tg_message_id) }); }
        catch (e) { warnings.push(`Не удалось удалить пост: ${e.message}`); }
      }
      await sql`DELETE FROM works WHERE id = ${row.id}`;
    }

    for (let i = 0; i < works.length; i++) {
      const w = works[i];
      let mid = msgOf.get(w.id) || null;
      if (w.tg && canTg) {
        try {
          if (mid) {
            try { await tg.call('editMessageText', { chat_id: tg.channel(), message_id: mid, text: tg.compose(w), ...opts }); }
            catch (e) { if (!e.notModified) throw e; }
          } else {
            const sent = await tg.call('sendMessage', { chat_id: tg.channel(), text: tg.compose(w), ...opts });
            mid = sent.message_id;
          }
        } catch (e) { warnings.push(`«${w.title}»: ${e.message}`); }
      } else if (w.tg && !canTg) {
        warnings.push('Telegram не настроен (TELEGRAM_BOT_TOKEN / TELEGRAM_CHANNEL).');
      }
      const json = JSON.stringify(w);
      await sql`INSERT INTO works (id, position, tg_message_id, data, updated_at)
        VALUES (${w.id}, ${i}, ${mid}, ${json}::jsonb, now())
        ON CONFLICT (id) DO UPDATE SET position = ${i}, tg_message_id = ${mid}, data = ${json}::jsonb, updated_at = now()`;
    }

    return res.status(200).json({ ok: true, works, warnings: [...new Set(warnings)] });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
};
