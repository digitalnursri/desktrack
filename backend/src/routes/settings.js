const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authMiddleware, checkRole } = require('../middleware/auth');

// GET all authorized domains for the current tenant
router.get('/domains', authMiddleware, async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const result = await query(
      'SELECT * FROM allowed_domains WHERE company_id = $1 ORDER BY domain ASC',
      [companyId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching domains:', err);
    res.status(500).json({ error: 'Server error fetching domains.' });
  }
});

// POST a new authorized domain
router.post('/domains', authMiddleware, checkRole(['SUPER_ADMIN']), async (req, res) => {
  const { domain } = req.body;
  if (!domain) {
    return res.status(400).json({ error: 'Domain is required.' });
  }

  try {
    const companyId = req.user.companyId;
    
    // Check if domain already exists for this company
    const existing = await query(
      'SELECT * FROM allowed_domains WHERE domain = $1 AND company_id = $2',
      [domain, companyId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Domain already authorized for this company.' });
    }

    const result = await query(
      'INSERT INTO allowed_domains (domain, company_id) VALUES ($1, $2) RETURNING *',
      [domain, companyId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding domain:', err);
    res.status(500).json({ error: 'Server error adding domain.' });
  }
});

// DELETE an authorized domain
router.delete('/domains/:id', authMiddleware, checkRole(['SUPER_ADMIN']), async (req, res) => {
  const { id } = req.params;

  try {
    const companyId = req.user.companyId;
    
    // Ensure the domain belongs to the current company
    const checkResult = await query(
      'SELECT * FROM allowed_domains WHERE id = $1 AND company_id = $2',
      [id, companyId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Domain not found or unauthorized.' });
    }

    await query('DELETE FROM allowed_domains WHERE id = $1', [id]);
    res.json({ message: 'Domain removed successfully.' });
  } catch (err) {
    console.error('Error deleting domain:', err);
    res.status(500).json({ error: 'Server error deleting domain.' });
  }
});

module.exports = router;
