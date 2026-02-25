export default function MobileHeader({ sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed, isLarge }) {
  const handleToggle = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      const willOpen = !sidebarOpen;
      setSidebarOpen(willOpen);
      if (willOpen) setSidebarCollapsed(false);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white shadow-sm border-b border-gray-200 h-16 flex items-center px-4 gap-3">
      <button
        onClick={handleToggle}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
        aria-label="Toggle sidebar"
        title={sidebarOpen ? "Close menu" : "Open menu"}
      >
        <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M5 6a1 1 0 0 0 0 2h14a1 1 0 1 0 0-2zm-1 6a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1m0 5a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1" clipRule="evenodd"></path>
        </svg>
      </button>
      <span className="font-semibold text-gray-900 truncate">Fleet Manager</span>
    </div>
  );
}
