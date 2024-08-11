// src/components/DeleteConfirmationModal.js
import React from 'react';
import './Modal.css';

const DeleteConfirmationModal = ({ onConfirm, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Confirm Deletion</h2>
        <p>Are you sure you want to delete this link?</p>
        <div className="modal-buttons">
          <button 
            type="button" 
            onClick={onConfirm} 
            className="confirm-button"
          >
            Confirm
          </button>
          <button 
            type="button" 
            onClick={onClose} 
            className="close-button"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
