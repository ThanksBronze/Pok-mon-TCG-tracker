import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Menu.css';
import { jwtDecode } from 'jwt-decode';

export default function Menu() {
	const [open, setOpen] = useState(false);
	const navigate = useNavigate();

	const isAdmin = useMemo(() => {
		const token = localStorage.getItem('token');
		if (!token) return false;
		try {
			const { roles } = jwtDecode(token);
			return Array.isArray(roles) && roles.includes('admin');
		} catch {
			return false;
		}
	}, [localStorage.getItem('token')]);

	const handleLogout = () => {
		localStorage.removeItem('token');
		navigate('/login', { replace: true });
		setOpen(false);
	};

	return (
		<>
			{/* Toggle button */}
			<button
				className="nav-toggle"
				onClick={() => setOpen(true)}
				aria-label="Open menu"
			>
				☰
			</button>

			{/* Overlay */}
			{open && <div className="nav-overlay" onClick={() => setOpen(false)} />}

			{/* Drawer */}
			<aside className={`nav-drawer${open ? ' open' : ''}`}>
				<button
					className="nav-close"
					onClick={() => setOpen(false)}
					aria-label="Close menu"
				>
					×
				</button>
				<nav className="nav-content">
					<ul className="nav-list">
						<li><Link to="/" onClick={() => setOpen(false)}>Home</Link></li>
						{isAdmin && (
							<>
								<li><Link to="/series" onClick={() => setOpen(false)}>Series</Link></li>
								<li><Link to="/sets"    onClick={() => setOpen(false)}>Sets</Link></li>
								<li><Link to="/types"   onClick={() => setOpen(false)}>Card Types</Link></li>
								<li><Link to="/users"   onClick={() => setOpen(false)}>Users</Link></li>
							</>
						)}
					</ul>
					{/* Logout tucked at the bottom */}
					<button
						className="nav-logout"
						onClick={handleLogout}
					>
						Logout
					</button>
				</nav>
			</aside>
		</>
	);
}
