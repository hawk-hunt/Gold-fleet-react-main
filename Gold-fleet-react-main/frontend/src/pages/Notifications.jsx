import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaExclamationTriangle, FaInfoCircle, FaCheckCircle, FaClock, FaBell } from 'react-icons/fa';

export default function Notifications() {
  const { company } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Build notifications based on company status
    const notifs = [];

    // Subscription Suspension Notification
    if (company?.subscription_status === 'suspended') {
      notifs.push({
        id: 'suspension-' + Date.now(),
        type: 'warning',
        title: 'Subscription Suspended',
        message: 'Your subscription has been suspended. You can still manage your fleet, but live tracking and reporting features are currently unavailable. To resume your subscription, please visit your Billing & Plans section or contact support for assistance.',
        timestamp: new Date(),
        icon: FaExclamationTriangle,
        read: false,
        color: 'red'
      });
    }

    // Pending Approval Notification
    if (company?.company_status === 'pending_approval') {
      notifs.push({
        id: 'pending-' + Date.now(),
        type: 'info',
        title: 'Pending Admin Approval',
        message: 'Your company account is currently under review by our platform administrators. This usually takes up to 24 hours. Once approved, you\'ll have full access to all fleet management features.',
        timestamp: new Date(),
        icon: FaClock,
        read: false,
        color: 'yellow'
      });
    }

    // Active Subscription Notification
    if (company?.subscription_status === 'active' && company?.company_status === 'approved') {
      notifs.push({
        id: 'active-' + Date.now(),
        type: 'success',
        title: 'Account Active',
        message: 'Your subscription is active and your company has been approved. You have full access to all fleet management features.',
        timestamp: new Date(),
        icon: FaCheckCircle,
        read: false,
        color: 'green'
      });
    }

    setNotifications(notifs);
    setLoading(false);
  }, [company]);

  const getNotificationStyles = (type) => {
    const styles = {
      warning: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        title: 'text-red-900',
        message: 'text-red-700',
        icon: 'text-red-600'
      },
      info: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        title: 'text-yellow-900',
        message: 'text-yellow-700',
        icon: 'text-yellow-600'
      },
      success: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        title: 'text-green-900',
        message: 'text-green-700',
        icon: 'text-green-600'
      }
    };
    return styles[type] || styles.info;
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <FaBell className="text-2xl text-yellow-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">Stay updated on your account status</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <FaBell className="text-5xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No notifications at this time</p>
          <p className="text-gray-400 mt-2">You're all set! Check back later for updates.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => {
            const styles = getNotificationStyles(notif.type);
            const Icon = notif.icon;
            return (
              <div
                key={notif.id}
                className={`${styles.bg} ${styles.border} border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow`}
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <Icon className={`text-2xl ${styles.icon} mt-1`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-lg font-semibold ${styles.title}`}>
                      {notif.title}
                    </h3>
                    <p className={`mt-2 ${styles.message} text-sm leading-relaxed`}>
                      {notif.message}
                    </p>
                    <p className={`mt-3 text-xs ${styles.message} opacity-75`}>
                      {formatTime(notif.timestamp)}
                    </p>
                  </div>

                  {/* Status Badge */}
                  {!notif.read && (
                    <div className="flex-shrink-0">
                      <span className="inline-block w-2 h-2 bg-yellow-600 rounded-full mt-2"></span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
