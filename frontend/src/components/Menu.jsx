import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Menu.css';
import { jwtDecode } from 'jwt-decode';

export default function Menu() {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const navigate = useNavigate();

  useEffect(() => {
    const onStorage = e => { if (e.key === 'token') setToken(e.newValue); };
    const onAuth = () => setToken(localStorage.getItem('token'));
    window.addEventListener('storage', onStorage);
    window.addEventListener('auth-changed', onAuth);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('auth-changed', onAuth);
    };
  }, []);

  const isAuthenticated = !!token;

  const isAdmin = useMemo(() => {
    if (!token) return false;
    try {
      const { roles } = jwtDecode(token);
      return Array.isArray(roles) && roles.includes('admin');
    } catch {
      return false;
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('auth-changed'));
    setOpen(false);
    navigate('/login', { replace: true });
  };

  return (
    <>
      {/* Show hamburger only when logged in (App hides Menu on /login & /register anyway) */}
      {isAuthenticated && (
        <button
          className="nav-toggle"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          ☰
        </button>
      )}

      {open && <div className="nav-overlay" onClick={() => setOpen(false)} />}

      <aside className={`nav-drawer${open ? ' open' : ''}`}>
        <button
          className="nav-close"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        >
          ×
        </button>
        <nav className="nav-content" aria-label="Main">
          <ul className="nav-list">
            <li><Link to="/" onClick={() => setOpen(false)}>Home</Link></li>
            {isAdmin && (
              <>
                <li><Link to="/series" onClick={() => setOpen(false)}>Series</Link></li>
                <li><Link to="/sets" onClick={() => setOpen(false)}>Sets</Link></li>
                <li><Link to="/types" onClick={() => setOpen(false)}>Card Types</Link></li>
                <li><Link to="/users" onClick={() => setOpen(false)}>Users</Link></li>
              </>
            )}
          </ul>

          {isAuthenticated && (
            <button className="nav-logout" onClick={handleLogout}>
              Logout
            </button>
          )}
        </nav>
      </aside>
    </>
  );
}
