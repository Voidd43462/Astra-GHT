const { neon } = require('@neondatabase/serverless');

let sql;
let ready;

function db() {
  if (!process.env.DATABASE_URL) return Promise.reject(new Error('DATABASE_URL is not configured'));
  if (!sql) sql = neon(process.env.DATABASE_URL);
  if (!ready) {
    ready = sql`CREATE TABLE IF NOT EXISTS works (
      id TEXT PRIMARY KEY,
      position INT NOT NULL DEFAULT 0,
      tg_message_id BIGINT,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
  }
  return ready.then(() => sql);
}

module.exports = { db };
