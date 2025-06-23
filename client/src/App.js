import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeContext } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import OnboardingPage from './pages/OnboardingPage';
import Dashboard from './pages/Dashboard';
import QuestionPage from './pages/QuestionPage';
import ProfilePage from './pages/ProfilePage';
import SideQuestPage from './pages/SideQuestPage';
import RoguesGalleryPage from './pages/RoguesGalleryPage';
import InfoPage from './pages/InfoPage';
import ScoreboardPage from './pages/ScoreboardPage';
import AdminGamesPage from './pages/AdminGamesPage';
import AdminCluesPage from './pages/AdminCluesPage';
import AdminQuestionsPage from './pages/AdminQuestionsPage';
import AdminSideQuestsPage from './pages/AdminSideQuestsPage';
import AdminPlayersPage from './pages/AdminPlayersPage';

import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

// Guard for regular users
const AuthRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" replace />;
};

// Guard for admin users
const AdminRoute = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken');
  return adminToken ? children : <Navigate to="/admin/login" replace />;
};

export default function App() {
  const { theme } = useContext(ThemeContext);

  return (
    <div
      className="app-container"
      style={{
        '--primary-color': theme.primary,
        '--secondary-color': theme.secondary
      }}
    >
      <BrowserRouter>
        <Navbar />
        <div className="main-layout">
          <Sidebar />
          <div className="content">
            <Routes>
              {/* Public Onboarding */}
              <Route path="/" element={<OnboardingPage />} />

              {/* Player routes */}
              <Route
                path="/dashboard"
                element={
                  <AuthRoute>
                    <Dashboard />
                  </AuthRoute>
                }
              />
              <Route
                path="/:slug/clue/:clueId"
                element={
                  <AuthRoute>
                    <QuestionPage />
                  </AuthRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <AuthRoute>
                    <ProfilePage />
                  </AuthRoute>
                }
              />
              <Route
                path="/sidequests"
                element={
                  <AuthRoute>
                    <SideQuestPage />
                  </AuthRoute>
                }
              />
              <Route
                path="/roguery"
                element={
                  <AuthRoute>
                    <RoguesGalleryPage />
                  </AuthRoute>
                }
              />
              <Route
                path="/scoreboard"
                element={
                  <AuthRoute>
                    <ScoreboardPage />
                  </AuthRoute>
                }
              />
              <Route
                path="/info/:infoId"
                element={
                  <AuthRoute>
                    <InfoPage />
                  </AuthRoute>
                }
              />

              {/* Admin Authentication */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Admin Dashboard */}
              <Route
                path="/admin/dashboard"
                element={
                  <AdminRoute>
                    <AdminDashboardPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/games"
                element={
                  <AdminRoute>
                    <AdminGamesPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/clues"
                element={
                  <AdminRoute>
                    <AdminCluesPage />
                  </AdminRoute>
                }
              />
              {/* Manage trivia questions */}
              <Route
                path="/admin/questions"
                element={
                  <AdminRoute>
                    <AdminQuestionsPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/sidequests"
                element={
                  <AdminRoute>
                    <AdminSideQuestsPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/players"
                element={
                  <AdminRoute>
                    <AdminPlayersPage />
                  </AdminRoute>
                }
              />

              {/* 404 */}
              <Route path="*" element={<h2>404: Page Not Found</h2>} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </div>
  );
}
