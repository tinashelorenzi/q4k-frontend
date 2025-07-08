import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const LoginPage = ({ onBack, onLoginSuccess }) => {
  const { login, isLoading: authLoading } = useAuth()
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      setIsLoading(false)
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      setIsLoading(false)
      return
    }

    try {
      const response = await login(formData.email, formData.password)
      
      // Login successful
      console.log('Login successful:', response)
      
      // Call success callback with user data
      if (onLoginSuccess) {
        onLoginSuccess(response.user)
      }
      
    } catch (err) {
      console.error('Login error:', err)
      
      // Handle specific error messages
      let errorMessage = 'Login failed. Please try again.'
      
      if (err.message.includes('Invalid email or password')) {
        errorMessage = 'Invalid email or password. Please check your credentials.'
      } else if (err.message.includes('Account is locked')) {
        errorMessage = 'Your account is temporarily locked. Please try again later or contact support.'
      } else if (err.message.includes('Account is inactive')) {
        errorMessage = 'Your account is inactive. Please contact an administrator.'
      } else if (err.message.includes('Email address is not verified')) {
        errorMessage = 'Please verify your email address before logging in.'
      } else if (err.message.includes('Account is pending approval')) {
        errorMessage = 'Your account is pending approval. Please contact an administrator.'
      } else if (err.message.includes('fetch')) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.'
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading spinner if auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen animated-gradient flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white">Initializing...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen animated-gradient flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center space-x-2 text-white/70 hover:text-white transition-colors group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Home</span>
        </button>

        {/* Login Card */}
        <div className="glass-card p-8 animate-slide-up">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/25">
              <span className="text-white font-bold text-2xl">Q4K</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-white/60">Sign in to your management portal</p>
          </div>

          {/* Environment Indicator (only in development) */}
          {import.meta.env.DEV && (
            <div className="mb-6 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <p className="text-blue-300 text-sm text-center">
                🔧 Development Mode - API: {import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}
              </p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-white font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pl-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  placeholder="your.email@example.com"
                  required
                  disabled={isLoading}
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-white font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pl-12 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/70 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                disabled={isLoading}
              >
                Forgot your password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full btn-primary flex items-center justify-center space-x-2 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-white/20"></div>
            <span className="px-4 text-white/60 text-sm">or</span>
            <div className="flex-1 border-t border-white/20"></div>
          </div>

          {/* Alternative Actions */}
          <div className="space-y-3">
            <a 
              href="https://quest4knowledge.co.za" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full btn-secondary text-center"
            >
              Visit Main Platform
            </a>
            
            <div className="text-center">
              <p className="text-white/60 text-sm">
                Need access?{' '}
                <button 
                  className="text-blue-400 hover:text-blue-300 underline transition-colors"
                  disabled={isLoading}
                >
                  Contact Administrator
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-6">
          <p className="text-white/40 text-sm">
            Quest4Knowledge Management Portal
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage