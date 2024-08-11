// components/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebaseConfig'; // Import Firebase config
import { collection, query, where, getDocs } from 'firebase/firestore';
import './Auth.css'; // Import the CSS file

const LoginPage = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to homepage if already logged in
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
      navigate('/'); // Redirect to homepage or another page
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const usersCollection = collection(db, "users"); // Replace with your collection name
      const q = query(usersCollection, where("username", "==", username), where("password", "==", password));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // No matching documents found
        setError('Please enter valid credentials.');
      } else {
        // Successful login
        localStorage.setItem('loggedInUser', username); // Store username in local storage
        setError('');
        onLoginSuccess(); // Notify parent component of successful login
        navigate('/app'); // Redirect to the homepage or dashboard
      }
    } catch (error) {
      console.error("Error logging in: ", error);
      setError('An error occurred. Please try again.');
    }
  };

  const handleRegisterClick = () => {
    navigate('/register'); // Navigate to the register page
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleLogin}>
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
        <button type="submit" className="auth-button">Login</button>
        <button type="button" className="register-button" onClick={handleRegisterClick}>Register</button>
      </form>
    </div>
  );
};

export default LoginPage;
