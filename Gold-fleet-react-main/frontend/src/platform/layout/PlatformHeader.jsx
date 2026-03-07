import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaSearch, FaBell, FaUser, FaSignOutAlt } from 'react-icons/fa';
import platformApi from '../services/platformApi';

/**
 * Platform Header
 * Top navigation bar for Platform Owner panel
 */
export default function PlatformHeader({ sidebarOpen, setSidebarOpen, isLarge, sidebarWidth = 0 }) {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // notifications
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    setNotifLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/notifications', {
        headers: platformApi.getAuthHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || data.data || []);
        setUnreadCount(data.unread_count || data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);


  const handleLogout = () => {
    sessionStorage.removeItem('platformToken');
    navigate('/platform/login', { replace: true });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Handle search - could navigate or filter
      console.log('Search:', searchQuery);
      setSearchQuery('');
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 shadow-sm z-50 flex items-center px-4 lg:px-6"
      style={{
        paddingLeft: isLarge ? `calc(1.5rem + ${sidebarWidth}px)` : '1.5rem',
      }}
    >
      <div className="flex items-center justify-between w-full">
        {/* Left Section - Toggle & Search */}
        <div className="flex items-center gap-4 flex-1">
          {/* Sidebar Toggle - Mobile */}
          {!isLarge && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              <FaBars className="w-5 h-5" />
            </button>
          )}

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center gap-2 flex-1 max-w-md">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search companies, subscriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <FaSearch className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Right Section - Notifications & Profile */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileOpen(false); }}
              className="relative text-gray-700 hover:text-gray-900 transition-colors"
            >
              <FaBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-yellow-500 rounded-full" />
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                {notifLoading ? (
                  <div className="p-4">
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">No notifications</div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={async () => {
                          try {
                            await fetch(`http://localhost:8000/api/notifications/${n.id}/read`, {
                              method: 'PATCH',
                              headers: platformApi.getAuthHeader(),
                            });
                            loadNotifications();
                          } catch (err) {
                            console.error('Mark read failed', err);
                          }
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 p-2 rounded-full bg-blue-100">
                            <FaBell className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{n.title || n.message}</p>
                            <p className="mt-0.5 text-xs text-gray-500">
                              {n.message?.substring(0, 40)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <FaUser className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Platform Owner</span>
            </button>

            {/* Profile Menu */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                <button
                  onClick={() => { setProfileOpen(false); navigate('/platform/settings'); }}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center gap-2"
                >
                  <FaUser className="w-4 h-4" />
                  Settings
                </button>
                <hr className="border-gray-200 my-2" />
                <button
                  onClick={() => { setProfileOpen(false); handleLogout(); }}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-2"
                >
                  <FaSignOutAlt className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* backdrop for dropdowns */}
      {(notificationsOpen || profileOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setNotificationsOpen(false); setProfileOpen(false); }}
        />
      )}
    </header>
  );
}
