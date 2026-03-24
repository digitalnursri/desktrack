const axios = require('axios');

async function testAllApis() {
  const headers = {
    'Authorization': 'Bearer mock-token-test',
    'x-tenant-slug': 'default-tenant'
  };
  const baseUrl = 'http://localhost:5000/api/shifts';
  let createdShiftId = null;

  console.log('--- STARTING API TESTS ---');

  // 1. GET ALL SHIFTS
  try {
    const res = await axios.get(baseUrl, { headers });
    console.log('[GET]    SUCCESS. Found', res.data.length, 'shifts.');
  } catch (err) {
    console.log('[GET]    FAILED:', err.response?.data || err.message);
  }

  // 2. CREATE SHIFT
  try {
    const res = await axios.post(baseUrl, {
      name: "API Test Shift",
      start_time: "10:00",
      end_time: "18:00",
      grace_time: 15,
      over_late_threshold: 60,
      half_day_threshold: 4
    }, { headers });
    createdShiftId = res.data.id;
    console.log('[POST]   SUCCESS. Created shift ID:', createdShiftId);
  } catch (err) {
    console.log('[POST]   FAILED:', err.response?.data || err.message);
  }

  // 3. UPDATE SHIFT
  if (createdShiftId) {
    try {
      const res = await axios.put(`${baseUrl}/${createdShiftId}`, {
        name: "Updated Test Shift",
        start_time: "11:00",
        end_time: "19:00",
        grace_time: 20,
        over_late_threshold: 45,
        half_day_threshold: 4.5
      }, { headers });
      console.log('[PUT]    SUCCESS. Updated shift ID:', res.data.id);
    } catch (err) {
      console.log('[PUT]    FAILED:', err.response?.data || err.message);
    }

    // 4. DELETE SHIFT
    try {
      const res = await axios.delete(`${baseUrl}/${createdShiftId}`, { headers });
      console.log('[DELETE] SUCCESS. Deleted shift message:', res.data.message);
    } catch (err) {
      console.log('[DELETE] FAILED:', err.response?.data || err.message);
    }
  }

  // 5. GET ALL SHIFTS AGAIN TO VERIFY DELETION
  try {
    const res = await axios.get(baseUrl, { headers });
    console.log('[GET]    SUCCESS. Found', res.data.length, 'shifts after deletion.');
  } catch (err) {
    console.log('[GET]    FAILED:', err.response?.data || err.message);
  }

  console.log('--- API TESTS COMPLETE ---');
}

testAllApis();
