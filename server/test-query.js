// Test getQuery
const { getDatabase, getQuery } = require('./lib/sqlite');

async function test() {
  try {
    console.log('Getting database...');
    const db = await getDatabase();
    console.log('✅ Database connected');
    
    console.log('Running query...');
    const user = await getQuery(
      'SELECT * FROM profiles WHERE LOWER(email) = LOWER(?)',
      ['admin@unionhub.com']
    );
    
    console.log('✅ Query result:', user);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

test();
