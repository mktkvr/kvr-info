import React, { useState, useEffect } from 'react';
import './AdminPage.css';
import EditModal from './EditModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ModalForm from './ModalForm';
import { db } from './firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

const AdminPage = () => {
  const [editIndex, setEditIndex] = useState(null);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appToDelete, setAppToDelete] = useState(null);
  const [showModalForm, setShowModalForm] = useState(false);
  const [apps, setApps] = useState([]);
  const [filter, setFilter] = useState('all'); // State for filtering

  const fetchApps = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "apps"));
      const appsData = [];
      querySnapshot.forEach((doc) => {
        appsData.push({ ...doc.data(), id: doc.id });
      });
      setApps(appsData);
    } catch (error) {
      console.error("Error fetching apps: ", error);
      setError('An error occurred while fetching app links.');
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleModalFormSubmit = async (name, url, imgSrc, type) => {
    if (name && url && imgSrc) {
      if (apps.some(app => app.url === url && editIndex === null)) {
        setError('URL already exists.');
        return;
      } else {
        setError('');
      }

      try {
        if (editIndex !== null) {
          const appDoc = doc(db, "apps", apps[editIndex].id);
          await updateDoc(appDoc, { name, url, imgSrc, type });
        } else {
          const newApp = { name, url, imgSrc, type };
          await addDoc(collection(db, "apps"), newApp);
        }
        setShowModalForm(false);
        setEditIndex(null);
        fetchApps();
      } catch (error) {
        console.error("Error updating app: ", error);
        setError('An error occurred while updating app link.');
      }
    }
  };

  const handleAddLink = () => {
    setEditIndex(null);
    setShowModalForm(true);
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setShowEditModal(true);
  };

  const handleDelete = (index) => {
    setAppToDelete(index);
    setShowDeleteModal(true);
  };

  const handleSaveEdit = async (updatedApp) => {
    try {
      const appDoc = doc(db, "apps", apps[editIndex].id);
      await updateDoc(appDoc, updatedApp);
      setShowEditModal(false);
      fetchApps();
    } catch (error) {
      console.error("Error saving edit: ", error);
      setError('An error occurred while saving the edit.');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const appDoc = doc(db, "apps", apps[appToDelete].id);
      await deleteDoc(appDoc);
      setShowDeleteModal(false);
      setAppToDelete(null);
      fetchApps();
    } catch (error) {
      console.error("Error confirming delete: ", error);
      setError('An error occurred while deleting the app link.');
    }
  };

  // Filtered apps based on the selected filter
  const filteredApps = filter === 'all' ? apps : apps.filter(app => app.type === filter);

  return (
    <div className="admin-page">
      <h1>Admin Page</h1>
      <button onClick={handleAddLink} className="add-link-button">Add Link</button>

      {error && <div className="error-message">{error}</div>}

      <div className="tabs">
        <div 
          className={`tab ${filter === 'all' ? 'active' : ''}`} 
          onClick={() => setFilter('all')}
        >
          All
        </div>
        {[...new Set(apps.map(app => app.type))].map(type => (
          <div 
            key={type} 
            className={`tab ${filter === type ? 'active' : ''}`} 
            onClick={() => setFilter(type)}
          >
            {type}
          </div>
        ))}
      </div>

      <div className="app-list">
        {filteredApps.length > 0 ? (
          filteredApps.map((app, index) => (
            <div key={app.id} className="app-item">
              <img src={app.imgSrc} alt={`${app.name} logo`} className="app-img" />
              <div className="app-details">
                <h3>{app.name}</h3>
                <p>Type: {app.type}</p>
                <p><a href={app.url} target="_blank" rel="noopener noreferrer">View Link</a></p>
                <button onClick={() => handleEdit(index)} className="edit-button">Edit</button>
                <button onClick={() => handleDelete(index)} className="delete-button">Delete</button>
              </div>
            </div>
          ))
        ) : (
          <p>No links available</p>
        )}
      </div>

      {showEditModal && (
        <EditModal 
          app={apps[editIndex]} 
          onSave={handleSaveEdit} 
          onClose={() => setShowEditModal(false)} 
        />
      )}
      {showDeleteModal && (
        <DeleteConfirmationModal 
          onConfirm={handleConfirmDelete} 
          onClose={() => setShowDeleteModal(false)} 
        />
      )}
      {showModalForm && (
        <ModalForm 
          onSubmit={handleModalFormSubmit} 
          onClose={() => setShowModalForm(false)} 
          editIndex={editIndex}
        />
      )}
    </div>
  );
};

export default AdminPage;
