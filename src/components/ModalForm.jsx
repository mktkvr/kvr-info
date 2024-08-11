import React, { useState, useEffect } from 'react';
import './Modal.css';

const ModalForm = ({ onSubmit, onClose, editIndex }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [imgSrc, setImgSrc] = useState('');
  const [type, setType] = useState('App'); // Default type

  useEffect(() => {
    if (editIndex !== null) {
      // Populate form fields with existing data when editing
      const app = /* Get the app from props or context */
      setName(app.name);
      setUrl(app.url);
      setImgSrc(app.imgSrc);
      setType(app.type || 'App');
    }
  }, [editIndex]);

  const handleTypeChange = (newType) => {
    setType(newType);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(name, url, imgSrc, type);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{editIndex !== null ? 'Edit Link' : 'Add Link'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              id="name" 
              placeholder=" " 
              required 
            />
            <label htmlFor="name">Name:</label>
          </div>
          <div className="input-group">
            <input 
              type="url" 
              value={url} 
              onChange={(e) => setUrl(e.target.value)} 
              id="url" 
              placeholder=" " 
              required 
            />
            <label htmlFor="url">URL:</label>
          </div>
          <div className="input-group">
            <input 
              type="url" 
              value={imgSrc} 
              onChange={(e) => setImgSrc(e.target.value)} 
              id="imgSrc" 
              placeholder=" " 
              required 
            />
            <label htmlFor="imgSrc">Image URL:</label>
          </div>
          <div className="type-selection">
            <button 
              type="button" 
              className={`type-button ${type === 'App' ? 'active' : ''}`}
              onClick={() => handleTypeChange('App')}
            >
              App
            </button>
            <button 
              type="button" 
              className={`type-button ${type === 'Report' ? 'active' : ''}`}
              onClick={() => handleTypeChange('Report')}
            >
              Report
            </button>
          </div>
          <div className="modal-buttons">
            <button type="submit" className="submit-button">
              {editIndex !== null ? 'Save Changes' : 'Add Link'}
            </button>
            <button type="button" onClick={onClose} className="close-button">
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalForm;
