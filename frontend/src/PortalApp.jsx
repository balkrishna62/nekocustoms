import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PortalLogin from './pages/portal/PortalLogin';
import PortalLayout from './pages/portal/PortalLayout';
import TaskManagement from './pages/portal/TaskManagement';
import ChatApp from './pages/portal/ChatApp';
import UserManagement from './pages/portal/UserManagement';
import PortalDashboard from './pages/portal/PortalDashboard';
import SiteAdministration from './pages/portal/SiteAdministration';
import WorkloadTracker from './pages/portal/WorkloadTracker';

// A simple hook to check auth status
const useAuth = () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  let user = null;
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch(e) {}
  }
  return { isAuthenticated: !!token, user };
};

const PortalProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
     return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default function PortalApp() {
  return (
    <div className="portal-app">
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<PortalLogin />} />
          
          <Route path="/dashboard" element={
            <PortalProtectedRoute>
              <PortalLayout />
            </PortalProtectedRoute>
          }>
            <Route index element={<PortalDashboard />} />
            <Route path="tasks" element={<TaskManagement />} />
            <Route path="chat" element={<ChatApp />} />
            <Route path="users" element={
              <PortalProtectedRoute requiredRole="admin">
                <UserManagement />
              </PortalProtectedRoute>
            } />
            <Route path="site" element={
              <PortalProtectedRoute requiredRole="manager">
                <SiteAdministration />
              </PortalProtectedRoute>
            } />
            <Route path="workload" element={
              <PortalProtectedRoute requiredRole="manager">
                <WorkloadTracker />
              </PortalProtectedRoute>
            } />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}
