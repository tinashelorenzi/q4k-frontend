import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import { Overview, Sessions, Progress, Profile } from '../components/dashboard'

const Dashboard = () => {
  const { user, tutorProfile, logout, isAdmin, isTutor, isManager } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getDashboardGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getUserRoleDisplay = () => {
    switch (user?.user_type) {
      case 'admin': return 'System Administrator'
      case 'manager': return 'Manager'
      case 'tutor': return 'Tutor'
      case 'staff': return 'Staff Member'
      default: return 'User'
    }
  }

  const getRoleColor = () => {
    switch (user?.user_type) {
      case 'admin': return 'from-red-500 to-pink-500'
      case 'manager': return 'from-blue-500 to-cyan-500'
      case 'tutor': return 'from-green-500 to-teal-500'
      case 'staff': return 'from-purple-500 to-indigo-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'sessions', label: 'Sessions', icon: '📚' },
    { id: 'progress', label: 'Progress', icon: '📈' },
    { id: 'profile', label: 'Profile', icon: '👤' }
  ]

  return (
    <div className="min-h-screen animated-gradient">
      {/* Mobile-First Header */}
      <header className="header-blur sticky top-0 z-50">
        <div className="px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between">
            {/* Logo and Brand - Compact on mobile */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <span className="text-white font-bold text-sm sm:text-base">Q4K</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-white">Quest4Knowledge</h1>
                <p className="text-xs text-white/60">Learning Portal</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-sm font-bold text-white">Q4K Portal</h1>
              </div>
            </div>
            
            {/* User Info and Logout - Mobile optimized */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="text-right">
                <p className="text-white text-xs sm:text-sm font-medium">
                  {user?.first_name || user?.username}
                </p>
                <p className="text-white/60 text-xs hidden sm:block">{getUserRoleDisplay()}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors"
                title="Logout"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Welcome Section - Mobile optimized */}
      <section className="px-4 py-4 sm:px-6 sm:py-6">
        <div className="glass-card p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {getDashboardGreeting()}, {user?.first_name || user?.username}! 👋
              </h2>
              <p className="text-white/70 text-sm sm:text-base">
                Ready to continue your learning journey?
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getRoleColor()} text-white text-xs sm:text-sm font-medium`}>
              {getUserRoleDisplay()}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Tab Navigation */}
      <nav className="px-4 sm:px-6 mb-4">
        <div className="flex space-x-1 bg-white/5 p-1 rounded-xl backdrop-blur-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 py-2 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="text-base sm:text-sm">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden text-xs">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="px-4 sm:px-6 pb-6 space-y-4 sm:space-y-6">
        
        {/* Overview Tab */}
        {activeTab === 'overview' && <Overview />}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && <Sessions />}

        {/* Progress Tab */}
        {activeTab === 'progress' && <Progress />}

        {/* Profile Tab */}
        {activeTab === 'profile' && <Profile />}

      </main>

      {/* Development Notice */}
      {import.meta.env.DEV && (
        <div className="px-4 sm:px-6 pb-6">
          <div className="glass-card p-4 border-l-4 border-blue-500">
            <h3 className="text-sm sm:text-base font-semibold text-white mb-2">🔧 Development Mode</h3>
            <p className="text-white/80 text-xs sm:text-sm">
              This is a development build. Additional features are being added continuously.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard