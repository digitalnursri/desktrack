const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authMiddleware, checkRole } = require('../middleware/auth');

// All employee routes require authentication
router.use(authMiddleware);

router.get('/', checkRole(['HR', 'MANAGER', 'SUPER_ADMIN', 'EMPLOYEE']), employeeController.getEmployees);
router.post('/', checkRole(['HR', 'SUPER_ADMIN']), employeeController.createEmployee);
router.get('/:id', checkRole(['HR', 'MANAGER', 'SUPER_ADMIN', 'EMPLOYEE']), employeeController.getEmployeeById);

module.exports = router;
