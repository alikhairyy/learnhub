import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const close = () => setOpen(false);
  const handleLogout = () => {
    logout();
    close();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={close}>
          <img src="/logo.svg" alt="" width="34" height="34" />
          <span>
            Learn<b>Hub</b>
          </span>
        </Link>

        <button className="menu-toggle" aria-label="Toggle menu" onClick={() => setOpen(!open)}>
          ☰
        </button>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          <NavLink to="/" end onClick={close}>
            Home
          </NavLink>
          <NavLink to="/courses" onClick={close}>
            Courses
          </NavLink>
          {user && (
            <NavLink to="/my-courses" onClick={close}>
              My Courses
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" onClick={close}>
              Admin
            </NavLink>
          )}

          {user ? (
            <div className="nav-user">
              <span className="avatar" title={user.email}>
                {user.name.charAt(0).toUpperCase()}
              </span>
              <span className="nav-name">{user.name}</span>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                Log out
              </button>
            </div>
          ) : (
            <div className="nav-user">
              <Link to="/login" className="btn btn-outline btn-sm" onClick={close}>
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={close}>
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
