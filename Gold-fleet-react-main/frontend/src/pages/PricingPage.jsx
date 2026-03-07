import React from 'react';
import Header from '../components/Header';
import { Link } from 'react-router-dom';

/**
 * Pricing Page
 * Shows available plans and pricing details
 */
export default function PricingPage() {
  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      subtext: 'Perfect for small fleets',
      trialText: '12 days free trial',
      features: [
        'Up to 5 vehicles',
        'Up to 5 drivers',
        'Up to 2 team members',
        'Analytics dashboard',
        'Maintenance tracking',
        'Expense management',
      ],
      popular: false,
    },
    {
      name: 'Professional',
      price: '$49.99',
      subtext: 'For growing businesses',
      trialText: '12 days free trial',
      period: '/month',
      features: [
        'Up to 50 vehicles',
        'Up to 50 drivers',
        'Up to 10 team members',
        'Advanced analytics & reports',
        'Real-time GPS tracking',
        'Maintenance tracking',
        'Expense management',
        'Priority email support',
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '$199.99',
      subtext: 'For large-scale operations',
      trialText: '12 days free trial',
      period: '/month',
      features: [
        'Unlimited vehicles',
        'Unlimited drivers',
        'Unlimited team members',
        'Advanced analytics & reports',
        'Real-time GPS tracking',
        'Maintenance tracking',
        'Expense management',
        'Dedicated account manager',
        'Custom integrations',
      ],
      popular: false,
    },
  ];

  return (
    <div className="w-full">
      <Header sidebarOpen={false} setSidebarOpen={() => {}} />

      {/* Hero */}
      <header className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">Simple, Transparent Pricing</h1>
          <p className="mt-4 text-lg max-w-xl mx-auto">
            All plans include a 12-day free trial. No credit card required. Choose the plan that fits your fleet size.
          </p>
        </div>
      </header>

      {/* Plans */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={`border rounded-lg shadow-lg p-8 flex flex-col justify-between transition-all duration-300 ${
                  plan.popular 
                    ? 'border-yellow-500 bg-yellow-50 transform scale-105' 
                    : 'border-gray-200 hover:border-yellow-300 hover:shadow-xl'
                }`}
              >
                {plan.popular && (
                  <div className="mb-4">
                    <span className="bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-1">{plan.name}</h2>
                  {plan.subtext && (
                    <p className="text-sm text-gray-600 mb-4">{plan.subtext}</p>
                  )}
                  <div className="flex items-baseline gap-1 mb-2">
                    <p className="text-4xl font-bold text-gray-900">{plan.price}</p>
                    {plan.period && <span className="text-gray-600">{plan.period}</span>}
                  </div>
                  {plan.trialText && (
                    <p className="text-sm text-blue-600 font-semibold mb-6">{plan.trialText}</p>
                  )}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {plan.popular ? (
                  <Link
                    to="/login"
                    className="mt-auto px-6 py-3 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-colors text-center"
                  >
                    Start Free Trial
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="mt-auto px-6 py-3 bg-white text-yellow-600 border border-yellow-600 rounded-lg font-semibold hover:bg-yellow-50 transition-colors text-center"
                  >
                    Start Free Trial
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
