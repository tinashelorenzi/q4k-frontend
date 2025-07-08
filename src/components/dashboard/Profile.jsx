import { useAuth } from '../../context/AuthContext'

const Profile = () => {
  const { user, tutorProfile, isTutor } = useAuth()

  const getUserRoleDisplay = () => {
    switch (user?.user_type) {
      case 'admin': return 'System Administrator'
      case 'manager': return 'Manager'
      case 'tutor': return 'Tutor'
      case 'staff': return 'Staff Member'
      default: return 'User'
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* User Profile */}
      <div className="glass-card p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Profile Information</h3>
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:justify-between py-2">
            <span className="text-white/70 text-sm">Name:</span>
            <span className="text-white text-sm sm:text-base">{user?.first_name} {user?.last_name}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between py-2">
            <span className="text-white/70 text-sm">Email:</span>
            <span className="text-white text-sm sm:text-base break-all">{user?.email}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between py-2">
            <span className="text-white/70 text-sm">Role:</span>
            <span className="text-white text-sm sm:text-base">{getUserRoleDisplay()}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between py-2">
            <span className="text-white/70 text-sm">Status:</span>
            <span className={`text-sm px-2 py-1 rounded font-medium ${
              user?.is_active 
                ? 'bg-green-500/20 text-green-300' 
                : 'bg-red-500/20 text-red-300'
            }`}>
              {user?.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Tutor Profile Section */}
      {isTutor() && tutorProfile && (
        <div className="glass-card p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Tutor Profile</h3>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between py-2">
              <span className="text-white/70 text-sm">Experience:</span>
              <span className="text-white text-sm sm:text-base">{tutorProfile.years_of_experience} years</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between py-2">
              <span className="text-white/70 text-sm">Hourly Rate:</span>
              <span className="text-white text-sm sm:text-base">
                {tutorProfile.hourly_rate ? `$${tutorProfile.hourly_rate}` : 'Not set'}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between py-2">
              <span className="text-white/70 text-sm">Subjects:</span>
              <span className="text-white text-sm sm:text-base">
                {tutorProfile.subjects || 'Not specified'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="glass-card p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Settings</h3>
        <div className="space-y-3">
          <button className="w-full btn-secondary text-left p-3 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm sm:text-base">Edit Profile</span>
              <span className="text-xl">✏️</span>
            </div>
          </button>
          <button className="w-full btn-secondary text-left p-3 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm sm:text-base">Notifications</span>
              <span className="text-xl">🔔</span>
            </div>
          </button>
          <button className="w-full btn-secondary text-left p-3 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm sm:text-base">Privacy Settings</span>
              <span className="text-xl">🔒</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile 