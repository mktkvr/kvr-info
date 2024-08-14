import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../db/firebaseConfig';
import * as XLSX from 'xlsx';
import './UserListPage.css';

const UserListPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users");
        const querySnapshot = await getDocs(usersCollection);
        const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersList);

        // Extract provinces from users data for the dropdown
        const allProvinces = [...new Set(usersList.map(user => user.address?.province).filter(Boolean))];
        setProvinces(allProvinces);
      } catch (error) {
        console.error("Error fetching users: ", error);
        setError('An error occurred while fetching users.');
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedProvince === '') {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter(user => user.address?.province === selectedProvince));
    }
  }, [selectedProvince, users]);

  const exportToExcel = () => {
    const formattedUsers = filteredUsers.map(user => ({
      id: user.id,
      name: user.name,
      username: user.username,
      phone: user.phone,
      userType: user.userType,
      address: user.address?.address || 'N/A',
      subdistrict: user.address?.subdistrict || 'N/A',
      district: user.address?.district || 'N/A',
      province: user.address?.province || 'N/A',
      zipCode: user.address?.zipCode || 'N/A',
    }));

    const ws = XLSX.utils.json_to_sheet(formattedUsers, {
      header: ["id", "name", "username", "phone", "userType", "address", "subdistrict", "district", "province", "zipCode"],
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "UserList.xlsx");
  };

  return (
    <div className="user-list-container">
      <h2>User List</h2>
      {error && <div className="error-message">{error}</div>}
      <div className="filter-section">
        <label htmlFor="province-filter">Filter by Province:</label>
        <select
          id="province-filter"
          value={selectedProvince}
          onChange={(e) => setSelectedProvince(e.target.value)}
        >
          <option value="">All Provinces</option>
          {provinces.map((province, index) => (
            <option key={index} value={province}>
              {province}
            </option>
          ))}
        </select>
      </div>
      <button className="export-button" onClick={exportToExcel}>
        Export to Excel
      </button>
      {filteredUsers.length > 0 ? (
        <table className="user-list-table">
          <thead>
            <tr>
              {/* <th>ID</th> */}
              <th>Name</th>
              <th>Username</th>
              <th>Phone</th>
              <th>User Type</th>
              <th>Address</th>
              <th>Subdistrict</th>
              <th>District</th>
              <th>Province</th>
              <th>ZipCode</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                {/* <td>{user.id}</td> */}
                <td>{user.name}</td>
                <td>{user.username}</td>
                <td>{user.phone}</td>
                <td>{user.userType}</td>
                <td>{user.address?.address || 'N/A'}</td>
                <td>{user.address?.subdistrict || 'N/A'}</td>
                <td>{user.address?.district || 'N/A'}</td>
                <td>{user.address?.province || 'N/A'}</td>
                <td>{user.address?.zipCode || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No users found.</p>
      )}
    </div>
  );
};

export default UserListPage;
