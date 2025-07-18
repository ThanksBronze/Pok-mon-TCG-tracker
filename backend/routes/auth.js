const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {body, validationResult} = require('express-validator');
const pool = require('../db');

const router = express.Router();
const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;

// POST /api/auth/register
router.post(
	'/register',
	body('username').isString().notEmpty(),
	body('email').optional({ nullable: true }).isEmail(),
	body('password').isLength({ min: 6 }),
	async (req, res, next) => {
		const errs = validationResult(req);
		if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });

		try {
			const { username, email = null, password } = req.body;
			const hash = await bcrypt.hash(password, saltRounds);

			const { rows: [newUser] } = await pool.query(
				`INSERT INTO users (username, email, password_hash)
				 VALUES ($1, $2, $3)
				 RETURNING id, username, email`,
				[username, email, hash]
			);

			await pool.query(
				`INSERT INTO user_roles (user_id, role_id)
				 VALUES ($1,
					 (SELECT id FROM roles WHERE name = 'user')
				 )`,
				[newUser.id]
			);

			res.status(201).json(newUser);
		} catch (err) {
			next(err);
		}
	}
);


// POST /api/auth/login
router.post(
	'/login',
	body('username').optional().isString(),
	body('email').optional().isEmail(),
	body('password').isString().notEmpty(),
	async (req, res, next) => {
		const errs = validationResult(req);
		if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });

		try {
			const { username, email, password } = req.body;
			const lookupKey = email ? 'email' : 'username';
			const lookupVal = email || username;
			const { rows } = await pool.query(
				`SELECT id, username, password_hash
				 FROM users
				 WHERE ${lookupKey} = $1
					 AND deleted_at IS NULL`,
				[lookupVal]
			);
			const user = rows[0];
			if (!user || !await bcrypt.compare(password, user.password_hash)) {
				return res.status(401).json({ message: 'Wrong credentials' });
			}

			const { rows: userRoles } = await pool.query(
				`SELECT r.name 
				 FROM roles r
				 JOIN user_roles ur ON ur.role_id = r.id
				 WHERE ur.user_id = $1`,
				[user.id]
			);

			const roles = userRoles.map(r => r.name);
			const token = jwt.sign(
				{ sub: user.id, username: user.username, roles },
				process.env.JWT_SECRET,
				{ expiresIn: '7d' }
			);
			res.json({ token });
		} catch (err) {
			next(err);
		}
	}
);

module.exports = router;