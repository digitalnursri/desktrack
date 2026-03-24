const axios = require('axios');

async function testDeleteApi() {
  const headers = {
    'Authorization': 'Bearer mock-token-test',
    'x-tenant-slug': 'default-tenant'
  };
  const baseUrl = 'http://localhost:5000/api/shifts';

  console.log('--- TESTING DELETE API ---');

  try {
    // 1. Get all shifts to find one to delete
    let res = await axios.get(baseUrl, { headers });
    let shifts = res.data;
    console.log('[GET] Found', shifts.length, 'shifts currently in the database.');

    if (shifts.length === 0) {
      console.log('No shifts to delete. Creating a dummy shift first...');
      const createRes = await axios.post(baseUrl, {
        name: "Delete Me Shift",
        start_time: "00:00",
        end_time: "01:00",
        grace_time: 0,
        over_late_threshold: 0,
        half_day_threshold: 0
      }, { headers });
      console.log('Created dummy shift with ID:', createRes.data.id);
      
      // Refetch
      res = await axios.get(baseUrl, { headers });
      shifts = res.data;
    }

    const shiftToDelete = shifts[0];
    console.log(`[DELETE] Attempting to delete shift ID ${shiftToDelete.id} ('${shiftToDelete.name}')...`);

    // 2. Delete the shift
    const deleteRes = await axios.delete(`${baseUrl}/${shiftToDelete.id}`, { headers });
    console.log('[DELETE] Response Status:', deleteRes.status);
    console.log('[DELETE] Response Data:', deleteRes.data);

    // 3. Verify it's gone
    const verifyRes = await axios.get(baseUrl, { headers });
    const remainingShifts = verifyRes.data;
    console.log('[GET] Verification: Found', remainingShifts.length, 'shifts remaining.');
    
    const wasDeleted = !remainingShifts.some(s => s.id === shiftToDelete.id);
    if (wasDeleted) {
      console.log(`[SUCCESS] Shift ID ${shiftToDelete.id} was successfully deleted!`);
    } else {
      console.log(`[ERROR] Shift ID ${shiftToDelete.id} STILL EXISTS after deletion call!`);
    }

  } catch (err) {
    console.log('[ERROR]', err.response?.status, err.response?.data || err.message);
  }

  console.log('--- DELETE API TEST COMPLETE ---');
}

testDeleteApi();
