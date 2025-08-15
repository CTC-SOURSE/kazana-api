export const API_BASE =
  import.meta.env.VITE_API_BASE || 'https://kazana-api-production.up.railway.app';
export const WIDGET_URL = `${API_BASE}/embed/widget.html`;

async function doFetch(url: string, init: RequestInit) {
  const r = await fetch(url, {
    mode: 'cors',
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
    ...init
  });
  return r;
}

export async function tryRoutes(
  candidates: Array<{method: 'GET'|'POST'|'PATCH'|'DELETE', path: string, body?: any}>
) {
  let lastErr: any = null;
  for (const c of candidates) {
    try {
      const url = c.path.startsWith('http') ? c.path : `${API_BASE}${c.path}`;
      const r = await doFetch(url, {
        method: c.method,
        body: c.body ? JSON.stringify(c.body) : undefined
      });
      if (r.ok) {
        const ct = r.headers.get('content-type') || '';
        return ct.includes('application/json') ? r.json() : r.text();
      } else {
        lastErr = await r.text();
      }
    } catch (e) { lastErr = e; }
  }
  throw new Error(typeof lastErr === 'string' ? lastErr : 'Request failed');
}
