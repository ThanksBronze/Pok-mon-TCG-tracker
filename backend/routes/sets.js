const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../db');
const router = express.Router();

// GET /api/sets
router.get('/', async (req, res, next) => {
	try {
		const { rows } = await pool.query(
			`SELECT * 
				 FROM sets 
				WHERE deleted_at IS NULL
				ORDER BY name_of_expansion`
		);
		res.json(rows);
	} catch (err) {
		next(err);
	}
});

// GET /api/sets/:id
router.get('/:id', async (req, res, next) => {
	try {
		const { rows } = await pool.query(
			`SELECT * 
				 FROM sets 
				WHERE id = $1
					AND deleted_at IS NULL`,
			[req.params.id]
		);
		if (!rows.length) {
			return res.status(404).json({ message: 'Setet finns inte' });
		}
		res.json(rows[0]);
	} catch (err) {
		next(err);
	}
});

// POST /api/sets
router.post(
	'/',
	body('name_of_expansion').isString().notEmpty(),
	body('series_id').isInt(),
	async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		const { name_of_expansion, series_id } = req.body;
		try {
			const { rows } = await pool.query(
				`INSERT INTO sets (name_of_expansion, series_id)
				 VALUES ($1, $2)
				 RETURNING *`,
				[name_of_expansion, series_id]
			);
			res.status(201).json(rows[0]);
		} catch (err) {
			next(err);
		}
	}
);

// PUT /api/sets/:id
router.put(
	'/:id',
	body('name_of_expansion').optional().isString(),
	body('series_id').optional().isInt(),
	async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		const { name_of_expansion, series_id } = req.body;
		try {
			const { rows } = await pool.query(
				`UPDATE sets
						SET name_of_expansion = COALESCE($1, name_of_expansion),
								series_id = COALESCE($2, series_id),
								updated_at = NOW()
					WHERE id = $3
						AND deleted_at IS NULL
					RETURNING *`,
				[name_of_expansion, series_id, req.params.id]
			);
			if (!rows.length) {
				return res.status(404).json({ message: 'Setet finns inte' });
			}
			res.json(rows[0]);
		} catch (err) {
			next(err);
		}
	}
);

// DELETE /api/sets/:id — soft delete
router.delete('/:id', async (req, res, next) => {
	try {
		await pool.query(
			`UPDATE sets
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