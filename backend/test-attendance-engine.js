const { calculateAttendance } = require('./src/services/attendanceService');

const shift = {
  shift_start_time: '10:00',
  shift_end_time: '19:00',
  total_working_hours: 9,
  grace_minutes: 15,
  late_start_time: '10:16',
  late_end_time: '10:59',
  overlate_start_time: '11:00',
  halfday_start_time: '12:30'
};

const runTest = (name, checkInTimeStr, checkOutTimeStr, expectedStatus, expectedHours) => {
  const baseDateStr = '2026-03-24T';
  const checkIn = new Date(`${baseDateStr}${checkInTimeStr}:00`);
  const checkOut = checkOutTimeStr ? new Date(`${baseDateStr}${checkOutTimeStr}:00`) : null;
  
  const result = calculateAttendance(shift, checkIn, checkOut);
  
  const passed = result.status === expectedStatus && 
                 (!expectedHours || result.workingHours === expectedHours);
                 
  if (passed) {
    console.log(`✅ PASS: ${name} -> Got ${result.status} with ${result.workingHours} hours`);
  } else {
    console.error(`❌ FAIL: ${name}`);
    console.error(`   Expected: Status ${expectedStatus}, Hours ${expectedHours}`);
    console.error(`   Got: Status ${result.status}, Hours ${result.workingHours}`);
  }
};

console.log('--- RUNNING ATTENDANCE LOGIC UNIT TESTS ---\n');

// 1. ON-TIME
runTest('Exactly ON-TIME (10:00)', '10:00', '19:00', 'ON_TIME', 9);
runTest('In Grace Period (10:10)', '10:10', '19:10', 'ON_TIME', 9);
runTest('Max Grace Period (10:15)', '10:15', '19:15', 'ON_TIME', 9);

// 2. LATE
runTest('Just Late (10:16)', '10:16', '19:16', 'LATE', 9);
runTest('Clearly Late (10:30)', '10:30', '19:30', 'LATE', 9);
runTest('Max Late (10:59)', '10:59', '19:59', 'LATE', 9);

// 3. OVER-LATE
runTest('Just Over-Late (11:00)', '11:00', '20:00', 'OVER_LATE', 9);
runTest('Clearly Over-Late (11:45)', '11:45', '20:45', 'OVER_LATE', 9);

// 4. HALF-DAY (Arrival)
runTest('Just Half-Day (12:30)', '12:30', '21:30', 'HALF_DAY', 9);
runTest('Afternoon Check-in (14:00)', '14:00', '23:00', 'HALF_DAY', 9);

// 5. HALF-DAY (Early Checkout override)
// If checking in on time, but leaving early (working < 4.5 hours)
runTest('Early Checkout enforces Half-Day', '10:00', '14:00', 'HALF_DAY', 4);

// 6. ON-TIME with full expected hours
runTest('On-time, worked 5 hours', '10:00', '15:00', 'ON_TIME', 5); // 5 > 4.5, so ON_TIME status remains.

console.log('\n--- TESTS DONE ---');
