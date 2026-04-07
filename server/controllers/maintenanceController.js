const db = require('../config/db');

// GET all maintenance requests (with filters)
const getRequests = async (req, res) => {
  try {
    const { stage, type, equipment_id, assigned_to } = req.query;
    let query = `
      SELECT mr.*, 
             e.name as equipment_name, e.serial_number,
             u.name as assigned_name,
             t.name as team_name
      FROM maintenance_requests mr
      LEFT JOIN equipments e ON mr.equipment_id = e.id
      LEFT JOIN users u ON mr.assigned_to = u.id
      LEFT JOIN teams t ON e.team_id = t.id
      WHERE 1=1`;
    const params = [];
    if (stage) { query += ' AND mr.stage = ?'; params.push(stage); }
    if (type) { query += ' AND mr.type = ?'; params.push(type); }
    if (equipment_id) { query += ' AND mr.equipment_id = ?'; params.push(equipment_id); }
    if (assigned_to) { query += ' AND mr.assigned_to = ?'; params.push(assigned_to); }
    query += ' ORDER BY mr.created_at DESC';
    const [rows] = await db.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET requests grouped by stage (Kanban view)
const getKanbanData = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT mr.*, 
             e.name as equipment_name, e.serial_number, e.category,
             u.name as assigned_name
      FROM maintenance_requests mr
      LEFT JOIN equipments e ON mr.equipment_id = e.id
      LEFT JOIN users u ON mr.assigned_to = u.id
      ORDER BY mr.priority DESC, mr.scheduled_date ASC
    `);
    const kanban = {
      new: rows.filter(r => r.stage === 'new'),
      in_progress: rows.filter(r => r.stage === 'in_progress'),
      repaired: rows.filter(r => r.stage === 'repaired'),
      scrapped: rows.filter(r => r.stage === 'scrapped'),
    };
    res.json({ success: true, data: kanban });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET single request
const getRequest = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT mr.*, e.name as equipment_name, e.serial_number, e.category, e.department, e.location,
              u.name as assigned_name, t.name as team_name
       FROM maintenance_requests mr
       LEFT JOIN equipments e ON mr.equipment_id = e.id
       LEFT JOIN users u ON mr.assigned_to = u.id
       LEFT JOIN teams t ON e.team_id = t.id
       WHERE mr.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Request not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST create request (with auto-fill logic)
const createRequest = async (req, res) => {
  const { type, subject, description, equipment_id, scheduled_date, estimated_duration, priority, assigned_to } = req.body;
  if (!subject || !type) return res.status(400).json({ success: false, message: 'Subject and type are required' });
  try {
    // Auto-fill: if equipment linked, auto-suggest team
    let autoAssign = assigned_to;
    if (equipment_id && !assigned_to) {
      const [eqRows] = await db.query(
        `SELECT u.id FROM equipments e JOIN users u ON e.team_id = u.team_id WHERE e.id = ? AND u.role = 'technician' LIMIT 1`,
        [equipment_id]
      );
      if (eqRows.length) autoAssign = eqRows[0].id;
    }
    const [result] = await db.query(
      `INSERT INTO maintenance_requests (type, subject, description, equipment_id, scheduled_date, estimated_duration, priority, assigned_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [type, subject, description, equipment_id || null, scheduled_date || null, estimated_duration || null, priority || 'medium', autoAssign || null]
    );
    res.status(201).json({ success: true, data: { id: result.insertId, subject } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT update request
const updateRequest = async (req, res) => {
  const { type, subject, description, equipment_id, scheduled_date, completion_date, estimated_duration, stage, priority, assigned_to } = req.body;
  try {
    const [result] = await db.query(
      `UPDATE maintenance_requests SET type=?, subject=?, description=?, equipment_id=?, scheduled_date=?, completion_date=?, estimated_duration=?, stage=?, priority=?, assigned_to=? WHERE id=?`,
      [type, subject, description, equipment_id || null, scheduled_date || null, completion_date || null, estimated_duration, stage, priority, assigned_to || null, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Request not found' });

    // If stage moved to scrapped, update equipment status too
    if (stage === 'scrapped' && equipment_id) {
      await db.query('UPDATE equipments SET status = ? WHERE id = ?', ['scrapped', equipment_id]);
    }
    if (stage === 'in_progress' && equipment_id) {
      await db.query('UPDATE equipments SET status = ? WHERE id = ?', ['maintenance', equipment_id]);
    }
    if (stage === 'repaired' && equipment_id) {
      await db.query('UPDATE equipments SET status = ? WHERE id = ?', ['active', equipment_id]);
    }
    res.json({ success: true, message: 'Request updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH update only stage (for Kanban drag-and-drop)
const updateStage = async (req, res) => {
  const { stage } = req.body;
  const validStages = ['new', 'in_progress', 'repaired', 'scrapped'];
  if (!validStages.includes(stage)) return res.status(400).json({ success: false, message: 'Invalid stage' });
  try {
    const [rows] = await db.query('SELECT * FROM maintenance_requests WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Request not found' });
    const request = rows[0];

    await db.query('UPDATE maintenance_requests SET stage = ? WHERE id = ?', [stage, req.params.id]);

    // Auto-update equipment status based on stage
    if (request.equipment_id) {
      const statusMap = { in_progress: 'maintenance', repaired: 'active', scrapped: 'scrapped', new: 'active' };
      await db.query('UPDATE equipments SET status = ? WHERE id = ?', [statusMap[stage], request.equipment_id]);
    }
    res.json({ success: true, message: 'Stage updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE request
const deleteRequest = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM maintenance_requests WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Request not found' });
    res.json({ success: true, message: 'Request deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET stats for dashboard
const getRequestStats = async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(stage = 'new') as new_requests,
        SUM(stage = 'in_progress') as in_progress,
        SUM(stage = 'repaired') as repaired,
        SUM(stage = 'scrapped') as scrapped,
        SUM(priority = 'critical') as critical,
        SUM(type = 'corrective') as corrective,
        SUM(type = 'preventive') as preventive
      FROM maintenance_requests`
    );
    res.json({ success: true, data: stats[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET calendar events (all scheduled requests)
const getCalendarEvents = async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = `
      SELECT mr.id, mr.subject, mr.scheduled_date, mr.type, mr.stage, mr.priority,
             e.name as equipment_name, u.name as assigned_name
      FROM maintenance_requests mr
      LEFT JOIN equipments e ON mr.equipment_id = e.id
      LEFT JOIN users u ON mr.assigned_to = u.id
      WHERE mr.scheduled_date IS NOT NULL`;
    const params = [];
    if (month && year) {
      query += ' AND MONTH(mr.scheduled_date) = ? AND YEAR(mr.scheduled_date) = ?';
      params.push(month, year);
    }
    query += ' ORDER BY mr.scheduled_date';
    const [rows] = await db.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getRequests, getKanbanData, getRequest, createRequest, updateRequest, updateStage, deleteRequest, getRequestStats, getCalendarEvents };
