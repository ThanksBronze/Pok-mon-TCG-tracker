const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../db');
const router = express.Router();

/**
 * @openapi
 * /api/card-types:
 *   get:
 *     summary: List card types
 *     description: Returns all non-deleted card types ordered by name.
 *     tags: [Card Types]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of card type objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CardType'
 *       500:
 *         description: Server error
 */
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

/**
 * @openapi
 * /api/card-types/{id}:
 *   get:
 *     summary: Get a card type by id
 *     tags: [Card Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Card type id
 *     responses:
 *       200:
 *         description: Card type found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CardType'
 *       404:
 *         description: Card type not found
 *       500:
 *         description: Server error
 */
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

/**
 * @openapi
 * /api/card-types:
 *   post:
 *     summary: Create a card type
 *     description: Creates a new card type. Category is optional.
 *     tags: [Card Types]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "EX"
 *               category:
 *                 type: string
 *                 nullable: true
 *                 example: "Subtype"
 *     responses:
 *       201:
 *         description: Card type created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CardType'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Conflict (e.g. duplicate name)
 *       500:
 *         description: Server error
 */
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

/**
 * @openapi
 * /api/card-types/{id}:
 *   put:
 *     summary: Update a card type
 *     description: Updates name and/or category for a non-deleted card type.
 *     tags: [Card Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Card type id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "GX"
 *               category:
 *                 type: string
 *                 nullable: true
 *                 example: "Rarity"
 *     responses:
 *       200:
 *         description: Card type updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CardType'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Card type not found
 *       500:
 *         description: Server error
 */
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

/**
 * @openapi
 * /api/card-types/{id}:
 *   delete:
 *     summary: Soft-delete a card type
 *     description: Marks the card type as deleted by setting `deleted_at`.
 *     tags: [Card Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Card type id
 *     responses:
 *       204:
 *         description: Deleted (no content)
 *       404:
 *         description: Card type not found
 *       500:
 *         description: Server error
 */
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

/**
 * @openapi
 * components:
 *   schemas:
 *     CardType:
 *       type: object
 *       properties:
 *         id: {type: integer, example: 7}
 *         name: {type: string, example: "Holofoil"}
 *         category: {type: string, nullable: true, example: "Finish"}
 */