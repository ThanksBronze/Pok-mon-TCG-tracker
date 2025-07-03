const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../db');
const router = express.Router();

// GET /api/card-types
router.get('/', async (req, res, next) => {
	try {
		const { rows } = await pool.query(
			`SELECT id, name, category
				FROM card_types
			WHERE deleted_at IS NULL
			ORDER BY name`,
			[]
		);
		res.json(rows);
	} catch (err) {
		next(err);
	}
});

// GET /api/card-types/:id
router.get('/:id', async (req, res, next) => {
	try {
		const { rows } = await pool.query(
			`SELECT id, name, category
	 FROM card_types
	WHERE id = $1
		AND deleted_at IS NULL`,
			[req.params.id]
		);
		if (!rows.length) {
			return res.status(404).json({ message: 'Typen hittades inte' });
		}
		res.json(rows[0]);
	} catch (err) {
		next(err);
	}
});

// POST /api/card-types
router.post(
	'/',
	body('name').isString().notEmpty(),
	body('category').optional().isString(),
	async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		const { name, category = null } = req.body;
		try {
			const { rows } = await pool.query(
		`INSERT INTO card_types (name, category)
	 VALUES ($1, $2)
	 RETURNING id, name, category`,
			[name, category]
			);
			res.status(201).json(rows[0]);
		} catch (err) {
			next(err);
		}
	}
);

// PUT /api/card-types/:id
router.put(
	'/:id',
	body('name').optional().isString().notEmpty(),
	body('category').optional().isString(),
	async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		const { name, category } = req.body;
		try {
			const { rows } = await pool.query(
	`UPDATE card_types
		SET name = COALESCE($1, name),
	category = COALESCE($2, category),
	updated_at = NOW()
	WHERE id = $3
		AND deleted_at IS NULL
	RETURNING id, name, category`,
			[name, category, req.params.id]
			);
			if (!rows.length) {
				return res.status(404).json({ message: 'Typen hittades inte' });
			}
			res.json(rows[0]);
		} catch (err) {
			next(err);
		}
	}
);

// DELETE /api/card-types/:id — soft-delete
router.delete('/:id', async (req, res, next) => {
	try {
		await pool.query(
			`UPDATE card_types
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
