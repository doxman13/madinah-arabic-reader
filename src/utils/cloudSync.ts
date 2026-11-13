/**
 * Cloud Sync Utility for Madinah Arabic Reader using Cloudflare D1
 */

export function getSyncKey(): string | null {
  return localStorage.getItem('madinah_sync_user_key');
}

export function setSyncKey(key: string): void {
  localStorage.setItem('madinah_sync_user_key', key.trim().toLowerCase());
}

export function clearSyncKey(): void {
  localStorage.removeItem('madinah_sync_user_key');
}

export function collectLocalProgress(): Record<string, string> {
  const payload: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('madinah_') && !key.startsWith('madinah_sync_')) {
      const val = localStorage.getItem(key);
      if (val !== null) {
        payload[key] = val;
      }
    }
  }
  return payload;
}

export function applyRemoteProgress(payload: Record<string, string>): void {
  Object.entries(payload).forEach(([key, val]) => {
    if (key.startsWith('madinah_') && !key.startsWith('madinah_sync_')) {
      localStorage.setItem(key, val);
    }
  });
}

export async function pushProgressToCloud(userKey: string): Promise<{ success: boolean; error?: string }> {
  try {
    const localData = collectLocalProgress();
    const res = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userKey,
        data: localData
      })
    });

    const json = await res.json() as { success?: boolean; error?: string };
    if (!res.ok || json.error) {
      return { success: false, error: json.error || 'Server error' };
    }

    localStorage.setItem('madinah_sync_last_synced', new Date().toISOString());
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

export async function pullProgressFromCloud(userKey: string): Promise<{ success: boolean; found: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/progress?userKey=${encodeURIComponent(userKey)}`);
    const json = await res.json() as { found?: boolean; progress?: Record<string, string>; error?: string };

    if (!res.ok || json.error) {
      return { success: false, found: false, error: json.error || 'Server error' };
    }

    if (!json.found || !json.progress) {
      return { success: true, found: false };
    }

    applyRemoteProgress(json.progress);
    localStorage.setItem('madinah_sync_last_synced', new Date().toISOString());
    return { success: true, found: true };
  } catch (err: any) {
    return { success: false, found: false, error: err.message || 'Network error' };
  }
}
