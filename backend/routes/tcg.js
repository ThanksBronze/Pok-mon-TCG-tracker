const express = require('express');
const axios = require('axios');
const https = require('https');
const router = express.Router();
const NodeCache = require('node-cache');

const tcgCache = new NodeCache({ stdTTL: 60 * 60 });
const httpsAgent = new https.Agent({ keepAlive: true });

// GET /api/tcg/cards
router.get('/cards', async (req, res, next) => {
	try {
		const { q, page, pageSize, orderBy, select } = req.query;
		const params = {};
		if (q) params.q = q;
		if (page) params.page = page;
		if (pageSize) params.pageSize = pageSize;
		if (orderBy) params.orderBy = orderBy;
		if (select) params.select = select;

		const apiRes = await axios.get(
			'https://api.pokemontcg.io/v2/cards',
			{
				params,
				headers: {
					'X-Api-Key': process.env.POKEMON_TCG_API_KEY
				},
			}
		);

		res.json(apiRes.data);
	} catch (err) {
		console.error('TCG API error:', err.message);

		if (err.response) {
			return res
				.status(err.response.status)
				.json(err.response.data);
		}
		next(err);
	}
});

// GET /api/tcg/cards/:id
router.get('/cards/:id', async (req, res, next) => {
	const key = `card:${req.params.id}`;
	const cached = tcgCache.get(key);
	if (cached) {
		return res.json(cached);
	}

	try {
		const apiRes = await axios.get(
			`https://api.pokemontcg.io/v2/cards/${req.params.id}`,
			{ httpsAgent, headers: { 'X-Api-Key': process.env.POKEMON_TCG_API_KEY } }
		);
		tcgCache.set(key, apiRes.data);
		res.json(apiRes.data);
	} catch (err) {
		console.error('TCG API single‐card error:', err.message);
		if (err.response) {
			return res
				.status(err.response.status)
				.json(err.response.data);
		}
		next(err);
	}
});


module.exports = router;
