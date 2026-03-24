const { query, pool } = require('../src/config/db');

/**
 * Script to assign default shifts to all employees
 */
const assignDefaultShifts = async () => {
  try {
    console.log('Starting default shift assignment...');

    // 1. Get all companies
    const companies = await query('SELECT id FROM companies');
    
    for (const company of companies.rows) {
      const companyId = company.id;

      // 2. Ensure a default "General Shift" exists for the company
      let shiftResult = await query(
        "SELECT id FROM shifts WHERE company_id = $1 AND name = 'General Shift'",
        [companyId]
      );

      let shiftId;
      if (shiftResult.rows.length === 0) {
        const newShift = await query(
          `INSERT INTO shifts (company_id, name, start_time, end_time, grace_time, over_late_threshold, half_day_threshold)
           VALUES ($1, 'General Shift', '09:00', '18:00', 15, 60, 4) RETURNING id`,
          [companyId]
        );
        shiftId = newShift.rows[0].id;
        console.log(`Created General Shift for company ${companyId}`);
      } else {
        shiftId = shiftResult.rows[0].id;
      }

      // 3. Get all employees in this company without a shift
      const employees = await query(
        `SELECT id FROM employees e 
         WHERE e.company_id = $1 AND NOT EXISTS (
           SELECT 1 FROM employee_shifts es WHERE es.employee_id = e.id
         )`,
        [companyId]
      );

      // 4. Assign the default shift
      for (const emp of employees.rows) {
        await query(
          `INSERT INTO employee_shifts (employee_id, shift_id, company_id, effective_from)
           VALUES ($1, $2, $3, CURRENT_DATE)`,
          [emp.id, shiftId, companyId]
        );
        console.log(`Assigned General Shift to employee ${emp.id}`);
      }
    }

    console.log('Shift assignment completed successfully.');
  } catch (err) {
    console.error('Error in shift assignment script:', err);
  } finally {
    if (pool) await pool.end();
  }
};

assignDefaultShifts();
