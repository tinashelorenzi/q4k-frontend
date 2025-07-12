// src/pages/AccountSetupPage.jsx - Fixed with correct API URLs
import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

const AccountSetupPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  // State management
  const [step, setStep] = useState(1) // 1: verify token, 2: setup form, 3: success
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tokenData, setTokenData] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    physicalAddress: ''
  })

  // Form validation errors
  const [formErrors, setFormErrors] = useState({})

  // API base URL
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  // Verify token on component mount
  useEffect(() => {
    if (!token) {
      setError('No setup token provided. Please check your email link.')
      setLoading(false)
      return
    }
    
    verifyToken()
  }, [token])

  // Verify the setup token - FIXED URL PATH
  const verifyToken = async () => {
    try {
      setLoading(true)
      setError('')

      // CORRECTED: Use /api/auth/ instead of /api/users/
      const url = `${API_BASE_URL}/api/auth/verify-token/?token=${token}`
      console.log('🔍 Verifying token at:', url)

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('✅ Token verification response:', data)

      if (data.valid) {
        setTokenData(data)
        setStep(2) // Move to setup form
      } else {
        setError(data.error || 'Invalid or expired setup link.')
      }
    } catch (err) {
      console.error('Token verification error:', err)
      setError('Failed to verify setup link. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear field-specific error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // Validate form data
  const validateForm = () => {
    const errors = {}

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    // Phone number validation (optional but must be valid if provided)
    if (formData.phoneNumber && !/^\+?[\d\s-()]+$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Please enter a valid phone number'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Submit account setup - FIXED URL PATH
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      setError('')

      // CORRECTED: Use /api/auth/ instead of /api/users/
      const url = `${API_BASE_URL}/api/auth/complete-setup/`
      console.log('🚀 Completing setup at:', url)

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password,
          confirm_password: formData.confirmPassword,
          phone_number: formData.phoneNumber || '',
          physical_address: formData.physicalAddress || ''
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('✅ Setup completion response:', data)

      // Store tokens in localStorage
      localStorage.setItem('access_token', data.tokens.access)
      localStorage.setItem('refresh_token', data.tokens.refresh)
      localStorage.setItem('user_data', JSON.stringify(data.user))
      localStorage.setItem('tutor_data', JSON.stringify(data.tutor))
      
      setStep(3) // Move to success step
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/dashboard')
      }, 3000)

    } catch (err) {
      console.error('Setup error:', err)
      if (err.message.includes('400')) {
        setError('Please check your input and try again.')
      } else if (err.message.includes('500')) {
        setError('Server error. Please try again later.')
      } else {
        setError('Failed to complete setup. Please check your connection and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Loading screen
  if (loading && step === 1) {
    return (
      <div className="min-h-screen animated-gradient flex items-center justify-center">
        <div className="glass-card p-8 max-w-md w-full mx-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Verifying Setup Link</h2>
          <p className="text-white/70">Please wait while we verify your invitation...</p>
        </div>
      </div>
    )
  }

  // Error screen
  if (error && step === 1) {
    return (
      <div className="min-h-screen animated-gradient flex items-center justify-center">
        <div className="glass-card p-8 max-w-md w-full mx-4 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Setup Link Issue</h2>
          <p className="text-white/70 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  // Success screen
  if (step === 3) {
    return (
      <div className="min-h-screen animated-gradient flex items-center justify-center">
        <div className="glass-card p-8 max-w-md w-full mx-4 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Account Setup Complete!</h2>
          <p className="text-white/70 mb-6">
            Welcome to Quest4Knowledge! You'll be redirected to your dashboard shortly.
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    )
  }

  // Setup form (step 2)
  return (
    <div className="min-h-screen animated-gradient flex items-center justify-center py-12">
      <div className="glass-card p-8 max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/25">
            <span className="text-white font-bold text-2xl">Q4K</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Complete Your Setup</h2>
          <p className="text-white/70 mb-4">
            Welcome {tokenData?.first_name}! Please set up your account to get started.
          </p>
        </div>

        {/* Setup Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Display any general errors */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Password Field */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter a secure password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {formErrors.password && (
              <p className="text-red-400 text-sm mt-1">{formErrors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Confirm Password *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {formErrors.confirmPassword && (
              <p className="text-red-400 text-sm mt-1">{formErrors.confirmPassword}</p>
            )}
          </div>

          {/* Phone Number Field */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="+27 123 456 7890"
            />
            {formErrors.phoneNumber && (
              <p className="text-red-400 text-sm mt-1">{formErrors.phoneNumber}</p>
            )}
          </div>

          {/* Physical Address Field */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Physical Address
            </label>
            <textarea
              name="physicalAddress"
              value={formData.physicalAddress}
              onChange={handleInputChange}
              rows={3}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Your physical address"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Setting up account...' : 'Complete Setup'}
          </button>
        </form>

        {/* Back to home link */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-white/60 hover:text-white transition-colors text-sm"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default AccountSetupPage