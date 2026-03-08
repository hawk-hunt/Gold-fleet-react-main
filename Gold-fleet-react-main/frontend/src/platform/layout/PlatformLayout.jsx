import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PlatformHeader from './PlatformHeader';
import PlatformSidebar from './PlatformSidebar';

/**
 * Platform Layout - Modern Gold & White Theme
 * Professional SaaS admin panel layout for Platform Owner
 * Color scheme: Gold (#FFD700) and White (#FFFFFF)
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
    <div className="min-h-screen w-screen flex flex-col bg-gray-50 overflow-x-hidden">
      {/* Global Header */}
      <PlatformHeader
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isLarge={isLarge}
        sidebarWidth={sidebarWidth}
      />

      {/* Sidebar + Main Content Container */}
      <div className="flex flex-1 overflow-hidden bg-gray-50 mt-[60px]">
        {/* Sidebar */}
        <PlatformSidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          isCollapsed={sidebarCollapsed}
          setIsCollapsed={setSidebarCollapsed}
          isLarge={isLarge}
        />

        {/* Main Content Area - Fully Responsive */}
        <div
          className="flex-1 flex flex-col overflow-y-auto pt-0 bg-gray-50"
          style={{
            width: isLarge ? `calc(100% - ${sidebarWidth}px)` : '100%',
            minHeight: 'calc(100vh - 60px)',
            transition: 'width 0.3s ease-in-out',
          }}
        >
          {/* Content Wrapper */}
          <div className="w-full px-2 sm:px-3 lg:px-4">
            <main className="w-full py-3 lg:py-4 space-y-6">
              {children}
            </main>
          </div>

          {/* Spacer to push footer */}
          <div className="flex-1" />

          {/* Professional Footer */}
          <footer className="border-t border-gray-300 px-4 py-3 text-center bg-white">
            <p className="text-gray-400 text-xs font-medium">&copy; 2024 Gold Fleet Platform. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </div>
  );
}

