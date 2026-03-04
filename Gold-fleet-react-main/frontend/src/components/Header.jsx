import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header({ sidebarOpen, setSidebarOpen, isLarge, sidebarWidth = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userName] = useState(user?.name || 'User');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/notifications', {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
        }
      });
      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`http://localhost:8000/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
        }
      });
      loadNotifications();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('http://localhost:8000/api/notifications/mark-all-read', {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
        }
      });
      loadNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(() => loadNotifications(), 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const getNotificationIcon = (type) => {
    const iconProps = 'w-4 h-4';
    const icons = {
      success: <svg className={iconProps} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>,
      warning: <svg className={iconProps} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>,
      error: <svg className={iconProps} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>,
      info: <svg className={iconProps} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>,
    };
    return icons[type] || icons.info;
  };

  const getBgColorClass = (type) => {
    const colors = {
      success: 'bg-green-100',
      warning: 'bg-yellow-100',
      error: 'bg-red-100',
      info: 'bg-blue-100',
    };
    return colors[type] || 'bg-blue-100';
  };

  const getTextColorClass = (type) => {
    const colors = {
      success: 'text-green-600',
      warning: 'text-yellow-600',
      error: 'text-red-600',
      info: 'text-blue-600',
    };
    return colors[type] || 'text-blue-600';
  };

  // Show public nav when not authenticated
  if (!user) {
    return (
      <div className="w-full">
        {/* Top promo banner */}
        <div className="w-full bg-yellow-600 text-white text-center py-2 px-4 relative">
          <span className="font-medium">Track your fleet operations in real time with Gold Fleet</span>
          <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:opacity-75">×</button>
        </div>

        {/* Main navigation */}
        <nav className="bg-white shadow-sm px-6 py-3 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link className="flex items-center space-x-2" to="/" data-discover="true">
                  <img alt="Gold Fleet" className="h-10 w-10 rounded" src="/icons/result.png" />
                  <span className="text-gray-800 font-bold text-lg">Gold Fleet</span>
                </Link>
              </div>

              <div className="hidden md:flex space-x-6">
                <Link className="text-[#5C4B1F] hover:text-[#C9A227] font-medium transition-all duration-300 ease-in-out" to="/solutions">Solutions</Link>
                <Link className="text-[#5C4B1F] hover:text-[#C9A227] font-medium transition-all duration-300 ease-in-out" to="/features">Features</Link>
                <Link className="text-[#5C4B1F] hover:text-[#C9A227] font-medium transition-all duration-300 ease-in-out" to="/resources">Resources</Link>
                <Link className="text-[#5C4B1F] hover:text-[#C9A227] font-medium transition-all duration-300 ease-in-out" to="/pricing">Pricing</Link>
                <Link className="text-[#5C4B1F] hover:text-[#C9A227] font-medium transition-all duration-300 ease-in-out" to="/about">About</Link>
                <Link className="text-[#5C4B1F] hover:text-[#C9A227] font-medium transition-all duration-300 ease-in-out" to="/contact">Contact</Link>
              </div>

              <div className="hidden md:flex items-center space-x-3">
                <Link className="text-sm text-gray-700 hover:text-yellow-600" to="/demo" data-discover="true">Book Demo</Link>
                <Link className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-100" to="/login" data-discover="true">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-in w-4 h-4" aria-hidden="true"><path d="m10 17 5-5-5-5"></path><path d="M15 12H3"></path><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path></svg>
                  <span className="text-sm font-medium">Login</span>
                </Link>
                <Link className="px-3 py-1.5 rounded-md bg-yellow-600 text-white hover:bg-yellow-700 text-sm font-medium" to="/signup" data-discover="true">Start Free Trial</Link>
              </div>

              <div className="md:hidden">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-[#5C4B1F] hover:text-[#C9A227] transition-all duration-300 ease-in-out focus:outline-none">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>
    );
  }

  // Dashboard header - for authenticated users
  return (
    <div 
      className="fixed top-0 left-0 bg-white shadow-sm border-b border-gray-200 h-16"
      style={{
        marginLeft: sidebarWidth,
        width: `calc(100% - ${sidebarWidth}px)`,
        right: 0,
        zIndex: 60,
        transition: 'margin-left 300ms cubic-bezier(.2,.8,.2,1), width 300ms cubic-bezier(.2,.8,.2,1)'
      }}
    >
      <div className="flex items-center h-full px-4 lg:px-6 max-w-full w-full">
        {/* Left - Logo and hamburger */}
        <div className="flex items-center space-x-3">
          {/* Mobile hamburger */}
          <button
            onClick={() => {
              if (!isLarge) {
                setSidebarOpen(!sidebarOpen);
              }
            }}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M5 6a1 1 0 0 0 0 2h14a1 1 0 1 0 0-2zm-1 6a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1m0 5a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1" clipRule="evenodd"></path>
            </svg>
          </button>

          {/* Logo */}
          <img alt="Gold Fleet" className="h-8 w-auto" src="/icons/result.png" />
        </div>

        {/* Center - Search bar (desktop only) */}
        <div className="hidden lg:flex flex-1 max-w-md mx-4">
          <div className="w-full">
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent ml-2 outline-none text-gray-700 placeholder-gray-500 w-full"
              />
            </div>
          </div>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center space-x-2 lg:space-x-4 ml-auto">
          {/* Mobile search */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Search"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setProfileOpen(false);
              }}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Notifications"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0018 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {/* Notifications dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                {loading ? (
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
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                          !notif.read ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => markAsRead(notif.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`flex-shrink-0 p-2 rounded-full ${getBgColorClass(notif.type)}`}>
                            {getNotificationIcon(notif.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                            <p className="mt-0.5 text-xs text-gray-500">{notif.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Settings */}
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden sm:inline-block"
            aria-label="Settings"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* User profile dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotificationsOpen(false);
              }}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm hover:shadow-lg transition-shadow"
              aria-label="User menu"
            >
              {user?.name?.charAt(0).toUpperCase()}{user?.name?.split(' ')[1]?.charAt(0).toUpperCase() || 'U'}
            </button>

            {/* Profile dropdown */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => { setProfileOpen(false); navigate('/profile'); }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile Settings
                  </button>
                  <button
                    onClick={() => { setProfileOpen(false); navigate('/account'); }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Account
                  </button>
                </div>
                <div className="border-t border-gray-200 py-1">
                  <button
                    onClick={() => { setProfileOpen(false); handleLogout(); }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search bar - expanded */}
      {searchOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 p-4">
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent ml-2 outline-none text-gray-700 placeholder-gray-500 w-full"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Backdrop for dropdowns */}
      {(notificationsOpen || profileOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setNotificationsOpen(false);
            setProfileOpen(false);
          }}
        />
      )}
    </div>
  );
}

