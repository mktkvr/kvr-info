import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ onHomeClick, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const userType = localStorage.getItem('userType'); // Assuming you store userType in localStorage

  const handleHomeClick = () => {
    onHomeClick();
    navigate('/app');
  };

  const handleOCRClick = () => {
    navigate('/ocr');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleAdminPageClick = () => {
    navigate('/admin');
  };

  const handleLogoutClick = () => {
    onLogout(); // Call the logout handler
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">MyApp</div>
      <div className="navbar-link">
        <button
          onClick={handleHomeClick}
          className={`nav-button ${location.pathname === '/' ? 'active' : ''}`}
        >
          Home
        </button>
        <button
          onClick={handleOCRClick}
          className={`nav-button ${location.pathname === '/ocr' ? 'active' : ''}`}
        >
          OCR
        </button>
        {localStorage.getItem('loggedInUser') && (
          <>
            <button
              onClick={handleProfileClick}
              className={`nav-button ${location.pathname === '/profile' ? 'active' : ''}`}
            >
              Profile
            </button>
            {userType === 'admin' && (
              <button
                onClick={handleAdminPageClick}
                className={`nav-button ${location.pathname === '/admin' ? 'active' : ''}`}
              >
                Admin Page
              </button>
            )}
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
