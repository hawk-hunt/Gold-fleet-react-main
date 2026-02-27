import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

/**
 * Resources Page
 * Comprehensive documentation, guides, and support resources
 * Desktop and mobile responsive
 */
export default function ResourcesPage() {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const resourceCategories = [
    {
      title: 'Documentation',
      icon: '📖',
      items: [
        { name: 'Getting Started Guide', description: 'Quick start guide to set up your first fleet', link: '#' },
        { name: 'System Architecture', description: 'Learn about platform architecture and data flow', link: '#' },
        { name: 'API Reference', description: 'Complete REST API documentation with examples', link: '#' },
        { name: 'Database Schema', description: 'Detailed information about all database tables', link: '#' },
      ],
    },
    {
      title: 'Tutorials & Guides',
      icon: '🎓',
      items: [
        { name: 'Adding Vehicles', description: 'Step-by-step guide to add vehicles to your fleet', link: '#' },
        { name: 'Managing Drivers', description: 'How to create and manage driver profiles', link: '#' },
        { name: 'Route Optimization', description: 'Guide to using route optimization features', link: '#' },
        { name: 'Reports & Analytics', description: 'Understanding dashboards and generating reports', link: '#' },
      ],
    },
    {
      title: 'Video Tutorials',
      icon: '🎥',
      items: [
        { name: 'Platform Overview (5 min)', description: 'Complete tour of the Gold Fleet platform', link: '#' },
        { name: 'First Fleet Setup (8 min)', description: 'Setting up your first vehicles and drivers', link: '#' },
        { name: 'GPS Tracking Live (6 min)', description: 'Real-time GPS tracking demonstration', link: '#' },
        { name: 'Advanced Analytics (10 min)', description: 'Deep dive into analytics and reporting', link: '#' },
      ],
    },
    {
      title: 'Download Center',
      icon: '⬇️',
      items: [
        { name: 'Mobile App (iOS)', description: 'Download Gold Fleet for iPhone and iPad', link: '#' },
        { name: 'Mobile App (Android)', description: 'Download Gold Fleet for Android devices', link: '#' },
        { name: 'Desktop Software', description: 'Desktop application for Windows and Mac', link: '#' },
        { name: 'API SDK', description: 'Software Development Kits for various languages', link: '#' },
      ],
    },
  ];

  const caseStudies = [
    {
      title: 'ABC Logistics: 25% Cost Reduction',
      description: 'How ABC Logistics reduced operational costs by 25% using Gold Fleet\'s route optimization',
      industry: 'Logistics',
      results: ['25% cost reduction', '18% fuel savings', '40% faster deliveries'],
      link: '#',
    },
    {
      title: 'FastCourier: 99% On-Time Delivery',
      description: 'FastCourier achieved 99% on-time delivery rate with real-time tracking and dispatch',
      industry: 'Delivery Services',
      results: ['99% on-time rate', '35% productivity increase', '2x customer satisfaction'],
      link: '#',
    },
    {
      title: 'Premier Transport: 40% Safer Fleet',
      description: 'Premier Transport improved safety metrics by 40% through driver behavior monitoring',
      industry: 'Transportation',
      results: ['40% accident reduction', '30% insurance savings', 'Zero compliance issues'],
      link: '#',
    },
  ];

  const faqs = [
    {
      question: 'How do I get started with Gold Fleet?',
      answer: 'Simply sign up for a free trial account, add your vehicles and drivers, and start tracking immediately. You\'ll have access to all features during the trial period.',
    },
    {
      question: 'What are the system requirements?',
      answer: 'Gold Fleet works on any modern web browser (Chrome, Firefox, Safari, Edge). Mobile apps require iOS 12+ or Android 8+. No special hardware is required except GPS devices.',
    },
    {
      question: 'How much does Gold Fleet cost?',
      answer: 'Pricing varies based on fleet size and features. We offer flexible plans starting from Basic to Enterprise. Contact sales for custom quotes.',
    },
    {
      question: 'Can I integrate Gold Fleet with my existing systems?',
      answer: 'Yes! Gold Fleet has a comprehensive REST API and pre-built integrations with popular CRM, ERP, and accounting systems. Custom integrations are also available.',
    },
    {
      question: 'What support options are available?',
      answer: 'We offer 24/7 email and phone support, live chat, knowledge base, video tutorials, and dedicated account managers for enterprise customers.',
    },
    {
      question: 'How is my fleet data secured?',
      answer: 'Your data is encrypted using military-grade encryption (AES-256), stored on secure cloud servers, backed up regularly, and compliant with GDPR and SOC 2.',
    },
    {
      question: 'Can I export my data?',
      answer: 'Yes, you can export all your data in CSV, Excel, or JSON format. We also provide API access for programmatic data retrieval.',
    },
    {
      question: 'What is your uptime guarantee?',
      answer: 'We guarantee 99.9% uptime with a service level agreement (SLA). Our infrastructure is redundant and distributed across multiple data centers.',
    },
  ];

  const partners = [
    { name: 'GPS Device Partners', icon: '📡', companies: ['Garmin', 'TomTom', 'Verizon Connect'] },
    { name: 'Integration Partners', icon: '🔗', companies: ['Salesforce', 'Microsoft Dynamics', 'SAP'] },
    { name: 'Technology Partners', icon: '🛠️', companies: ['AWS', 'Google Cloud', 'Microsoft Azure'] },
    { name: 'Support Partners', icon: '🤝', companies: ['Local Implementation', 'Training Providers', 'IT Support'] },
  ];

  return (
    <div className="w-full">
      <Header sidebarOpen={false} setSidebarOpen={() => {}} />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-yellow-600 to-yellow-500 py-20 px-6">
        <div className="max-w-7xl mx-auto text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Resources & Support
          </h1>
          <p className="text-lg md:text-xl text-yellow-100 max-w-2xl mx-auto">
            Everything you need to get started, learn, and maximize Gold Fleet. Documentation, tutorials, guides, and more.
          </p>
        </div>
      </section>

      {/* Quick Navigation Bar */}
      <section className="bg-white border-b border-gray-200 py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-4 justify-center">
          <button className="px-4 py-2 bg-yellow-50 text-yellow-600 rounded-lg font-medium hover:bg-yellow-100 transition-colors">
            Documentation
          </button>
          <button className="px-4 py-2 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-gray-200">
            Tutorials
          </button>
          <button className="px-4 py-2 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-gray-200">
            Videos
          </button>
          <button className="px-4 py-2 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-gray-200">
            Downloads
          </button>
          <button className="px-4 py-2 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-gray-200">
            API Docs
          </button>
        </div>
      </section>

      {/* Resource Categories Grid */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
            Knowledge Base
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {resourceCategories.map((category, idx) => (
              <div key={idx} className="p-8 border border-gray-200 rounded-lg hover:border-yellow-500 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-4xl">{category.icon}</span>
                  <h3 className="text-2xl font-bold text-gray-900">{category.title}</h3>
                </div>
                <ul className="space-y-4">
                  {category.items.map((item, iIdx) => (
                    <li key={iIdx} className="border-l-2 border-yellow-200 pl-4">
                      <a
                        href={item.link}
                        className="text-yellow-600 font-semibold hover:text-yellow-700 block"
                      >
                        {item.name}
                      </a>
                      <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Getting Help Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
            Getting Help
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: '💬',
                title: 'Live Chat',
                description: 'Chat with support team in real-time',
                availability: 'Available 24/7',
              },
              {
                icon: '📧',
                title: 'Email Support',
                description: 'Send detailed questions to support',
                availability: '24-hour response time',
              },
              {
                icon: '☎️',
                title: 'Phone Support',
                description: 'Call our support team directly',
                availability: 'Business hours + emergency',
              },
              {
                icon: '🎯',
                title: 'Dedicated Manager',
                description: 'Personal account manager (Pro+)',
                availability: 'Scheduled meetings',
              },
            ].map((option, idx) => (
              <div key={idx} className="p-8 bg-white rounded-lg border border-gray-200 text-center hover:shadow-md transition-shadow">
                <div className="text-5xl mb-4">{option.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{option.title}</h3>
                <p className="text-gray-700 text-sm mb-3">{option.description}</p>
                <p className="text-yellow-600 font-medium text-sm">{option.availability}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
            Success Stories & Case Studies
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {caseStudies.map((study, idx) => (
              <a
                key={idx}
                href={study.link}
                className="p-8 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="inline-block px-3 py-1 bg-yellow-600 text-white text-xs font-semibold rounded-full mb-4">
                  {study.industry}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{study.title}</h3>
                <p className="text-gray-700 mb-4">{study.description}</p>
                <ul className="space-y-2">
                  {study.results.map((result, rIdx) => (
                    <li key={rIdx} className="flex items-center gap-2 text-gray-700">
                      <span className="text-yellow-600 font-bold">✓</span>
                      {result}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 text-yellow-600 font-semibold">
                  Read Case Study →
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-yellow-500 transition-colors">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900 text-left">{faq.question}</h3>
                  <span className={`text-2xl text-yellow-600 transition-transform ${expandedFaq === idx ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                {expandedFaq === idx && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
            Our Partners
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {partners.map((partner, idx) => (
              <div key={idx} className="p-8 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200 text-center">
                <div className="text-5xl mb-4">{partner.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">{partner.name}</h3>
                <ul className="space-y-2">
                  {partner.companies.map((company, cIdx) => (
                    <li key={cIdx} className="text-gray-700 text-sm">
                      {company}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
            Join the Community
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '💻',
                title: 'Developer Forum',
                description: 'Connect with developers, share code, ask questions',
                link: '#',
              },
              {
                icon: '🐦',
                title: 'Twitter/X',
                description: 'Follow us for updates, tips, and announcements',
                link: '#',
              },
              {
                icon: '📱',
                title: 'Discord Community',
                description: 'Real-time chat with other Gold Fleet users',
                link: '#',
              },
            ].map((community, idx) => (
              <a
                key={idx}
                href={community.link}
                className="p-8 bg-white rounded-lg border border-gray-200 text-center hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="text-5xl mb-4">{community.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{community.title}</h3>
                <p className="text-gray-700 mb-4">{community.description}</p>
                <span className="text-yellow-600 font-semibold">Join Now →</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Certification Program */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Gold Fleet Certification Program
          </h2>
          <p className="text-lg text-gray-700 mb-8">
            Get certified and demonstrate your expertise in fleet management and Gold Fleet platform usage.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { level: 'Beginner', duration: '4 weeks', focus: 'Platform basics and features' },
              { level: 'Professional', duration: '8 weeks', focus: 'Advanced operations and analytics' },
              { level: 'Expert', duration: '12 weeks', focus: 'API integration and customization' },
            ].map((cert, idx) => (
              <div key={idx} className="p-6 border-2 border-yellow-200 rounded-lg hover:border-yellow-500 transition-colors">
                <div className="text-3xl font-bold text-yellow-600 mb-2">{cert.level}</div>
                <div className="text-gray-700 text-sm mb-3">
                  <strong>Duration:</strong> {cert.duration}
                </div>
                <div className="text-gray-700 text-sm mb-4">
                  <strong>Focus:</strong> {cert.focus}
                </div>
                <button className="px-4 py-2 bg-yellow-600 text-white font-medium rounded hover:bg-yellow-700 transition-colors">
                  Enroll
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog/Resources Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
            Latest Blog Posts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                tag: 'Tips',
                title: '5 Ways to Reduce Fleet Maintenance Costs',
                excerpt: 'Learn proven strategies to minimize maintenance expenses without compromising vehicle reliability...',
                date: 'Feb 20, 2024',
              },
              {
                tag: 'News',
                title: 'Gold Fleet Platform 2.0 Released',
                excerpt: 'Exciting new features including AI-powered route optimization and enhanced analytics dashboard...',
                date: 'Feb 15, 2024',
              },
              {
                tag: 'Guide',
                title: 'Complete Guide to Driver Behavior Monitoring',
                excerpt: 'Understand how to use driver monitoring features to improve safety and reduce insurance claims...',
                date: 'Feb 10, 2024',
              },
            ].map((post, idx) => (
              <div key={idx} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className="h-40 bg-gradient-to-br from-yellow-400 to-yellow-600"></div>
                <div className="p-6">
                  <div className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full mb-3">
                    {post.tag}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{post.title}</h3>
                  <p className="text-gray-700 text-sm mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs">{post.date}</span>
                    <a href="#" className="text-yellow-600 font-semibold text-sm hover:text-yellow-700">
                      Read More →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-yellow-600 to-yellow-500">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-lg text-yellow-100 mb-8">
            Contact our support team for personalized assistance
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-4 bg-white text-yellow-600 font-bold rounded-lg hover:bg-yellow-50 transition-colors text-lg"
            >
              Start Free Trial
            </Link>
            <a
              href="#"
              className="px-8 py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-yellow-700 transition-colors text-lg"
            >
              Contact Support
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p>&copy; 2024 Gold Fleet. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
