import React, { useState, useEffect } from 'react';
import './Modal.css';

const EditModal = ({ app, onSave, onClose }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [imgSrc, setImgSrc] = useState('');
  const [type, setType] = useState('App'); // Default type

  useEffect(() => {
    if (app) {
      setName(app.name);
      setUrl(app.url);
      setImgSrc(app.imgSrc);
      setType(app.type || 'App');
    }
  }, [app]);

  const handleTypeChange = (newType) => {
    setType(newType);
  };

  const handleSave = () => {
    onSave({ name, url, imgSrc, type });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Link</h2>
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
          <button onClick={handleSave} className="submit-button">Save Changes</button>
          <button onClick={onClose} className="close-button">Close</button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
