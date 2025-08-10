import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css'

export default function Login() {
	const [identifier, setIdentifier] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const navigate = useNavigate();

	const handleSubmit = async e => {
		e.preventDefault();
		setError('');
		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username: identifier, password })
			});
			if (!res.ok) throw new Error('Cant find user');
			const { token } = await res.json();
			localStorage.setItem('token', token);
			navigate('/');
		} catch (err) {
			setError(err.message);
		}
	};

	return (
		<div className="login-page">
			<div className="login-container">
				<div className="login-hero">
					<h1 className="title-large">CARD TRACKER</h1>
					<div className="login-sub">Track your Pokémon cards</div>
						<img
							src="https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/094.png"
							alt="Gengar"
							className="hero-image"
							loading="lazy"
							onError={e => {
								e.currentTarget.src = 'data:image/svg+xml;charset=UTF-8,<svg width="160" height="160" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="160" fill="%233f2d7f"/><text x="50%" y="50%" fill="%23fff" font-size="14" text-anchor="middle" dy=".3em">Bild saknas</text></svg>';
							}}
						/>
				</div>

				<div className="login-form-wrapper">
					<form className="login-form" onSubmit={handleSubmit}>
						<label>
							Username or email
							<div className="input-wrapper">
								<input
									type="text"
									value={identifier}
									onChange={e => setIdentifier(e.target.value)}
									required
									placeholder=""
								/>
							</div>
						</label>

						<label>
							Password
							<div className="input-wrapper">
								<input
									type="password"
									value={password}
									onChange={e => setPassword(e.target.value)}
									required
									placeholder=""
								/>
								<div className="password-toggle">
									{/* enkel eye-ikon: */}
									<svg viewBox="0 0 24 24" width="20" height="20">
										<path d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/>
										<circle cx="12" cy="12" r="2.5"/>
									</svg>
								</div>
							</div>
						</label>

						{error && <p className="error">{error}</p>}

						<button type="submit">Log in</button>
					</form>

					<p className="register-line">
						New user? <Link to="/register">Register here</Link>
					</p>
				</div>
			</div>
		</div>
	);
}