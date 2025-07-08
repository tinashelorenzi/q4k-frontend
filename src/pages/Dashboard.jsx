import { useAuth } from '../context/AuthContext'

const Dashboard = () => {
  const { user, tutorProfile, logout, isAdmin, isTutor, isManager } = useAuth()

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

  return (
    <div className="min-h-screen animated-gradient">
      {/* Header */}
      <header className="header-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <span className="text-white font-bold text-xl">Q4K</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Quest4Knowledge</h1>
                <p className="text-sm text-white/60">Management Portal</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-white text-sm">Welcome back,</p>
                <p className="text-white font-medium">{user?.first_name || user?.username}</p>
              </div>
              <button
                onClick={handleLogout}
                className="btn-secondary text-sm flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="glass-card p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {getDashboardGreeting()}, {user?.first_name || user?.username}!
                </h2>
                <p className="text-white/80">
                  Welcome to your Quest4Knowledge management dashboard.
                </p>
              </div>
              <div className={`w-32 h-16 bg-gradient-to-r ${getRoleColor()} rounded-xl flex items-center justify-center`}>
                <div className="text-center">
                  <p className="text-white text-xs font-medium">Role</p>
                  <p className="text-white text-sm font-bold">{getUserRoleDisplay()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Info Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Profile Information */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Profile Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/70">Full Name:</span>
                  <span className="text-white">{user?.full_name || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Email:</span>
                  <span className="text-white">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Username:</span>
                  <span className="text-white">{user?.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Phone:</span>
                  <span className="text-white">{user?.phone_number || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Member Since:</span>
                  <span className="text-white">
                    {user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Account Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Verified:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user?.is_verified 
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                      : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                  }`}>
                    {user?.is_verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Approved:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user?.is_approved 
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                      : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                  }`}>
                    {user?.is_approved ? 'Approved' : 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user?.is_active 
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}>
                    {user?.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Last Login:</span>
                  <span className="text-white">
                    {user?.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tutor Profile (if user is a tutor) */}
          {isTutor() && (
            <div className="glass-card p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Tutor Profile</h3>
              {tutorProfile ? (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/70">Experience:</span>
                      <span className="text-white">{tutorProfile.years_of_experience} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Hourly Rate:</span>
                      <span className="text-white">
                        {tutorProfile.hourly_rate ? `$${tutorProfile.hourly_rate}/hr` : 'Not set'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Available:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        tutorProfile.is_available 
                          ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}>
                        {tutorProfile.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white/70 mb-2">Subjects:</h4>
                    <p className="text-white text-sm">
                      {tutorProfile.subjects_of_expertise || 'No subjects listed'}
                    </p>
                  </div>
                  {tutorProfile.bio && (
                    <div className="md:col-span-2">
                      <h4 className="text-white/70 mb-2">Bio:</h4>
                      <p className="text-white text-sm">{tutorProfile.bio}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-white/70">No tutor profile found. Please contact an administrator.</p>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {isAdmin() && (
                <>
                  <button className="btn-primary p-4 text-center space-y-2">
                    <div className="text-2xl">👥</div>
                    <div className="text-sm">Manage Tutors</div>
                  </button>
                  <button className="btn-primary p-4 text-center space-y-2">
                    <div className="text-2xl">📊</div>
                    <div className="text-sm">View Reports</div>
                  </button>
                </>
              )}
              
              {isTutor() && (
                <>
                  <button className="btn-primary p-4 text-center space-y-2">
                    <div className="text-2xl">📚</div>
                    <div className="text-sm">My Gigs</div>
                  </button>
                  <button className="btn-primary p-4 text-center space-y-2">
                    <div className="text-2xl">⏰</div>
                    <div className="text-sm">Log Session</div>
                  </button>
                </>
              )}
              
              <button className="btn-secondary p-4 text-center space-y-2">
                <div className="text-2xl">⚙️</div>
                <div className="text-sm">Settings</div>
              </button>
              
              <a 
                href="https://quest4knowledge.co.za" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-secondary p-4 text-center space-y-2 block"
              >
                <div className="text-2xl">🌐</div>
                <div className="text-sm">Main Site</div>
              </a>
            </div>
          </div>

          {/* Development Notice */}
          {import.meta.env.DEV && (
            <div className="glass-card p-6 border-l-4 border-blue-500">
              <h3 className="text-lg font-semibold text-white mb-2">🔧 Development Mode</h3>
              <p className="text-white/80 text-sm">
                This is a development build. Additional features like tutor management, gig assignment, 
                and reporting will be available in the full version.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Dashboard