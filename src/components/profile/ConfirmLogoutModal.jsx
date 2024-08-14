// ConfirmLogoutModal.jsx
import React from 'react';
import './ConfirmLogoutModal.css';

const ConfirmLogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Confirm Logout</h2>
        <p>Are you sure you want to log out?</p>
        <div className="modal-buttons">
          <button onClick={onConfirm} className="modal-button confirm">Yes</button>
          <button onClick={onClose} className="modal-button cancel">No</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmLogoutModal;
