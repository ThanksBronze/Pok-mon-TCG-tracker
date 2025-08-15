import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css'

export default function Register() {
	const [username, setUsername] = useState('');
	const [email,    setEmail   ] = useState('');
	const [password, setPassword] = useState('');
	const [error,    setError   ] = useState('');
	const navigate = useNavigate();

	const handleSubmit = async e => {
		e.preventDefault();
		setError('');
		try {
			const res = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, email, password })
			});
			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.errors?.[0]?.msg || 'Something went wrong');
			}
			navigate('/login');
		} catch (err) {
			setError(err.message);
		}
	};

	return (
		<div className="register-page">
		<div className="register-container">
			<div className="register-hero">
				<h2 className="title-large">Create account</h2>
				<div className="register-sub">Track your Pokémon cards</div>
			</div>
			<div className="register-form-wrapper">
				<form className="register-form" onSubmit={handleSubmit}>
					<label>
						Username
						<input
							type="text"
							value={username}
							onChange={e => setUsername(e.target.value)}
							required
						/>
					</label>
					<label>
						Email (optional)
						<input
							type="email"
							value={email}
							onChange={e => setEmail(e.target.value)}
						/>
					</label>
					<label>
						Password (min 6 characters)
						<input
							type="password"
							value={password}
							onChange={e => setPassword(e.target.value)}
							minLength={6}
							required
						/>
					</label>
					{error && <p className="error">{error}</p>}
					<button type="submit">Register</button>
				</form>
				<div className="register-line">
					Already registered? <Link to="/login">Login here</Link>
				</div>
			</div>
		</div>
	</div>
	);
}