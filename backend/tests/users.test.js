const request = require('supertest');
const express = require('express');
const usersRouter = require('../routes/users');
const pool = require('../db');

jest.mock('../db', () => ({
	query: jest.fn()
}));

function createApp() {
	const app = express();
	app.use(express.json());
	// stub auth/user
	app.use((req, res, next) => {
		req.user = { id: 1 };
		next();
	});
	app.use('/api/users', usersRouter);
	// error handler
	app.use((err, req, res, next) => {
		res.status(500).json({ error: err.message });
	});
	return app;
}

describe('routes/users', () => {
	let app;
	beforeAll(() => {
		app = createApp();
	});

	afterEach(() => {
		pool.query.mockReset();
	});

	describe('GET /api/users', () => {
		it('200 + [] when no users', async () => {
			pool.query.mockResolvedValue({ rows: [] });
			const res = await request(app).get('/api/users');
			expect(res.status).toBe(200);
			expect(res.body).toEqual([]);
			expect(pool.query).toHaveBeenCalledWith(
				expect.stringContaining('FROM users')
			);
		});

		it('200 + rows when present', async () => {
			const rows = [
				{ id:1, username:'alice', email:'a@e.com', created_at:'x', updated_at:'y' },
				{ id:2, username:'bob',   email:null,    created_at:'x', updated_at:'y' },
			];
			pool.query.mockResolvedValue({ rows });
			const res = await request(app).get('/api/users');
			expect(res.status).toBe(200);
			expect(res.body).toEqual(rows);
		});
	});

	describe('GET /api/users/:id', () => {
		it('404 when not found', async () => {
			pool.query.mockResolvedValue({ rows: [] });
			const res = await request(app).get('/api/users/42');
			expect(res.status).toBe(404);
			expect(res.body).toEqual({ message: 'Användaren hittades inte' });
			expect(pool.query).toHaveBeenCalledWith(
				expect.stringContaining('WHERE id = $1'),
				['42']
			);
		});

		it('200 + user when found', async () => {
			const user = { id: 7, username:'u', email:'e', created_at:'x', updated_at:'y' };
			pool.query.mockResolvedValue({ rows: [user] });
			const res = await request(app).get('/api/users/7');
			expect(res.status).toBe(200);
			expect(res.body).toEqual(user);
		});
	});

	describe('POST /api/users', () => {
		it('400 on missing username', async () => {
			const res = await request(app).post('/api/users').send({ email:'foo@bar' });
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('errors');
			expect(pool.query).not.toHaveBeenCalled();
		});

		it('400 on invalid email', async () => {
			const res = await request(app).post('/api/users').send({ username:'u', email:'notemail' });
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('errors');
		});

		it('201 + created row (with null email)', async () => {
			const created = { id:3, username:'u', email:null, created_at:'c', updated_at:'u' };
			pool.query.mockResolvedValue({ rows:[created] });
			const res = await request(app)
				.post('/api/users')
				.send({ username:'u' });
			expect(res.status).toBe(201);
			expect(res.body).toEqual(created);
			expect(pool.query).toHaveBeenCalledWith(
				expect.stringContaining('INSERT INTO users'),
				['u', null]
			);
		});

		it('201 + created row (with email)', async () => {
			const created = { id:4, username:'u', email:'e@e.com', created_at:'c', updated_at:'u' };
			pool.query.mockResolvedValue({ rows:[created] });
			const res = await request(app)
				.post('/api/users')
				.send({ username:'u', email:'e@e.com' });
			expect(res.status).toBe(201);
			expect(res.body).toEqual(created);
			expect(pool.query).toHaveBeenCalledWith(
				expect.stringContaining('INSERT INTO users'),
				['u', 'e@e.com']
			);
		});
	});

	describe('PUT /api/users/:id', () => {
		it('400 on invalid username/email', async () => {
			let res = await request(app).put('/api/users/9').send({ username:'' });
			expect(res.status).toBe(400);
			res = await request(app).put('/api/users/9').send({ email:'bad' });
			expect(res.status).toBe(400);
			expect(pool.query).not.toHaveBeenCalled();
		});

		it('404 when no matching user', async () => {
			pool.query.mockResolvedValue({ rows: [] });
			const res = await request(app)
				.put('/api/users/9')
				.send({ username:'new' });
			expect(res.status).toBe(404);
			expect(res.body).toEqual({ message: 'Användaren hittades inte' });
			expect(pool.query).toHaveBeenCalledWith(
				expect.stringContaining('UPDATE users'),
				['new', undefined, '9']
			);
		});

		it('200 + updated row', async () => {
			const updated = { id:9, username:'new', email:'e@e.com', created_at:'c', updated_at:'u' };
			pool.query.mockResolvedValue({ rows:[updated] });
			const res = await request(app)
				.put('/api/users/9')
				.send({ username:'new', email:'e@e.com' });
			expect(res.status).toBe(200);
			expect(res.body).toEqual(updated);
			expect(pool.query).toHaveBeenCalledWith(
				expect.stringContaining('UPDATE users'),
				['new', 'e@e.com', '9']
			);
		});
	});

	describe('DELETE /api/users/:id', () => {
		it('204 on success', async () => {
			pool.query.mockResolvedValue({});
			const res = await request(app).delete('/api/users/13');
			expect(res.status).toBe(204);
			expect(pool.query).toHaveBeenCalledWith(
				expect.stringContaining('UPDATE users'),
				['13']
			);
		});
	});

	describe('error handling', () => {
		it('500 on query failure', async () => {
			pool.query.mockRejectedValue(new Error('boom'));
			const res = await request(app).get('/api/users');
			expect(res.status).toBe(500);
			expect(res.body).toEqual({ error: 'boom' });
		});
	});
});