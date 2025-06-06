import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeContext } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import OnboardingPage from './pages/OnboardingPage';
import Dashboard from './pages/Dashboard';
import QuestionPage from './pages/QuestionPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import SideQuestPage from './pages/SideQuestPage';
import RoguesGalleryPage from './pages/RoguesGalleryPage';
import InfoPage from './pages/InfoPage';

const AuthRoute = ({ children }) => {
  return localStorage.getItem('token') ? children : <Navigate to="/" />;
};

export default function App() {
  const { theme } = useContext(ThemeContext);

  return (
    <div
      style={{
        '--primary-color': theme.primary,
        '--secondary-color': theme.secondary
      }}
      className="app-container"
    >
      <BrowserRouter>
        <Navbar />
        <div className="main-layout">
          <Sidebar />
          <div className="content">
            <Routes>
              <Route path="/" element={<OnboardingPage />} />
              <Route path="/dashboard" element={<AuthRoute><Dashboard /></AuthRoute>} />
              <Route path="/clue/:clueId" element={<AuthRoute><QuestionPage /></AuthRoute>} />
              <Route path="/profile" element={<AuthRoute><ProfilePage /></AuthRoute>} />
              <Route path="/sidequests" element={<AuthRoute><SideQuestPage /></AuthRoute>} />
              <Route path="/roguery" element={<RoguesGalleryPage />} />
              <Route path="/info/:infoId" element={<InfoPage />} />
              <Route path="/admin" element={<AuthRoute><AdminPage /></AuthRoute>} />
              <Route path="*" element={<h2>404: Page Not Found</h2>} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </div>
  );
}
