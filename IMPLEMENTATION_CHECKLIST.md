# UnionHub Implementation Checklist

## 🎯 Immediate Actions (Next 3 Hours)

### ✅ Phase 1: Security Fixes (15 minutes)
- [x] Remove MongoDB credentials from vercel.json
- [x] Remove hardcoded test account passwords
- [x] Remove automatic user creation on startup
- [ ] **TODO:** Implement Bcrypt password hashing
  - Location: `server/index.js` login & registration endpoints
  - Time: 15 minutes
  - See: `SECURITY_ISSUES.md` Section 4

### ✅ Phase 2: Code Cleanup (10 minutes)
- [ ] Delete `api/` directory (duplicate code)
- [ ] Update `vercel.json` to use `server/index.js` only
- [ ] Test that API still works

### ⏳ Phase 3: Database Setup (30 minutes)
Choose ONE:

**Option A: Keep MongoDB (Cloud)**
```bash
# Nothing to do, just ensure .env has proper credentials
# Update vercel environment variables in Vercel dashboard
```

**Option B: Switch to SQLite (Recommended)** ← Choose this one
```bash
# 1. Install package
npm install better-sqlite3

# 2. Initialize database
node server/scripts/init-sqlite.js

# 3. Update .env
DATABASE_TYPE=sqlite
DATABASE_PATH=./data/unionhub.db

# 4. Test the application
npm run dev

# 5. Add to .gitignore
echo "data/unionhub.db" >> .gitignore
```

**Option C: Migrate from MongoDB to SQLite** (if you have data)
```bash
# See: MIGRATION_MONGODB_TO_SQLITE.md
# Time: 30 minutes
```

---

## 📋 Before Going to Production

### Security Requirements
- [ ] **Bcrypt Password Hashing** - CRITICAL
  - [ ] Implement in login endpoint
  - [ ] Implement in registration endpoint
  - [ ] Update database schema to use `password_hash` instead of `password`
  - [ ] Test with curl

- [ ] **Input Validation** - HIGH
  - [ ] Install: `npm install express-validator`
  - [ ] Add validation middleware to `/profiles` endpoint
  - [ ] Add validation middleware to `/auth/login` endpoint
  - [ ] Validate email format, password length, etc.

