const db = require('../config/db');

// GET all users
const getUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.*, t.name as team_name FROM users u LEFT JOIN teams t ON u.team_id = t.id ORDER BY u.name`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET single user
const getUser = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.*, t.name as team_name FROM users u LEFT JOIN teams t ON u.team_id = t.id WHERE u.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST create user
const createUser = async (req, res) => {
  const { name, email, role, team_id } = req.body;
  if (!name || !email) return res.status(400).json({ success: false, message: 'Name and email are required' });
  try {
    const [result] = await db.query(
      'INSERT INTO users (name, email, role, team_id) VALUES (?, ?, ?, ?)',
      [name, email, role || 'technician', team_id || null]
    );
    res.status(201).json({ success: true, data: { id: result.insertId, name, email, role, team_id } });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'Email already exists' });
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT update user
const updateUser = async (req, res) => {
  const { name, email, role, team_id } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE users SET name = ?, email = ?, role = ?, team_id = ? WHERE id = ?',
      [name, email, role, team_id, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE user
const deleteUser = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getUsers, getUser, createUser, updateUser, deleteUser };
