import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useFormValidation } from '../hooks/useFormValidation'
import Header from '../components/Header'

const AuthPage = () => {
  const navigate = useNavigate()
  const { login, signup, token, isInitialized, loading: authLoading, user } = useAuth()
  const [isSignup, setIsSignup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Login validation
  const loginForm = useFormValidation(
    { email: '', password: '' },
    {
      email: {
        required: 'Email is required',
        email: 'Please enter a valid email address',
      },
      password: {
        required: 'Password is required',
        minLength: 'Password must be at least 8 characters',
      },
    }
  )

  // Signup validation
  const signupForm = useFormValidation(
    {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      company_name: '',
      company_email: '',
      company_phone: '',
      company_address: '',
    },
    {
      name: {
        required: 'Full name is required',
      },
      email: {
        required: 'Email is required',
        email: 'Please enter a valid email address',
      },
      password: {
        required: 'Password is required',
        minLength: 'Password must be at least 8 characters',
      },
      password_confirmation: {
        required: 'Please confirm your password',
      },
      company_name: {
        required: 'Company name is required',
      },
      company_email: {
        required: 'Company email is required',
        email: 'Please enter a valid company email address',
      },
    }
  )

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isInitialized && !authLoading && token) {
      const redirectPath = user?.role === 'driver' ? '/driver' : '/main'
      navigate(redirectPath, { replace: true })
    }
  }, [token, isInitialized, authLoading, navigate, user])

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!loginForm.isValid) {
      loginForm.setAllTouched()
      return
    }

    setError('')
    setLoading(true)

    try {
      const result = await login(loginForm.values.email, loginForm.values.password)
      
      // If login returns email_verified: false, show appropriate message
      if (!result.user?.email_verified) {
        setError('Please verify your email before logging in. Check your email for the verification link.')
        return
      }
      
      const redirectPath = result.user?.role === 'driver' ? '/driver' : '/main'
      navigate(redirectPath, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    if (!signupForm.isValid) {
      signupForm.setAllTouched()
      return
    }

    setError('')
    setLoading(true)

    try {
      const signupData = {
        name: signupForm.values.name,
        email: signupForm.values.email,
        password: signupForm.values.password,
        password_confirmation: signupForm.values.password_confirmation,
        company_name: signupForm.values.company_name,
        company_email: signupForm.values.company_email,
        company_phone: signupForm.values.company_phone || undefined,
        company_address: signupForm.values.company_address || undefined,
      }

      await signup(signupData)
      // Ensure any existing token is cleared and do NOT auto-login.
      sessionStorage.removeItem('auth_token')
      setIsSignup(false)
      loginForm.resetForm()
      // Navigate explicitly to the login view and show a verification message
      setError('✓ Account created successfully! Please check your email for a verification link. Click the link in the email to activate your account.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <Header sidebarOpen={false} setSidebarOpen={() => {}} />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-amber-50 p-4">
      <div className="bg-white rounded-xl shadow-md flex flex-col md:flex-row w-full max-w-4xl overflow-hidden">
        {/* Left Section - Login Form */}
        <div className="md:w-1/2 p-8">
          <h2 className="text-2xl font-bold mb-6">
            {isSignup ? 'Create Your Account' : 'Sign in to Gold Fleet'}
          </h2>
          
          {/* Error/Success Message */}
          {error && (
            <div className={`mb-4 p-3 rounded border ${
              error.includes('✓') || error.includes('Account created')
                ? 'bg-green-100 border-green-400 text-green-700'
                : 'bg-red-100 border-red-400 text-red-700'
            }`}>
              {error}
            </div>
          )}

          {/* Login Form */}
          {!isSignup && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={loginForm.values.email}
                  onChange={loginForm.handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    loginForm.errors.email
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-yellow-600'
                  }`}
                  placeholder="you@example.com"
                  required
                />
                {loginForm.errors.email && (
                  <p className="mt-1 text-sm text-red-600">{loginForm.errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={loginForm.values.password}
                  onChange={loginForm.handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    loginForm.errors.password
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-yellow-600'
                  }`}
                  placeholder="••••••••"
                  required
                />
                {loginForm.errors.password && (
                  <p className="mt-1 text-sm text-red-600">{loginForm.errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="inline-flex items-center">
                  <input type="checkbox" className="form-checkbox h-4 w-4 text-yellow-600" />
                  <span className="ml-2 text-sm text-gray-600">Keep me logged in</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-yellow-600 hover:underline">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading || !loginForm.isValid}
                className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          )}

          {/* Signup Form */}
          {isSignup && (
            <form onSubmit={handleSignup} className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={signupForm.values.name}
                  onChange={signupForm.handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    signupForm.errors.name
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-yellow-600'
                  }`}
                  placeholder="Enter your name"
                  required
                />
                {signupForm.errors.name && (
                  <p className="mt-1 text-sm text-red-600">{signupForm.errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={signupForm.values.email}
                  onChange={signupForm.handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    signupForm.errors.email
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-yellow-600'
                  }`}
                  placeholder="you@example.com"
                  required
                />
                {signupForm.errors.email && (
                  <p className="mt-1 text-sm text-red-600">{signupForm.errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={signupForm.values.password}
                  onChange={signupForm.handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    signupForm.errors.password
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-yellow-600'
                  }`}
                  placeholder="••••••••"
                  required
                />
                {signupForm.errors.password && (
                  <p className="mt-1 text-sm text-red-600">{signupForm.errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="password_confirmation"
                  value={signupForm.values.password_confirmation}
                  onChange={signupForm.handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    signupForm.errors.password_confirmation
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-yellow-600'
                  }`}
                  placeholder="••••••••"
                  required
                />
                {signupForm.errors.password_confirmation && (
                  <p className="mt-1 text-sm text-red-600">{signupForm.errors.password_confirmation}</p>
                )}
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Company Information</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={signupForm.values.company_name}
                    onChange={signupForm.handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      signupForm.errors.company_name
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-yellow-600'
                    }`}
                    placeholder="Company Name"
                    required
                  />
                  {signupForm.errors.company_name && (
                    <p className="mt-1 text-sm text-red-600">{signupForm.errors.company_name}</p>
                  )}
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Email
                  </label>
                  <input
                    type="email"
                    name="company_email"
                    value={signupForm.values.company_email}
                    onChange={signupForm.handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      signupForm.errors.company_email
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-yellow-600'
                    }`}
                    placeholder="company@example.com"
                    required
                  />
                  {signupForm.errors.company_email && (
                    <p className="mt-1 text-sm text-red-600">{signupForm.errors.company_email}</p>
                  )}
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Phone
                  </label>
                  <input
                    type="tel"
                    name="company_phone"
                    value={signupForm.values.company_phone}
                    onChange={signupForm.handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600"
                    placeholder="**********"
                  />
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Address
                  </label>
                  <input
                    type="text"
                    name="company_address"
                    value={signupForm.values.company_address}
                    onChange={signupForm.handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600"
                    placeholder="St, City, Region"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !signupForm.isValid}
                className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-4"
              >
                {loading ? 'Signing up...' : 'Create Account'}
              </button>
            </form>
          )}
          
          {/* Sign up / Login Toggle */}
          <div className="text-center mt-4">
            <button
              onClick={() => {
                setIsSignup(!isSignup)
                setError('')
              }}
              className="text-sm text-yellow-600 hover:underline"
            >
              {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-gray-300"></div>
            <span className="px-2 text-gray-500 text-sm">OR</span>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>

          {/* Social Login Buttons */}
          <button className="w-full flex items-center justify-center border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition-colors mb-3">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Login with Google
          </button>

          <button className="w-full flex items-center justify-center border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="mr-2 w-5 h-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M493.4 24.6l-104-24c-11.3-2.6-22.9 3.3-27.5 13.9l-48 112c-4.2 9.8-1.4 21.3 6.9 28l60.6 49.6c-36 76.7-98.9 140.5-177.2 177.2l-49.6-60.6c-6.8-8.3-18.2-11.1-28-6.9l-112 48C3.9 366.5-2 378.1.6 389.4l24 104C27.1 504.2 36.7 512 48 512c256.1 0 464-207.5 464-464 0-11.2-7.7-20.9-18.6-23.4z"></path>
            </svg>
            Login with SMS
          </button>
        </div>

        {/* Right Section - Info Panel (Hidden on Mobile) */}
        <div className="hidden md:flex md:w-1/2 p-8 bg-gray-50 flex-col justify-center">
          <h3 className="text-xl font-semibold mb-4">What's New</h3>
          <ul className="space-y-2 text-sm text-gray-700 mb-6">
            <li>• Feature A launched</li>
            <li>• Scheduled maintenance tomorrow</li>
            <li>• New notification system</li>
          </ul>

          <h3 className="text-xl font-semibold mb-4">System Updates</h3>
          <ul className="space-y-2 text-sm text-gray-700 mb-6">
            <li>• Version 1.2 deployed</li>
            <li>• API improvements</li>
          </ul>

          <h3 className="text-xl font-semibold mb-4">Fleet Notifications</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• New alert: vehicle #42</li>
            <li>• Tire pressure low on vehicle #7</li>
          </ul>
        </div>
      </div>
      </div>
    </div>
  )
}

export default AuthPage
