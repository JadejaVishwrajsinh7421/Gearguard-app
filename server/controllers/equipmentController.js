const db = require('../config/db');

// GET all equipments
const getEquipments = async (req, res) => {
  try {
    const { status, team_id, search } = req.query;
    let query = `SELECT e.*, t.name as team_name FROM equipments e LEFT JOIN teams t ON e.team_id = t.id WHERE 1=1`;
    const params = [];
    if (status) { query += ' AND e.status = ?'; params.push(status); }
    if (team_id) { query += ' AND e.team_id = ?'; params.push(team_id); }
    if (search) { query += ' AND (e.name LIKE ? OR e.serial_number LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    query += ' ORDER BY e.created_at DESC';
    const [rows] = await db.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET single equipment with maintenance requests
const getEquipment = async (req, res) => {
  try {
    const [equipRows] = await db.query(
      `SELECT e.*, t.name as team_name FROM equipments e LEFT JOIN teams t ON e.team_id = t.id WHERE e.id = ?`,
      [req.params.id]
    );
    if (!equipRows.length) return res.status(404).json({ success: false, message: 'Equipment not found' });

    const [reqRows] = await db.query(
      `SELECT mr.*, u.name as assigned_name FROM maintenance_requests mr 
       LEFT JOIN users u ON mr.assigned_to = u.id 
       WHERE mr.equipment_id = ? ORDER BY mr.created_at DESC`,
      [req.params.id]
    );
    res.json({ success: true, data: { ...equipRows[0], maintenance_requests: reqRows } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST create equipment
const createEquipment = async (req, res) => {
  const { name, serial_number, category, department, assigned_employee, purchase_date, warranty_expiry, location, team_id, status, notes } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Equipment name is required' });
  try {
    const [result] = await db.query(
      `INSERT INTO equipments (name, serial_number, category, department, assigned_employee, purchase_date, warranty_expiry, location, team_id, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, serial_number, category, department, assigned_employee, purchase_date || null, warranty_expiry || null, location, team_id || null, status || 'active', notes]
    );
    res.status(201).json({ success: true, data: { id: result.insertId, name } });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'Serial number already exists' });
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT update equipment
const updateEquipment = async (req, res) => {
  const { name, serial_number, category, department, assigned_employee, purchase_date, warranty_expiry, location, team_id, status, notes } = req.body;
  try {
    const [result] = await db.query(
      `UPDATE equipments SET name=?, serial_number=?, category=?, department=?, assigned_employee=?, purchase_date=?, warranty_expiry=?, location=?, team_id=?, status=?, notes=? WHERE id=?`,
      [name, serial_number, category, department, assigned_employee, purchase_date || null, warranty_expiry || null, location, team_id || null, status, notes, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Equipment not found' });
    res.json({ success: true, message: 'Equipment updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE equipment
const deleteEquipment = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM equipments WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Equipment not found' });
    res.json({ success: true, message: 'Equipment deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET stats for dashboard
const getEquipmentStats = async (req, res) => {
  try {
    const [stats] = await db.query(
      `SELECT 
        COUNT(*) as total,
        SUM(status = 'active') as active,
        SUM(status = 'maintenance') as in_maintenance,
        SUM(status = 'scrapped') as scrapped
       FROM equipments`
    );
    res.json({ success: true, data: stats[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getEquipments, getEquipment, createEquipment, updateEquipment, deleteEquipment, getEquipmentStats };
