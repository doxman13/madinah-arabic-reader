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
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Route /api/progress to the D1 sync handler
    if (url.pathname.startsWith('/api/progress')) {
      return handleProgressApi(request, env);
    }

    // Default: serve static frontend assets (HTML, JS, CSS, audio clips)
    return await env.ASSETS.fetch(request);
  }
};

async function handleProgressApi(request: Request, env: Env): Promise<Response> {
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!env.DB) {
    return new Response(JSON.stringify({ 
      error: 'D1 Database not bound yet. In Cloudflare Dashboard, go to Settings -> Bindings and bind variable DB to your D1 database.' 
    }), {
      status: 503,
      headers: corsHeaders,
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

    if (request.method === 'GET') {
      const url = new URL(request.url);
      const userKey = url.searchParams.get('userKey')?.trim().toLowerCase();

      if (!userKey) {
        return new Response(JSON.stringify({ error: 'Missing userKey query parameter' }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      const row = await env.DB.prepare('SELECT data, updated_at FROM user_progress WHERE user_key = ?')
        .bind(userKey)
        .first<{ data: string; updated_at: string }>();

      if (!row) {
        return new Response(JSON.stringify({ found: false, progress: null }), {
          status: 200,
          headers: corsHeaders,
        });
      }

      return new Response(JSON.stringify({ 
        found: true, 
        progress: JSON.parse(row.data), 
        updatedAt: row.updated_at 
      }), {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (request.method === 'POST') {
      const body = await request.json() as { userKey?: string; data?: any };
      const userKey = body.userKey?.trim().toLowerCase();

      if (!userKey || !body.data) {
        return new Response(JSON.stringify({ error: 'Missing userKey or data in request body' }), {
          status: 400,
          headers: corsHeaders,
        });
      }

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
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: corsHeaders,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Database error' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}
