const axios = require('axios');

async function test() {
  try {
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'priyanka_singh@creativefrenzy.in',
      password: 'Priyanka@123'
    }, {
      headers: { 'x-tenant-slug': 'creativefrenzy' }
    });

    const token = loginRes.data.token;
    console.log('Login successful. Token acquired.');

    const statsRes = await axios.get('http://localhost:5000/api/attendance/stats?date=2026-03-26', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'x-tenant-slug': 'creativefrenzy'
      }
    });

    console.log('Stats Response:', JSON.stringify(statsRes.data, null, 2));
  } catch (err) {
    console.error('Test failed:', err.response ? err.response.data : err.message);
  }
}

test();
