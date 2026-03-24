const { query } = require('../config/db');

/**
 * Employee Controller
 */

const getEmployees = async (req, res) => {
  const companyId = req.tenantId;
  try {
    const result = await query(
      'SELECT e.*, d.name as department_name, des.name as designation_name FROM employees e LEFT JOIN departments d ON e.department_id = d.id LEFT JOIN designations des ON e.designation_id = des.id WHERE e.company_id = $1',
      [companyId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get Employees Error:', err);
    res.status(500).json({ error: 'Server error retrieving employees.' });
  }
};

const createEmployee = async (req, res) => {
  const companyId = req.tenantId;
  const { 
    first_name, last_name, email, employee_code, designation_id, department_id, salary_info, joining_date, shift_id 
  } = req.body;
  console.log('Create Employee Body:', req.body);

  try {
    // 1. Create Employee
    const result = await query(
      `INSERT INTO employees (company_id, first_name, last_name, employee_code, designation_id, department_id, salary_info, joining_date, email, shift_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        companyId, first_name, last_name, employee_code, designation_id, department_id, 
        JSON.stringify(salary_info || {}), joining_date, email, shift_id
      ]
    );

    const employee = result.rows[0];

    // 2. Assign Shift if provided
    if (shift_id) {
      await query(
        `INSERT INTO employee_shifts (employee_id, shift_id, company_id, effective_from)
         VALUES ($1, $2, $3, CURRENT_DATE)`,
        [employee.id, shift_id, companyId]
      );
    }

    res.status(201).json(employee);
  } catch (err) {
    console.error('Create Employee Error:', err);
    res.status(500).json({ error: 'Server error creating employee.' });
  }
};

const getEmployeeById = async (req, res) => {
  const companyId = req.tenantId;
  const { id } = req.params;

  try {
    const result = await query(
      `SELECT e.*, d.name as department_name FROM employees e 
       LEFT JOIN departments d ON e.department_id = d.id 
       WHERE e.id = $1 AND e.company_id = $2`,
      [id, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get Employee Error:', err);
    res.status(500).json({ error: 'Server error retrieving employee.' });
  }
};

module.exports = { getEmployees, createEmployee, getEmployeeById };
