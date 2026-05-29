import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/log', label: 'Log Today' },
  { to: '/habits', label: 'Habits' },
  { to: '/goals', label: 'Goals' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/dashboard" className="navbar-logo">
          PRAXIS
        </NavLink>

        {/* Desktop links */}
        <div className="navbar-links">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-link${isActive ? ' nav-link-active' : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        <div className="navbar-right">
          {user && (
            <span className="navbar-username">@{user.username}</span>
          )}
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>

          {/* Hamburger — mobile only */}
          <button
            className="hamburger"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span className={`ham-line ${menuOpen ? 'open' : ''}`} />
            <span className={`ham-line ${menuOpen ? 'open' : ''}`} />
            <span className={`ham-line ${menuOpen ? 'open' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="mobile-nav" onClick={() => setMenuOpen(false)}>
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `mobile-nav-link${isActive ? ' nav-link-active' : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
          <button onClick={handleLogout} className="mobile-logout">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
