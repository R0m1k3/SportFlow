import { Router } from 'express';
import pool from '../db';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/sessions - Get all sessions for the logged-in user
router.get('/', protect, async (req: AuthRequest, res) => {
  const userId = req.user?.userId;
  try {
    const result = await pool.query(
      'SELECT id, type, duration, date FROM sessions WHERE user_id = $1 ORDER BY date DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/sessions - Add a new session
router.post('/', protect, async (req: AuthRequest, res) => {
  const userId = req.user?.userId;
  const { type, duration, date } = req.body;

  if (!type || !duration || !date) {
    return res.status(400).json({ message: 'Type, duration, and date are required.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO sessions (user_id, type, duration, date) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, type, duration, date]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding session:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/sessions/:id - Delete a session
router.delete('/:id', protect, async (req: AuthRequest, res) => {
  const userId = req.user?.userId;
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM sessions WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Session not found or user not authorized.' });
    }

    res.status(200).json({ id });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;