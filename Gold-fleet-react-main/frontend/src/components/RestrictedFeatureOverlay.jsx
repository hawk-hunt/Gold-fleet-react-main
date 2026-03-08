import React from 'react';
import { FaLock } from 'react-icons/fa';

/**
 * RestrictedFeatureOverlay Component
 * 
 * Shows a lock overlay on features that are restricted due to pending company approval.
 * Used to disable access to fleet management and reporting features.
 */
export default function RestrictedFeatureOverlay({ isRestricted, children, featureName = 'This feature' }) {
  if (!isRestricted) {
    return children;
  }

  return (
    <div className="relative">
      <div className="opacity-50">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 bg-opacity-30 rounded-lg">
        <FaLock className="text-white text-4xl mb-2" />
        <p className="text-white text-center font-semibold text-sm px-4">
          {featureName} is locked
        </p>
        <p className="text-white text-center text-xs px-4 mt-1">
          Your company is pending approval. This will be available soon.
        </p>
      </div>
    </div>
  );
}
