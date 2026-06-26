import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Import Pages
import LoginPage from '../pages/auth/LoginPage';
import SignUpPage from '../pages/auth/SignUpPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import EmailVerificationPage from '../pages/auth/EmailVerificationPage';

import DashboardPage from '../pages/DashboardPage';
import TodoPage from '../pages/TodoPage';
import CalendarPage from '../pages/CalendarPage';
import EventTimelinePage from '../pages/EventTimelinePage';
import FocusModePage from '../pages/FocusModePage';
import PomodoroPage from '../pages/PomodoroPage';
import JournalPage from '../pages/JournalPage';
import ProfilePage from '../pages/ProfilePage';

// Import Layout
import AppLayout from '../components/layout/AppLayout';

// Guard components
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-email" element={<EmailVerificationPage />} />

      {/* Protected Routes wrapped in AppLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="todo" element={<TodoPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="timeline" element={<EventTimelinePage />} />
        <Route path="focus" element={<FocusModePage />} />
        <Route path="pomodoro" element={<PomodoroPage />} />
        <Route path="journal" element={<JournalPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
