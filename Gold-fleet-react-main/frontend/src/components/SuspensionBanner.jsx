import React from 'react';
import { FaExclamationTriangle, FaLink } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

/**
 * SuspensionBanner Component
 * 
 * Shows when a company's subscription has been suspended.
 * Displays information about suspension and what to do next.
 */
export default function SuspensionBanner({ subscriptionStatus }) {
  const navigate = useNavigate();
  
  // Only show banner if subscription is suspended
  if (subscriptionStatus !== 'suspended') {
    return null;
  }

  return (
    <div className="w-full bg-red-50 border-l-4 border-red-500 p-6 mb-6 rounded-lg shadow-md">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <FaExclamationTriangle className="h-6 w-6 text-red-600 mt-0.5" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-red-900 mb-2">
            ⚠️ Subscription Suspended
          </h3>
          <div className="mt-3 text-sm text-red-800 space-y-2">
            <p>
              Your subscription has been suspended. You can still manage your fleet, but <span className="font-semibold">live tracking and reporting features are currently unavailable.</span>
            </p>
            <p className="mt-3">
              To resume your subscription, please visit your <span className="font-semibold">Billing & Plans</span> section or contact support for assistance.
            </p>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => navigate('/company-settings')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              <FaLink className="text-sm" />
              Go to Company Settings
            </button>
            <a
              href="mailto:support@goldfleet.com"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-red-600 text-red-600 hover:bg-red-50 font-semibold rounded-lg transition-colors duration-200"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
