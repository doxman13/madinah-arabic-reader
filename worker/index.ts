interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run<T = unknown>(): Promise<{ success: boolean; error?: string }>;
  all<T = unknown>(): Promise<{ results: T[]; success: boolean }>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
  exec(query: string): Promise<any>;
}

interface Env {
  DB: D1Database;
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
}

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const CREATE_TABLE_SQL = 'CREATE TABLE IF NOT EXISTS user_progress (user_key TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at TEXT);';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/progress') {
      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: CORS_HEADERS });
      }

      if (!env.DB) {
        return new Response(JSON.stringify({ error: 'D1 Database not bound' }), {
          status: 503,
          headers: CORS_HEADERS,
        });
      }

      try {
        await env.DB.prepare(CREATE_TABLE_SQL).run();

        if (request.method === 'GET') {
          const userKey = url.searchParams.get('userKey')?.trim().toLowerCase();
          if (!userKey) {
            return new Response(JSON.stringify({ error: 'Missing userKey' }), {
              status: 400,
              headers: CORS_HEADERS,
            });
          }

          const row = await env.DB.prepare('SELECT data, updated_at FROM user_progress WHERE user_key = ?')
            .bind(userKey)
            .first<{ data: string; updated_at: string }>();

          if (!row) {
            return new Response(JSON.stringify({ found: false, progress: null }), {
              status: 200,
              headers: CORS_HEADERS,
            });
          }

          return new Response(JSON.stringify({
            found: true,
            progress: JSON.parse(row.data),
            updatedAt: row.updated_at,
          }), {
            status: 200,
            headers: CORS_HEADERS,
          });
        }

        if (request.method === 'POST') {
          const body = await request.json() as { userKey?: string; data?: any };
          const userKey = body.userKey?.trim().toLowerCase();

          if (!userKey || !body.data) {
            return new Response(JSON.stringify({ error: 'Missing userKey or data' }), {
              status: 400,
              headers: CORS_HEADERS,
            });
          }

          const jsonString = JSON.stringify(body.data);
          const now = new Date().toISOString();

          await env.DB.prepare(
            'INSERT INTO user_progress (user_key, data, updated_at) VALUES (?, ?, ?) ON CONFLICT(user_key) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at;'
          ).bind(userKey, jsonString, now).run();

          return new Response(JSON.stringify({
            success: true,
            userKey,
            updatedAt: now,
          }), {
            status: 200,
            headers: CORS_HEADERS,
          });
        }

        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: CORS_HEADERS,
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || 'Database error' }), {
          status: 500,
          headers: CORS_HEADERS,
        });
      }
    }

    // Default: serve static assets (Vite frontend, audio files, etc.)
    return await env.ASSETS.fetch(request);
  }
};
