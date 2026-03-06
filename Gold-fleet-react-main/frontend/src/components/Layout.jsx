import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Footer from './Footer';
import Header from './Header';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // track large screen breakpoint so we only offset content on lg+ screens
  const [isLarge, setIsLarge] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMapPage = location.pathname === '/map';

  // ONLY redirect drivers away from admin pages - allow admins and others to access /main freely
  useEffect(() => {
    // Only apply this check if user is authenticated and is a DRIVER
    if (user && user.role === 'driver') {
      const adminRoutes = ['/main', '/vehicles', '/services', '/inspections', '/issues', '/expenses', '/fuel-fillups', '/reminders', '/company-settings'];
      if (adminRoutes.some(route => location.pathname.startsWith(route))) {
        navigate('/driver', { replace: true });
      }
    }
  }, [user, location.pathname, navigate]);

  useEffect(() => {
    const onResize = () => setIsLarge(window.innerWidth >= 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Sidebar widths (px)
  const SIDEBAR_EXPANDED = 260;
  const SIDEBAR_COLLAPSED = 80;

  // Force sidebar closed on map page
  const effectiveSidebarOpen = isMapPage ? false : sidebarOpen;
  const effectiveSidebarCollapsed = isMapPage ? true : sidebarCollapsed;

  // computed sidebar width in px that should affect layout (0 when closed on small screens)
  const sidebarWidth = isLarge && effectiveSidebarOpen ? (effectiveSidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED) : 0;

  return (
    <div className="min-h-screen w-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-x-hidden">
      {/* Global Header - fixed at top */}
      <Header
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isLarge={isLarge}
        sidebarWidth={sidebarWidth}
      />

      {/* Sidebar - fixed position on all screens */}
      <Sidebar
        sidebarOpen={effectiveSidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarCollapsed={effectiveSidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        isLarge={isLarge}
        sidebarWidth={sidebarWidth}
      />

      {/* Main content area: only this scrolls */}
      <div
        className={`flex-1 flex flex-col ${isMapPage ? 'overflow-hidden' : 'overflow-y-auto pb-16'}`}
        style={{
          marginLeft: isLarge ? sidebarWidth : 0,
          width: isLarge ? `calc(100% - ${sidebarWidth}px)` : '100%',
          height: isMapPage ? `calc(100vh - 64px)` : 'auto',
          minHeight: isMapPage ? `calc(100vh - 64px)` : 'auto',
          maxHeight: isMapPage ? `calc(100vh - 64px)` : 'auto',
          paddingTop: isMapPage ? 0 : '64px',
          transition: 'margin-left 300ms cubic-bezier(.2,.8,.2,1), width 300ms cubic-bezier(.2,.8,.2,1)'
        }}
      >
        {/* Content wrapper */}
        <div className={`flex flex-col flex-1 w-full ${isMapPage ? 'h-full overflow-hidden' : ''}`} style={isMapPage ? { height: '100%', display: 'flex' } : {}}>
          {isMapPage ? (
            // Fullscreen map - no padding or margins
            <div className="w-full h-full flex-1 flex flex-col overflow-hidden" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {children}
            </div>
          ) : (
            <>
              <div className="w-full px-3 sm:px-4 lg:px-6">
                <main className="w-full py-6 lg:py-8 space-y-6">
                  {children}
                </main>
              </div>
              {/* spacer removed; footer is fixed so padding-bottom handles spacing */}
            </>
          )}
        </div>

        {!isMapPage && <Footer />}
      </div>
    </div>
  );
}
