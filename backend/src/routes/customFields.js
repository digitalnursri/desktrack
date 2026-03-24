const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// Mock implementation for custom fields during demo
router.get('/', (req, res) => {
  const { module } = req.query;
  
  if (module === 'employees') {
    return res.json([
      { id: 'first_name', field_name: 'First Name', field_type: 'text', is_required: true },
      { id: 'last_name', field_name: 'Last Name', field_type: 'text', is_required: true },
      { id: 'email', field_name: 'Work Email', field_type: 'text', is_required: true },
      { id: 'employee_code', field_name: 'Employee ID', field_type: 'text', is_required: true },
      { 
        id: 'department_id', 
        field_name: 'Department', 
        field_type: 'dropdown', 
        is_required: true, 
        options: [
          { label: 'Administration', value: 1 },
          { label: 'Engineering', value: 2 },
          { label: 'HR', value: 3 }
        ] 
      },
      { 
        id: 'designation_id', 
        field_name: 'Designation', 
        field_type: 'dropdown', 
        is_required: true, 
        options: [
          { label: 'Director', value: 1 },
          { label: 'Lead Engineer', value: 2 },
          { label: 'Developer', value: 3 },
          { label: 'HR Manager', value: 4 }
        ] 
      },
      { 
        id: 'shift_id', 
        field_name: 'Assigned Shift', 
        field_type: 'dropdown', 
        is_required: true, 
        options: [
          { label: 'General Shift', value: 1 },
          { label: 'Night Shift', value: 2 }
        ] 
      },
      { id: 'joining_date', field_name: 'Joining Date', field_type: 'date', is_required: true }
    ]);
  }
  
  res.json([]);
});

module.exports = router;
