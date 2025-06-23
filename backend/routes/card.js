const express = require('express');
const { body, validationReslut } = require('express-validator');
const pool = require('--/db');
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

//GET /api/cards/:id
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