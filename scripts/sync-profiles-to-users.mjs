#!/usr/bin/env node
/*
  Sync profiles -> users in PocketBase
  - Authenticates as PocketBase admin using env vars:
      PB_URL (default http://127.0.0.1:8090)
      PB_ADMIN_EMAIL
      PB_ADMIN_PASSWORD
  - Supports flags:
      --dry-run                 Do not create users, just report
      --default-password <pwd>  Use a single default password for all created users
      --random-passwords        Generate per-user strong random passwords
      --report <path>           CSV output path (default: reports/users-sync-YYYYMMDD-HHMMSS.csv)
  - Idempotent: skips users that already exist (matched by email)
*/

// Node 18+: global fetch available
import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const args = { dryRun: false, defaultPassword: null, randomPasswords: false, report: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') args.dryRun = true;
    else if (a === '--random-passwords') args.randomPasswords = true;
    else if (a === '--default-password') { args.defaultPassword = argv[++i] || null; }
    else if (a === '--report') { args.report = argv[++i] || null; }
  }
  return args;
}

function tsStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function ensureDir(p) {
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function randPassword(len = 14) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()-_=+';
  let s = '';
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

async function jsonFetch(base, p, opts = {}) {
  const url = base.replace(/\/$/, '') + p;
  const headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
  const res = await fetch(url, { ...opts, headers });
  const text = await res.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!res.ok) {
    const message = (body && (body.message || body.error)) || (typeof body === 'string' ? body : null) || res.statusText;
    const err = new Error(message ?? `HTTP ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

async function adminLogin(baseUrl, email, password) {
  return jsonFetch(baseUrl, '/api/admins/auth-with-password', {
    method: 'POST',
    body: JSON.stringify({ identity: email, password })
  });
}

async function listProfiles(baseUrl, page = 1, perPage = 200) {
  return jsonFetch(baseUrl, `/api/collections/profiles/records?page=${page}&perPage=${perPage}`);
}

async function findUserByEmail(baseUrl, email) {
  const filter = encodeURIComponent(`email = '${email.replace(/'/g, "\\'")}'`);
  const body = await jsonFetch(baseUrl, `/api/collections/users/records?page=1&perPage=1&filter=${filter}`);
  const items = body?.items || [];
  return items.length ? items[0] : null;
}

async function createUser(baseUrl, token, { email, name, password }) {
  return jsonFetch(baseUrl, '/api/collections/users/records', {
    method: 'POST',
    headers: { 'Authorization': token ? token : '' },
    body: JSON.stringify({
      email,
      emailVisibility: true,
      password,
      passwordConfirm: password,
      name: name || ''
    })
  });
}

async function main() {
  const args = parseArgs(process.argv);
  const baseUrl = process.env.PB_URL || 'http://127.0.0.1:8090';
  const adminEmail = process.env.PB_ADMIN_EMAIL;
  const adminPassword = process.env.PB_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error('PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD must be set in the environment.');
    process.exit(1);
  }

  if (args.randomPasswords && args.defaultPassword) {
    console.error('Use either --random-passwords or --default-password, not both.');
    process.exit(1);
  }

  if (!args.randomPasswords && !args.defaultPassword) {
    // allow DEFAULT_USER_PASSWORD from env as fallback
    if (process.env.DEFAULT_USER_PASSWORD) args.defaultPassword = process.env.DEFAULT_USER_PASSWORD;
  }

  if (!args.randomPasswords && !args.defaultPassword) {
    console.error('Specify a password strategy: --default-password "ChangeMe123!" or --random-passwords');
    process.exit(1);
  }

  const reportPath = args.report || path.join('reports', `users-sync-${tsStamp()}.csv`);
  ensureDir(reportPath);

  console.log('Logging in as admin...');
  let adminToken = '';
  try {
    const login = await adminLogin(baseUrl, adminEmail, adminPassword);
    adminToken = login?.token ? `Admin ${login.token}` : '';
  } catch (e) {
    console.warn('Admin login failed:', e.message);
    console.warn('Proceeding without admin token. This will only work if your users collection allows public create.');
    adminToken = '';
  }

  const csvRows = [['email', 'name', 'action', 'password']];
  let page = 1; const perPage = 200;
  let created = 0, skipped = 0, errors = 0;

  console.log('Fetching profiles and syncing users...');
  while (true) {
    let body;
    try {
      body = await listProfiles(baseUrl, page, perPage);
    } catch (e) {
      console.error('Failed to list profiles:', e.message);
      process.exit(1);
    }

    const items = body?.items || [];
    if (!items.length) break;

    for (const p of items) {
      const email = p?.email || '';
      const name = p?.name || '';
      if (!email) {
        console.warn('Skipping profile with no email:', p?.id);
        csvRows.push(['', name, 'skipped_no_email', '']);
        skipped++;
        continue;
      }

      let exists = null;
      try {
        exists = await findUserByEmail(baseUrl, email);
      } catch (e) {
        console.warn(`Lookup failed for ${email}:`, e.message);
      }

      if (exists) {
        csvRows.push([email, name, 'skipped_exists', '']);
        skipped++;
        continue;
      }

      const password = args.randomPasswords ? randPassword(14) : args.defaultPassword;

      if (args.dryRun) {
        csvRows.push([email, name, 'would_create', args.randomPasswords ? password : '(default)']);
        created++;
      } else {
        try {
          await createUser(baseUrl, adminToken, { email, name, password });
          csvRows.push([email, name, 'created', args.randomPasswords ? password : '(default)']);
          created++;
        } catch (e) {
          console.error(`Create failed for ${email}:`, e.message);
          csvRows.push([email, name, 'error', '']);
          errors++;
        }
      }
    }

    if ((page * perPage) >= (body?.totalItems || 0)) break;
    page++;
  }

  const csv = csvRows.map(r => r.map(v => {
    const s = String(v ?? '');
    return s.includes(',') || s.includes('"') ? '"' + s.replace(/"/g, '""') + '"' : s;
  }).join(',')).join('\n');

  fs.writeFileSync(reportPath, csv, 'utf8');
  console.log('Report written to', reportPath);
  console.log(`Summary: created=${created} skipped=${skipped} errors=${errors}${args.dryRun ? ' (dry-run)' : ''}`);
}

main().catch((e) => {
  console.error('Unexpected error:', e);
  process.exit(1);
});
