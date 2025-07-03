const request = require('supertest');
const express = require('express');
const seriesRouter = require('../routes/series');
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
	app.use('/api/series', seriesRouter);
	// simple error handler
	app.use((err, req, res, next) => {
		res.status(500).json({ error: err.message });
	});
	return app;
}

describe('routes/series', () => {
	let app;
	beforeAll(() => {
		app = createApp();
	});

	afterEach(() => {
		pool.query.mockReset();
	});

	describe('GET /api/series', () => {
		it('returns an empty array when no rows', async () => {
			pool.query.mockResolvedValue({ rows: [] });

			const res = await request(app).get('/api/series');

			expect(res.status).toBe(200);
			expect(res.body).toEqual([]);
			expect(pool.query).toHaveBeenCalledWith(
				expect.stringContaining('FROM series')
			);
		});

		it('returns all series rows', async () => {
			const rows = [{ id: 1, name: 'Foo' }, { id: 2, name: 'Bar' }];
			pool.query.mockResolvedValue({ rows });

			const res = await request(app).get('/api/series');

			expect(res.status).toBe(200);
			expect(res.body).toEqual(rows);
		});
	});

	describe('GET /api/series/:id', () => {
		it('404 when not found', async () => {
			pool.query.mockResolvedValue({ rows: [] });

			const res = await request(app).get('/api/series/42');

			expect(res.status).toBe(404);
			expect(res.body).toEqual({ message: 'Serien hittades inte' });
			expect(pool.query).toHaveBeenCalledWith(
				expect.stringContaining('WHERE id = $1'),
				['42']
			);
		});

		it('200 + row when found', async () => {
			const row = { id: 5, name: 'Baz' };
			pool.query.mockResolvedValue({ rows: [row] });

			const res = await request(app).get('/api/series/5');

			expect(res.status).toBe(200);
			expect(res.body).toEqual(row);
		});
	});

	describe('POST /api/series', () => {
		it('400 on missing or invalid name', async () => {
			const res = await request(app).post('/api/series').send({});
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('errors');
			expect(pool.query).not.toHaveBeenCalled();
		});

		it('201 + created row', async () => {
			const created = { id: 7, name: 'New Series' };
			pool.query.mockResolvedValue({ rows: [created] });

			const res = await request(app)
				.post('/api/series')
				.send({ name: 'New Series' });

			expect(res.status).toBe(201);
			expect(res.body).toEqual(created);
			expect(pool.query).toHaveBeenCalledWith(
				expect.stringContaining('INSERT INTO series'),
				['New Series']
			);
		});
	});

	describe('PUT /api/series/:id', () => {
		it('400 on invalid name', async () => {
			const res = await request(app)
				.put('/api/series/9')
				.send({ name: '' });
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('errors');
			expect(pool.query).not.toHaveBeenCalled();
		});

		it('404 when no matching row', async () => {
			pool.query.mockResolvedValue({ rows: [] });

			const res = await request(app)
				.put('/api/series/9')
				.send({ name: 'Updated' });

			expect(res.status).toBe(404);
			expect(res.body).toEqual({ message: 'Serien hittades inte' });
			expect(pool.query).toHaveBeenCalledWith(
				expect.stringContaining('UPDATE series'),
				['Updated', '9']
			);
		});

		it('200 + updated row', async () => {
			const updated = { id: 9, name: 'Updated' };
			pool.query.mockResolvedValue({ rows: [updated] });

			const res = await request(app)
				.put('/api/series/9')
				.send({ name: 'Updated' });

			expect(res.status).toBe(200);
			expect(res.body).toEqual(updated);
			expect(pool.query).toHaveBeenCalledWith(
				expect.stringContaining('UPDATE series'),
				['Updated', '9']
			);
		});
	});

	describe('DELETE /api/series/:id', () => {
		it('204 No Content', async () => {
			pool.query.mockResolvedValue({});

			const res = await request(app).delete('/api/series/13');

			expect(res.status).toBe(204);
			expect(pool.query).toHaveBeenCalledWith(
				expect.stringContaining('UPDATE series'),
				['13']
			);
		});
	});

	describe('error handling', () => {
		it('500 when pool.query throws', async () => {
			pool.query.mockRejectedValue(new Error('boom!'));

			const res = await request(app).get('/api/series');
			expect(res.status).toBe(500);
			expect(res.body).toEqual({ error: 'boom!' });
		});
	});
});