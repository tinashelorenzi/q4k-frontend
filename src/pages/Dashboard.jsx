// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)
  const [tutorData, setTutorData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load user data from localStorage
    const storedUserData = localStorage.getItem('user_data')
    const storedTutorData = localStorage.getItem('tutor_data')
    const accessToken = localStorage.getItem('access_token')

    if (!accessToken) {
      // No token found, redirect to login
      navigate('/login')
      return
    }

    if (storedUserData && storedTutorData) {
      setUserData(JSON.parse(storedUserData))
      setTutorData(JSON.parse(storedTutorData))
    }

    setLoading(false)
  }, [navigate])

  const handleLogout = () => {
    // Clear all stored data
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_data')
    localStorage.removeItem('tutor_data')
    
    // Redirect to home
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen animated-gradient flex items-center justify-center">
        <div className="glass-card p-8 max-w-md w-full mx-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading Dashboard</h2>
          <p className="text-white/70">Please wait...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen animated-gradient">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">Q4K</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Quest4Knowledge</h1>
                <p className="text-white/60 text-sm">Tutor Portal</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white font-medium">{userData?.first_name} {userData?.last_name}</p>
                <p className="text-white/60 text-sm">{tutorData?.tutor_id}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500/20 text-red-300 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Welcome, {userData?.first_name}! 🎉
          </h2>
          <p className="text-white/80">
            Your tutor account has been successfully created. You can now start managing your tutoring activities.
          </p>
        </div>

        {/* Account Information */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-white/60 text-sm">Full Name</label>
                <p className="text-white font-medium">{userData?.first_name} {userData?.last_name}</p>
              </div>
              <div>
                <label className="text-white/60 text-sm">Email</label>
                <p className="text-white font-medium">{userData?.email}</p>
              </div>
              <div>
                <label className="text-white/60 text-sm">User Type</label>
                <p className="text-white font-medium capitalize">{userData?.user_type}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Tutor Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-white/60 text-sm">Tutor ID</label>
                <p className="text-white font-medium">{tutorData?.tutor_id}</p>
              </div>
              <div>
                <label className="text-white/60 text-sm">Full Name</label>
                <p className="text-white font-medium">{tutorData?.full_name}</p>
              </div>
              <div>
                <label className="text-white/60 text-sm">Status</label>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            <button className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-4 text-center transition-all duration-300">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-white font-medium text-sm">Update Profile</p>
            </button>

            <button className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-4 text-center transition-all duration-300">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-white font-medium text-sm">New Session</p>
            </button>

            <button className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-4 text-center transition-all duration-300">
              <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-white font-medium text-sm">View Sessions</p>
            </button>

            <button className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-4 text-center transition-all duration-300">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-white font-medium text-sm">Analytics</p>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h4 className="text-white font-medium mb-2">No activity yet</h4>
            <p className="text-white/60 text-sm mb-4">Start by updating your profile or creating your first tutoring session.</p>
            <button className="btn-primary">
              Get Started
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard