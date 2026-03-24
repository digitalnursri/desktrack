const axios = require('axios');

async function testApi() {
  try {
    const response = await axios.post('http://localhost:5000/api/shifts', {
      name: "dfg",
      start_time: "09:00",
      end_time: "18:00",
      grace_time: 15,
      over_late_threshold: 60,
      half_day_threshold: 4
    }, {
      headers: {
        'Authorization': 'Bearer mock-token-0.37799204925093577',
        'x-tenant-slug': 'default-tenant'
      }
    });
    console.log('SUCCESS:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('FAILED WITH STATUS:', error.response.status);
      console.log('DATA:', error.response.data);
    } else {
      console.log('FAILED TO CONNECT:', error.message);
    }
  }
}

testApi();
