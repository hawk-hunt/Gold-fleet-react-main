import React, { useEffect, useState } from 'react';
import { FaEnvelope, FaSpinner, FaPlus, FaSearch, FaChevronRight } from 'react-icons/fa';
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

  useEffect(() => {
    const fetchMessages = async () => {
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
    };

    fetchMessages();
  }, [page]);

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
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-yellow-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FaEnvelope className="text-yellow-500" />
            Messages
          </h1>
          <p className="text-slate-400 mt-2">
            Communication with tenant companies {unreadCount > 0 && `(${unreadCount} unread)`}
          </p>
        </div>
        <button
          onClick={() => setShowCompose(!showCompose)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 font-semibold rounded-lg hover:from-yellow-400 hover:to-yellow-500 transition-all"
        >
          <FaPlus /> Compose
        </button>
      </div>

      {error && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm">
          Using demo data. {error}
        </div>
      )}

      {/* Compose Form */}
      {showCompose && (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900/50 border border-yellow-500/20 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Send Message</h3>
          <div className="grid grid-cols-1 gap-4">
            <select className="px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-yellow-500">
              <option>Select Company...</option>
              <option>ABC Logistics</option>
              <option>Fast Delivery Co</option>
              <option>Quick Transport</option>
            </select>
            <input
              type="text"
              placeholder="Subject"
              className="px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-500"
            />
            <textarea
              placeholder="Message body..."
              rows="4"
              className="px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-500 resize-none"
            />
            <div className="flex gap-2">
              <button className="flex-1 px-4 py-2 bg-yellow-500 text-slate-900 font-semibold rounded-lg hover:bg-yellow-400 transition-all">
                Send
              </button>
              <button
                onClick={() => setShowCompose(false)}
                className="flex-1 px-4 py-2 bg-slate-700/50 text-slate-300 font-semibold rounded-lg hover:bg-slate-600/50 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search messages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-500 transition-colors"
        />
      </div>

      {/* Messages List */}
      <div className="space-y-2">
        {filteredMessages.map((msg) => (
          <div
            key={msg.id}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              msg.read
                ? 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/30'
                : 'bg-gradient-to-r from-yellow-500/10 to-slate-800/50 border-yellow-500/20 hover:from-yellow-500/20'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className={`font-semibold ${msg.read ? 'text-slate-300' : 'text-white'}`}>
                    {msg.from}
                  </h4>
                  {!msg.read && <span className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0" />}
                </div>
                <p className="text-slate-400 text-sm mt-1">
                  <span className="font-medium">To:</span> {msg.to}
                </p>
                <p className="text-white font-medium mt-2">{msg.subject}</p>
                <p className="text-slate-400 text-sm mt-1 line-clamp-2">{msg.preview}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-xs text-slate-400">{msg.date}</span>
                <FaChevronRight className="text-slate-500" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-slate-400">
          Showing {filteredMessages.length} of {messages.length} messages
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-600/50 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600/50 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
