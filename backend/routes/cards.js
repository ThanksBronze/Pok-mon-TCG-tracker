const express = require('express');
const { body, validationResult} = require('express-validator');
const pool = require('../db');
const router = express.Router();

/**
 * @openapi
 * /api/cards:
 *   get:
 *     summary: List cards for the authenticated user
 *     description: Returns all non-deleted cards that belong to the current user, enriched with series, set, type and owner names.
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of cards
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CardView'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
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

/**
 * @openapi
 * /api/cards/search:
 *   get:
 *     summary: Full-text search and filter cards
 *     description: Performs a weighted full-text search on cards and allows filtering by series, set, type and rarity. Results are limited to the authenticated user's cards.
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search terms (space separated). Uses PostgreSQL to_tsquery and ILIKE fallback.
 *       - in: query
 *         name: series
 *         schema:
 *           type: integer
 *         description: Series id filter
 *       - in: query
 *         name: set
 *         schema:
 *           type: integer
 *         description: Set id filter
 *       - in: query
 *         name: type
 *         schema:
 *           type: integer
 *         description: Card type id filter
 *       - in: query
 *         name: rarity
 *         schema:
 *           type: string
 *         description: Exact rarity filter
 *     responses:
 *       200:
 *         description: Filtered list of cards (max 100)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CardView'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
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

/**
 * @openapi
 * /api/cards/{id}:
 *   get:
 *     summary: Get a card by id
 *     description: Returns a single card (owned by the current user) with joined view fields.
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Card id
 *     responses:
 *       200:
 *         description: Card found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CardView'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Card not found
 *       500:
 *         description: Server error
 */
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

/**
 * @openapi
 * /api/cards:
 *   post:
 *     summary: Create a card
 *     description: Creates a new card owned by the authenticated user.
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CardCreateInput'
 *     responses:
 *       201:
 *         description: Card created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Card'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
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

/**
 * @openapi
 * /api/cards/{id}:
 *   put:
 *     summary: Update a card
 *     description: Updates an existing card owned by the authenticated user. Only provided fields will be updated.
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Card id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CardUpdateInput'
 *     responses:
 *       200:
 *         description: Updated card (raw DB row)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Card'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Card not found
 *       500:
 *         description: Server error
 */
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

/**
 * @openapi
 * /api/cards/{id}:
 *   delete:
 *     summary: Soft-delete a card
 *     description: Marks the card as deleted by setting `deleted_at`. Only the owner can delete.
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Card id
 *     responses:
 *       204:
 *         description: Deleted (no content)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Card not found
 *       500:
 *         description: Server error
 */
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

/**
 * @openapi
 * components:
 *   schemas:
 *     Card:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 123 }
 *         name: { type: string, example: "Charizard" }
 *         set_id: { type: integer, example: 42 }
 *         type_id: { type: integer, example: 3 }
 *         user_id: { type: integer, example: 9 }
 *         no_in_set: { type: integer, nullable: true, example: 4 }
 *         image_small: { type: string, format: uri, nullable: true }
 *         image_large: { type: string, format: uri, nullable: true }
 *         rarity: { type: string, nullable: true, example: "Rare Holo" }
 *         price_low: { type: number, format: float, nullable: true, example: 12.5 }
 *         price_mid: { type: number, format: float, nullable: true, example: 25.0 }
 *         price_high: { type: number, format: float, nullable: true, example: 80.0 }
 *         price_market: { type: number, format: float, nullable: true, example: 28.9 }
 *         created_at: { type: string, format: date-time, nullable: true }
 *         updated_at: { type: string, format: date-time, nullable: true }
 *         deleted_at: { type: string, format: date-time, nullable: true }
 *     CardView:
 *       allOf:
 *         - $ref: '#/components/schemas/Card'
 *         - type: object
 *           properties:
 *             series_name: { type: string, example: "Sword & Shield" }
 *             set_name: { type: string, example: "Darkness Ablaze" }
 *             type_name: { type: string, example: "Fire" }
 *             user_name: { type: string, example: "albin" }
 *     CardCreateInput:
 *       type: object
 *       required: [name, set_id, type_id]
 *       properties:
 *         name: { type: string, example: "Charizard" }
 *         set_id: { type: integer, example: 42 }
 *         type_id: { type: integer, example: 3 }
 *         no_in_set: { type: integer, minimum: 1, nullable: true, example: 4 }
 *         image_small: { type: string, format: uri, nullable: true }
 *         image_large: { type: string, format: uri, nullable: true }
 *         rarity: { type: string, nullable: true }
 *         price_low: { type: number, format: float, nullable: true }
 *         price_mid: { type: number, format: float, nullable: true }
 *         price_high: { type: number, format: float, nullable: true }
 *         price_market: { type: number, format: float, nullable: true }
 *     CardUpdateInput:
 *       type: object
 *       properties:
 *         name: { type: string }
 *         set_id: { type: integer }
 *         type_id: { type: integer }
 *         no_in_set: { type: integer, minimum: 1, nullable: true }
 *         image_small: { type: string, format: uri, nullable: true }
 *         image_large: { type: string, format: uri, nullable: true }
 *         rarity: { type: string, nullable: true }
 *         price_low: { type: number, format: float, nullable: true }
 *         price_mid: { type: number, format: float, nullable: true }
 *         price_high: { type: number, format: float, nullable: true }
 *         price_market: { type: number, format: float, nullable: true }
 */