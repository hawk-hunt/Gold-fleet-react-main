import React, { useState, useEffect } from 'react'
import { FaCheck, FaClock } from 'react-icons/fa'
import api from '../services/api'

/**
 * Plan Selection Component for Company Signup
 */
export const PlanSelection = ({ selectedPlan, onSelectPlan }) => {
  const defaultPlans = [
    {
      id: 1,
      name: 'Starter',
      description: 'Perfect for small fleets',
      price: 0,
      trial_days: 12,
      max_vehicles: 5,
      max_drivers: 5,
      max_users: 2,
      has_analytics: true,
      has_map_tracking: false,
      has_maintenance_tracking: true,
      has_expense_tracking: true,
    },
    {
      id: 2,
      name: 'Professional',
      description: 'For growing businesses',
      price: 49.99,
      trial_days: 12,
      max_vehicles: 50,
      max_drivers: 50,
      max_users: 10,
      has_analytics: true,
      has_map_tracking: true,
      has_maintenance_tracking: true,
      has_expense_tracking: true,
    },
    {
      id: 3,
      name: 'Enterprise',
      description: 'For large operations',
      price: 199.99,
      trial_days: 12,
      max_vehicles: null,
      max_drivers: null,
      max_users: null,
      has_analytics: true,
      has_map_tracking: true,
      has_maintenance_tracking: true,
      has_expense_tracking: true,
    },
  ]

  const [plans, setPlans] = useState(defaultPlans)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await api.getPlans()
        console.log('✅ API Plans Response:', response)
        
        // Handle different response formats
        let fetchedPlans = []
        if (Array.isArray(response)) {
          fetchedPlans = response
          console.log('📦 Plans from API (array):', fetchedPlans)
        } else if (response && typeof response === 'object') {
          if (Array.isArray(response.data)) {
            fetchedPlans = response.data
            console.log('📦 Plans from API (response.data):', fetchedPlans)
          } else if (response.length === undefined && Object.keys(response).every(k => !isNaN(k))) {
            // Response is a collection-like object
            fetchedPlans = Object.values(response)
            console.log('📦 Plans from API (object values):', fetchedPlans)
          }
        }
        
        // Use API plans if available, otherwise use defaults
        if (fetchedPlans.length > 0) {
          console.log('🎯 Using plans from API:', fetchedPlans.map(p => ({ id: p.id, name: p.name })))
          setPlans(fetchedPlans)
        } else {
          console.warn('⚠️ No plans from API, using defaults')
          setPlans(defaultPlans)
        }
      } catch (err) {
        console.error('❌ Error fetching plans:', err.message)
        console.log('📌 Falling back to default plans')
        // Keep using default plans
        setPlans(defaultPlans)
      } finally {
        setLoading(false)
      }
    }

    // Fetch plans immediately
    fetchPlans()
  }, [])

  const features = [
    { key: 'has_analytics', label: 'Analytics Dashboard' },
    { key: 'has_map_tracking', label: 'Real-time GPS Tracking' },
    { key: 'has_maintenance_tracking', label: 'Maintenance Tracking' },
    { key: 'has_expense_tracking', label: 'Expense Management' },
  ]

  if (loading) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Your Plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Select Your Plan</h3>
        <p className="text-gray-600">
          All plans include a <span className="font-semibold">free 12-day trial</span>. No credit card required.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => onSelectPlan(plan)}
            className={`relative rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
              selectedPlan?.id === plan.id
                ? 'border-yellow-500 bg-yellow-50 shadow-xl'
                : 'border-gray-200 bg-white hover:border-yellow-300 shadow-lg hover:shadow-xl'
            }`}
          >
            {/* Selection Indicator */}
            {selectedPlan?.id === plan.id && (
              <div className="absolute top-4 right-4 bg-yellow-500 text-white rounded-full p-2">
                <FaCheck className="w-4 h-4" />
              </div>
            )}

            {/* Plan Header */}
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 px-6 py-6 border-b border-gray-100">
              <h4 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h4>
              <p className="text-sm text-gray-600 mb-4">{plan.description}</p>

              {/* Price */}
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-yellow-600">
                  ${parseFloat(plan.price).toFixed(2)}
                </span>
                <span className="text-gray-600">/month</span>
              </div>
            </div>

            {/* Trial Badge */}
            <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
              <FaClock className="text-blue-600 w-4 h-4" />
              <span className="text-sm font-medium text-blue-900">
                {plan.trial_days} days free trial
              </span>
            </div>

            {/* Limits */}
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="space-y-2 text-sm">
                {plan.max_vehicles && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Vehicles:</span>
                    <span className="font-semibold text-gray-900">{plan.max_vehicles}</span>
                  </div>
                )}
                {!plan.max_vehicles && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Vehicles:</span>
                    <span className="font-semibold text-gray-900">Unlimited</span>
                  </div>
                )}
                {plan.max_drivers && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Drivers:</span>
                    <span className="font-semibold text-gray-900">{plan.max_drivers}</span>
                  </div>
                )}
                {!plan.max_drivers && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Drivers:</span>
                    <span className="font-semibold text-gray-900">Unlimited</span>
                  </div>
                )}
                {plan.max_users && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Users:</span>
                    <span className="font-semibold text-gray-900">{plan.max_users}</span>
                  </div>
                )}
                {!plan.max_users && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Users:</span>
                    <span className="font-semibold text-gray-900">Unlimited</span>
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="px-6 py-6 space-y-3">
              {features.map((feature) => (
                <div key={feature.key} className="flex items-center gap-3">
                  {plan[feature.key] ? (
                    <FaCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <div className="w-5 h-5 text-gray-300 flex-shrink-0">
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                  <span className={`text-sm ${plan[feature.key] ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                    {feature.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Selection Highlight */}
            {selectedPlan?.id === plan.id && (
              <div className="px-6 py-4 bg-yellow-100 border-t border-yellow-200">
                <p className="text-center text-sm font-semibold text-yellow-900">Selected Plan</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default PlanSelection
