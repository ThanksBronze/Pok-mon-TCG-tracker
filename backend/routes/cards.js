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

router.get('/search', async (req, res, next) => {
	try {
		const { q, series, set, type, rarity } = req.query;

		const whereParts = [];
		const values = [req.user.id]; // $1
		let idx = 2;

		if (q && q.trim()) {
			const terms = q
				.trim()
				.split(/\s+/)
				.map(t => t.replace(/[:&|!]/g, ''))
				.filter(Boolean)
				.map(t => `${t}:*`);
			const tsQueryString = terms.join(' & ');

			whereParts.push(`(
				c.document_with_weights @@ to_tsquery('english', $${idx})
				OR c.name ILIKE '%' || $${idx + 1} || '%'
			)`);
			values.push(tsQueryString);
			values.push(q.trim());
			idx += 2;
		} else {
			whereParts.push('TRUE');
		}

		if (series) {
			whereParts.push(`ser.id = $${idx}`);
			values.push(parseInt(series, 10));
			idx++;
		}
		if (set) {
			whereParts.push(`c.set_id = $${idx}`);
			values.push(parseInt(set, 10));
			idx++;
		}
		if (type) {
			whereParts.push(`c.type_id = $${idx}`);
			values.push(parseInt(type, 10));
			idx++;
		}
		if (rarity) {
			whereParts.push(`c.rarity = $${idx}`);
			values.push(rarity);
			idx++;
		}

		let orderClause;
		if (q && q.trim()) {
			orderClause = `ts_rank(c.document_with_weights, to_tsquery('english', $2)) DESC`;
		} else {
			orderClause = 'c.created_at DESC';
		}

		const queryText = `
			SELECT
				c.*,
				ser.name AS series_name,
				s.name_of_expansion AS set_name,
				t.name AS type_name,
				u.username AS user_name
			FROM cards c
			JOIN sets s ON s.id = c.set_id
			JOIN series ser ON ser.id = s.series_id
			JOIN card_types t ON t.id = c.type_id
			JOIN users u ON u.id = c.user_id
			WHERE ${whereParts.join(' AND ')}
				AND c.user_id = $1
				AND c.deleted_at IS NULL
			ORDER BY ${orderClause}
			LIMIT 100
		`;

		const { rows } = await pool.query(queryText, values);
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



module.exports = router;