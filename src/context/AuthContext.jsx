import { createContext, useContext, useState, useEffect } from 'react'
import apiService from '../services/api'

// Create the auth context
const AuthContext = createContext()

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [tutorProfile, setTutorProfile] = useState(null)
  const [tutor, setTutor] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      setIsLoading(true)
      
      // Check if user is authenticated
      if (apiService.isAuthenticated()) {
        const userData = apiService.getCurrentUser()
        const tutorData = apiService.getTutorProfile()
        const tutorInfo = apiService.getTutorInfo()
        
        setUser(userData)
        setTutorProfile(tutorData)
        setTutor(tutorInfo)
        setIsAuthenticated(true)

        // Verify token is still valid
        try {
          await apiService.checkAuth()
        } catch (error) {
          // Token is invalid, clear auth
          console.warn('Token validation failed:', error)
          await logout()
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      await logout()
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      setIsLoading(true)
      
      const response = await apiService.login(email, password)
      
      // Validate user status
      if (!response.user.is_active) {
        throw new Error('Your account has been deactivated. Please contact support.')
      }

      if (response.user.user_type === 'tutor' && !response.user.is_approved) {
        throw new Error('Your tutor account is pending approval. Please contact support.')
      }

      if (!response.user.is_verified) {
        throw new Error('Please verify your email address before logging in.')
      }

      // Set user data
      setUser(response.user)
      setTutorProfile(response.tutor_profile || null)
      setTutor(response.tutor || null)
      setIsAuthenticated(true)
      
      return response
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      await apiService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Always clear state regardless of API call success
      setUser(null)
      setTutorProfile(null)
      setTutor(null)
      setIsAuthenticated(false)
      setIsLoading(false)
    }
  }

  const updateUser = (userData) => {
    setUser(userData)
    localStorage.setItem('user_data', JSON.stringify(userData))
  }

  const updateTutorProfile = (profileData) => {
    setTutorProfile(profileData)
    localStorage.setItem('tutor_profile', JSON.stringify(profileData))
  }

  const updateTutor = (tutorData) => {
    setTutor(tutorData)
    localStorage.setItem('tutor_info', JSON.stringify(tutorData))
  }

  // Helper function to check user role
  const hasRole = (role) => {
    return user?.user_type === role
  }

  const isAdmin = () => hasRole('admin')
  const isTutor = () => hasRole('tutor')
  const isManager = () => hasRole('manager')
  const isStaff = () => hasRole('staff')

  // Get tutor ID for API calls
  const getTutorId = () => {
    return tutor?.id || user?.id  // Returns numeric ID like 1
  }

  const getFormattedTutorId = () => {
    // For display purposes, return the formatted tutor_id
    return tutor?.tutor_id || `TUT-${String(user?.id).padStart(3, '0')}`
  }


  // Context value
  const value = {
    // State
    user,
    tutorProfile,
    tutor,
    isAuthenticated,
    isLoading,
    
    // Actions
    login,
    logout,
    updateUser,
    updateTutorProfile,
    updateTutor,
    
    // Helpers
    hasRole,
    isAdmin,
    isTutor,
    isManager,
    isStaff,
    getTutorId,          // Returns numeric ID for API calls
    getFormattedTutorId, // Returns formatted ID for display
    
    // Re-initialize auth (useful for token refresh scenarios)
    initializeAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext