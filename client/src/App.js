import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeContext } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import QuestionPage from './pages/QuestionPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import SideQuestPage from './pages/SideQuestPage';
import RoguesGalleryPage from './pages/RoguesGalleryPage';
import InfoPage from './pages/InfoPage';


const isAuthenticated = () => !!localStorage.getItem('token');

function App() {
  const { theme } = useContext(ThemeContext);

  return (
    <div style={{
      '--primary-color': theme.primary,
      '--secondary-color': theme.secondary
    }} className="app-container"
    >
      <BrowserRouter>
        <Navbar />
        <div className="main-layout">
          <Sidebar />
          <div className="content">
            <Routes>
              <Route path="/" element={<WelcomePage />} />
              <Route path="/login" element={isAuthenticated() ? <Navigate to="/dashboard" /> : <LoginPage />} />
              <Route path="/register" element={isAuthenticated() ? <Navigate to="/dashboard" /> : <RegisterPage />} />
              <Route
                path="/dashboard"
                element={isAuthenticated() ? <Dashboard /> : <Navigate to="/login" />}
              />
              <Route
                path="/clue/:clueId"
                element={isAuthenticated() ? <QuestionPage /> : <Navigate to="/login" />}
              />
              <Route
                path="/profile"
                element={isAuthenticated() ? <ProfilePage /> : <Navigate to="/login" />}
              />
              <Route
                path="/sidequests"
                element={isAuthenticated() ? <SideQuestPage /> : <Navigate to="/login" />}
              />
              <Route
                path="/roguery"
                element={<RoguesGalleryPage />}
              />
              <Route
                path="/info/:infoId"
                element={<InfoPage />}
              />
              <Route
                path="/admin"
                element={isAuthenticated() ? <AdminPage /> : <Navigate to="/login" />}
              />
              <Route path="*" element={<h2>404: Page Not Found</h2>} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
