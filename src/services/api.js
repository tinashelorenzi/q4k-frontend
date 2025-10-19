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
  async login(email, password, turnstileToken = null) {
    try {
      const payload = { email, password };
      if (turnstileToken) {
        payload.turnstile_token = turnstileToken;
      }
      
      const response = await fetch(`${this.apiURL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
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

      // Store tutor info if available
      if (data.tutor) {
        localStorage.setItem('tutor_info', JSON.stringify(data.tutor))
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
    localStorage.removeItem('tutor_info')
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

  // Get tutor info
  getTutorInfo() {
    const tutorInfo = localStorage.getItem('tutor_info')
    return tutorInfo ? JSON.parse(tutorInfo) : null
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

  // Gig Management endpoints
  async getTutorGigs(tutorId, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const endpoint = `/gigs/tutor/${tutorId}/${queryString ? `?${queryString}` : ''}`
    return await this.apiCall(endpoint)
  }

  async getGigDetails(gigId) {
    return await this.apiCall(`/gigs/${gigId}/`)
  }

  async createGig(gigData) {
    return await this.apiCall('/gigs/', {
      method: 'POST',
      body: JSON.stringify(gigData)
    })
  }

  async updateGig(gigId, gigData) {
    return await this.apiCall(`/gigs/${gigId}/`, {
      method: 'PUT',
      body: JSON.stringify(gigData)
    })
  }

  async deleteGig(gigId) {
    return await this.apiCall(`/gigs/${gigId}/`, {
      method: 'DELETE'
    })
  }

  // Session Management endpoints
  async getTutorSessions(tutorId, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const endpoint = `/gigs/sessions/tutor/${tutorId}/${queryString ? `?${queryString}` : ''}`
    return await this.apiCall(endpoint)
  }

  async getSessionDetails(sessionId) {
    return await this.apiCall(`/sessions/${sessionId}/`)
  }

  async createSession(sessionData) {
    // Extract gig ID from the sessionData
    const gigId = sessionData.gig?.id || sessionData.gig
    
    if (!gigId) {
      throw new Error('Gig ID is required to create a session')
    }
    
    // Remove gig from sessionData since it will be added by the backend
    const { gig, ...cleanSessionData } = sessionData
    
    return await this.apiCall(`/gigs/${gigId}/sessions/`, {
      method: 'POST',
      body: JSON.stringify(cleanSessionData)
    })
  }

  // Alias for createSession (for consistency)
  async createGigSession(sessionData) {
    return await this.createSession(sessionData)
  }

  async updateSession(sessionId, sessionData) {
    return await this.apiCall(`/sessions/${sessionId}/`, {
      method: 'PUT',
      body: JSON.stringify(sessionData)
    })
  }

  async deleteSession(sessionId) {
    return await this.apiCall(`/sessions/${sessionId}/`, {
      method: 'DELETE'
    })
  }

  // Tutor Profile endpoints
  async getTutorProfile(tutorId) {
    return await this.apiCall(`/tutors/${tutorId}/`)
  }

  async updateTutorProfile(tutorId, profileData) {
    return await this.apiCall(`/tutors/${tutorId}/`, {
      method: 'PUT',
      body: JSON.stringify(profileData)
    })
  }

  // General endpoints
  async getTutors(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return await this.apiCall(`/tutors/?${queryString}`)
  }

  async getGigs(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return await this.apiCall(`/gigs/?${queryString}`)
  }

  // Analytics endpoints
  async getTutorAnalytics(tutorId, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const endpoint = `/analytics/tutor/${tutorId}/${queryString ? `?${queryString}` : ''}`
    return await this.apiCall(endpoint)
  }

  async getGigAnalytics(gigId, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const endpoint = `/analytics/gig/${gigId}/${queryString ? `?${queryString}` : ''}`
    return await this.apiCall(endpoint)
  }

  // Dashboard endpoints
  async getDashboardData(userType = 'tutor', params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const endpoint = `/dashboard/${userType}/${queryString ? `?${queryString}` : ''}`
    return await this.apiCall(endpoint)
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

  // File upload endpoint
  async uploadFile(file, endpoint = '/upload/', additionalData = {}) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      // Add additional data to form
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key])
      })

      const response = await fetch(`${this.apiURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          // Don't set Content-Type for FormData, let browser set it
        },
        body: formData
      })

      return await this.handleResponse(response)
    } catch (error) {
      console.error('File upload error:', error)
      throw error
    }
  }

  // Notification endpoints
  async getNotifications(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return await this.apiCall(`/notifications/?${queryString}`)
  }

  async markNotificationAsRead(notificationId) {
    return await this.apiCall(`/notifications/${notificationId}/mark-read/`, {
      method: 'POST'
    })
  }

  async markAllNotificationsAsRead() {
    return await this.apiCall('/notifications/mark-all-read/', {
      method: 'POST'
    })
  }

  // Search endpoints
  async searchGigs(query, params = {}) {
    const searchParams = new URLSearchParams({
      q: query,
      ...params
    }).toString()
    return await this.apiCall(`/search/gigs/?${searchParams}`)
  }

  async searchTutors(query, params = {}) {
    const searchParams = new URLSearchParams({
      q: query,
      ...params
    }).toString()
    return await this.apiCall(`/search/tutors/?${searchParams}`)
  }

  async searchSessions(query, params = {}) {
    const searchParams = new URLSearchParams({
      q: query,
      ...params
    }).toString()
    return await this.apiCall(`/search/sessions/?${searchParams}`)
  }

  // User Profile Management
  async getUserProfile() {
    return await this.apiCall('/auth/profile/')
  }

  async updateUserProfile(profileData) {
    return await this.apiCall('/auth/profile/update/', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    })
  }

  async partialUpdateUserProfile(profileData) {
    return await this.apiCall('/auth/profile/update/', {
      method: 'PATCH',
      body: JSON.stringify(profileData)
    })
  }

  // Password Management
  async changePassword(passwordData) {
    const { currentPassword, newPassword, confirmPassword } = passwordData
    return await this.apiCall('/auth/change-password/', {
      method: 'POST',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      })
    })
  }

  async requestPasswordReset(email) {
    return await this.apiCall('/auth/password-reset/', {
      method: 'POST',
      body: JSON.stringify({ email })
    })
  }

  // Account Settings
  async getUserSettings() {
    return await this.apiCall('/auth/settings/')
  }

  async updateUserSettings(settingsData) {
    return await this.apiCall('/auth/settings/', {
      method: 'PUT',
      body: JSON.stringify(settingsData)
    })
  }

  async partialUpdateUserSettings(settingsData) {
    return await this.apiCall('/auth/settings/', {
      method: 'PATCH',
      body: JSON.stringify(settingsData)
    })
  }

  // Account Management
  async deactivateAccount(password) {
    return await this.apiCall('/auth/deactivate/', {
      method: 'POST',
      body: JSON.stringify({ password })
    })
  }

  // Tutor Profile Management (already exists, but adding for completeness)
  async getMyTutorProfile() {
    return await this.apiCall('/tutors/my-profile/')
  }

  async updateMyTutorProfile(profileData) {
    return await this.apiCall('/tutors/my-profile/', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    })
  }

  async partialUpdateMyTutorProfile(profileData) {
    return await this.apiCall('/tutors/my-profile/', {
      method: 'PATCH',
      body: JSON.stringify(profileData)
    })
  }

  async getMyTutorInfo() {
    return await this.apiCall('/tutors/my-info/')
  }

  async updateMyTutorInfo(tutorData) {
    return await this.apiCall('/tutors/my-info/', {
      method: 'PUT',
      body: JSON.stringify(tutorData)
    })
  }

  // Profile Avatar/Image Upload (if you plan to add this)
  async uploadProfileImage(imageFile) {
    const formData = new FormData()
    formData.append('profile_image', imageFile)
    
    return await this.apiCall('/auth/profile/image/', {
      method: 'POST',
      body: formData,
      headers: {
        // Remove Content-Type to let browser set it with boundary for FormData
        ...this.getAuthHeaders(),
        'Content-Type': undefined
      }
    })
  }
}

// Create and export a singleton instance
const apiService = new ApiService()
export default apiService

// Export the class as well for testing purposes
export { ApiService }