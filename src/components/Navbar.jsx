import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🦷</span>
          <span className="brand-text">DentBook</span>
        </Link>
        <div className="navbar-links">
          <Link
            to="/"
            className={location.pathname === '/' ? 'active' : ''}
          >
            Find Dentists
          </Link>
          <Link
            to="/admin"
            className={location.pathname === '/admin' ? 'active' : ''}
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
