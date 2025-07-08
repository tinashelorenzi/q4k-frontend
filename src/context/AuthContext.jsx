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
        
        setUser(userData)
        setTutorProfile(tutorData)
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
      
      setUser(response.user)
      setTutorProfile(response.tutor_profile)
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

  // Helper function to check user role
  const hasRole = (role) => {
    return user?.user_type === role
  }

  const isAdmin = () => hasRole('admin')
  const isTutor = () => hasRole('tutor')
  const isManager = () => hasRole('manager')
  const isStaff = () => hasRole('staff')

  // Context value
  const value = {
    // State
    user,
    tutorProfile,
    isAuthenticated,
    isLoading,
    
    // Actions
    login,
    logout,
    updateUser,
    updateTutorProfile,
    
    // Helpers
    hasRole,
    isAdmin,
    isTutor,
    isManager,
    isStaff,
    
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