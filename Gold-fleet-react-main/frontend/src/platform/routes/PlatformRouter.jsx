import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PlatformProtectedRoute from './PlatformProtectedRoute';
import PlatformLayout from '../layout/PlatformLayout';
import PlatformLogin from '../pages/PlatformLogin';
import PlatformSignup from '../pages/PlatformSignup';
import PlatformDashboard from '../pages/PlatformDashboard';
import PlatformAnalytics from '../pages/PlatformAnalytics';
import PlatformCompanies from '../pages/PlatformCompanies';
import PlatformSubscriptions from '../pages/PlatformSubscriptions';
import PlatformMessages from '../pages/PlatformMessages';
import PlatformSettings from '../pages/PlatformSettings';
import PaymentManagement from '../pages/PaymentManagement';

/**
 * Platform Router
 * All /platform/* routes registered here ONLY
 * Completely isolated from main application routes
 * Does NOT modify existing routes or auth system
 */
export default function PlatformRouter() {
  return (
    <Routes>
      {/* Public Platform Routes */}
      <Route path="platform/login" element={<PlatformLogin />} />
      <Route path="platform/signup" element={<PlatformSignup />} />

      {/* Protected Platform Routes */}
      <Route
        path="platform/*"
        element={
          <PlatformProtectedRoute>
            <PlatformLayout>
              <Routes>
                <Route path="dashboard" element={<PlatformDashboard />} />
                <Route path="analytics" element={<PlatformAnalytics />} />
                <Route path="companies" element={<PlatformCompanies />} />
                <Route path="subscriptions" element={<PlatformSubscriptions />} />
                <Route path="payments" element={<PaymentManagement />} />
                <Route path="messages" element={<PlatformMessages />} />
                <Route path="settings" element={<PlatformSettings />} />

                {/* Default redirect to platform dashboard */}
                <Route path="/" element={<Navigate to="/platform/dashboard" replace />} />
              </Routes>
            </PlatformLayout>
          </PlatformProtectedRoute>
        }
      />
    </Routes>
  );
}

