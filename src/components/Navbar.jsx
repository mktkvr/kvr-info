import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import ConfirmLogoutModal from './profile/ConfirmLogoutModal'; // Import the modal component

const Navbar = ({ onHomeClick, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const userType = localStorage.getItem('userType'); // Assuming you store userType in localStorage
  const loggedInUser = localStorage.getItem('loggedInUser'); // Assuming you store loggedInUser in localStorage

  const [isModalOpen, setIsModalOpen] = useState(false);

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
    setIsModalOpen(true); // Open the modal on logout button click
  };

  const handleLogoutConfirm = () => {
    setIsModalOpen(false);
    onLogout();
    navigate('/login');
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const navigateToCoverSheet = () => {
    navigate('/cover-sheet');
  };

  const navigateToPDFToText = () => {
    navigate('/pdf-to-text');
  };

  const navigateToUserList = () => {
    navigate('/user-list');
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
        <button
          onClick={navigateToCoverSheet}
          className={`nav-button ${location.pathname === '/cover-sheet' ? 'active' : ''}`}
        >
          Cover Page
        </button>
        <button
          onClick={navigateToPDFToText}
          className={`nav-button ${location.pathname === '/pdf-to-text' ? 'active' : ''}`}
        >
          PDF to Text
        </button>
        {loggedInUser && (
          <div className="profile-dropdown">
            <button
              onClick={handleProfileClick}
              className={`nav-button ${location.pathname === '/profile' ? 'active' : ''}`}
            >
              Profile
            </button>
            <div className="dropdown-menu">
              <button
                onClick={() => navigate('/profile')}
                className={`dropdown-item ${location.pathname === '/profile' ? 'active' : ''}`}
              >
                View Profile
              </button>
              <button
                onClick={handleLogoutClick}
                className="dropdown-item"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
      <ConfirmLogoutModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onConfirm={handleLogoutConfirm}
      />
    </nav>
  );
};

export default Navbar;
