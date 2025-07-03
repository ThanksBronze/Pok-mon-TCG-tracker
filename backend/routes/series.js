const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../db');
const router = express.Router();

// GET /api/series
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name
         FROM series
        WHERE deleted_at IS NULL
        ORDER BY name`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/series/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name
         FROM series
        WHERE id = $1
          AND deleted_at IS NULL`,
      [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ message: 'Serien hittades inte' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/series
router.post(
  '/',
  body('name').isString().notEmpty(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name } = req.body;
    try {
      const { rows } = await pool.query(
        `INSERT INTO series (name)
         VALUES ($1)
         RETURNING id, name`,
        [name]
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/series/:id
router.put(
  '/:id',
  body('name').optional().isString().notEmpty(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name } = req.body;
    try {
      const { rows } = await pool.query(
        `UPDATE series
            SET name       = COALESCE($1, name),
                updated_at = NOW()
          WHERE id = $2
            AND deleted_at IS NULL
          RETURNING id, name`,
        [name, req.params.id]
      );
      if (!rows.length) {
        return res.status(404).json({ message: 'Serien hittades inte' });
      }
      res.json(rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/series/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await pool.query(
      `UPDATE series
          SET deleted_at = NOW()
        WHERE id = $1`,
      [req.params.id]
    );
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;