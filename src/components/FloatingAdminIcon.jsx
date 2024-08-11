// components/FloatingAdminIcon.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './FloatingAdminIcon.css'; // Import the CSS file for styling

const FloatingAdminIcon = () => {
  const navigate = useNavigate();
  const userType = localStorage.getItem('userType');

  if (userType !== 'admin') {
    return null; // Do not render if the user is not an admin
  }

  const handleClick = () => {
    navigate('/admin'); // Navigate to the admin page
  };

  return (
    <div className="floating-admin-icon" onClick={handleClick}>
      🐻‍❄️
    </div>
  );
};

export default FloatingAdminIcon;
