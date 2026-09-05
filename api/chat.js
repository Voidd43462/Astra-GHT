const crypto = require('node:crypto');
const { neon } = require('@neondatabase/serverless');

const CHAT_COOKIE = 'astra_chat_session';
const STUDIO_COOKIE = 'astra_studio_session';
const MAX_MESSAGE = 1200;

function db() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
  return neon(process.env.DATABASE_URL);
}

function cookie(req, name) {
  const raw = req.headers.cookie || '';
  const hit = raw.split(';').map(v => v.trim()).find(v => v.startsWith(`${name}=`));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : '';
}

function studioAuthorized(req) {
  const token = cookie(req, STUDIO_COOKIE);
  const secret = process.env.STUDIO_SECRET || '';
  if (!token || !secret) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  if (expected !== signature) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return !!data.exp && data.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

function newVisitorId() {
  return crypto.randomBytes(32).toString('hex');
}

function setVisitorCookie(res, value) {
  res.setHeader('Set-Cookie', `${CHAT_COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`);
}

async function ensureSchema(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS chat_conversations (
      id uuid PRIMARY KEY,
      visitor_id text NOT NULL UNIQUE,
      visitor_name text NOT NULL DEFAULT 'Гость',
      status text NOT NULL DEFAULT 'open',
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id bigserial PRIMARY KEY,
      conversation_id uuid NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
      sender text NOT NULL CHECK (sender IN ('visitor','owner')),
      body text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS chat_messages_conversation_idx ON chat_messages (conversation_id, id)`;
  await sql`CREATE INDEX IF NOT EXISTS chat_conversations_updated_idx ON chat_conversations (updated_at DESC)`;
}

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return req.body;
}

function cleanText(value, max = MAX_MESSAGE) {
  return String(value || '').trim().replace(/\u0000/g, '').slice(0, max);
}

async function getOrCreateConversation(sql, req, res, name) {
  let visitorId = cookie(req, CHAT_COOKIE);
  if (!visitorId) {
    visitorId = newVisitorId();
    setVisitorCookie(res, visitorId);
  }
  let rows = await sql`SELECT * FROM chat_conversations WHERE visitor_id = ${visitorId} LIMIT 1`;
  if (rows[0]) {
    if (name) {
      const nextName = cleanText(name, 80) || rows[0].visitor_name;
      await sql`UPDATE chat_conversations SET visitor_name=${nextName}, updated_at=now() WHERE id=${rows[0].id}`;
      rows[0].visitor_name = nextName;
    }
    return rows[0];
  }
  const id = crypto.randomUUID();
  const nextName = cleanText(name, 80) || 'Гость';
  rows = await sql`
    INSERT INTO chat_conversations (id, visitor_id, visitor_name)
    VALUES (${id}, ${visitorId}, ${nextName})
    RETURNING *
  `;
  return rows[0];
}

async function messages(sql, conversationId, sinceId = 0) {
  return sql`
    SELECT id, sender, body, created_at
    FROM chat_messages
    WHERE conversation_id=${conversationId} AND id>${Number(sinceId) || 0}
    ORDER BY id ASC
    LIMIT 200
  `;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  try {
    const sql = db();
    await ensureSchema(sql);
    const isAdmin = studioAuthorized(req);
    const body = parseBody(req);
    const action = body.action || req.query?.action || '';

    if (req.method === 'GET' && action === 'admin') {
      if (!isAdmin) return res.status(401).json({ ok:false, error:'Unauthorized' });
      const rows = await sql`
        SELECT c.id, c.visitor_name, c.status, c.created_at, c.updated_at,
          COALESCE((SELECT body FROM chat_messages m WHERE m.conversation_id=c.id ORDER BY m.id DESC LIMIT 1),'') AS last_message,
          COALESCE((SELECT sender FROM chat_messages m WHERE m.conversation_id=c.id ORDER BY m.id DESC LIMIT 1),'') AS last_sender
        FROM chat_conversations c
        ORDER BY c.updated_at DESC
        LIMIT 100
      `;
      return res.status(200).json({ ok:true, conversations:rows });
    }

    if (req.method === 'GET') {
      const convoId = req.query?.conversation || '';
      if (isAdmin && convoId) {
        const rows = await sql`SELECT * FROM chat_conversations WHERE id=${convoId} LIMIT 1`;
        if (!rows[0]) return res.status(404).json({ ok:false, error:'Conversation not found' });
        const ms = await messages(sql, convoId, req.query?.since || 0);
        return res.status(200).json({ ok:true, conversation:rows[0], messages:ms });
      }
      const convo = await getOrCreateConversation(sql, req, res);
      const ms = await messages(sql, convo.id, req.query?.since || 0);
      return res.status(200).json({ ok:true, conversation:{id:convo.id,visitorName:convo.visitor_name,status:convo.status}, messages:ms });
    }

    if (req.method !== 'POST') return res.status(405).json({ ok:false, error:'Method not allowed' });

    const text = cleanText(body.message);
    if (!text) return res.status(400).json({ ok:false, error:'Сообщение пустое' });

    if (body.action === 'owner-send') {
      if (!isAdmin) return res.status(401).json({ ok:false, error:'Unauthorized' });
      const convoId = cleanText(body.conversationId, 80);
      const exists = await sql`SELECT id FROM chat_conversations WHERE id=${convoId} LIMIT 1`;
      if (!exists[0]) return res.status(404).json({ ok:false, error:'Conversation not found' });
      const result = await sql`
        INSERT INTO chat_messages (conversation_id, sender, body) VALUES (${convoId}, 'owner', ${text})
        RETURNING id, sender, body, created_at
      `;
      await sql`UPDATE chat_conversations SET status='open', updated_at=now() WHERE id=${convoId}`;
      return res.status(201).json({ ok:true, message:result[0] });
    }

    if (body.action === 'close') {
      if (!isAdmin) return res.status(401).json({ ok:false, error:'Unauthorized' });
      const convoId = cleanText(body.conversationId, 80);
      await sql`UPDATE chat_conversations SET status='closed', updated_at=now() WHERE id=${convoId}`;
      return res.status(200).json({ ok:true });
    }

    const convo = await getOrCreateConversation(sql, req, res, body.name);
    if (convo.status === 'closed') await sql`UPDATE chat_conversations SET status='open', updated_at=now() WHERE id=${convo.id}`;

    const recent = await sql`
      SELECT COUNT(*)::int AS count FROM chat_messages
      WHERE conversation_id=${convo.id} AND sender='visitor' AND created_at > now() - interval '1 minute'
    `;
    if ((recent[0]?.count || 0) >= 15) return res.status(429).json({ ok:false, error:'Слишком много сообщений. Подождите минуту.' });

    const result = await sql`
      INSERT INTO chat_messages (conversation_id, sender, body) VALUES (${convo.id}, 'visitor', ${text})
      RETURNING id, sender, body, created_at
    `;
    await sql`UPDATE chat_conversations SET status='open', updated_at=now() WHERE id=${convo.id}`;
    return res.status(201).json({ ok:true, conversationId:convo.id, message:result[0] });
  } catch (error) {
    console.error('chat API error', error);
    return res.status(500).json({ ok:false, error: error.message || 'Chat service unavailable' });
  }
};
