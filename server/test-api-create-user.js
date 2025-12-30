(async () => {
  try {
    const loginRes = await fetch('http://localhost:8787/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@unionhub.com', password: 'AdminPassword123!' })
    });
    if (!loginRes.ok) throw new Error('Login failed: ' + loginRes.status);
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Got token:', token && token.substring(0,20) + '...');

    const createRes = await fetch('http://localhost:8787/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({
        email: 'apiuser@unionhub.com',
        password: 'ApiUser123!',
        first_name: 'Api',
        last_name: 'User',
        name: 'Api User',
        class_name: 'Freshman',
        department_code: 'IT',
        biography: 'Created by test script',
        coins: 10,
        credibility_score: 50
      })
    });
    console.log('Create status:', createRes.status);
    const body = await createRes.text();
    console.log('Create body:', body);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();