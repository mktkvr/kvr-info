// components/AdminPage.jsx
import React, { useState, useEffect } from 'react';
import './AdminPage.css';
import EditModal from './EditModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ModalForm from './ModalForm';
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

const AdminPage = ({ setApps }) => {
  const [editIndex, setEditIndex] = useState(null);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appToDelete, setAppToDelete] = useState(null);
  const [showModalForm, setShowModalForm] = useState(false);
  const [apps, setAppsLocal] = useState([]);

  const fetchApps = async () => {
    const querySnapshot = await getDocs(collection(db, "apps"));
    const appsData = [];
    querySnapshot.forEach((doc) => {
      appsData.push({ ...doc.data(), id: doc.id });
    });
    setApps(appsData);
    setAppsLocal(appsData);
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

      if (editIndex !== null) {
        // Edit existing link
        const appDoc = doc(db, "apps", apps[editIndex].id);
        await updateDoc(appDoc, { name, url, imgSrc, type });
      } else {
        // Add new link
        const newApp = { name, url, imgSrc, type };
        await addDoc(collection(db, "apps"), newApp);
      }
      setShowModalForm(false);
      setEditIndex(null);  // Reset editIndex after submit
      fetchApps(); // Fetch updated data
    }
  };

  const handleAddLink = () => {
    setEditIndex(null);  // Reset editIndex to create new link
    setShowModalForm(true);  // Show ModalForm
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
    const appDoc = doc(db, "apps", apps[editIndex].id);
    await updateDoc(appDoc, updatedApp);
    setShowEditModal(false);
    fetchApps(); // Fetch updated data
  };

  const handleConfirmDelete = async () => {
    const appDoc = doc(db, "apps", apps[appToDelete].id);
    await deleteDoc(appDoc);
    setShowDeleteModal(false);
    setAppToDelete(null);
    fetchApps(); // Fetch updated data
  };

  // Separate apps by type
  const appsByType = apps.reduce((acc, app) => {
    if (!acc[app.type]) {
      acc[app.type] = [];
    }
    acc[app.type].push(app);
    return acc;
  }, {});

  return (
    <div className="admin-page">
      <h1>Admin Page</h1>
      <button onClick={handleAddLink} className="add-link-button">Add Link</button>

      {Object.keys(appsByType).map(type => (
        <div key={type} className={`app-list ${type.toLowerCase()}-list`}>
          <h2>{type} Links</h2>
          {appsByType[type].length > 0 ? (
            appsByType[type].map((app, index) => (
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
      ))}

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
