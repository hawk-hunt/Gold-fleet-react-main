import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaSearch, FaBell, FaUser, FaSignOutAlt } from 'react-icons/fa';

/**
 * Platform Header
 * Top navigation bar for Platform Owner panel
 */
export default function PlatformHeader({ sidebarOpen, setSidebarOpen, isLarge, sidebarWidth = 0 }) {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
      className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-yellow-500/20 z-50 flex items-center px-4 lg:px-6"
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
              className="text-slate-300 hover:text-white transition-colors"
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
                className="w-full px-4 py-2 bg-slate-700/30 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-yellow-500/50 transition-colors"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <FaSearch className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Right Section - Notifications & Profile */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative text-slate-300 hover:text-white transition-colors">
            <FaBell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-yellow-500 rounded-full" />
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/30 transition-colors"
            >
              <FaUser className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Platform Owner</span>
            </button>

            {/* Profile Menu */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg py-2 z-50">
                <button
                  onClick={() => navigate('/platform/settings')}
                  className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors flex items-center gap-2"
                >
                  <FaUser className="w-4 h-4" />
                  Settings
                </button>
                <hr className="border-slate-700/50 my-2" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-400 hover:bg-slate-700/50 hover:text-red-300 transition-colors flex items-center gap-2"
                >
                  <FaSignOutAlt className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
