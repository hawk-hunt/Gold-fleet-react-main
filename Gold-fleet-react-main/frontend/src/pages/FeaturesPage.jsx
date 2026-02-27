import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

/**
 * Features Page
 * Comprehensive showcase of Gold Fleet system capabilities
 * Desktop and mobile responsive
 */
export default function FeaturesPage() {
  const featureCategories = [
    {
      title: 'Fleet Management',
      icon: '🚗',
      features: [
        { name: 'Vehicle Tracking', description: 'Real-time GPS tracking with live vehicle location updates' },
        { name: 'Vehicle Database', description: 'Comprehensive vehicle records including make, model, fuel type, and maintenance history' },
        { name: 'Driver Management', description: 'Manage driver licenses, contact info, and driving history' },
        { name: 'Fleet Analytics', description: 'Dashboard insights on fleet utilization, mileage, and efficiency' },
      ],
    },
    {
      title: 'Trip & Route Management',
      icon: '🗺️',
      features: [
        { name: 'Trip Tracking', description: 'Monitor and log all fleet trips with start/end locations and duration' },
        { name: 'Route Optimization', description: 'AI-powered route planning to reduce fuel costs and driving time' },
        { name: 'Trip History', description: 'Detailed records of all completed trips for auditing and analysis' },
        { name: 'Distance Tracking', description: 'Automatic mileage recording for cost allocation and maintenance scheduling' },
      ],
    },
    {
      title: 'Maintenance & Compliance',
      icon: '🔧',
      features: [
        { name: 'Service Records', description: 'Log all maintenance services with dates, costs, and details' },
        { name: 'Inspection Reports', description: 'Regular vehicle inspections with automated compliance tracking' },
        { name: 'Issue Management', description: 'Report and track vehicle issues through resolution' },
        { name: 'Maintenance Alerts', description: 'Automated reminders for scheduled maintenance and inspections' },
      ],
    },
    {
      title: 'Financial Management',
      icon: '💰',
      features: [
        { name: 'Fuel Management', description: 'Track fuel fillups, consumption, and identify efficiency issues' },
        { name: 'Expense Tracking', description: 'Record and categorize fleet-related expenses for budgeting' },
        { name: 'Cost Analysis', description: 'Detailed cost reports by vehicle, driver, or time period' },
        { name: 'Invoice Management', description: 'Generate invoices for billing customers and internal accounting' },
      ],
    },
    {
      title: 'Notifications & Alerts',
      icon: '🔔',
      features: [
        { name: 'Real-time Alerts', description: 'Instant notifications for speeding, harsh driving, and emergencies' },
        { name: 'Maintenance Reminders', description: 'Proactive alerts for upcoming service schedules' },
        { name: 'Driver Behavior Alerts', description: 'Monitor idling, aggressive braking, and safety concerns' },
        { name: 'Geofence Alerts', description: 'Get notified when vehicles enter or exit designated areas' },
      ],
    },
    {
      title: 'Analytics & Reporting',
      icon: '📊',
      features: [
        { name: 'Interactive Dashboard', description: 'Real-time overview of fleet status and key metrics' },
        { name: 'Custom Reports', description: 'Generate detailed reports on performance, costs, and compliance' },
        { name: 'Driver Analytics', description: 'Track driver behavior, safety scores, and performance metrics' },
        { name: 'Fleet Insights', description: 'Data-driven insights to optimize operations and reduce costs' },
      ],
    },
  ];

  const keyBenefits = [
    {
      title: 'Save up to 20% on Operations',
      description: 'Reduce fuel consumption, optimize routes, and minimize downtime through intelligent fleet management',
    },
    {
      title: 'Increase Safety & Compliance',
      description: 'Monitor driver behavior, track maintenance schedules, and maintain full compliance records',
    },
    {
      title: 'Real-time Visibility',
      description: 'Track every vehicle 24/7 with live GPS updates and comprehensive status information',
    },
    {
      title: 'Data-driven Decisions',
      description: 'Access powerful analytics and insights to make informed business decisions',
    },
    {
      title: 'Easy Integration',
      description: 'Seamlessly integrate with existing systems and devices for smooth implementation',
    },
    {
      title: 'Scalable Solution',
      description: 'Grow from small fleets to enterprise operations with our flexible platform',
    },
  ];

  return (
    <div className="w-full">
      <Header sidebarOpen={false} setSidebarOpen={() => {}} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-yellow-50 to-amber-50 py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Powerful Features for Fleet Management
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Everything you need to manage, monitor, and optimize your fleet operations in real-time
          </p>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Gold Fleet?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {keyBenefits.map((benefit, idx) => (
              <div key={idx} className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-700">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Categories */}
      {featureCategories.map((category, catIdx) => (
        <section key={catIdx} className={`py-16 px-6 ${catIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-12">
              <span className="text-5xl">{category.icon}</span>
              <h2 className="text-3xl font-bold text-gray-900">{category.title}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {category.features.map((feature, fIdx) => (
                <div key={fIdx} className="p-6 bg-white rounded-lg border border-gray-200 hover:border-yellow-500 hover:shadow-md transition-all">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.name}</h3>
                  <p className="text-gray-700">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Integration Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Easy Integration</h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">
            Gold Fleet integrates seamlessly with your existing systems, devices, and workflows. Our API is flexible and well-documented for custom integrations.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['REST API', 'Mobile Apps', 'GPS Devices', 'CRM Systems', 'ERP Integration', 'Payment Gateway', 'Email Alerts', 'Bulk Operations'].map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-700/50 rounded-lg text-white text-sm font-medium">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Performance Benchmarks */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Industry-Leading Performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { metric: '99.9%', label: 'Uptime SLA' },
              { metric: '<1s', label: 'Real-time Updates' },
              { metric: '100K+', label: 'Vehicles Tracked' },
              { metric: '24/7', label: 'Customer Support' },
            ].map((item, idx) => (
              <div key={idx} className="p-8 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg text-center border border-yellow-200">
                <div className="text-4xl font-bold text-yellow-600 mb-2">{item.metric}</div>
                <div className="text-gray-700 font-medium">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-yellow-500 to-yellow-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Fleet Operations?
          </h2>
          <p className="text-lg text-yellow-100 mb-8">
            Join hundreds of companies already using Gold Fleet to optimize their operations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-3 bg-white text-yellow-600 font-semibold rounded-lg hover:bg-yellow-50 transition-colors"
            >
              Start Free Trial
            </Link>
            <Link
              to="/about"
              className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Learn More
            </Link>
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
