import React from 'react';
import { FaInfoCircle, FaClock } from 'react-icons/fa';

/**
 * ApprovalBanner Component
 * 
 * Shows when a company's subscription is active but pending admin approval.
 * Displays what features are available and what's restricted.
 */
export default function ApprovalBanner({ companyStatus, subscriptionStatus }) {
  // Only show banner if company is pending approval but has active subscription
  if (companyStatus !== 'pending_approval' || subscriptionStatus !== 'active') {
    return null;
  }

  return (
    <div className="w-full bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <FaClock className="h-5 w-5 text-yellow-400 mt-0.5" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Pending Admin Approval
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p className="mb-2">
              Your subscription is active, but your company account is currently under review by our platform administrators.
            </p>
            <p className="mb-3">
              <strong>Approval usually takes up to 24 hours.</strong>
            </p>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <h4 className="font-semibold text-green-700 mb-1">✓ Available Now:</h4>
                <ul className="text-xs text-yellow-700 space-y-1">
                  <li>• Notifications</li>
                  <li>• Messages</li>
                  <li>• Billing & Profile</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-red-700 mb-1">🔒 Restricted:</h4>
                <ul className="text-xs text-yellow-700 space-y-1">
                  <li>• Vehicles & Drivers</li>
                  <li>• Tracking Map</li>
                  <li>• Reports & Analytics</li>
                  <li>• Fleet Management Tools</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
