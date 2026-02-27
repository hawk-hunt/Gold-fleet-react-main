import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

/**
 * Solutions Page
 * Industry-specific solutions and use cases for Gold Fleet
 * Desktop and mobile responsive
 */
export default function SolutionsPage() {
  const solutions = [
    {
      title: 'Logistics & Delivery',
      icon: '📦',
      description: 'Optimize deliveries and logistics operations',
      benefits: [
        'Real-time route optimization to reduce delivery times',
        'Driver performance tracking and accountability',
        'Automated delivery confirmations and proof of delivery',
        'Customer delivery notifications and tracking links',
        'Cost-per-delivery analytics and optimization',
      ],
      image: '/images/pexels-enginakyurt-20500734.jpg',
      color: 'from-blue-50 to-blue-100',
    },
    {
      title: 'Construction & Equipment',
      icon: '🏗️',
      description: 'Manage construction vehicles and equipment',
      benefits: [
        'Track heavy equipment and vehicle location across job sites',
        'Monitor fuel consumption and equipment maintenance',
        'Job site arrival and departure tracking',
        'Equipment utilization and downtime analysis',
        'Compliance with construction industry regulations',
      ],
      image: '/images/pexels-silveremeya-7381783.jpg',
      color: 'from-orange-50 to-orange-100',
    },
    {
      title: 'Transportation Services',
      icon: '🚌',
      description: 'Manage passenger and charter transportation',
      benefits: [
        'Real-time vehicle and passenger tracking',
        'Driver behavior and safety monitoring',
        'Schedule optimization and route planning',
        'Fuel efficiency tracking and cost reduction',
        'Maintenance scheduling and vehicle health monitoring',
      ],
      image: '/images/pexels-vladimirsrajber-21407450.jpg',
      color: 'from-green-50 to-green-100',
    },
    {
      title: 'Service & Maintenance',
      icon: '🔧',
      description: 'Optimize field service operations',
      benefits: [
        'Dispatch technicians to service locations efficiently',
        'Real-time job tracking and completion status',
        'Service history and maintenance records',
        'Customer communication and scheduling',
        'Resource utilization and productivity metrics',
      ],
      image: '/images/pexels-mikebirdy-244822.jpg',
      color: 'from-purple-50 to-purple-100',
    },
    {
      title: 'Emergency Services',
      icon: '🚨',
      description: 'Critical fleet management for emergency response',
      benefits: [
        'Real-time emergency vehicle dispatch',
        'GPS tracking for rapid response coordination',
        'Communication and data sharing between units',
        'Historical data for performance analysis',
        'Compliance reporting for regulations',
      ],
      image: '/images/pexels-onetrillionpixels-33336584.png',
      color: 'from-red-50 to-red-100',
    },
    {
      title: 'Sales & Distribution',
      icon: '🛒',
      description: 'Manage sales representative and distribution routes',
      benefits: [
        'Territory management and sales rep tracking',
        'Customer visit scheduling and route optimization',
        'Sales performance and call history',
        'Inventory tracking at delivery points',
        'Real-time field reporting and insights',
      ],
      image: '/images/howz-nguyen-AAhnWrD_8vk-unsplash.jpg',
      color: 'from-pink-50 to-pink-100',
    },
  ];

  const useCases = [
    {
      title: 'Reduce Fuel Costs',
      description: 'Monitor fuel consumption, optimize routes, and identify inefficient driving patterns to reduce fuel expenses by up to 20%.',
      metrics: [
        '20% fuel savings',
        'Route optimization',
        'Driver behavior insights',
      ],
    },
    {
      title: 'Improve Safety',
      description: 'Monitor driver behavior, detect harsh driving, speeding, and unsafe practices to create a safer fleet and reduce insurance costs.',
      metrics: [
        'Accident reduction',
        'Driver scoring',
        'Compliance reporting',
      ],
    },
    {
      title: 'Maintenance Excellence',
      description: 'Automated maintenance scheduling, service history tracking, and predictive maintenance alerts to keep vehicles operating optimally.',
      metrics: [
        'Scheduled maintenance',
        'Extended vehicle life',
        'Reduced breakdowns',
      ],
    },
    {
      title: 'Increase Productivity',
      description: 'Optimize dispatch, route planning, and resource allocation to maximize vehicle utilization and driver productivity.',
      metrics: [
        'Route efficiency',
        'Time savings',
        'Output increase',
      ],
    },
    {
      title: 'Ensure Compliance',
      description: 'Comprehensive audit trails, automated reporting, and compliance tracking for regulatory requirements and business standards.',
      metrics: [
        'Audit ready',
        'Compliance tracking',
        'Legal protection',
      ],
    },
    {
      title: 'Enhanced Visibility',
      description: 'Real-time tracking dashboard providing complete visibility into fleet operations, vehicle status, and driver performance.',
      metrics: [
        '24/7 tracking',
        'Real-time alerts',
        'Live dashboard',
      ],
    },
  ];

  const testimonials = [
    {
      name: 'John Smith',
      company: 'ABC Logistics',
      role: 'Fleet Manager',
      quote: 'Gold Fleet has transformed our operations. We\'ve reduced fuel costs by 18% and improved on-time deliveries significantly.',
    },
    {
      name: 'Sarah Johnson',
      company: 'FastCourier Services',
      role: 'Operations Director',
      quote: 'The real-time tracking has been a game-changer for customer service. Customers love being able to track their packages live.',
    },
    {
      name: 'Mike Davis',
      company: 'Premier Transportation',
      role: 'Safety Manager',
      quote: 'Our driver safety has improved dramatically with the behavior monitoring. Insurance rates have even gone down.',
    },
  ];

  return (
    <div className="w-full">
      <Header sidebarOpen={false} setSidebarOpen={() => {}} />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-yellow-600 to-yellow-500 py-20 px-6">
        <div className="max-w-7xl mx-auto text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Enterprise Solutions for Every Fleet
          </h1>
          <p className="text-lg md:text-xl text-yellow-100 max-w-2xl mx-auto">
            Tailored fleet management solutions for logistics, transportation, construction, and more. Drive efficiency, safety, and profitability.
          </p>
        </div>
      </section>

      {/* Industry Solutions Grid */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
            Solutions by Industry
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {solutions.map((solution, idx) => (
              <div
                key={idx}
                className={`bg-gradient-to-br ${solution.color} rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-200`}
              >
                {/* Image */}
                <div className="h-48 overflow-hidden">
                  <img
                    src={solution.image}
                    alt={solution.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl">{solution.icon}</span>
                    <h3 className="text-xl font-bold text-gray-900">{solution.title}</h3>
                  </div>
                  <p className="text-gray-700 text-sm mb-4">{solution.description}</p>
                  <ul className="space-y-2 mb-6">
                    {solution.benefits.map((benefit, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-yellow-600 font-bold">✓</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/signup"
                    className="inline-block text-yellow-600 font-semibold hover:text-yellow-700 transition-colors"
                  >
                    Learn More →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases / Business Outcomes */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
            Business Outcomes & Use Cases
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {useCases.map((useCase, idx) => (
              <div
                key={idx}
                className="p-8 bg-white rounded-lg border-l-4 border-yellow-600 shadow-md hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-3">{useCase.title}</h3>
                <p className="text-gray-700 mb-6">{useCase.description}</p>
                <div className="space-y-2">
                  {useCase.metrics.map((metric, mIdx) => (
                    <div key={mIdx} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                      {metric}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Implementation Process */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
            Quick Implementation Process
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Assessment',
                description: 'Analyze your fleet needs and existing operations',
              },
              {
                step: '2',
                title: 'Setup',
                description: 'Configure system with your vehicles and routes',
              },
              {
                step: '3',
                title: 'Training',
                description: 'Train your team on the platform',
              },
              {
                step: '4',
                title: 'Launch',
                description: 'Start optimizing and monitoring',
              },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 bg-yellow-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-700 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-yellow-50 to-amber-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
            Proven ROI
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                metric: '6 months',
                label: 'Average ROI payback period',
              },
              {
                metric: '18-25%',
                label: 'Cost reduction (fuel, maintenance, labor)',
              },
              {
                metric: '40%',
                label: 'Improvement in on-time performance',
              },
              {
                metric: '35%',
                label: 'Reduction in driver-related incidents',
              },
            ].map((item, idx) => (
              <div key={idx} className="p-8 bg-white rounded-lg text-center border border-yellow-200 shadow-md">
                <div className="text-4xl font-bold text-yellow-600 mb-2">{item.metric}</div>
                <div className="text-gray-700 font-medium">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="p-8 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border border-yellow-200 shadow-md">
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500">★</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                <div className="border-t pt-4">
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-sm text-yellow-600 font-medium">{testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
            Before & After Gold Fleet
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 border-2 border-red-300 bg-red-50 rounded-lg">
              <h3 className="text-2xl font-bold text-red-700 mb-6">Before</h3>
              <ul className="space-y-3">
                {[
                  'Manual trip tracking and record-keeping',
                  'No real-time visibility into fleet',
                  'High fuel costs and inefficient routing',
                  'Reactive maintenance causing breakdowns',
                  'Limited driver accountability',
                  'Poor compliance documentation',
                  'Time-consuming manual reporting',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-700">
                    <span className="text-red-600 font-bold">✗</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-8 border-2 border-green-300 bg-green-50 rounded-lg">
              <h3 className="text-2xl font-bold text-green-700 mb-6">After</h3>
              <ul className="space-y-3">
                {[
                  'Automated tracking and real-time data',
                  '24/7 GPS visibility of all vehicles',
                  'Optimized routes saving 20% fuel',
                  'Predictive maintenance preventing issues',
                  'Complete driver monitoring and scoring',
                  'Automated compliance reporting',
                  'Instant actionable insights via dashboard',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-700">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Support & Resources */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
            Expert Support & Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '📚',
                title: 'Documentation',
                description: 'Comprehensive guides and API documentation for developers',
              },
              {
                icon: '👥',
                title: 'Dedicated Support',
                description: '24/7 customer support team to assist with any questions',
              },
              {
                icon: '🎓',
                title: 'Training Programs',
                description: 'Certification programs and training for your team',
              },
            ].map((item, idx) => (
              <div key={idx} className="p-8 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border border-yellow-200 text-center">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-700">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-yellow-600 to-yellow-500">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Fleet?
          </h2>
          <p className="text-lg text-yellow-100 mb-8">
            Join hundreds of companies optimizing their operations with Gold Fleet. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-4 bg-white text-yellow-600 font-bold rounded-lg hover:bg-yellow-50 transition-colors text-lg"
            >
              Start Free Trial
            </Link>
            <Link
              to="/contact"
              className="px-8 py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-yellow-700 transition-colors text-lg"
            >
              Schedule Demo
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
