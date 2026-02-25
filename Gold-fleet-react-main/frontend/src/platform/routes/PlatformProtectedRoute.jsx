import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Platform Protected Route
 * Checks ONLY for platformToken (NOT authToken)
 * Completely isolated from main auth system
 */
export default function PlatformProtectedRoute({ children }) {
  const platformToken = sessionStorage.getItem('platformToken');

  if (!platformToken) {
    return <Navigate to="/platform/login" replace />;
  }

  return children;
}
