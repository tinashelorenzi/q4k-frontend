// API Service for Quest4Knowledge Management Portal
class ApiService {
    constructor() {
      this.baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
      this.apiURL = `${this.baseURL}/api`
    }
  
    // Helper method to get auth headers
    getAuthHeaders() {
      const token = localStorage.getItem('access_token')
      return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    }
  
    // Helper method to handle API responses
    async handleResponse(response) {
      const data = await response.json()
      
      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401) {
          // Token expired or invalid - clear storage and redirect to login
          this.clearAuth()
          throw new Error(data.detail || 'Authentication failed')
        }
        
        // Handle other errors
        throw new Error(data.error || data.detail || `HTTP error! status: ${response.status}`)
      }
      
      return data
    }
  
    // Authentication methods
    async login(email, password) {
      try {
        const response = await fetch(`${this.apiURL}/auth/login/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password })
        })
  
        const data = await this.handleResponse(response)
  
        // Store tokens and user data
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('refresh_token', data.refresh_token)
        localStorage.setItem('user_data', JSON.stringify(data.user))
        
        // Store tutor profile if available
        if (data.tutor_profile) {
          localStorage.setItem('tutor_profile', JSON.stringify(data.tutor_profile))
        }
  
        return data
      } catch (error) {
        console.error('Login error:', error)
        throw error
      }
    }
  
    async logout() {
      try {
        const refreshToken = localStorage.getItem('refresh_token')
        
        if (refreshToken) {
          await fetch(`${this.apiURL}/auth/logout/`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ refresh_token: refreshToken })
          })
        }
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        // Always clear local storage
        this.clearAuth()
      }
    }
  
    async refreshToken() {
      try {
        const refreshToken = localStorage.getItem('refresh_token')
        
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }
  
        const response = await fetch(`${this.apiURL}/auth/token/refresh/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: refreshToken })
        })
  
        const data = await this.handleResponse(response)
        
        // Update access token
        localStorage.setItem('access_token', data.access_token)
        
        return data
      } catch (error) {
        console.error('Token refresh error:', error)
        this.clearAuth()
        throw error
      }
    }
  
    // Clear authentication data
    clearAuth() {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_data')
      localStorage.removeItem('tutor_profile')
    }
  
    // Check if user is authenticated
    isAuthenticated() {
      const token = localStorage.getItem('access_token')
      const userData = localStorage.getItem('user_data')
      return !!(token && userData)
    }
  
    // Get current user data
    getCurrentUser() {
      const userData = localStorage.getItem('user_data')
      return userData ? JSON.parse(userData) : null
    }
  
    // Get tutor profile
    getTutorProfile() {
      const tutorProfile = localStorage.getItem('tutor_profile')
      return tutorProfile ? JSON.parse(tutorProfile) : null
    }
  
    // Check user profile endpoint
    async checkAuth() {
      try {
        const response = await fetch(`${this.apiURL}/auth/check-auth/`, {
          headers: this.getAuthHeaders()
        })
  
        return await this.handleResponse(response)
      } catch (error) {
        console.error('Auth check error:', error)
        throw error
      }
    }
  
    // Generic API call method with automatic token refresh
    async apiCall(endpoint, options = {}) {
      try {
        const response = await fetch(`${this.apiURL}${endpoint}`, {
          ...options,
          headers: {
            ...this.getAuthHeaders(),
            ...options.headers
          }
        })
  
        return await this.handleResponse(response)
      } catch (error) {
        // If token expired, try to refresh and retry once
        if (error.message.includes('Authentication failed') && !options._retry) {
          try {
            await this.refreshToken()
            return await this.apiCall(endpoint, { ...options, _retry: true })
          } catch (refreshError) {
            throw refreshError
          }
        }
        throw error
      }
    }
  
    // Future API methods can be added here
    // Example: Tutor management endpoints
    async getTutors(params = {}) {
      const queryString = new URLSearchParams(params).toString()
      return await this.apiCall(`/tutors/?${queryString}`)
    }
  
    async getGigs(params = {}) {
      const queryString = new URLSearchParams(params).toString()
      return await this.apiCall(`/gigs/?${queryString}`)
    }
  
    // Contact form submission
    async submitContactForm(formData) {
      try {
        const response = await fetch(`${this.apiURL}/contact/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        })
  
        return await this.handleResponse(response)
      } catch (error) {
        console.error('Contact form error:', error)
        throw error
      }
    }
  }
  
  // Create and export a singleton instance
  const apiService = new ApiService()
  export default apiService
  
  // Export the class as well for testing purposes
  export { ApiService }