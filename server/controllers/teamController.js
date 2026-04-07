const db = require('../config/db');

// GET all teams
const getTeams = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM teams ORDER BY name');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET single team
const getTeam = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM teams WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Team not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST create team
const createTeam = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Team name is required' });
  try {
    const [result] = await db.query('INSERT INTO teams (name) VALUES (?)', [name]);
    res.status(201).json({ success: true, data: { id: result.insertId, name } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT update team
const updateTeam = async (req, res) => {
  const { name } = req.body;
  try {
    const [result] = await db.query('UPDATE teams SET name = ? WHERE id = ?', [name, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Team not found' });
    res.json({ success: true, message: 'Team updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE team
const deleteTeam = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM teams WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Team not found' });
    res.json({ success: true, message: 'Team deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getTeams, getTeam, createTeam, updateTeam, deleteTeam };