- [ ] **HTTPS Configuration** - HIGH
  - [ ] Obtain SSL certificate (Let's Encrypt free)
  - [ ] Configure in production environment
  - [ ] Redirect HTTP to HTTPS

- [ ] **Environment Variables** - CRITICAL
  - [ ] Add to production platform (Vercel, Heroku, etc.)
  - [ ] Never hardcode secrets
  - [ ] Verify all env vars are set: `JWT_SECRET`, `ADMIN_EMAIL`, etc.
  - [ ] Use strong JWT_SECRET (40+ random characters)

### Database Requirements
- [ ] Database initialized with schema
- [ ] Test data (admin user) created via proper registration
- [ ] Automated backups configured
- [ ] Backup tested and verified

### Testing Requirements
- [ ] Login works with valid credentials
- [ ] Login fails with invalid credentials
- [ ] User can view profile
- [ ] Admin can view all profiles
- [ ] Admin can create/edit tasks
- [ ] All API endpoints respond correctly

---

## 🔧 Implementation Guide

### Step 1: Implement Bcrypt (15 minutes)

**File:** `server/index.js`

```javascript
// Add at top of file
const bcrypt = require('bcryptjs');

// Update login endpoint (around line 120)
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  try {
    const { db } = await connectToDatabase();
    const userWithPassword = await db.collection('profiles').findOne({ 
      email: email.toLowerCase() 
    });
    
    if (!userWithPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // NEW: Use bcrypt instead of plaintext comparison
    const passwordValid = await bcrypt.compare(password, userWithPassword.password_hash);
    
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const token = signToken({ id: userWithPassword._id, email: userWithPassword.email });
    return res.json({ token, user: { id: userWithPassword._id, email: userWithPassword.email } });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update registration endpoint (around line 200)
app.post('/profiles', authMiddleware, async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const existingProfile = await ProfileModel.findByEmail(db, req.body.email);
    if (existingProfile) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    // NEW: Hash password before storing
    const passwordHash = await bcrypt.hash(req.body.password, 10);
    
    const newProfile = await ProfileModel.create(db, {
      ...req.body,
      password_hash: passwordHash
    });
    
    return res.status(201).json(newProfile);
  } catch (error) {
    console.error('Error creating profile:', error);
    return res.status(500).json({ error: 'Failed to create profile' });
  }
});
```

### Step 2: Switch to SQLite (30 minutes)

```bash
# 1. Install
npm install better-sqlite3

# 2. Create init script (use content from SETUP_SQLITE.md)
touch server/scripts/init-sqlite.js
# Copy content from SETUP_SQLITE.md "Create Database Schema" section

# 3. Initialize
node server/scripts/init-sqlite.js

# 4. Update .env
nano .env
# Add/update these lines:
# DATABASE_TYPE=sqlite
# DATABASE_PATH=./data/unionhub.db

# 5. Add to gitignore
echo "data/" >> .gitignore
echo "*.db" >> .gitignore

# 6. Test
npm run dev
```

### Step 3: Add Input Validation (30 minutes)

```bash
# Install validator
npm install express-validator

# Update server/index.js
```

```javascript
// Add at top
const { body, validationResult } = require('express-validator');

// Update login endpoint with validation
app.post('/auth/login', 
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  async (req, res) => {
    // ... rest of login logic
  }
);

// Update registration endpoint with validation
app.post('/profiles',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('first_name').trim().notEmpty(),
  body('last_name').trim().notEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  authMiddleware,
  async (req, res) => {
    // ... rest of creation logic
  }
);
```

---

## 🧪 Testing Commands

### Test Login
```bash
# Should succeed
curl -X POST http://localhost:8787/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"testpass123"}'

# Should fail (wrong password)
curl -X POST http://localhost:8787/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"wrongpass"}'
```

### Test Admin Endpoints
```bash
# Save the token from login response, then:
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl http://localhost:8787/admin/profiles \
  -H "Authorization: Bearer $TOKEN"
```

### Test Database
```bash
# For SQLite
sqlite3 ./data/unionhub.db
> SELECT COUNT(*) FROM profiles;
> SELECT email FROM profiles LIMIT 5;
> .exit

# For MongoDB
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/unionhub"
> db.profiles.find().limit(5)
> exit
```

---

## 📦 Deployment Checklist

### Before Deploying to Production

#### Frontend (React/Vite)
- [ ] Build succeeds: `npm run build`
- [ ] No console errors in development
- [ ] Environment variables correct in `.env.production`
- [ ] API_URL points to production backend

#### Backend (Node.js/Express)
- [ ] All dependencies installed: `npm install`
- [ ] Environment variables set in production platform
- [ ] Database initialized and seeded
- [ ] Bcrypt passwords implemented
- [ ] Input validation working
- [ ] All endpoints tested with curl

#### Database
- [ ] Database type chosen (SQLite/MongoDB/PostgreSQL)
- [ ] Database initialized with schema
- [ ] Backups configured
- [ ] Restore from backup tested

#### Security
- [ ] No hardcoded credentials anywhere
- [ ] All secrets in environment variables
- [ ] HTTPS configured
- [ ] CORS properly scoped
- [ ] Rate limiting enabled
- [ ] Logging enabled

### Deployment Platforms
- **Frontend:** Vercel, Netlify, GitHub Pages
- **Backend:** Vercel, Heroku, Railway, DigitalOcean, AWS
- **Database:** 
  - SQLite: Same server as backend
  - MongoDB: MongoDB Atlas
  - PostgreSQL: Heroku, Railway, AWS RDS

---

## 📊 Progress Tracking

### Completed ✅
- [x] Security audit completed
- [x] Critical vulnerabilities fixed
- [x] Documentation created
- [x] Database options documented

### In Progress ⏳
- [ ] Bcrypt implementation
- [ ] Database setup (SQLite or other)
- [ ] Input validation

### Not Started ❌
- [ ] Remove duplicate code
- [ ] Add logging
- [ ] Deploy to production

### Success Criteria ✅
- [ ] Application runs locally
- [ ] Login works with password hashing
- [ ] Database persists data
- [ ] All API endpoints respond
- [ ] No hardcoded secrets
- [ ] Ready for production

---

## 📞 Troubleshooting

### "bcryptjs not found"
```bash
npm install bcryptjs
npm rebuild  # Rebuild native modules
```

### "database is locked"
```bash
# Stop all Node processes
pkill -f node
# Or use Task Manager on Windows

# Restart the server
npm run dev
```

### "database table does not exist"
```bash
# For SQLite, reinitialize
node server/scripts/init-sqlite.js

# For MongoDB, check connection string
echo $MONGODB_URI
```

### "Cannot find module 'express-validator'"
```bash
npm install express-validator
```

---

## 🚀 Success Indicators

You'll know you're done when:

- ✅ Application starts without errors
- ✅ Login page loads at http://localhost:8080
- ✅ Can login with valid credentials
- ✅ Admin dashboard shows users and tasks
- ✅ Can create/edit tasks as admin
- ✅ Database is SQLite or secure MongoDB
- ✅ All passwords are bcrypt hashed
- ✅ No secrets in code or git history
- ✅ Ready to show to team/deploy

---

## 📚 Reference Files

| Document | Purpose |
|----------|---------|
| SECURITY_ISSUES.md | Security audit & fixes |
| SETUP_SQLITE.md | SQLite setup guide |
| MIGRATION_MONGODB_TO_SQLITE.md | Data migration |
| PROJECT_ARCHITECTURE.md | Project structure |
| QUICK_REFERENCE.md | Commands & tips |
| ANALYSIS_SUMMARY.md | Complete analysis |

---

## ⏱️ Time Estimates

| Task | Time | Difficulty |
|------|------|-----------|
| Implement Bcrypt | 15 min | Easy |
| Setup SQLite | 30 min | Easy |
| Add validation | 30 min | Medium |
| Remove duplicate code | 10 min | Easy |
| Setup production | 1 hour | Medium |
| **Total** | **2-3 hrs** | **Easy-Medium** |

---

## 🎉 You're Ready!

You have everything you need to:
1. Fix security issues
2. Choose a database
3. Deploy to production
4. Maintain the codebase

**Start with implementing Bcrypt, then choose SQLite, then deploy!**

Good luck! 🚀
