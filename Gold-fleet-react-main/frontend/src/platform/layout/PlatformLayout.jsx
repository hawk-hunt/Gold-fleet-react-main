import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PlatformHeader from './PlatformHeader';
import PlatformSidebar from './PlatformSidebar';

/**
 * Platform Layout
 * Complete layout for Platform Owner panel
 * Similar to main Layout but completely isolated
 */
export default function PlatformLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLarge, setIsLarge] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );
  const location = useLocation();

  useEffect(() => {
    const onResize = () => setIsLarge(window.innerWidth >= 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const SIDEBAR_EXPANDED = 260;
  const SIDEBAR_COLLAPSED = 80;

  const sidebarWidth = isLarge && sidebarOpen ? (sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED) : 0;

  return (
    <div className="min-h-screen w-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-x-hidden">
      {/* Global Header */}
      <PlatformHeader
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isLarge={isLarge}
        sidebarWidth={sidebarWidth}
      />

      {/* Sidebar */}
      <PlatformSidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
        isLarge={isLarge}
      />

      {/* Main Content Area */}
      <div
        className="flex-1 flex flex-col overflow-y-auto pt-20 lg:pt-12"
        style={{
          marginLeft: isLarge ? sidebarWidth : 0,
          width: isLarge ? `calc(100% - ${sidebarWidth}px)` : '100%',
          minHeight: 'calc(100vh - 64px)',
          transition: 'margin-left 300ms cubic-bezier(.2,.8,.2,1), width 300ms cubic-bezier(.2,.8,.2,1)',
        }}
      >
        {/* Content Wrapper */}
        <div className="w-full px-3 sm:px-4 lg:px-6">
          <main className="w-full py-4 lg:py-6 space-y-6">
            {children}
          </main>
        </div>

        {/* Spacer to push footer */}
        <div className="flex-1" />

        {/* Simple Footer */}
        <footer className="border-t border-gray-200 px-6 py-4 text-center text-gray-600 text-sm">
          <p>&copy; 2024 Gold Fleet Platform. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
