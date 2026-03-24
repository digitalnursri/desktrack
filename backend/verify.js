const app = require('./src/app');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. Mock Database Store
const store = {
  companies: [
    { id: 't1', name: 'Tenant One', slug: 'tenant1', is_active: true },
    { id: 't2', name: 'Tenant Two', slug: 'tenant2', is_active: true }
  ],
  users: [
    { id: 'u1', company_id: 't1', email: 'admin@t1.com', password_hash: '', role: 'HR' }
  ],
  employees: [],
  attendance: []
};

// Seed password
(async () => {
  store.users[0].password_hash = await bcrypt.hash('password123', 10);
})();

// 2. Mock Global Query Function
global.mockQuery = (text, params) => {
  console.log(`[Mock DB] Executing: ${text.substring(0, 50)}...`);
  
  if (text.includes('SELECT id, name, slug, is_active FROM companies')) {
    const tenant = store.companies.find(c => c.slug === params[0] || c.id === params[0]);
    return { rows: tenant ? [tenant] : [] };
  }

  if (text.includes('SELECT * FROM users WHERE email = $1 AND company_id = $2')) {
    const user = store.users.find(u => u.email === params[0] && u.company_id === params[1]);
    return { rows: user ? [user] : [] };
  }

  if (text.includes('INSERT INTO employees')) {
    const newEmp = { id: 'e1', company_id: params[0], first_name: params[1] };
    store.employees.push(newEmp);
    return { rows: [newEmp] };
  }

  if (text.includes('SELECT e.*, d.name as department_name')) {
    return { rows: store.employees.filter(e => e.company_id === params[0]) };
  }

  return { rows: [] };
};

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret';

// 3. Start Server & Test
const PORT = 5001;
const server = app.listen(PORT, async () => {
  console.log(`Verification server running on port ${PORT}`);
  
  try {
    const axios = require('axios');
    const baseURL = `http://localhost:${PORT}/api`;
    
    console.log('\n--- 🧪 TEST 1: Tenant Identification ---');
    const res1 = await axios.get(`http://localhost:${PORT}/`, { headers: { 'x-tenant-slug': 'tenant1' } });
    console.log('Result:', res1.data.tenant === 'Tenant One' ? '✅ PASS' : '❌ FAIL');

    console.log('\n--- 🧪 TEST 2: Login (Tenant 1) ---');
    const loginRes = await axios.post(`${baseURL}/auth/login`, {
      email: 'admin@t1.com',
      password: 'password123'
    }, { headers: { 'x-tenant-slug': 'tenant1' } });
    const token = loginRes.data.token;
    console.log('Result:', token ? '✅ PASS' : '❌ FAIL');

    console.log('\n--- 🧪 TEST 3: Multi-tenant Data Isolation ---');
    // Create employee in Tenant 1
    await axios.post(`${baseURL}/employees`, {
      first_name: 'John',
      last_name: 'Doe'
    }, { headers: { 'x-tenant-slug': 'tenant1', 'Authorization': `Bearer ${token}` } });

    // Fetch from Tenant 1
    const empRes1 = await axios.get(`${baseURL}/employees`, { 
      headers: { 'x-tenant-slug': 'tenant1', 'Authorization': `Bearer ${token}` } 
    });
    console.log('Tenant 1 Employee Count:', empRes1.data.length);

    // Attempt Fetch from Tenant 2 with Tenant 1 Token (Should Fail Auth Middleware check)
    try {
      await axios.get(`${baseURL}/employees`, { 
        headers: { 'x-tenant-slug': 'tenant2', 'Authorization': `Bearer ${token}` } 
      });
      console.log('Tenant Isolation:', '❌ FAIL (Should have blocked)');
    } catch (err) {
      console.log('Tenant Isolation:', err.response.status === 403 ? '✅ PASS (Blocked access to t2)' : '❌ FAIL');
    }

    console.log('\n--- ✅ VERIFICATION COMPLETE ---');
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('Verification Failed:', err.response?.data || err.message);
    server.close();
    process.exit(1);
  }
});
