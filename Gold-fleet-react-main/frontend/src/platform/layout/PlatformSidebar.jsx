import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChartLine, FaBuilding, FaCreditCard, FaChartBar, FaEnvelope, FaCog, FaChevronDown } from 'react-icons/fa';

/**
 * Platform Sidebar Navigation
 * Completely separate from main Sidebar.jsx
 */
export default function PlatformSidebar({ isOpen, setIsOpen, isCollapsed, setIsCollapsed, isLarge }) {
  const location = useLocation();

  const navigationItems = [
    { label: 'Dashboard', path: '/platform/dashboard', icon: FaChartLine },
    { label: 'Companies', path: '/platform/companies', icon: FaBuilding },
    { label: 'Subscriptions', path: '/platform/subscriptions', icon: FaCreditCard },
    { label: 'Payments', path: '/platform/payments', icon: FaCreditCard },
    { label: 'Analytics', path: '/platform/analytics', icon: FaChartBar },
    { label: 'Messages', path: '/platform/messages', icon: FaEnvelope },
    { label: 'Settings', path: '/platform/settings', icon: FaCog },
  ];

  const isActive = (path) => location.pathname === path;

  const SIDEBAR_EXPANDED = 240;
  const SIDEBAR_COLLAPSED = 70;

  const sidebarWidth = isCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

  return (
    <>
      {/* Overlay on mobile when sidebar is open */}
      {!isLarge && isOpen && (
        <div
          className="fixed inset-0 top-16 bg-black/30 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-yellow-200 transition-all duration-300 overflow-y-auto flex flex-col h-[calc(100vh-64px)] ${
          !isLarge ? (isOpen ? 'fixed left-0 top-16 w-56 z-40' : 'fixed -left-56 top-16 z-40') : 'relative'
        }`}
        style={{
          width: isLarge ? `${sidebarWidth}px` : undefined,
        }}
      >
        {/* Top Section - Logo + Collapse Toggle */}
        <div className="p-3 border-b border-yellow-200 bg-white flex items-center justify-between gap-2">
          {!isCollapsed && (
            <div className="text-lg font-bold text-yellow-600 flex-1">Platform</div>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-bold text-sm shadow-md flex-1">
              PO
            </div>
          )}
          {/* Collapse Toggle Button - Top Right */}
          {isLarge && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg text-yellow-700 hover:text-gray-900 hover:bg-gray-100 transition-all flex-shrink-0"
              title={isCollapsed ? 'Expand' : 'Collapse'}
            >
              <FaChevronDown
                className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
              />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                  active
                    ? 'bg-yellow-100 text-yellow-900 font-semibold shadow-sm'
                    : 'text-yellow-700 hover:text-yellow-900 hover:bg-yellow-50'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>


      </aside>
    </>
  );
}

