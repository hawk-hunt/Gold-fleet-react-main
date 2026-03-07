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

  const SIDEBAR_EXPANDED = 260;
  const SIDEBAR_COLLAPSED = 80;

  const sidebarWidth = isCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

  return (
    <>
      {/* Overlay on mobile when sidebar is open */}
      {!isLarge && isOpen && (
        <div
          className="fixed inset-0 top-16 bg-black/30 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-64px)] bg-white border-r border-gray-200 transition-all duration-300 z-40 overflow-y-auto flex flex-col ${
          !isLarge && !isOpen ? '-translate-x-full' : ''
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} ${!isLarge ? 'w-64' : ''}`}
        style={{
          width: isLarge ? `${sidebarWidth}px` : undefined,
        }}
      >
        {/* Logo/Platform Name */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-center gap-2">
            {!isCollapsed && (
              <div className="text-lg font-bold text-yellow-600">Platform</div>
            )}
            {isCollapsed && (
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-bold text-sm">
                PO
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-6 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  active
                    ? 'bg-yellow-50 text-yellow-600 border-l-2 border-yellow-600'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle (lg screens only) */}
        {isLarge && (
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all"
            >
              <FaChevronDown
                className={`w-4 h-4 transition-transform ${
                  isCollapsed ? 'rotate-180' : ''
                }`}
              />
              {!isCollapsed && <span className="text-xs">Collapse</span>}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
