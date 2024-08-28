import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import LoginPage from './components/login&register/LoginPage';
import RegisterPage from './components//login&register/RegisterPage';
import ProfilePage from './components/profile/ProfilePage';
import Navbar from './components/Navbar';
import AdminPage from './components/admin/AdminPage';
import UserListPage from './components/admin/user/UserListPage';
import OCRPage from './components/other/OCRPage';
import UploadPage from './components/admin/applink/UploadPage';
import ImageListPage from './components/applink/ImageListPage';
import { db } from './components/db/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import AppDisplay from './components/applink/AppDisplay';
import ProtectedRoute from './components/ProtectedRoute';
import CoverSheetPage from './components/other/CoverSheetPage';
import Footer from './components/Footer';
import PdfToTextPage from './components/other/pages/PdfToTextPage';
import './App.css';
import NotePage from './components/note/NotePage';

// Create a component to manage route saving
const RouteManager = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Save the current route to local storage
    localStorage.setItem('savedRoute', location.pathname);
  }, [location]);

  useEffect(() => {
    // Redirect to the saved route on component mount
    const savedRoute = localStorage.getItem('savedRoute');
    if (savedRoute) {
      navigate(savedRoute);
      localStorage.removeItem('savedRoute');
    }
  }, [navigate]);

  return children;
};

const App = () => {
  const [apps, setApps] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchApps = async () => {
      const querySnapshot = await getDocs(collection(db, "apps"));
      const appsData = [];
      querySnapshot.forEach((doc) => {
        appsData.push({ ...doc.data(), id: doc.id });
      });
      setApps(appsData);
    };

    fetchApps();

    // Check if the user is logged in and if they are an admin
    const loggedInUser = localStorage.getItem('loggedInUser');
    const userType = sessionStorage.getItem('userType');
    if (loggedInUser) {
      setIsLoggedIn(true);
      if (userType === 'admin') {
        setIsAdmin(true);
      }
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    const userType = sessionStorage.getItem('userType'); // Check user type from sessionStorage
    if (userType === 'admin') {
      setIsAdmin(true);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    localStorage.removeItem('loggedInUser'); // Clear logged-in user data
    sessionStorage.removeItem('userType'); // Clear user type
  };

  const handleHomeClick = () => {
    setIsAdmin(false);
  };

  const handleAdminModeClick = () => {
    setIsAdmin(true);
  };

  // Group apps by type
  const groupedApps = apps.reduce((acc, app) => {
    if (!acc[app.type]) {
      acc[app.type] = [];
    }
    acc[app.type].push(app);
    return acc;
  }, {});

  return (
    <Router>
      <RouteManager>
        <div className="App">
          {isLoggedIn && (
            <Navbar
              onHomeClick={handleHomeClick}
              onAdminModeClick={handleAdminModeClick}
              onLogout={handleLogout}
            />
          )}
          <Routes>
            <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/user-list" element={<UserListPage />} />
            <Route path="/cover-sheet" element={<CoverSheetPage />} />
            <Route path="/pdf-to-text" element={<PdfToTextPage />} />
            <Route path="/notes" element={<NotePage />} />
            <Route path="/app" element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <AppDisplay groupedApps={groupedApps} />
              </ProtectedRoute>
            } />
            <Route path="/ocr" element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <OCRPage />
              </ProtectedRoute>
            } />
            <Route path="/upload" element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <UploadPage />
              </ProtectedRoute>
            } />
            <Route path="/view-slips" element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <ImageListPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <ProfilePage onLogout={handleLogout} />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <AdminPage setApps={setApps} />
              </ProtectedRoute>
            } />
          </Routes>
          <Footer />
        </div>
      </RouteManager>
    </Router>
  );
};

export default App;
