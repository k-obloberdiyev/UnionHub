const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getProfileByEmail, getProfileById, insertProfile } = require('./db');

const app = express();
const PORT = process.env.PORT || 8787;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());

function nowISO() {
  return new Date().toISOString();
}

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

function authMiddleware(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  const row = getProfileByEmail(email);
  if (!row || !row.password_hash) return res.status(400).json({ error: 'Invalid login credentials' });
  const ok = bcrypt.compareSync(password, row.password_hash);
  if (!ok) return res.status(400).json({ error: 'Invalid login credentials' });
  const token = signToken(row);
  return res.json({ token, user: { id: row.id, email: row.email } });
});

app.get('/profiles/:id', authMiddleware, (req, res) => {
  const id = req.params.id;
  const row = getProfileById(id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  return res.json(row);
});

app.post('/profiles', authMiddleware, (req, res) => {
  const b = req.body || {};
  const id = b.id || require('crypto').randomUUID();
  const created_at = nowISO();
  const updated_at = created_at;
  let password_hash = null;
  if (b.password) password_hash = bcrypt.hashSync(b.password, 10);
  try {
    const profile = {
      id,
      email: b.email || null,
      password_hash,
      first_name: b.first_name || null,
      last_name: b.last_name || null,
      department_id: b.department_id || null,
      avatar_url: b.avatar_url || b.avatar || null,
      coins: Number(b.coins || 0),
      credibility_score: Number(b.credibility_score || 0),
      name: b.name || null,
      class_name: b.class_name || null,
      biography: b.biography || '',
      department_code: typeof b.department_code === 'number' ? b.department_code : null,
      created_at,
      updated_at,
    };

    insertProfile(profile);
  } catch (e) {
    if (e && (e.code === 'EMAIL_EXISTS' || String(e.message).includes('Email already exists'))) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    return res.status(500).json({ error: 'Failed to create profile' });
  }
  const row = getProfileById(id);
  return res.status(201).json(row);
});

app.get('/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`UnionHub server listening on :${PORT}`);
});
