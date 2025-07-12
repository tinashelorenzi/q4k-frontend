// src/pages/AccountSetupPage.jsx
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

  // Verify the setup token
  const verifyToken = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(`${API_BASE_URL}/api/users/verify-token/?token=${token}`)
      const data = await response.json()

      if (response.ok && data.valid) {
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

  // Submit account setup
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      setError('')

      const response = await fetch(`${API_BASE_URL}/api/users/complete-setup/`, {
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

      const data = await response.json()

      if (response.ok) {
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
      } else {
        if (data.error) {
          setError(data.error)
        } else if (data.password) {
          setFormErrors({ password: data.password.join(', ') })
        } else {
          setError('Account setup failed. Please try again.')
        }
      }
    } catch (err) {
      console.error('Setup error:', err)
      setError('Failed to complete setup. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Loading step
  if (step === 1 && loading) {
    return (
      <div className="min-h-screen animated-gradient flex items-center justify-center">
        <div className="glass-card p-8 max-w-md w-full mx-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Verifying Setup Link</h2>
          <p className="text-white/70">Please wait while we validate your invitation...</p>
        </div>
      </div>
    )
  }

  // Error step
  if (error && step < 3) {
    return (
      <div className="min-h-screen animated-gradient flex items-center justify-center">
        <div className="glass-card p-8 max-w-md w-full mx-4 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Setup Link Issue</h2>
          <p className="text-red-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="btn-primary w-full"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    )
  }

  // Success step
  if (step === 3) {
    return (
      <div className="min-h-screen animated-gradient flex items-center justify-center">
        <div className="glass-card p-8 max-w-md w-full mx-4 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to Quest4Knowledge!</h2>
          <p className="text-white/80 mb-2">Your tutor account has been created successfully.</p>
          <p className="text-white/60 text-sm mb-6">Redirecting to your dashboard...</p>
          
          <div className="bg-white/10 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-white mb-2">Account Details</h3>
            <div className="text-left text-white/80 text-sm space-y-1">
              <p><span className="font-medium">Name:</span> {tokenData?.first_name} {tokenData?.last_name}</p>
              <p><span className="font-medium">Tutor ID:</span> {tokenData?.tutor_id}</p>
              <p><span className="font-medium">Email:</span> {tokenData?.email}</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary w-full"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Setup form step
  return (
    <div className="min-h-screen animated-gradient flex items-center justify-center py-12">
      <div className="glass-card p-8 max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/25">
            <span className="text-white font-bold text-2xl">Q4K</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Complete Your Setup</h2>
          <p className="text-white/60">Create your tutor account password</p>
        </div>

        {/* User Information Display */}
        {tokenData && (
          <div className="bg-white/10 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-white mb-2">Your Information</h3>
            <div className="text-white/80 text-sm space-y-1">
              <p><span className="font-medium">Name:</span> {tokenData.first_name} {tokenData.last_name}</p>
              <p><span className="font-medium">Tutor ID:</span> {tokenData.tutor_id}</p>
              <p><span className="font-medium">Email:</span> {tokenData.email}</p>
              <p><span className="font-medium">Expires:</span> {formatDate(tokenData.expires_at)}</p>
            </div>
          </div>
        )}

        {/* Setup Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-white font-medium mb-2">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 pr-12 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                  formErrors.password ? 'border-red-500' : 'border-white/20'
                }`}
                placeholder="Enter a secure password"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
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
            {formErrors.password && (
              <p className="text-red-400 text-sm mt-1">{formErrors.password}</p>
            )}
            <p className="text-white/50 text-xs mt-1">
              Must be 8+ characters with uppercase, lowercase, and number
            </p>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-white font-medium mb-2">
              Confirm Password *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 pr-12 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                  formErrors.confirmPassword ? 'border-red-500' : 'border-white/20'
                }`}
                placeholder="Confirm your password"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
              >
                {showConfirmPassword ? (
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
            {formErrors.confirmPassword && (
              <p className="text-red-400 text-sm mt-1">{formErrors.confirmPassword}</p>
            )}
          </div>

          {/* Phone Number Field */}
          <div>
            <label htmlFor="phoneNumber" className="block text-white font-medium mb-2">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                formErrors.phoneNumber ? 'border-red-500' : 'border-white/20'
              }`}
              placeholder="+27 123 456 7890"
              disabled={loading}
            />
            {formErrors.phoneNumber && (
              <p className="text-red-400 text-sm mt-1">{formErrors.phoneNumber}</p>
            )}
          </div>

          {/* Physical Address Field */}
          <div>
            <label htmlFor="physicalAddress" className="block text-white font-medium mb-2">
              Physical Address (Optional)
            </label>
            <textarea
              id="physicalAddress"
              name="physicalAddress"
              value={formData.physicalAddress}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
              placeholder="123 Main Street, City, Province, Postal Code"
              disabled={loading}
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating Account...
              </>
            ) : (
              'Create My Account'
            )}
          </button>
        </form>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-white/50 text-xs">
            Need help? Contact support at{' '}
            <a href="mailto:support@quest4knowledge.com" className="text-blue-400 hover:underline">
              support@quest4knowledge.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default AccountSetupPage