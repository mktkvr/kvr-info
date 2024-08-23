import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import ConfirmLogoutModal from './profile/ConfirmLogoutModal'; // Import the modal component

const Navbar = ({ onHomeClick, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userType, setUserType] = useState('');
  const loggedInUser = localStorage.getItem('loggedInUser'); // Assuming you store loggedInUser in localStorage

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch userType from localStorage and update state
    const storedUserType = localStorage.getItem('userType');
    setUserType(storedUserType);
    console.log('User Type:', storedUserType); // Debugging line
  }, []);

  const handleHomeClick = () => {
    onHomeClick();
    navigate('/app');
  };

  const handleUpimgClick = () => {
    navigate('/upimg');
  };

  const handleNoteClick = () => {
    navigate('/notes');
  };

  const handleOtherClick = () => {
    navigate('/Other');
  };

  const handleProfileClick = () => {
    navigate('/profile');
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
          onClick={handleUpimgClick}
          className={`nav-button ${location.pathname === '/upimg' ? 'active' : ''}`}
        >
          Upload Image
        </button>
        <button
          onClick={handleNoteClick}
          className={`nav-button ${location.pathname === '/notes' ? 'active' : ''}`}
        >
          Note
        </button>
        {loggedInUser && (
          <div className="profile-dropdown">
            <button
              // onClick={handleOtherClick}
              className={`nav-button ${location.pathname === '/Menu' ? 'active' : ''}`}
            >
              Other
            </button>
            <div className="dropdown-menu">
              <button
                onClick={() => navigate('/ocr')}
                className={`dropdown-item ${location.pathname === '/ocr' ? 'active' : ''}`}
              >
                OCR
              </button>
              <button
                onClick={() => navigate('/cover-sheet')}
                className={`dropdown-item ${location.pathname === '/cover-sheet' ? 'active' : ''}`}
              >
                Cover Page
              </button>
              <button
                onClick={() => navigate('/pdf-to-text')}
                className={`dropdown-item ${location.pathname === '/pdf-to-text' ? 'active' : ''}`}
              >
                PDF to Text
              </button>
            </div>
          </div>
        )}
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
              {userType === 'admin' && ( // Conditionally render based on userType
                <>
                  <button
                    onClick={() => navigate('/admin')}
                    className={`dropdown-item ${location.pathname === '/admin' ? 'active' : ''}`}
                  >
                    Admin Page
                  </button>
                  <button
                    onClick={() => navigate('/user-list')}
                    className={`dropdown-item ${location.pathname === '/user-list' ? 'active' : ''}`}
                  >
                    User List
                  </button>
                </>
              )}
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
