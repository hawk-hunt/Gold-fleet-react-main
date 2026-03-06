export default function Footer() {
  // fixed footer height (h-16) is used by layout padding-bottom
  return (
    <footer className="fixed bottom-0 w-full border-t border-gray-200 bg-white shadow-inner z-20 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-900">Gold Fleet</div>
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <a href="#" className="hover:text-yellow-600 transition-colors">Privacy</a>
          <a href="#" className="hover:text-yellow-600 transition-colors">Terms</a>
          <a href="#" className="hover:text-yellow-600 transition-colors">Support</a>
        </div>
        <div className="text-sm text-gray-500">© {new Date().getFullYear()} Gold Fleet</div>
      </div>
    </footer>
  );
}
