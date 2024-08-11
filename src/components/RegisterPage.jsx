// components/RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebaseConfig';
import { collection, setDoc, doc, query, where, getDocs } from 'firebase/firestore';
import './Auth.css';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState('user');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name || !username || !password || !phone) {
      setError('All fields are required.');
      return;
    }

    try {
      const usersCollection = collection(db, "users");
      const q = query(usersCollection, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setError('Username already exists. Please choose another one.');
        return;
      }

      // Use the username as the document ID
      const userDocRef = doc(db, "users", username);
      await setDoc(userDocRef, {
        name,
        username,
        password,
        phone,
        userType
      });

      setSuccess('Registration successful! You can now log in.');
      setError('');
      setName('');
      setUsername('');
      setPassword('');
      setPhone('');
      setUserType('user');

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error("Error registering user: ", error);
      setError('An error occurred. Please try again.');
      setSuccess('');
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <form onSubmit={handleRegister}>
        <div className="form-group">
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder=" "
          />
          <label htmlFor="name">Name</label>
        </div>
        <div className="form-group">
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder=" "
          />
          <label htmlFor="username">Username</label>
        </div>
        <div className="form-group">
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder=" "
          />
          <label htmlFor="password">Password</label>
        </div>
        <div className="form-group">
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            placeholder=" "
          />
          <label htmlFor="phone">Phone</label>
        </div>
        <button type="submit" className="auth-button">Register</button>
      </form>
      <button type="button" className="login-button" onClick={handleLoginClick}>
        Already have an account? Login
      </button>
    </div>
  );
};

export default RegisterPage;
