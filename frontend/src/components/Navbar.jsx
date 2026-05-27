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
        </div>
      </div>
    </nav>
  );
}
