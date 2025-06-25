const express = require('express');
const { body, validationResult} = require('express-validator');
const pool = require('../db');
const router = express.Router();

// GET /api/cards
router.get('/', async(req, res, next) => {
	try{
		const{rows} = await pool.query(
			'SELECT * FROM cards WHERE user_id = $1 AND (deleted_at IS NULL)',
			[req.user.id]
		);
		res.json(rows);
	} catch (err) { next(err); }
});

// GET /api/cards/:id
router.get('/:id', async(req, res, next) => {
	try{
		const {rows} = await pool.query(
			'SELECT * FROM cards WHERE id=$1 AND user_id=$2 AND (deleted_at IS NULL)',
			[req.params.id, req.user.id]
		);
		if(!rows.length) return res.status(404).json({message: 'Kortet finns inte'});
		res.json(rows[0]);
	} catch(err) {next(err);}
});

// POST /api/cards
router.post('/',
	body('name').isString().notEmpty(),
	body('set_id').isInt(),
	body('type_id').isInt(),
	body('no_in_set').optional().isInt({min: 0}),
	async(req, res, next) => {
		const errors = validationResult (req);
		if(!errors.isEmpty()) return res.status(400).json({errors: errors.array()});
		const{name, set_id, type_id, no_in_set = 1} = req.body;
		try{
			const{rows} = await pool.query(
				'INSERT INTO cards(name, set_id, type_id, no_in_set, user_id) VALUES($1,$2,$3,$4,$5) RETURNING *',
				[name, set_id, type_id, no_in_set, req.user.id]
			);
			res.status(201).json(rows[0]);
		}catch (err) {next(err);}
	}
);

// PUT api/cards/:id
router.put(
	'/:id',
	body('name').optional().isString(),
	body('set_id').optional().isInt(),
	body('type_id').optional().isInt(),
	body('no_in_set').optional().isInt({ min: 0 }),
	async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		const { name, set_id, type_id, no_in_set } = req.body;
		try {
			const { rows } = await pool.query(
				`UPDATE cards
					SET name = COALESCE($1, name),
						set_id = COALESCE($2, set_id),
						type_id = COALESCE($3, type_id),
						no_in_set = COALESCE($4, no_in_set),
						updated_at = NOW()
				WHERE id = $5
					AND user_id = $6
					AND deleted_at IS NULL
				RETURNING *`,
				[name, set_id, type_id, no_in_set, req.params.id, req.user.id]
			);
		if (rows.length === 0) {
			return res.status(404).json({ message: 'Kortet finns inte' });
		}
		res.json(rows[0]);
	} catch (err) {
		next(err);
	}
	}
);

// DELETE /api/cards/:id (soft delete)
router.delete('/:id', async(req, res, next) => {
	try{
		await pool.query(
			`UPDATE cards
				SET deleted_at = now()
			WHERE id = $1 AND user_id = $2`,
			[req.params.id, req.user.id]
		);
		res.status(204).send();
	} catch (err) {next(err);}
});

module.exports = router;