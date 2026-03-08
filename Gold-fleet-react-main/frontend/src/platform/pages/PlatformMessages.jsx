import React, { useEffect, useState, useCallback } from 'react';
import { FaEnvelope, FaSpinner, FaPlus, FaSearch, FaChevronRight, FaSync } from 'react-icons/fa';
import platformApi from '../services/platformApi';

/**
 * Platform Messages
 * Messaging system for platform owner to communicate with companies
 */
export default function PlatformMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [page, setPage] = useState(1);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await platformApi.getMessages(page, 10);
      setMessages(data.data || data.messages || defaultMessages);
    } catch (err) {
      setError(err.message);
      setMessages(defaultMessages);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const defaultMessages = [
    {
      id: 1,
      from: 'Platform',
      to: 'ABC Logistics',
      subject: 'Account Verification',
      preview: 'Please verify your email address to activate your account...',
      date: '2024-06-15',
      read: false,
      type: 'system',
    },
    {
      id: 2,
      from: 'Fast Delivery Co',
      to: 'Platform Support',
      subject: 'Subscription Upgrade Request',
      preview: 'We would like to upgrade to the Enterprise plan. Can you help?',
      date: '2024-06-14',
      read: true,
      type: 'incoming',
    },
    {
      id: 3,
      from: 'Platform',
      to: 'Quick Transport',
      subject: 'Maintenance Update',
      preview: 'We have scheduled maintenance on June 25th from 2-4 AM UTC.',
      date: '2024-06-13',
      read: true,
      type: 'system',
    },
    {
      id: 4,
      from: 'Modern Fleets',
      to: 'Platform Support',
      subject: 'Integration Support',
      preview: 'How do we integrate our existing system with your API?',
      date: '2024-06-12',
      read: false,
      type: 'incoming',
    },
  ];

  const filteredMessages = messages.filter((m) =>
    m.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = messages.filter((m) => !m.read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-4">
      <div className="w-full px-2 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl border border-yellow-600 p-6 shadow-lg">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <FaEnvelope className="text-white" />
              Messages
            </h1>
            <p className="text-yellow-100 mt-2">
              Communication with tenant companies {unreadCount > 0 && `(${unreadCount} unread)`}
            </p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={fetchMessages}
              className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-white text-yellow-600 font-semibold rounded-lg hover:shadow-md active:scale-95 transition-all duration-200"
            >
              <FaSync className="text-sm" />
              Refresh
            </button>
            <button
              onClick={() => setShowCompose(!showCompose)}
              className="inline-flex items-center gap-2 px-5 py-3 bg-white text-yellow-600 font-semibold rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all duration-200"
            >
              <FaPlus /> Compose
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-300 rounded-lg text-red-800 text-sm">
            Using demo data. {error}
          </div>
        )}

        {/* Compose Form */}
        {showCompose && (
          <div className="bg-white border-2 border-yellow-500 rounded-lg p-6 space-y-4 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900">Send Message</h3>
          <div className="grid grid-cols-1 gap-4">
            <select className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium focus:outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200 transition-all">
              <option>Select Company...</option>
              <option>ABC Logistics</option>
              <option>Fast Delivery Co</option>
              <option>Quick Transport</option>
            </select>
            <input
              type="text"
              placeholder="Subject"
              className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 font-medium focus:outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200 transition-all"
            />
            <textarea
              placeholder="Message body..."
              rows="4"
              className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 font-medium focus:outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200 resize-none transition-all"
            />
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all duration-200">
                Send
              </button>
              <button
                onClick={() => setShowCompose(false)}
                className="flex-1 px-4 py-3 bg-gray-100 border border-gray-300 text-yellow-700 font-semibold rounded-lg hover:bg-gray-200 active:scale-95 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-600" />
        <input
          type="text"
          placeholder="Search messages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border-2 border-yellow-500 rounded-lg text-gray-900 placeholder-gray-500 font-medium focus:outline-none focus:border-yellow-600 focus:ring-2 focus:ring-yellow-200 transition-all"
        />
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {filteredMessages.map((msg) => (
          <div
            key={msg.id}
            className={`p-4 border-2 border-yellow-500 rounded-lg cursor-pointer transition-all hover:shadow-md ${
              msg.read
                ? 'bg-white hover:shadow-lg'
                : 'bg-yellow-50 hover:shadow-lg'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className={`font-semibold ${msg.read ? 'text-yellow-700' : 'text-gray-900'}`}>
                    {msg.from}
                  </h4>
                  {!msg.read && <span className="w-2 h-2 bg-gray-700 rounded-full flex-shrink-0" />}
                </div>
                <p className="text-gray-600 text-sm mt-1">
                  <span className="font-medium">To:</span> {msg.to}
                </p>
                <p className="text-gray-900 font-medium mt-2">{msg.subject}</p>
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">{msg.preview}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-xs text-gray-500">{msg.date}</span>
                <FaChevronRight className="text-gray-400" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-lg p-4 border-2 border-yellow-500">
        <p className="text-gray-600">
          Showing {filteredMessages.length} of {messages.length} messages
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border-2 border-yellow-500 text-yellow-700 bg-white rounded-lg disabled:opacity-50 hover:bg-yellow-50 transition-colors font-medium"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
          >
            Next
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}

