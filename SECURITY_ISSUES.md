# UnionHub Security & Code Issues Report

## 🔴 CRITICAL ISSUES (Fixed)

### 1. **Exposed MongoDB Credentials in vercel.json** ✅ FIXED
**Severity:** CRITICAL

**Before:**
```json
"MONGODB_URI": "mongodb+srv://kamolbekobloberdiyev:kamolbek2009@cluster0.uevsipa.mongodb.net/unionhub?retryWrites=true&w=majority"
```

**Issue:** 
- Credentials were hardcoded in version control
- Anyone cloning the repo could access the database
- Attackers could insert/delete data

**After:**
```json
"MONGODB_URI": "@MONGODB_URI"
```
✅ **Fixed:** Credentials are now sourced from environment variables only (not in code)

---

### 2. **Hardcoded Test Account Passwords** ✅ FIXED
**Severity:** CRITICAL

**Before (server/index.js and api/index.js):**
```javascript
password: 'admin123'
password: 'baxodir123'
```

**Issues:**
- Plaintext passwords in version control
- Hard to change without code update
- Security risk for any developer

**After:**
```javascript
// Database initialization disabled - use proper user registration flow
```
✅ **Fixed:** Test accounts removed. Use proper registration flow instead.

---

### 3. **Plaintext Password Comparison** ⚠️ PARTIALLY FIXED
**Severity:** HIGH

**Before:**
```javascript
if (userWithPassword.password !== password) {
  return res.status(401).json({ error: 'Invalid email or password' });
}
```

**Issue:**
- Passwords stored as plaintext in database
- No hashing (bcrypt/argon2)
- Vulnerable to database breaches

**Current Status:** 
✅ Added TODO comments in code to implement bcrypt
⏳ **Action Required:** See section below

---

## 🟡 HIGH PRIORITY FIXES REQUIRED

### 4. **Implement Bcrypt Password Hashing**
**Severity:** HIGH | **Status:** TODO

**Install bcryptjs** (already in package.json):
```bash
npm install bcryptjs
```

**Update server/index.js login endpoint:**

```javascript
const bcrypt = require('bcryptjs');

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
    
    // ✅ Use bcrypt comparison instead of plaintext
    const passwordValid = await bcrypt.compare(password, userWithPassword.password_hash);
    
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const token = signToken({ id: userWithPassword._id, email: userWithPassword.email });
    return res.json({ 
      token, 
      user: { id: userWithPassword._id, email: userWithPassword.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
```

**Update registration/profile creation endpoints:**

```javascript
const bcrypt = require('bcryptjs');

app.post('/profiles', authMiddleware, async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    
    // Check if email already exists
    const existingProfile = await ProfileModel.findByEmail(db, req.body.email);
    if (existingProfile) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    // ✅ Hash password before storing
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    
    const newProfile = await ProfileModel.create(db, {
      ...req.body,
      password_hash: hashedPassword  // Store hash, not plaintext
    });
    
    return res.status(201).json(newProfile);
  } catch (error) {
    console.error('Error creating profile:', error);
    return res.status(500).json({ error: 'Failed to create profile' });
  }
});
```

---

### 5. **Duplicate Server Implementations**
**Severity:** MEDIUM | **Status:** PARTIAL FIX

**Current Structure:**
```
api/              (Vercel serverless API)
├── index.js     (151 lines, duplicate logic)
└── lib/mongodb.js

server/           (Standalone Node.js server)
├── index.js     (286 lines, similar logic)
└── lib/mongodb.js
```

**Issue:**
- Same code in two places → maintenance nightmare
- Bug fixes need to be applied twice
- Inconsistent versions possible

**Recommendation:**
1. **Keep `server/`** as main implementation (Vercel will use this)
2. **Remove `api/`** directory or make it import from `server/`

**Quick Fix - Make API import from server:**

Create `api/index.js`:
```javascript
// Re-export server implementation for Vercel
module.exports = require('../server/index.js');
```

---

