// Minimal PocketBase adapter to satisfy the small supabase surface used by the app.
// This is a development helper — it uses the PocketBase REST API and is intentionally small.
/* eslint-disable @typescript-eslint/no-explicit-any */

const POCKETBASE_URL = (import.meta as any).env.VITE_POCKETBASE_URL ?? 'http://127.0.0.1:8090';

// --- Lightweight session management (client-side) ---
type AuthCallback = (event: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED', session: any) => void;
const listeners: AuthCallback[] = [];
const STORAGE_KEY = 'uh_pocket_session';
let currentSession: any = null;

function jsonFetch(path: string, opts: any = {}) {
  const url = `${POCKETBASE_URL}${path}`;
  const headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
  return fetch(url, Object.assign({}, opts, { headers })).then(async (res) => {
    const text = await res.text();
    let body: any = null;
    try { body = text ? JSON.parse(text) : null; } catch { body = text; }
    if (!res.ok) {
      // Prefer any error message returned from the server. Fall back to statusText.
      const message = (body && (body.message || body.error || body.error_description)) || (typeof body === 'string' ? body : null) || res.statusText;
      const err: any = new Error(message ?? `HTTP ${res.status}`);
      err.status = res.status;
      err.body = body;
      throw err;
    }
    return body;
  });
}

function notify(event: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED', session: any) {
  for (const cb of listeners) {
    try { cb(event, session); } catch { /* noop */ }
  }
}

function loadSessionFromStorage() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (raw) currentSession = JSON.parse(raw);
  } catch { /* ignore */ }
}

function saveSession(session: any) {
  currentSession = session;
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch { /* ignore */ }
}

function clearSession() {
  currentSession = null;
  try {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}

// Initialize from storage on first import
loadSessionFromStorage();

const PocketAdapter = {
  auth: {
    async getSession() {
      // Mimic Supabase's shape: { data: { session } }
      return { data: { session: currentSession } };
    },
    onAuthStateChange(callback: AuthCallback) {
      listeners.push(callback);
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              const idx = listeners.indexOf(callback);
              if (idx >= 0) listeners.splice(idx, 1);
            }
          }
        }
      };
    },
    async signInWithPassword({ email, password }: { email: string; password: string }) {
      // Try the common collection names that projects often use for user auth.
      const endpoints = [
        `/api/collections/users/auth-with-password`,
        `/api/collections/profiles/auth-with-password`,
      ];

      for (const ep of endpoints) {
        try {
          const body = await jsonFetch(ep, {
            method: 'POST',
            body: JSON.stringify({ identity: email, password }),
          });
          // PocketBase returns { token, record }
          const record = body?.record || {};
          const token = body?.token || '';
          const session = {
            access_token: token,
            user: {
              id: record.id,
              email: record.email || email,
            }
          };
          saveSession(session);
          notify('SIGNED_IN', session);
          return { data: body, error: null };
        } catch (err: any) {
          console.warn(`[PocketAdapter] auth attempt to ${ep} failed:`, err?.status, err?.message, err?.body ?? err);
          if (err?.status && err.status >= 400 && err.status < 500 && err?.body && typeof err.body === 'object' && (err.body.message || err.body.error)) {
            return { data: null, error: new Error(err.body.message || err.body.error || err.message) };
          }
          // Otherwise continue to next endpoint
        }
      }

      // If none of the endpoints worked, return a generic error.
      return { data: null, error: new Error('Authentication failed (no matching auth endpoint found or bad request). Check PocketBase collections and server logs.') };
    },
    async signOut() {
      clearSession();
      notify('SIGNED_OUT', null);
      return { error: null };
    }
  },

  from(table: string) {
    const state: any = { table, filters: [] as string[], sort: '', page: 1, perPage: 100, selectFields: '*' };

    const api: any = {
      select(selectFields: string, opts?: any) {
        state.selectFields = selectFields;
        if (opts && opts.count) state.returnCount = true;
        return api;
      },
      eq(field: string, value: any) {
        // build a simple filter by equality (PocketBase filter syntax is e.g. "field = 'value'")
        const v = typeof value === 'string' ? `'${value.replace("'", "\\'")}'` : value;
        state.filters.push(`${field} = ${v}`);
        return api;
      },
      range(from: number, to: number) {
        const perPage = to - from + 1;
        const page = Math.floor(from / perPage) + 1;
        state.page = page;
        state.perPage = perPage;
        return api;
      },
      order(field: string, opts?: { ascending?: boolean }) {
        state.sort = (opts?.ascending ? '' : '-') + field;
        return api;
      },
      async then(resolve: any, reject: any) {
        try {
          const filter = state.filters.length ? state.filters.join(' && ') : undefined;
          const q = `?page=${state.page}&perPage=${state.perPage}` + (filter ? `&filter=${encodeURIComponent(filter)}` : '') + (state.sort ? `&sort=${encodeURIComponent(state.sort)}` : '');
          const body = await jsonFetch(`/api/collections/${state.table}/records${q}`, { method: 'GET' });
          const data = body.items || [];
          const result: any = { data, error: null };
          if (typeof body.totalItems !== 'undefined') result.count = body.totalItems;
          resolve(result);
        } catch (err) {
          reject({ data: null, error: err });
        }
      },
      async run() { return new Promise((res, rej) => api.then(res, rej)); }
    };

    return api;
  }
};

export default PocketAdapter;
