const db = require('../config/database');
const auditService = require('../services/auditService');
const { randomUUID: uuidv4 } = require('crypto');

exports.createTask = async (req, res) => {
  const { title, description, priority, due_date, assigned_to } = req.body;
  const organizationId = req.organizationId;
  const createdBy = req.user.id;
  const taskId = uuidv4();

  try {
    const result = await db.query(
      'INSERT INTO tasks (id, organization_id, title, description, priority, due_date, assigned_to, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [taskId, organizationId, title, description, priority || 'medium', due_date, assigned_to || createdBy, createdBy]
    );

    const newTask = result.rows[0];
    
    // Log audit
    await auditService.logAction(createdBy, 'CREATE', 'task', newTask.id, newTask, req.ip, req.headers['user-agent']);

    res.status(201).json(newTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getTasks = async (req, res) => {
  const organizationId = req.organizationId;
  const userId = req.user.id;
  const userRole = req.user.role;
  const { status, priority, assigned_to } = req.query;

  let query = 'SELECT * FROM tasks WHERE organization_id = $1';
  let params = [organizationId];

  // Role-based visibility logic from guide
  if (userRole !== 'admin') {
    query += ` AND (assigned_to = $${params.length + 1} OR created_by = $${params.length + 1})`;
    params.push(userId);
  }

  if (status) {
    query += ' AND status = $' + (params.length + 1);
    params.push(status);
  }
  if (priority) {
    query += ' AND priority = $' + (params.length + 1);
    params.push(priority);
  }
  if (assigned_to && userRole === 'admin') {
    query += ' AND assigned_to = $' + (params.length + 1);
    params.push(assigned_to);
  }

  try {
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getTaskById = async (req, res) => {
  const { id } = req.params;
  const organizationId = req.organizationId;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    const result = await db.query(
      'SELECT * FROM tasks WHERE id = $1 AND organization_id = $2',
      [id, organizationId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = result.rows[0];

    // Additional security check for single task access
    if (userRole !== 'admin' && task.assigned_to !== userId && task.created_by !== userId) {
        return res.status(403).json({ error: 'Access denied to this task.' });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const organizationId = req.organizationId;
  const userId = req.user.id;
  const { title, description, status, priority, due_date, assigned_to } = req.body;

  try {
    const oldTaskResult = await db.query(
      'SELECT * FROM tasks WHERE id = $1 AND organization_id = $2',
      [id, organizationId]
    );

    if (oldTaskResult.rowCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const oldTask = oldTaskResult.rows[0];

    const result = await db.query(
      `UPDATE tasks 
       SET title = COALESCE($1, title), 
           description = COALESCE($2, description), 
           status = COALESCE($3, status), 
           priority = COALESCE($4, priority), 
           due_date = COALESCE($5, due_date), 
           assigned_to = COALESCE($6, assigned_to),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND organization_id = $8
       RETURNING *`,
      [title, description, status, priority, due_date, assigned_to, id, organizationId]
    );

    const updatedTask = result.rows[0];

    // Change logging
    const changes = { before: oldTask, after: updatedTask };
    await auditService.logAction(userId, 'UPDATE', 'task', id, changes, req.ip, req.headers['user-agent']);

    res.json(updatedTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteTask = async (req, res) => {
  const { id } = req.params;
  const organizationId = req.organizationId;
  const userId = req.user.id;

  try {
    const oldTaskResult = await db.query(
      'SELECT * FROM tasks WHERE id = $1 AND organization_id = $2',
      [id, organizationId]
    );

    if (oldTaskResult.rowCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await db.query('DELETE FROM tasks WHERE id = $1 AND organization_id = $2', [id, organizationId]);

    // Log audit
    await auditService.logAction(userId, 'DELETE', 'task', id, oldTaskResult.rows[0], req.ip, req.headers['user-agent']);

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.assignTask = async (req, res) => {
  const { id } = req.params;
  const { assigned_to } = req.body;
  const organizationId = req.organizationId;
  const userId = req.user.id;

  try {
    const oldTaskResult = await db.query('SELECT assigned_to FROM tasks WHERE id = $1', [id]);
    
    const result = await db.query(
      'UPDATE tasks SET assigned_to = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND organization_id = $3 RETURNING *',
      [assigned_to, id, organizationId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updatedTask = result.rows[0];
    await auditService.logAction(userId, 'ASSIGN', 'task', id, { from: oldTaskResult.rows[0].assigned_to, to: assigned_to }, req.ip);

    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.addComment = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  try {
    const result = await db.query(
      'INSERT INTO comments (id, task_id, user_id, content) VALUES ($1, $2, $3, $4) RETURNING *',
      [uuidv4(), id, userId, content]
    );

    const comment = result.rows[0];
    
    // Log audit
    await auditService.logAction(userId, 'COMMENT', 'task', id, { content }, req.ip);

    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getComments = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `SELECT c.*, u.first_name, u.last_name 
       FROM comments c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.task_id = $1 
       ORDER BY c.created_at ASC`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
