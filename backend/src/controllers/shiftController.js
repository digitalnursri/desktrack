const { query } = require('../config/db');

/**
 * Shift Controller
 */

const getShifts = async (req, res) => {
  const companyId = req.tenantId;
  try {
    const result = await query(
      'SELECT * FROM shifts WHERE company_id = $1 ORDER BY created_at DESC',
      [companyId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get Shifts Error:', err);
    res.status(500).json({ error: 'Server error retrieving shifts.' });
  }
};

const createShift = async (req, res) => {
  const companyId = req.tenantId;
  const { 
    name, shift_start_time, shift_end_time, total_working_hours, grace_minutes, 
    late_start_time, late_end_time, overlate_start_time, halfday_start_time
  } = req.body;

  try {
    const result = await query(
      `INSERT INTO shifts (company_id, name, shift_start_time, shift_end_time, total_working_hours, grace_minutes, late_start_time, late_end_time, overlate_start_time, halfday_start_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [companyId, name, shift_start_time, shift_end_time, total_working_hours, grace_minutes, late_start_time, late_end_time, overlate_start_time, halfday_start_time]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create Shift Error:', err);
    res.status(500).json({ error: 'Server error creating shift.' });
  }
};

const updateShift = async (req, res) => {
  const companyId = req.tenantId;
  const { id } = req.params;
  const { 
    name, shift_start_time, shift_end_time, total_working_hours, grace_minutes, 
    late_start_time, late_end_time, overlate_start_time, halfday_start_time
  } = req.body;

  try {
    const result = await query(
      `UPDATE shifts 
       SET name = $1, shift_start_time = $2, shift_end_time = $3, total_working_hours = $4, grace_minutes = $5, late_start_time = $6, late_end_time = $7, overlate_start_time = $8, halfday_start_time = $9
       WHERE id = $10 AND company_id = $11 RETURNING *`,
      [name, shift_start_time, shift_end_time, total_working_hours, grace_minutes, late_start_time, late_end_time, overlate_start_time, halfday_start_time, id, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Shift not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update Shift Error:', err);
    res.status(500).json({ error: 'Server error updating shift.' });
  }
};

const deleteShift = async (req, res) => {
  const companyId = req.tenantId;
  const { id } = req.params;

  try {
    const result = await query(
      'DELETE FROM shifts WHERE id = $1 AND company_id = $2 RETURNING *',
      [id, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Shift not found.' });
    }

    res.json({ message: 'Shift deleted successfully.' });
  } catch (err) {
    console.error('Delete Shift Error:', err);
    res.status(500).json({ error: 'Server error deleting shift.' });
  }
};

module.exports = { getShifts, createShift, updateShift, deleteShift };
