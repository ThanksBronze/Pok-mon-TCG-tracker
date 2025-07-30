const express = require('express');
const { body, validationResult} = require('express-validator');
const pool = require('../db');
const router = express.Router();

// GET /api/cards
router.get('/', async (req, res, next) => {
	try {
		const { rows } = await pool.query(
			`SELECT
				c.*,
				ser.name AS series_name,
				s.name_of_expansion AS set_name,
				t.name AS type_name,
				u.username AS user_name
			FROM cards AS c
			JOIN sets AS s ON s.id = c.set_id
			JOIN series AS ser ON ser.id = s.series_id
			JOIN card_types AS t ON t.id = c.type_id
			JOIN users AS u ON u.id = c.user_id
			WHERE c.user_id = $1
				AND c.deleted_at IS NULL
			ORDER BY c.created_at DESC`,
			[req.user.id]
		);
		res.json(rows);
	} catch (err) {
		next(err);
	}
});

// GET /api/cards/:id
router.get('/:id', async (req, res, next) => {
	try {
		const { rows } = await pool.query(
			`SELECT
				c.*,
				ser.name AS series_name,
				s.name_of_expansion AS set_name,
				t.name AS type_name,
				u.username AS user_name
			FROM cards AS c
			JOIN sets AS s ON s.id = c.set_id
			JOIN series AS ser ON ser.id = s.series_id
			JOIN card_types AS t ON t.id = c.type_id
			JOIN users AS u ON u.id = c.user_id
			WHERE c.id = $1
				AND c.user_id = $2
				AND c.deleted_at IS NULL`,
			[req.params.id, req.user.id]
		);
		if (!rows.length) {
			return res.status(404).json({ message: 'Kortet finns inte' });
		}
		res.json(rows[0]);
	} catch (err) {
		next(err);
	}
});

// POST /api/cards
router.post(
	'/',
	[
		body('name').isString().notEmpty(),
		body('set_id').isInt(),
		body('type_id').isInt(),
		body('no_in_set').optional().isInt({ min: 1 }),
		body('image_small').optional().isURL(),
		body('image_large').optional().isURL(),
		body('rarity').optional().isString(),
		body('price_low').optional().isFloat({ min: 0 }),
		body('price_mid').optional().isFloat({ min: 0 }),
		body('price_high').optional().isFloat({ min: 0 }),
		body('price_market').optional().isFloat({ min: 0 }),
	],
	async (req, res, next) => {
		const errs = validationResult(req);
		if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });

		const {
			name, set_id, type_id, no_in_set,
			image_small, image_large, rarity,
			price_low, price_mid, price_high, price_market
		} = req.body;

		try {
			const { rows } = await pool.query(
				`INSERT INTO cards
					 (name, set_id, type_id, no_in_set, user_id,
						image_small, image_large, rarity,
						price_low, price_mid, price_high, price_market)
				 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
				 RETURNING *`,
				[
					name, set_id, type_id, no_in_set, req.user.id,
					image_small, image_large, rarity,
					price_low, price_mid, price_high, price_market
				]
			);
			res.status(201).json(rows[0]);
		} catch (err) {
			next(err);
		}
	}
);

// PUT /api/cards/:id
router.put(
	'/:id',
	[
		body('name').optional().isString(),
		body('set_id').optional().isInt(),
		body('type_id').optional().isInt(),
		body('no_in_set').optional().isInt({ min: 1 }),
		body('image_small').optional().isURL(),
		body('image_large').optional().isURL(),
		body('rarity').optional().isString(),
		body('price_low').optional().isFloat({ min: 0 }),
		body('price_mid').optional().isFloat({ min: 0 }),
		body('price_high').optional().isFloat({ min: 0 }),
		body('price_market').optional().isFloat({ min: 0 }),
	],
	async (req, res, next) => {
		const errs = validationResult(req);
		if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });

		const {
			name, set_id, type_id, no_in_set,
			image_small, image_large, rarity,
			price_low, price_mid, price_high, price_market
		} = req.body;

		try {
			const { rows } = await pool.query(
				`UPDATE cards SET
					 name         = COALESCE($1, name),
					 set_id       = COALESCE($2, set_id),
					 type_id      = COALESCE($3, type_id),
					 no_in_set    = COALESCE($4, no_in_set),
					 image_small  = COALESCE($5, image_small),
					 image_large  = COALESCE($6, image_large),
					 rarity       = COALESCE($7, rarity),
					 price_low    = COALESCE($8, price_low),
					 price_mid    = COALESCE($9, price_mid),
					 price_high   = COALESCE($10, price_high),
					 price_market = COALESCE($11, price_market),
					 updated_at   = NOW()
				 WHERE id = $12
					 AND user_id = $13
					 AND deleted_at IS NULL
				 RETURNING *`,
				[
					name, set_id, type_id, no_in_set,
					image_small, image_large, rarity,
					price_low, price_mid, price_high, price_market,
					req.params.id, req.user.id
				]
			);
			if (!rows.length) {
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

// SEARCH /api/cards/search
app.get('/api/cards/search', async (req, res) => {
	const { q, series, set, type, rarity } = req.query;

	const filters = [];
	if (series) filters.push(`series_id = ${parseInt(series)}`);
	if (set) filters.push(`set_id = ${parseInt(set)}`);
	if (type) filters.push(`type_id = ${parseInt(type)}`);
	if (rarity) filters.push(`rarity = '${rarity}'`);

	const tsQuery = q
		? `document_with_weights @@ plainto_tsquery('swedish', '${q.replace("'", "''")}')`
		: 'TRUE';

	const whereClause = [tsQuery, ...filters].join(' AND ');

	const cards = await db.query(`
		SELECT * FROM cards
		WHERE ${whereClause}
		ORDER BY ts_rank(document_with_weights, plainto_tsquery('swedish', '${q || ''}')) DESC
		LIMIT 100
	`);

	res.json(cards.rows);
});

module.exports = router;