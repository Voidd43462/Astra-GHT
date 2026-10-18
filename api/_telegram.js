const HASHTAG = '#работа';

const esc = s => String(s ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

async function call(method, body) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not configured');
  const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const d = await r.json().catch(() => ({}));
  if (!d.ok) {
    const e = new Error(d.description || `Telegram ${method} failed`);
    e.notModified = /not modified/i.test(d.description || '');
    throw e;
  }
  return d.result;
}

// Работа -> текст поста в канале
function compose(p) {
  const parts = [HASHTAG, `<b>${esc(p.title)}</b>`];
  if (p.short) parts.push(esc(p.short));
  if (p.text && p.text !== p.short) parts.push('', esc(p.text));
  const urls = (p.demos || []).map(d => d.url).filter(Boolean);
  if (urls.length) parts.push('', ...urls.map(u => `🔗 ${esc(u)}`));
  const tags = (p.tags || []).map(t => '#' + String(t).replace(/[^\p{L}\p{N}_]+/gu, '_')).filter(t => t.length > 1);
  if (tags.length) parts.push('', tags.join(' '));
  return parts.join('\n');
}

// Пост в канале -> работа. Возвращает null, если в посте нет хэштега #работа.
function parse(msg) {
  const text = msg.text || msg.caption || '';
  if (!text.toLowerCase().includes(HASHTAG)) return null;
  const urls = [...text.matchAll(/https?:\/\/[^\s<>"]+/g)].map(m => m[0].replace(/[.,;)]+$/, ''));
  const tags = [...text.matchAll(/#([\p{L}\p{N}_]+)/gu)].map(m => m[1]).filter(t => t.toLowerCase() !== 'работа');
  const lines = text.split('\n')
    .map(l => l.replace(/#[\p{L}\p{N}_]+/gu, '').replace(/https?:\/\/\S+/g, '').replace(/^🔗\s*/, '').trim())
    .filter(Boolean);
  if (!lines.length) return null;
  const [title, short, ...rest] = lines;
  return {
    title,
    short: short || '',
    text: [short, ...rest].filter(Boolean).join('\n'),
    tags: tags.map(t => t.replace(/_/g, ' ')),
    features: [],
    demos: [...new Set(urls)].map(u => ({ name: u.replace(/^https?:\/\//, '').replace(/\/$/, ''), url: u })),
    private: false,
    tg: true
  };
}

const channel = () => process.env.TELEGRAM_CHANNEL;

module.exports = { call, compose, parse, channel };
