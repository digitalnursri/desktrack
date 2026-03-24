const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

const login = async (req, res) => {
  const { email, password } = req.body;
  const tenantId = req.tenantId;

  try {
    const userResult = await query(
      'SELECT * FROM users WHERE email = $1 AND company_id = $2',
      [email, tenantId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        companyId: user.company_id 
      },
      process.env.JWT_SECRET || 'desktrack_secret',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.company_id
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
};

const register = async (req, res) => {
  const { email, password, role } = req.body;
  const tenantId = req.tenantId;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await query(
      'INSERT INTO users (email, password_hash, role, company_id) VALUES ($1, $2, $3, $4) RETURNING id',
      [email, hashedPassword, role, tenantId]
    );

    res.status(201).json({ message: 'User registered successfully.', id: result.rows[0].id });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
};

module.exports = { login, register };
