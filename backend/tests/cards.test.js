const request = require('supertest');
const express = require('express');
const cardsRouter = require('../routes/cards');
const pool = require('../db');

jest.mock('../db', () => ({
	query: jest.fn()
}));

function createApp() {
	const app = express();
	app.use(express.json());
	app.use((req, res, next) => {
		req.user = { id: 1 };
		next();
	});
	app.use('/api/cards', cardsRouter);
	app.use((err, req, res, next) => {
		res.status(500).json({ error: err.message });
	});
	return app;
}

describe('cards.js CRUD routes', () => {
	let app;

	beforeAll(() => {
		app = createApp();
	});

	afterEach(() => {
		pool.query.mockReset();
	});

	test('GET /api/cards → empty array', async () => {
		pool.query.mockResolvedValue({ rows: [] });

		const res = await request(app).get('/api/cards');

		expect(res.status).toBe(200);
		expect(res.body).toEqual([]);

		expect(pool.query).toHaveBeenCalledWith(
			expect.stringContaining('FROM cards AS c'),
			[1]
		);
	});

	test('GET /api/cards/:id → 404 när ej hittad', async () => {
		pool.query.mockResolvedValue({ rows: [] });

		const res = await request(app).get('/api/cards/42');

		expect(res.status).toBe(404);
		expect(res.body).toEqual({ message: 'Kortet finns inte' });

		expect(pool.query).toHaveBeenCalledWith(
			expect.stringContaining('WHERE c.id = $1'),
			['42', 1]
		);
	});

	test('POST /api/cards → 201 och returnerar skapat kort', async () => {
		const newCard = {
			id: 7,
			name: 'Testmon',
			set_id: 2,
			type_id: 3,
			no_in_set: 1,
			user_id: 1,
			created_at: '2025-06-26T12:00:00.000Z',
			updated_at: '2025-06-26T12:00:00.000Z',
			deleted_at: null
		};
		pool.query.mockResolvedValue({ rows: [newCard] });

		const res = await request(app)
			.post('/api/cards')
			.send({ name: 'Testmon', set_id: 2, type_id: 3 });

		expect(res.status).toBe(201);
		expect(res.body).toEqual(newCard);
		expect(pool.query).toHaveBeenCalledWith(
			expect.stringContaining('INSERT INTO cards'),
			['Testmon', 2, 3, 1, 1]
		);
	});

	test('PUT /api/cards/:id → 200 och returnerar uppdaterat kort', async () => {
		const updatedCard = {
			id: 7,
			name: 'Testmon-upd',
			set_id: 2,
			type_id: 3,
			no_in_set: 1,
			user_id: 1,
			created_at: '2025-06-25T09:00:00.000Z',
			updated_at: '2025-06-25T10:00:00.000Z',
			deleted_at: null
		};
		pool.query.mockResolvedValue({ rows: [updatedCard] });

		const res = await request(app)
			.put('/api/cards/7')
			.send({ name: 'Testmon-upd' });

		expect(res.status).toBe(200);
		expect(res.body).toEqual(updatedCard);
		expect(pool.query).toHaveBeenCalledWith(
			expect.stringContaining('UPDATE cards'),
			['Testmon-upd', undefined, undefined, undefined, '7', 1]
		);
	});

	test('DELETE /api/cards/:id → 204 No Content', async () => {
		pool.query.mockResolvedValue({});
		const res = await request(app).delete('/api/cards/7');
		expect(res.status).toBe(204);
		expect(pool.query).toHaveBeenCalledWith(
			expect.stringContaining('UPDATE cards'),
			['7', 1]
		);
	});
});