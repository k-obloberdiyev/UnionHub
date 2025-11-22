/* Minimal Supabase-like adapter backed by the Node+SQLite API */

const API_URL = (import.meta as any).env.VITE_API_URL as string | undefined;

if (!API_URL) {
  console.warn("VITE_API_URL is not set; api-adapter will not work without it.");
}

const STORAGE_KEY = "uh_api_session";

type SessionShape = {
  access_token: string;
  user: { id: string; email: string };
};

type AuthCallback = (event: "SIGNED_IN" | "SIGNED_OUT", session: SessionShape | null) => void;

let currentSession: SessionShape | null = null;
const listeners: AuthCallback[] = [];

function loadSessionFromStorage() {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (raw) currentSession = JSON.parse(raw);
  } catch {
    /* ignore */
  }
}

function saveSession(session: SessionShape | null) {
  currentSession = session;
  try {
    if (typeof localStorage !== "undefined") {
      if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      else localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }
}

function notify(event: "SIGNED_IN" | "SIGNED_OUT", session: SessionShape | null) {
  for (const cb of listeners) {
    try {
      cb(event, session);
    } catch {
      /* ignore */
    }
  }
}

loadSessionFromStorage();

async function apiFetch(path: string, opts: RequestInit & { auth?: boolean } = {}) {
  if (!API_URL) throw new Error("VITE_API_URL is not configured");
  const url = API_URL.replace(/\/$/, "") + path;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string> | undefined),
  };

  if (opts.auth && currentSession?.access_token) {
    headers["Authorization"] = `Bearer ${currentSession.access_token}`;
  }

  const res = await fetch(url, { ...opts, headers });
  const text = await res.text();
  let body: any = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!res.ok) {
    const message = (body && (body.error || body.message)) || res.statusText;
    const err: any = new Error(message || `HTTP ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return body;
}

const ApiAdapter: any = {
  auth: {
    async getSession() {
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
            },
          },
        },
      };
    },
    async signInWithPassword({ email, password }: { email: string; password: string }) {
      try {
        const body = await apiFetch("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        const session: SessionShape = {
          access_token: body.token,
          user: body.user,
        };
        saveSession(session);
        notify("SIGNED_IN", session);
        return { data: body, error: null };
      } catch (err: any) {
        return { data: null, error: new Error(err.message || "Login failed") };
      }
    },
    async signOut() {
      saveSession(null);
      notify("SIGNED_OUT", null);
      return { error: null };
    },
  },

  from(table: string) {
    const state: any = { table, filters: [] as string[], single: false };

    const api: any = {
      select(_fields: string) {
        // fields ignored on backend; always returns full row
        return api;
      },
      single() {
        state.single = true;
        return api;
      },
      eq(field: string, value: any) {
        state.filters.push({ field, value });
        return api;
      },
      async insert(values: any | any[]) {
        if (table !== "profiles") {
          return { data: null, error: new Error("Only profiles insert is implemented") };
        }
        try {
          const payload = Array.isArray(values) ? values[0] : values;
          const row = await apiFetch("/profiles", {
            method: "POST",
            body: JSON.stringify(payload),
            auth: true,
          });
          return { data: row, error: null };
        } catch (err: any) {
          return { data: null, error: new Error(err.message || "Failed to create profile") };
        }
      },
      async then(resolve: any, reject: any) {
        try {
          if (table !== "profiles") {
            throw new Error("Only profiles select is implemented");
          }
          const eqFilter = state.filters.find((f: any) => f.field === "id");
          if (!eqFilter) {
            throw new Error("Only eq('id', ...) filter is implemented for profiles");
          }
          const row = await apiFetch(`/profiles/${encodeURIComponent(eqFilter.value)}`, {
            method: "GET",
            auth: true,
          });
          const data = state.single ? row : [row];
          resolve({ data, error: null });
        } catch (err) {
          reject({ data: null, error: err });
        }
      },
    };

    return api;
  },
};

export default ApiAdapter;
