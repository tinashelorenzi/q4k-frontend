// src/pages/Dashboard.jsx - Fixed to use TutorDashboard component
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { TutorDashboard } from '../components/dashboard'


const Dashboard = () => {
  const { user, tutorProfile, logout, tutor, getFormattedTutorId } = useAuth()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Component is ready to render
    setLoading(false)
  }, [])

  const handleLogout = () => {
    logout()
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
                <p className="text-white font-medium">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-white/60 text-sm">{getFormattedTutorId()}</p>
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

      {/* Main Dashboard Content - NOW USING TutorDashboard COMPONENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TutorDashboard />
      </main>
    </div>
  )
}

export default Dashboard