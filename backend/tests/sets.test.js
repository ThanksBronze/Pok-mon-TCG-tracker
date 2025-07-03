const request = require('supertest');
const express = require('express');
const setsRouter = require('../routes/sets');
const pool = require('../db');

jest.mock('../db', () => ({
	query: jest.fn()
}));

function createApp() {
	const app = express();
	app.use(express.json());
	// Stub auth/user
	app.use((req, res, next) => {
		req.user = { id: 1 };
		next();
	});
	app.use('/api/sets', setsRouter);
	// simple error handler
	app.use((err, req, res, next) => {
		res.status(500).json({ error: err.message });
	});
	return app;
}

describe('routes/sets', () => {
	let app;
	beforeAll(() => {
		app = createApp();
	});

	afterEach(() => {
		pool.query.mockReset();
	});

	describe('GET /api/sets', () => {
		it('returns [] when no sets', async () => {
			pool.query.mockResolvedValue({ rows: [] });

			const res = await request(app).get('/api/sets');

			expect(res.status).toBe(200);
			expect(res.body).toEqual([]);
			expect(pool.query).toHaveBeenCalledWith(
				expect.stringContaining('FROM sets')
			);
		});

		it('returns rows when present', async () => {
			const rows = [
				{ id: 1, name_of_expansion: 'Alpha', series_id: 10 },
				{ id: 2, name_of_expansion: 'Beta', series_id: 20 },
			];
			pool.query.mockResolvedValue({ rows });

			const res = await request(app).get('/api/sets');

			expect(res.status).toBe(200);
			expect(res.body).toEqual(rows);
		});
	});

	describe('GET /api/sets/:id', () => {
		it('404 when not found', async () => {
			pool.query.mockResolvedValue({ rows: [] });

			const res = await request(app).get('/api/sets/42');

			expect(res.status).toBe(404);
			expect(res.body).toEqual({ message: 'Setet finns inte' });
			expect(pool.query).toHaveBeenCalledWith(
				expect.stringContaining('WHERE id = $1'),
				['42']
			);
		});

		it('200 + set when found', async () => {
			const row = { id: 5, name_of_expansion: 'Gamma', series_id: 30 };
			pool.query.mockResolvedValue({ rows: [row] });

			const res = await request(app).get('/api/sets/5');

			expect(res.status).toBe(200);
			expect(res.body).toEqual(row);
		});
	});

	describe('POST /api/sets', () => {
		it('400 on missing fields', async () => {
			const res = await request(app).post('/api/sets').send({});
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('errors');
			expect(pool.query).not.toHaveBeenCalled();
		});

		it('201 + created row', async () => {
			const created = { id: 7, name_of_expansion: 'Delta', series_id: 40 };
			pool.query.mockResolvedValue({ rows: [created] });

			const res = await request(app)
				.post('/api/sets')
				.send({ name_of_expansion: 'Delta', series_id: 40 });

			expect(res.status).toBe(201);
			expect(res.body).toEqual(created);
			expect(pool.query).toHaveBeenCalledWith(
				expect.stringContaining('INSERT INTO sets'),
				['Delta', 40]
			);
		});
	});

	describe('PUT /api/sets/:id', () => {
		it('400 on invalid input', async () => {
			const res = await request(app)
				.put('/api/sets/9')
				.send({ series_id: 'not-an-int' });
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('errors');
			expect(pool.query).not.toHaveBeenCalled();
		});

		it('404 when no matching set', async () => {
			pool.query.mockResolvedValue({ rows: [] });

			const res = await request(app)
				.put('/api/sets/9')
				.send({ name_of_expansion: 'Updated' });

			expect(res.status).toBe(404);
			expect(res.body).toEqual({ message: 'Setet finns inte' });
			expect(pool.query).toHaveBeenCalledWith(
				expect.stringContaining('UPDATE sets'),
				['Updated', undefined, '9']
			);
		});

		it('200 + updated row', async () => {
			const updated = {
				id: 9,
				name_of_expansion: 'Updated',
				series_id: 50
			};
			pool.query.mockResolvedValue({ rows: [updated] });

			const res = await request(app)
				.put('/api/sets/9')
				.send({ name_of_expansion: 'Updated', series_id: 50 });

			expect(res.status).toBe(200);
			expect(res.body).toEqual(updated);
			expect(pool.query).toHaveBeenCalledWith(
				expect.stringContaining('UPDATE sets'),
				['Updated', 50, '9']
			);
		});
	});

	describe('DELETE /api/sets/:id', () => {
		it('204 No Content', async () => {
			pool.query.mockResolvedValue({});
			const res = await request(app).delete('/api/sets/13');

			expect(res.status).toBe(204);
			expect(pool.query).toHaveBeenCalledWith(
				expect.stringContaining('UPDATE sets'),
				['13']
			);
		});
	});

	describe('error handling', () => {
		it('calls next(err) on query failure', async () => {
			pool.query.mockRejectedValue(new Error('fatal'));
			const res = await request(app).get('/api/sets');
			expect(res.status).toBe(500);
			expect(res.body).toEqual({ error: 'fatal' });
		});
	});
});