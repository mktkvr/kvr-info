// components/AppDisplay.jsx
import React, { useState } from 'react';
import AppLink from './AppLink';
import './AppDisplay.css';

const AppDisplay = ({ groupedApps }) => {
  const [selectedType, setSelectedType] = useState('All');

  const handleTypeChange = (type) => {
    setSelectedType(type);
  };

  // Filter apps based on the selected type
  const filteredApps = selectedType === 'All'
    ? groupedApps
    : { [selectedType]: groupedApps[selectedType] };

  return (
    <div className="app-display">
      <div className="filter-section-app">
        {['All', ...Object.keys(groupedApps)].map(type => (
          <button
            key={type}
            className={`filter-button ${selectedType === type ? 'active' : ''}`}
            onClick={() => handleTypeChange(type)}
          >
            {type}
          </button>
        ))}
      </div>
      {Object.keys(filteredApps).map(type => (
        <div key={type} className="app-group">
          <h2 className="app-group-title">{type}</h2>
          <div className="app-links-container">
            {filteredApps[type].map(app => (
              <AppLink key={app.id} name={app.name} url={app.url} imgSrc={app.imgSrc} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AppDisplay;
