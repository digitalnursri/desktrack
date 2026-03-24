const { Pool } = require('pg');
require('dotenv').config();

const poolProps = process.env.DATABASE_URL 
  ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
  : {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'desktrack',
      password: process.env.DB_PASSWORD || 'postgres',
      port: process.env.DB_PORT || 5432,
    };

const pool = process.env.NODE_ENV === 'test' ? null : new Pool(poolProps);

// In-memory store for demo mode
const memoryDB = {
  shifts: [
    { 
      id: 1, 
      name: 'General Shift', 
      shift_start_time: '10:00', 
      shift_end_time: '19:00', 
      total_working_hours: 9,
      grace_minutes: 15, 
      late_start_time: '10:16',
      late_end_time: '10:59',
      overlate_start_time: '11:00',
      halfday_start_time: '12:30', 
      company_id: 1, 
      created_at: new Date() 
    }
  ],
  users: [
    {
      id: 1,
      email: 'priyanka_singh@creativefrenzy.in',
      password_hash: '$2b$10$02dUrTOAzgAOiJTpJTvUo.JTreGkErGjzdjfjIEGCUZlWfPO/SQUO', // Priyanka@123
      role: 'SUPER_ADMIN',
      company_id: 1
    }
  ],
  departments: [
    { id: 1, name: 'Administration', company_id: 1 },
    { id: 2, name: 'Engineering', company_id: 1 },
    { id: 3, name: 'HR', company_id: 1 }
  ],
  designations: [
    { id: 1, name: 'Director', company_id: 1 },
    { id: 2, name: 'Lead Engineer', company_id: 1 },
    { id: 3, name: 'Developer', company_id: 1 },
    { id: 4, name: 'HR Manager', company_id: 1 }
  ],
  employees: [
    {
      id: 1,
      company_id: 1,
      first_name: 'Priyanka',
      last_name: 'Singh',
      email: 'priyanka_singh@creativefrenzy.in',
      employee_code: 'CF-001',
      designation_id: 1,
      department_id: 1,
      salary_info: '{}',
      joining_date: '2024-01-01',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE'
    }
  ],
  employee_shifts: [
    { employee_id: 1, shift_id: 1, company_id: 1, effective_from: '2024-01-01' }
  ],
  attendance: []
};

