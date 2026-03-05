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
      name: 'Basic',
      price: '¢99',
      features: [
        'Up to 50 vehicles',
        'Basic analytics',
        'Email support',
      ],
      popular: false,
    },
    {
      name: 'Pro',
      price: '¢299',
      features: [
        'Up to 500 vehicles',
        'Advanced analytics & reports',
        'Priority email support',
        'API access',
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Contact us',
      features: [
        'Unlimited vehicles',
        'Custom SLAs & integrations',
        'Dedicated account manager',
        '24/7 phone support',
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
          <h1 className="text-4xl md:text-5xl font-bold">Our Pricing</h1>
          <p className="mt-4 text-lg max-w-xl mx-auto">
            Choose a plan that fits the size of your fleet and the level of support you need.
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
                className={`border rounded-lg shadow-lg p-8 flex flex-col justify-between ${
                  plan.popular ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'
                }`}
              >
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">{plan.name}</h2>
                  <p className="text-4xl font-bold text-gray-900 mb-6">{plan.price}</p>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {plan.popular ? (
                  <Link
                    to="/signup"
                    className="mt-auto px-6 py-3 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-center"
                  >
                    Get Started
                  </Link>
                ) : (
                  <Link
                    to="/features"
                    className="mt-auto px-6 py-3 bg-white text-yellow-600 border border-yellow-600 rounded-md hover:bg-yellow-50 transition-colors text-center"
                  >
                    Learn More
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
