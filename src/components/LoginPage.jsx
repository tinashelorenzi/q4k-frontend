import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const LoginPage = ({ onBack }) => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

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

    try {
      await login(formData.email, formData.password)
      
      // Redirect to dashboard on successful login
      navigate('/dashboard')
      
    } catch (err) {
      // Handle different types of errors
      if (err.message.includes('deactivated')) {
        setError('Your account has been deactivated. Please contact support.')
      } else if (err.message.includes('pending approval')) {
        setError('Your tutor account is pending approval. Please contact support.')
      } else if (err.message.includes('verify your email')) {
        setError('Please verify your email address before logging in.')
      } else if (err.message.includes('credentials')) {
        setError('Invalid email or password. Please try again.')
      } else {
        setError(err.message || 'Login failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen animated-gradient flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-white font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                placeholder="your.email@example.com"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-white font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
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
                <span>Sign In</span>
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
                <button className="text-blue-400 hover:text-blue-300 underline">
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