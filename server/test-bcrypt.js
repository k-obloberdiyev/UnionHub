// Test bcrypt comparison
const bcrypt = require('bcryptjs');

async function test() {
  try {
    const hash = '$2a$10$SYNHfE1D7LDZ0BVA6xSsgOBtLnp2LkL5b37cdJnCgsFBvVamE5BUq';
    const password = 'AdminPassword123!';
    
    console.log('Testing bcrypt.compare...');
    const isValid = await bcrypt.compare(password, hash);
    console.log('✅ Password valid:', isValid);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

test();
