// ProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebaseConfig';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import AddressModal from './AddressModal';
import ConfirmationModal from './ConfirmationModal';
import './ProfilePage.css';

const ProfilePage = ({ onLogout }) => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addressData, setAddressData] = useState(null);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const username = localStorage.getItem('loggedInUser');
      if (!username) {
        setError('No user is logged in.');
        return;
      }

      try {
        const usersCollection = collection(db, "users");
        const q = query(usersCollection, where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError('User not found.');
        } else {
          const userDoc = querySnapshot.docs[0].data();
          setUserData(userDoc);
          setError('');
          sessionStorage.setItem('userType', userDoc.userType);
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
        setError('An error occurred while fetching user data.');
      }
    };

    fetchUserData();
  }, []);

  const handleAddAddress = async (address) => {
    const username = localStorage.getItem('loggedInUser');
    if (!username) return;

    try {
      const usersCollection = collection(db, "users");
      const q = query(usersCollection, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDocRef = doc(db, "users", querySnapshot.docs[0].id);
        await updateDoc(userDocRef, { address });
        setUserData(prev => ({ ...prev, address }));
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error adding address: ", error);
    }
  };

  const handleEditAddress = async (address) => {
    const username = localStorage.getItem('loggedInUser');
    if (!username) return;

    try {
      const usersCollection = collection(db, "users");
      const q = query(usersCollection, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDocRef = doc(db, "users", querySnapshot.docs[0].id);
        await updateDoc(userDocRef, { address });
        setUserData(prev => ({ ...prev, address }));
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error editing address: ", error);
    }
  };

  const handleDeleteAddress = async () => {
    const username = localStorage.getItem('loggedInUser');
    if (!username) return;

    try {
      const usersCollection = collection(db, "users");
      const q = query(usersCollection, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDocRef = doc(db, "users", querySnapshot.docs[0].id);
        await updateDoc(userDocRef, { address: null });
        setUserData(prev => ({ ...prev, address: null }));
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error deleting address: ", error);
    }
  };

  const handleLogout = () => {
    setActionToConfirm('logout');
    setIsConfirmationModalOpen(true);
  };

  const confirmAction = async () => {
    if (actionToConfirm === 'logout') {
      onLogout();
      navigate('/login');
    } else if (actionToConfirm === 'delete') {
      await handleDeleteAddress();
    }
    setIsConfirmationModalOpen(false);
  };

  const openAddAddressModal = () => {
    setAddressData(null);
    setIsModalOpen(true);
  };

  const openEditAddressModal = (address) => {
    setAddressData(address);
    setIsModalOpen(true);
  };

  const openDeleteAddressModal = () => {
    setActionToConfirm('delete');
    setIsConfirmationModalOpen(true);
  };

  const navigateToAdminPage = () => {
    navigate('/admin');
  };

  const navigateToUserList = () => {
    navigate('/user-list'); // Navigate to the User List page
  };

  const navigateToCoverSheet = () => {
    navigate('/cover-sheet'); // Navigate to the Cover Sheet page
  };

  return (
    <div className="profile-container">
      <div className="nav-tabs">
        <div className="profile-info">
          <h2>Profile</h2>
          {error && <div className="error-message">{error}</div>}
          {userData ? (
            <div>
              <p><strong>Name:</strong> {userData.name}</p>
              <p><strong>Username:</strong> {userData.username}</p>
              <p><strong>Phone:</strong> {userData.phone}</p>
              <p><strong>UserType:</strong> {userData.userType}</p>
              {userData.address && (
                <div>
                  <h3>Address:</h3>
                  <p>{userData.address.address}, {userData.address.subdistrict}, {userData.address.district}, {userData.address.province}, {userData.address.postalCode}</p>
                  <button onClick={() => openEditAddressModal(userData.address)} className="edit-address-button">Edit Address</button>
                  <button onClick={openDeleteAddressModal} className="delete-address-button">Delete Address</button>
                </div>
              )}
              {!userData.address && (
                <button onClick={openAddAddressModal} className="add-address-button">Add Address</button>
              )}
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </div>
        <div className="admin-buttons">
          <div className="buttons-container">
            <button onClick={handleLogout} className="modal-button logout-button">Logout</button>
            {userData && userData.userType === 'admin' && (
              <>
                <button onClick={navigateToAdminPage} className="goto-admin-button">Go to Admin Page</button>
                <button onClick={navigateToUserList} className="view-user-list-button">View User List</button>
              </>
            )}
            <button onClick={navigateToCoverSheet} className="cover-sheet-button">Cover Page</button> {/* Added Button */}
          </div>
        </div>
      </div>

      <AddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddAddress={handleAddAddress}
        addressData={addressData}
        onEditAddress={handleEditAddress}
      />

      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onConfirm={confirmAction}
        onCancel={() => setIsConfirmationModalOpen(false)}
        message={actionToConfirm === 'logout' ? 'Are you sure you want to logout?' : 'Are you sure you want to delete this address?'}
      />
    </div>
  );
};

export default ProfilePage;
