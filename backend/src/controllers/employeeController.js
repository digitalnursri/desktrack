const { query } = require('../config/db');

/**
 * Employee Controller
 */

const getEmployees = async (req, res) => {
  const companyId = req.tenantId;
  try {
    const result = await query(
      'SELECT e.*, d.name as department_name, des.name as designation_name, s.name as shift_name FROM employees e LEFT JOIN departments d ON e.department_id = d.id LEFT JOIN designations des ON e.designation_id = des.id LEFT JOIN shifts s ON e.shift_id = s.id WHERE e.company_id = $1',
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
    first_name, last_name, email, employee_code, designation_id, department_id, salary_info, joining_date, shift_id, role, status 
  } = req.body;

  try {
    const result = await query(
      `INSERT INTO employees (company_id, first_name, last_name, email, employee_code, designation_id, department_id, salary_info, joining_date, shift_id, role, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [companyId, first_name, last_name, email, employee_code, designation_id, department_id, salary_info || '{}', joining_date, shift_id, role || 'EMPLOYEE', status || 'ACTIVE']
    );
    
    res.status(201).json(result.rows[0]);
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
      `SELECT e.*, d.name as department_name, des.name as designation_name, s.name as shift_name 
       FROM employees e 
       LEFT JOIN departments d ON e.department_id = d.id 
       LEFT JOIN designations des ON e.designation_id = des.id
       LEFT JOIN shifts s ON e.shift_id = s.id
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

const updateEmployee = async (req, res) => {
  const companyId = req.tenantId;
  const { id } = req.params;
  const { first_name, last_name, email, employee_code, designation_id, department_id, salary_info, joining_date, shift_id, status, role } = req.body;

  try {
    const result = await query(
      `UPDATE employees SET 
        first_name = $1, last_name = $2, email = $3, employee_code = $4, 
        designation_id = $5, department_id = $6, salary_info = $7, 
        joining_date = $8, shift_id = $9, status = $10, role = $11
       WHERE id = $12 AND company_id = $13 RETURNING *`,
      [first_name, last_name, email, employee_code, designation_id, department_id, salary_info || '{}', joining_date, shift_id, status, role, id, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update Employee Error:', err);
    res.status(500).json({ error: 'Server error updating employee.' });
  }
};

const deleteEmployee = async (req, res) => {
  const companyId = req.tenantId;
  const { id } = req.params;

  try {
    // Delete attendance records first due to possible constraint issues even with cascade
    await query('DELETE FROM attendance WHERE employee_id = $1 AND company_id = $2', [id, companyId]);

    const result = await query(
      'DELETE FROM employees WHERE id = $1 AND company_id = $2 RETURNING *',
      [id, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    res.json({ message: 'Employee deleted successfully.', employee: result.rows[0] });
  } catch (err) {
    console.error('Delete Employee Error:', err);
    res.status(500).json({ error: 'Server error deleting employee.' });
  }
};

const getDepartments = async (req, res) => {
  try {
    const result = await query('SELECT * FROM departments');
    res.json(result.rows);
  } catch (err) {
    console.error('Get Departments Error:', err);
    res.status(500).json({ error: 'Server error retrieving departments.' });
  }
};

const getDesignations = async (req, res) => {
  try {
    const result = await query('SELECT * FROM designations');
    res.json(result.rows);
  } catch (err) {
    console.error('Get Designations Error:', err);
    res.status(500).json({ error: 'Server error retrieving designations.' });
  }
};

module.exports = { getEmployees, createEmployee, getEmployeeById, updateEmployee, deleteEmployee, getDepartments, getDesignations };
