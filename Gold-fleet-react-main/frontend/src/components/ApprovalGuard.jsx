import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ApprovalGuard Component
 * 
 * Wraps routes that require company approval.
 * If company is not approved, redirects to /dashboard/pending-approval
 * Polls for status updates every 5 seconds to detect approval changes
 */
export const ApprovalGuard = ({ children }) => {
  const { company, loading, isInitialized, refreshAuth } = useAuth();
  const [isApproved, setIsApproved] = useState(null);
  const [pollInterval, setPollInterval] = useState(null);

  // Set up polling when company is not approved
  useEffect(() => {
    if (!company || isApproved === null) return;

    if (!isApproved) {
      // Company is not approved - start polling for updates
      console.log('[ApprovalGuard] Company not approved. Starting to poll for approval updates...');
      
      const interval = setInterval(async () => {
        const refreshed = await refreshAuth();
        if (refreshed) {
          console.log('[ApprovalGuard] Auth state refreshed. Checking approval status...');
        }
      }, 5000); // Poll every 5 seconds

      setPollInterval(interval);

      // Cleanup polling when component unmounts or approval changes
      return () => {
        if (interval) {
          clearInterval(interval);
          console.log('[ApprovalGuard] Stopping approval polling');
        }
      };
    } else {
      // Company is approved - stop polling
      if (pollInterval) {
        clearInterval(pollInterval);
        setPollInterval(null);
        console.log('[ApprovalGuard] Company approved! Stopped polling');
      }
    }
  }, [isApproved, company, refreshAuth]);

  useEffect(() => {
    if (!loading && isInitialized && company) {
      // Check if company is approved for fleet features
      // Allow access if company is approved AND subscription is active OR suspended
      // (users should still be able to manage fleet during suspension)
      const approved = company.company_status === 'approved' && 
                       (company.subscription_status === 'active' || company.subscription_status === 'suspended');
      setIsApproved(approved);
    }
  }, [company, loading, isInitialized]);

  // Still loading auth
  if (loading || !isInitialized || isApproved === null) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // User not authenticated
  if (!company) {
    return <Navigate to="/login" replace />;
  }

  // Company is pending approval - redirect to pending approval page
  if (!isApproved) {
    return <Navigate to="/dashboard/pending-approval" replace />;
  }

  // Company is approved - allow access
  return children;
};

export default ApprovalGuard;
