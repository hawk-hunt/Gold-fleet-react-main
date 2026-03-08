import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaSearch, FaBell, FaUser, FaSignOutAlt, FaTimes } from 'react-icons/fa';
import platformApi from '../services/platformApi';

/**
 * Platform Header - Modern Gold & White Theme
 * Professional top navigation bar for Platform Owner
 * Color scheme: Gold (#FFD700) and White (#FFFFFF)
 */
export default function PlatformHeader({ sidebarOpen, setSidebarOpen, isLarge, sidebarWidth = 0 }) {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
      console.log('Search:', searchQuery);
      setSearchQuery('');
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 h-[60px] bg-white border-b border-gray-300 shadow-sm z-50 flex items-center px-3 lg:px-6"
      style={{
        paddingLeft: isLarge ? `calc(1rem + ${sidebarWidth}px)` : '0.75rem',
      }}
    >
      <div className="flex items-center justify-between w-full h-full gap-3">
        {/* Left Section - Logo & Toggle */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Logo - Desktop */}
          <div className="hidden md:flex items-center gap-1.5 font-bold">
            <img src="/icons/result.png" alt="Gold Fleet Logo" className="w-8 h-8 object-contain flex-shrink-0" />
            <span className="text-gray-800 hidden lg:inline text-sm whitespace-nowrap">Gold Fleet</span>
          </div>

          {/* Sidebar Toggle - Mobile */}
          {!isLarge && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-700 hover:text-gray-900 transition-colors p-1.5 hover:bg-gray-100 rounded-lg flex-shrink-0"
            >
              {sidebarOpen ? <FaTimes className="w-4 h-4" /> : <FaBars className="w-4 h-4" />}
            </button>
          )}

          {/* Search Bar - Responsive */}
          <form onSubmit={handleSearch} className="hidden sm:flex items-center gap-2 flex-1 min-w-0">
            <div className="flex-1 min-w-0 relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm font-medium focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-200 transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
              >
                <FaSearch className="w-3 h-3" />
              </button>
            </div>
          </form>
        </div>

        {/* Right Section - Notifications & Profile */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileOpen(false); }}
              className="relative text-gray-700 hover:text-gray-900 transition-colors p-1.5 hover:bg-gray-100 rounded-lg"
            >
              <FaBell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-yellow-600 rounded-full shadow-md" />
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-300 z-50 max-h-96 overflow-y-auto">
                <div className="px-4 py-3 border-b border-gray-300 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">{unreadCount}</span>
                </div>
                {notifLoading ? (
                  <div className="p-4">
                    <div className="animate-pulse space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-xs">No notifications</div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
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
                        <div className="flex items-start space-x-2">
                          <div className="flex-shrink-0 p-1.5 rounded-full bg-gray-100">
                            <FaBell className="w-3 h-3 text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-900">{n.title || n.message}</p>
                            <p className="mt-0.5 text-xs text-gray-500">
                              {n.message?.substring(0, 40)}...
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
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors font-semibold"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-white font-bold shadow-md text-xs flex-shrink-0">
                PO
              </div>
              <span className="text-xs font-semibold hidden sm:inline">Admin</span>
            </button>

            {/* Profile Menu */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg py-2 z-50">
                <div className="px-3 py-2 border-b border-gray-300">
                  <p className="text-xs font-bold text-gray-900">Platform Owner</p>
                  <p className="text-xs text-gray-500">Admin Account</p>
                </div>
                <button
                  onClick={() => { setProfileOpen(false); navigate('/platform/settings'); }}
                  className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors flex items-center gap-2 font-medium text-xs"
                >
                  <FaUser className="w-3 h-3" />
                  Settings
                </button>
                <hr className="border-gray-300 my-1" />
                <button
                  onClick={() => { setProfileOpen(false); handleLogout(); }}
                  className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors flex items-center gap-2 font-medium text-xs"
                >
                  <FaSignOutAlt className="w-3 h-3" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop for dropdowns */}
      {(notificationsOpen || profileOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setNotificationsOpen(false); setProfileOpen(false); }}
        />
      )}
    </header>
  );
}

