const request = require('supertest');
const express = require('express');
const cardTypesRouter = require('../routes/card_types');
const pool = require('../db');

jest.mock('../db', () => ({ query: jest.fn() }));

function createApp() {
	const app = express();
	app.use(express.json());
	app.use((req, res, next) => {
		req.user = { id: 1 };
		next();
	});
	app.use('/api/card-types', cardTypesRouter);
	app.use((err, req, res, next) => {
		res.status(500).json({ error: err.message });
	});
	return app;
}

describe('card_types CRUD routes', () => {
	let app;
	beforeAll(() => { app = createApp(); });
	afterEach(() => { pool.query.mockReset(); });

	test('GET /api/card-types → empty array', async () => {
		pool.query.mockResolvedValue({ rows: [] });
		const res = await request(app).get('/api/card-types');
		expect(res.status).toBe(200);
		expect(res.body).toEqual([]);
		expect(pool.query).toHaveBeenCalledWith(
			expect.stringContaining('FROM card_types'),
			[]
		);
	});

	test('GET /api/card-types/:id → 404 when not found', async () => {
		pool.query.mockResolvedValue({ rows: [] });
		const res = await request(app).get('/api/card-types/42');
		expect(res.status).toBe(404);
		expect(res.body).toEqual({ message: 'Typen hittades inte' });
		expect(pool.query).toHaveBeenCalledWith(
			expect.stringContaining('WHERE id = $1'),
			['42']
		);
	});

	test('POST /api/card-types → 201 + created row', async () => {
		const created = { id: 7, name: 'Foo', category: null };
		pool.query.mockResolvedValue({ rows: [created] });
		const res = await request(app)
			.post('/api/card-types')
			.send({ name: 'Foo' });
		expect(res.status).toBe(201);
		expect(res.body).toEqual(created);
		expect(pool.query).toHaveBeenCalledWith(
			expect.stringContaining('INSERT INTO card_types'),
			['Foo', null]
		);
	});

	test('PUT /api/card-types/:id → 200 + updated row', async () => {
		const updated = { id: 9, name: 'Beta', category: 'X' };
		pool.query.mockResolvedValue({ rows: [updated] });
		const res = await request(app)
			.put('/api/card-types/9')
			.send({ name: 'Beta', category: 'X' });
		expect(res.status).toBe(200);
		expect(res.body).toEqual(updated);
		expect(pool.query).toHaveBeenCalledWith(
			expect.stringContaining('UPDATE card_types'),
			['Beta', 'X', '9']
		);
	});

	test('DELETE /api/card-types/:id → 204 No Content', async () => {
		pool.query.mockResolvedValue({});
		const res = await request(app).delete('/api/card-types/7');
		expect(res.status).toBe(204);
		expect(pool.query).toHaveBeenCalledWith(
			expect.stringContaining('UPDATE card_types'),
			['7']
		);
	});
});