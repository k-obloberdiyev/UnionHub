// Simulate the login endpoint
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDatabase, getQuery } = require('./lib/sqlite');

const DATABASE_TYPE = process.env.DATABASE_TYPE || 'sqlite';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

async function login(email, password) {
  try {
    if (DATABASE_TYPE === 'sqlite') {
      console.log('✅ Using SQLite');
      const db = await getDatabase();
      console.log('✅ Got database');
      
      // Get user from SQLite
      const user = await getQuery(
        'SELECT * FROM profiles WHERE LOWER(email) = LOWER(?)',
        [email]
      );
      console.log('✅ Got user:', user ? user.email : 'none');
      
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // ✅ Verify password using bcrypt
      console.log('Comparing passwords...');
      const passwordValid = await bcrypt.compare(password, user.password_hash);
      console.log('✅ Password valid:', passwordValid);
      
      if (!passwordValid) {
        throw new Error('Invalid email or password');
      }
      
      const token = signToken({ 
        id: user.id, 
        email: user.email 
      });
      
      return { 
        token, 
        user: { id: user.id, email: user.email, name: user.name }
      };
    }
  } catch (error) {
    console.error('❌ Login error:', error.message);
    throw error;
  }
}

async function test() {
  try {
    const result = await login('admin@unionhub.com', 'AdminPassword123!');
    console.log('✅ Login successful:', result);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

test();
