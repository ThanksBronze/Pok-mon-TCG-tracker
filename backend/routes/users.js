const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../db');
const router = express.Router();

// GET /api/users
router.get('/', async (req, res, next) => {
	try {
		const { rows } = await pool.query(
			`SELECT id, username, email, created_at, updated_at
				FROM users
				WHERE deleted_at IS NULL
				ORDER BY username`
		);
		res.json(rows);
	} catch (err) {
		next(err);
	}
});

// GET /api/users/:id
router.get('/:id', async (req, res, next) => {
	try {
		const { rows } = await pool.query(
			`SELECT id, username, email, created_at, updated_at
				FROM users
				WHERE id = $1
					AND deleted_at IS NULL`,
			[req.params.id]
		);
		if (!rows.length) {
			return res.status(404).json({ message: 'Användaren hittades inte' });
		}
		res.json(rows[0]);
	} catch (err) {
		next(err);
	}
});

// POST /api/users
router.post(
	'/',
	body('username').isString().notEmpty(),
	body('email').isEmail().optional({ nullable: true }),
	async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		const { username, email = null } = req.body;
		try {
			const { rows } = await pool.query(
				`INSERT INTO users (username, email)
				VALUES ($1, $2)
				RETURNING id, username, email, created_at, updated_at`,
				[username, email]
			);
			res.status(201).json(rows[0]);
		} catch (err) {
			next(err);
		}
	}
);

// PUT /api/users/:id
router.put(
	'/:id',
	body('username').optional().isString().notEmpty(),
	body('email').optional().isEmail(),
	async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		const { username, email } = req.body;
		try {
			const { rows } = await pool.query(
				`UPDATE users
						SET username = COALESCE($1, username),
								email = COALESCE($2, email),
								updated_at = NOW()
					WHERE id = $3
						AND deleted_at IS NULL
					RETURNING id, username, email, created_at, updated_at`,
				[username, email, req.params.id]
			);
			if (!rows.length) {
				return res.status(404).json({ message: 'Användaren hittades inte' });
			}
			res.json(rows[0]);
		} catch (err) {
			next(err);
		}
	}
);

// DELETE /api/users/:id
router.delete('/:id', async (req, res, next) => {
	try {
		await pool.query(
			`UPDATE users
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