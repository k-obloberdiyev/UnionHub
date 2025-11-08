#!/usr/bin/env node
// Seed script for PocketBase (CommonJS): creates departments and 30 profiles linked to departments
// Usage:
//   node scripts/seed-pocketbase.cjs --url http://127.0.0.1:8090 --admin-email admin@example.com --admin-password secret

const fetch = require('node-fetch');
const argv = require('minimist')(process.argv.slice(2));

const POCKETBASE_URL = argv.url || process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';
const ADMIN_EMAIL = argv['admin-email'] || process.env.POCKETBASE_ADMIN_EMAIL;
const ADMIN_PASSWORD = argv['admin-password'] || process.env.POCKETBASE_ADMIN_PASSWORD;
const ADMIN_TOKEN = argv['admin-token'] || process.env.POCKETBASE_ADMIN_TOKEN;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Provide admin credentials via --admin-email and --admin-password (or env vars)');
  process.exit(1);
}

async function adminLogin() {
  const url = `${POCKETBASE_URL}/api/admins/auth-with-password`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  });
  if (!res.ok) throw new Error(`Admin login failed: ${res.statusText}`);
  const data = await res.json();
  return data.token; // admin token
}

async function createCollectionRecord(adminToken, collection, record) {
  const url = `${POCKETBASE_URL}/api/collections/${collection}/records`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify(record)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create record: ${res.status} ${text}`);
  }
  return res.json();
}

async function main() {
  try {
    let token = ADMIN_TOKEN;
    if (!token) {
      if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
        throw new Error('No ADMIN_TOKEN provided and admin credentials missing. Provide --admin-token or --admin-email and --admin-password');
      }
      console.log('Logging in as admin...');
      token = await adminLogin();
      console.log('Admin token received');
    } else {
      console.log('Using provided admin token');
    }
    // Create departments and capture IDs
    const departmentsInput = [
      { name: 'Engineering', description: 'Product and platform' },
      { name: 'Design', description: 'Design and research' },
      { name: 'Community', description: 'Community and events' },
    ];

    const createdDepartments = [];
    for (const d of departmentsInput) {
      console.log('Creating department', d.name);
      const rec = await createCollectionRecord(token, 'departments', d);
      createdDepartments.push({ id: rec.id, name: d.name });
    }

    if (createdDepartments.length === 0) {
      throw new Error('No departments created; aborting profile seeding.');
    }

    // Create sample profiles (30 dummy users) and assign departments round-robin
    for (let i = 1; i <= 30; i++) {
      const dept = createdDepartments[(i - 1) % createdDepartments.length];
      const profile = {
        first_name: `User${i}`,
        last_name: 'Member',
        email: `user${i}@example.com`,
        // PocketBase relation fields expect an array of ids even for single-select relations
        department: [dept.id],
        avatar_url: '',
      };
      console.log('Creating profile', profile.email, '-> department', dept.name);
      await createCollectionRecord(token, 'profiles', profile);
    }

    console.log('Seeding complete');
  } catch (err) {
    console.error('Error during seeding:', err);
    process.exit(1);
  }
}

main();
