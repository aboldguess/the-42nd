import React, { useContext, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeContext } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import WelcomePage from './pages/WelcomePage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import QuestionPage from './pages/QuestionPage';
import QuestionPlayPage from './pages/QuestionPlayPage';
import SideQuestDetailPage from './pages/SideQuestDetailPage';
import ProfilePage from './pages/ProfilePage';
import PlayerProfilePage from './pages/PlayerProfilePage';
import TeamProfilePage from './pages/TeamProfilePage';
import PlayersPage from './pages/PlayersPage';
import TeamsPage from './pages/TeamsPage';
import SideQuestPage from './pages/SideQuestPage';
import RoguesGalleryPage from './pages/RoguesGalleryPage';
import InfoPage from './pages/InfoPage';
import HelpPage from './pages/HelpPage';
import ScoreboardPage from './pages/ScoreboardPage';
import ClueStatusPage from './pages/ClueStatusPage';
import QuestionStatusPage from './pages/QuestionStatusPage';
import SideQuestStatusPage from './pages/SideQuestStatusPage';
import NewSideQuestPage from './pages/NewSideQuestPage';
import CreateSideQuestPage from './pages/CreateSideQuestPage';
import SideQuestEditPage from './pages/SideQuestEditPage';
import SideQuestSubmissionsPage from './pages/SideQuestSubmissionsPage';
import MySideQuestSubmissionPage from './pages/MySideQuestSubmissionPage';
import AdminCluesPage from './pages/AdminCluesPage';
import AdminQuestionsPage from './pages/AdminQuestionsPage';
import AdminSideQuestsPage from './pages/AdminSideQuestsPage';
import AdminPlayersPage from './pages/AdminPlayersPage';
import AdminTeamsPage from './pages/AdminTeamsPage';
import AdminGalleryPage from './pages/AdminGalleryPage';
import AdminSettingsPage from './pages/AdminSettingsPage';

import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import QrScanButton from './components/QrScanButton';
import InstallPrompt from './components/InstallPrompt';
import NotificationHandler from './components/NotificationHandler';

// Guard for regular users
const AuthRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const location = window.location.pathname + window.location.search;
  return token ? children : <Navigate to={`/?next=${encodeURIComponent(location)}`} replace />;
};

// Guard for admin users
const AdminRoute = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken');
  return adminToken ? children : <Navigate to="/admin/login" replace />;
};

export default function App() {
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    // Trigger the browser's native permission prompt for notifications
    // the first time a user visits the app.
    if (
      typeof Notification !== 'undefined' &&
      Notification.permission === 'default'
    ) {
      Notification.requestPermission().catch((err) => {
        console.error('Notification permission request failed', err);
      });
    }
  }, []);

  return (
    <div
      className="app-container"
      style={{
        '--primary-color': theme.primary,
        '--secondary-color': theme.secondary,
        '--font-family': theme.fontFamily
      }}
    >
      <BrowserRouter>
        <Navbar />
        <div className="main-layout">
          <Sidebar />
          <div className="content">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<WelcomePage />} />
              <Route path="/signup" element={<SignupPage />} />
              {/* In-app documentation accessible without logging in */}
              <Route path="/help" element={<HelpPage />} />

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
                path="/clue/:clueId"
                element={
                  <AuthRoute>
                    <QuestionPage />
                  </AuthRoute>
                }
              />
              <Route
                path="/question/:id"
                element={
                  <AuthRoute>
                    <QuestionPlayPage />
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
                path="/player/:id"
                element={
                  <AuthRoute>
                    <PlayerProfilePage />
                  </AuthRoute>
                }
              />
              <Route
                path="/team/:id"
                element={
                  <AuthRoute>
                    <TeamProfilePage />
                  </AuthRoute>
                }
              />
              <Route
                path="/players"
                element={
                  <AuthRoute>
                    <PlayersPage />
                  </AuthRoute>
                }
              />
              <Route
                path="/teams"
                element={
                  <AuthRoute>
                    <TeamsPage />
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
                path="/sidequest/:id"
                element={
                  <AuthRoute>
                    <SideQuestDetailPage />
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
                path="/progress/clues"
                element={
                  <AuthRoute>
                    <ClueStatusPage />
                  </AuthRoute>
                }
              />
              <Route
                path="/progress/questions"
                element={
                  <AuthRoute>
                    <QuestionStatusPage />
                  </AuthRoute>
                }
              />
              <Route
                path="/progress/sidequests"
                element={
                  <AuthRoute>
                    <SideQuestStatusPage />
                  </AuthRoute>
                }
              />
              <Route
                path="/sidequests/new"
                element={
                  <AuthRoute>
                    <NewSideQuestPage />
                  </AuthRoute>
                }
              />
              <Route
                path="/sidequests/create"
                element={
                  <AuthRoute>
                    <CreateSideQuestPage />
                  </AuthRoute>
                }
              />
              <Route
                path="/sidequests/:id/edit"
                element={
                  <AuthRoute>
                    <SideQuestEditPage />
                  </AuthRoute>
                }
              />
              <Route
                path="/sidequests/:id/submissions"
                element={
                  <AuthRoute>
                    <SideQuestSubmissionsPage />
                  </AuthRoute>
                }
              />
              <Route
                path="/sidequests/:id/my-submission"
                element={
                  <AuthRoute>
                    <MySideQuestSubmissionPage />
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
              <Route
                path="/admin/teams"
                element={
                  <AdminRoute>
                    <AdminTeamsPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/gallery"
                element={
                  <AdminRoute>
                    <AdminGalleryPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <AdminRoute>
                    <AdminSettingsPage />
                  </AdminRoute>
                }
              />

              {/* 404 */}
              <Route path="*" element={<h2>404: Page Not Found</h2>} />
            </Routes>
          </div>
        </div>
        {/* Floating utilities shown on all pages */}
        <InstallPrompt />
        <QrScanButton />
        {/* Mark notifications as read based on the URL */}
        <NotificationHandler />
      </BrowserRouter>
    </div>
  );
}