module.exports = {
  query: async (text, params) => {
    if (process.env.NODE_ENV === 'test' && global.mockQuery) {
      return global.mockQuery(text, params);
    }

    try {
      // Try real database first
      if (pool) {
         // return await pool.query(text, params);
      }
      throw new Error('Using Memory DB');
    } catch (err) {
      // Basic SQL Parsing for Mock DB
      const queryText = text.toLowerCase().replace(/\s+/g, ' ').trim();
      
      // SELECT
      if (queryText.includes('select * from shifts')) {
        return { rows: memoryDB.shifts, rowCount: memoryDB.shifts.length };
      }

      // INSERT
      if (queryText.includes('insert into shifts')) {
        const newShift = {
          id: memoryDB.shifts.length > 0 ? Math.max(...memoryDB.shifts.map(s => s.id)) + 1 : 1,
          company_id: params[0],
          name: params[1],
          shift_start_time: params[2],
          shift_end_time: params[3],
          total_working_hours: parseFloat(params[4]),
          grace_minutes: parseInt(params[5]),
          late_start_time: params[6],
          late_end_time: params[7],
          overlate_start_time: params[8],
          halfday_start_time: params[9],
          created_at: new Date()
        };
        memoryDB.shifts.push(newShift);
        return { rows: [newShift], rowCount: 1 };
      }

      // UPDATE
      if (queryText.includes('update shifts')) {
        const id = parseInt(params[9]);
        const index = memoryDB.shifts.findIndex(s => s.id === id);
        if (index !== -1) {
          memoryDB.shifts[index] = {
            ...memoryDB.shifts[index],
            name: params[0],
            shift_start_time: params[1],
            shift_end_time: params[2],
            total_working_hours: parseFloat(params[3]),
            grace_minutes: parseInt(params[4]),
            late_start_time: params[5],
            late_end_time: params[6],
            overlate_start_time: params[7],
            halfday_start_time: params[8]
          };
          return { rows: [memoryDB.shifts[index]], rowCount: 1 };
        }
        return { rows: [], rowCount: 0 };
      }

      // DELETE
      if (queryText.includes('delete from shifts')) {
        const id = parseInt(params[0]);
        const shiftToDelete = memoryDB.shifts.find(s => s.id === id);
        if (shiftToDelete) {
          memoryDB.shifts = memoryDB.shifts.filter(s => s.id !== id);
          return { rows: [shiftToDelete], rowCount: 1 };
        }
        return { rows: [], rowCount: 0 };
      }

      // UPDATE attendance
      if (queryText.includes('update attendance')) {
        const id = parseInt(params[params.length - 2]); 
        const index = memoryDB.attendance.findIndex(a => a.id === id);
        if (index !== -1) {
          memoryDB.attendance[index] = {
            ...memoryDB.attendance[index],
            check_in: params[0],
            check_out: params[1],
            working_hours: params[2],
            overtime_hours: params[3],
            status: params[4],
            remarks: params[5]
          };
          return { rows: [memoryDB.attendance[index]], rowCount: 1 };
        }
      }

      // INSERT attendance
      if (queryText.includes('insert into attendance')) {
        const newRecord = {
          id: memoryDB.attendance.length + 1,
          company_id: params[0],
          employee_id: params[1],
          check_in: params[2],
          status: params[3],
          location_metadata: params[4],
          created_at: new Date()
        };
        memoryDB.attendance.push(newRecord);
        return { rows: [newRecord], rowCount: 1 };
      }

      // SELECT employees with joins
      if (queryText.includes('from employees')) {
        let result = memoryDB.employees.map(e => {
          const dept = memoryDB.departments.find(d => d.id === parseInt(e.department_id));
          const desg = memoryDB.designations.find(d => d.id === parseInt(e.designation_id));
          const shift = memoryDB.shifts.find(s => s.id === parseInt(e.shift_id));
          return {
            ...e,
            department_name: dept ? dept.name : 'Unknown',
            designation_name: desg ? desg.name : 'Unknown',
            shift_name: shift ? shift.name : 'Standard Shift'
          };
        });
        if (params.length > 0 && queryText.includes('company_id =')) {
          result = result.filter(e => e.company_id === params[0]);
        }
        if (params.length > 0 && queryText.includes('e.id =')) {
          result = result.filter(e => parseInt(e.id) === parseInt(params[0]));
        }
        return { rows: result, rowCount: result.length };
      }

      // INSERT employee
      if (queryText.includes('insert into employees')) {
        const newEmp = {
          id: memoryDB.employees.length + 1,
          company_id: params[0],
          first_name: params[1],
          last_name: params[2],
          employee_code: params[3],
          designation_id: params[4],
          department_id: params[5],
          salary_info: params[6],
          joining_date: params[7],
          email: params[8] || '',
          shift_id: params[9] || 1,
          status: 'ACTIVE',
          created_at: new Date()
        };
        memoryDB.employees.push(newEmp);
        return { rows: [newEmp], rowCount: 1 };
      }

      // SELECT users
      if (queryText.includes('from users')) {
        let result = memoryDB.users;
        if (params.length > 1 && queryText.includes('email =') && queryText.includes('company_id =')) {
          result = result.filter(u => u.email === params[0] && u.company_id === params[1]);
        }
        return { rows: result, rowCount: result.length };
      }

      // INSERT users
      if (queryText.includes('insert into users')) {
        const newUser = {
          id: memoryDB.users.length + 1,
          email: params[0],
          password_hash: params[1],
          role: params[2],
          company_id: params[3],
          created_at: new Date()
        };
        memoryDB.users.push(newUser);
        return { rows: [newUser], rowCount: 1 };
      }

      // SELECT depts/desgs
      if (queryText.includes('from departments')) {
        return { rows: memoryDB.departments, rowCount: memoryDB.departments.length };
      }
      if (queryText.includes('from designations')) {
        return { rows: memoryDB.designations, rowCount: memoryDB.designations.length };
      }

      return { rows: [], rowCount: 0 };
    }
  },
  pool,
};