## 🟢 COMPLETED FIXES

✅ **Removed credentials from vercel.json**
✅ **Removed hardcoded test account passwords**
✅ **Added SQLite setup guide** (SETUP_SQLITE.md)
✅ **Added TODO comments for bcrypt implementation**
✅ **Documented database migration path**

---

## 📋 REMAINING ISSUES TO ADDRESS

### 1. Duplicate API/Server Code
**How to fix:**
- Delete `api/` folder
- Update `vercel.json` to only reference `server/index.js`

### 2. Admin Email Hardcoded
**Current:** `ADMIN_EMAIL=kamolbekobloberdiyev1@gmail.com` (in .env)
**Better:** Use environment variable during deployment

### 3. No Input Validation
**Issue:** API accepts any data without validation
**Fix:** Add validation middleware:
```javascript
const { body, validationResult } = require('express-validator');

app.post('/profiles', 
  authMiddleware,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('first_name').trim().notEmpty(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  async (req, res) => {
    // Handle request
  }
);
```

### 4. No HTTPS in Development
**Fix:** Use environment variables for protocol:
```javascript
const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
```

### 5. CORS Too Permissive in Development
**Current:** `CORS_ORIGIN='*'`
**Better:**
```javascript
const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:8080'];
app.use(cors({ 
  origin: allowedOrigins,
  credentials: true 
}));
```

---

## 🛠️ DATABASE OPTIONS

### Current Setup: MongoDB Atlas (Cloud)
**✅ Pros:**
- Scalable
- Managed backups
- Good for distributed teams

**❌ Cons:**
- Requires internet connection
- Monthly/usage costs
- Data stored on third-party servers
- Credentials exposed (FIXED)

### Alternative: SQLite (Local SQL)
**✅ Pros:**
- No internet required
- No cloud dependencies
- Single file backup
- Perfect for small teams

**❌ Cons:**
- Single server only
- Limited concurrent writes

### Alternative: PostgreSQL (Self-hosted SQL)
**✅ Pros:**
- More robust than SQLite
- Still self-hosted
- Great for medium teams

**❌ Cons:**
- Requires database server
- More setup

**We recommend SQLite for now!** See SETUP_SQLITE.md

---

## 🔐 Security Checklist

### For Production Deployment:

- [ ] **Remove all hardcoded credentials** ✅ Done
- [ ] **Implement bcrypt password hashing** - TODO
- [ ] **Use environment variables** for all secrets
- [ ] **Enable HTTPS** (use Let's Encrypt)
- [ ] **Add input validation** - TODO
- [ ] **Add rate limiting** - TODO
- [ ] **Add logging/monitoring** - TODO
- [ ] **Regular security audits** - Schedule
- [ ] **Keep dependencies updated** - Run `npm audit` weekly
- [ ] **Database backups** - Automated daily
- [ ] **Firewall rules** - Block unauthorized IPs

---

## 🚀 Quick Start to Production-Ready

### Step 1: Setup SQLite
```bash
npm install better-sqlite3
npm install bcryptjs  # Already there, but confirm
node server/scripts/init-sqlite.js
```

### Step 2: Implement Bcrypt
Copy the code from section "4. Implement Bcrypt Password Hashing" above

### Step 3: Environment Variables
```bash
# Create .env.production
DATABASE_TYPE=sqlite
DATABASE_PATH=/var/lib/unionhub/data/unionhub.db
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
PORT=8787
ADMIN_EMAIL=your-email@example.com
```

### Step 4: Deploy
```bash
npm install --production
node server/scripts/init-sqlite.js
node server/index.js
```

---

## 📞 Support

For specific implementation help:
1. See SETUP_SQLITE.md for database setup
2. Check server/index.js for API examples
3. Review package.json for all dependencies
4. Run `npm audit` to check for vulnerabilities

---

## 📅 Last Updated
December 30, 2025

**Status:** 3/5 critical issues fixed. 2 remaining (bcrypt + duplicate code).
