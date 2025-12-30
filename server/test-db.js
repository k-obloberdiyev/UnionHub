// Simple test to check if database works
const { getDatabase } = require('./lib/sqlite');

async function test() {
  try {
    console.log('Connecting to database...');
    const db = await getDatabase();
    console.log('✅ Database connected');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

test();
