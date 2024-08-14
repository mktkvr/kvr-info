// src/components/AppLink.js
import React from 'react';
import './AppLink.css';

const AppLink = ({ name, url, imgSrc, type }) => {
  return (
    <div className="app-link">
      <a href={url} target="_blank" rel="noopener noreferrer">
        <img src={imgSrc} alt={`${name} logo`} className="app-img" />
        <div className="app-text">
          <span className="app-name">{name}</span> {/* App Name */}
          {type && <span className="app-type">{type}</span>} {/* App Type */}
        </div>
      </a>
    </div>
  );
};

export default AppLink;
