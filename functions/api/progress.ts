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
  DB?: D1Database;
}

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const url = new URL(request.url);
  const userKey = url.searchParams.get('userKey')?.trim().toLowerCase();

  if (!userKey) {
    return new Response(JSON.stringify({ error: 'Missing userKey query parameter' }), {
      status: 400,
      headers: CORS_HEADERS,
    });
  }

  if (!env.DB) {
    return new Response(JSON.stringify({ 
      error: 'D1 Database not bound yet. Please bind a D1 database named "DB" in Cloudflare Pages Settings -> Functions.' 
    }), {
      status: 503,
      headers: CORS_HEADERS,
    });
  }

  try {
    // Ensure table exists
    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS user_progress (
        user_key TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

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
      updatedAt: row.updated_at 
    }), {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Database query error' }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({ 
      error: 'D1 Database not bound yet. Please bind a D1 database named "DB" in Cloudflare Pages Settings -> Functions.' 
    }), {
      status: 503,
      headers: CORS_HEADERS,
    });
  }

  try {
    const body = await request.json() as { userKey?: string; data?: any };
    const userKey = body.userKey?.trim().toLowerCase();

    if (!userKey || !body.data) {
      return new Response(JSON.stringify({ error: 'Missing userKey or data in request body' }), {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    // Ensure table exists
    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS user_progress (
        user_key TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const jsonString = JSON.stringify(body.data);

    await env.DB.prepare(`
      INSERT INTO user_progress (user_key, data, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_key) DO UPDATE SET
        data = excluded.data,
        updated_at = CURRENT_TIMESTAMP
    `).bind(userKey, jsonString).run();

    return new Response(JSON.stringify({ 
      success: true, 
      userKey, 
      updatedAt: new Date().toISOString() 
    }), {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Failed to save progress' }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}
