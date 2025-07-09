import { useAuth } from '../../context/AuthContext'

const TutorSettings = () => {
  const { user, tutorProfile } = useAuth()

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
      
      {/* Profile Information */}
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
      {tutorProfile && (
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

      {/* Account Settings */}
      <div className="glass-card p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Account Settings</h3>
        <div className="space-y-3">
          <button className="w-full btn-secondary text-left p-3 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm sm:text-base">Edit Profile</span>
              <span className="text-xl">✏️</span>
            </div>
          </button>
          <button className="w-full btn-secondary text-left p-3 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm sm:text-base">Change Password</span>
              <span className="text-xl">🔒</span>
            </div>
          </button>
          <button className="w-full btn-secondary text-left p-3 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm sm:text-base">Payment Methods</span>
              <span className="text-xl">💳</span>
            </div>
          </button>
          <button className="w-full btn-secondary text-left p-3 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm sm:text-base">Tax Information</span>
              <span className="text-xl">📊</span>
            </div>
          </button>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="glass-card p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Notifications</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-white text-sm sm:text-base">New Booking Requests</span>
              <p className="text-white/60 text-xs">Get notified when students book sessions</p>
            </div>
            <button className="w-12 h-6 bg-blue-500 rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
            </button>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-white text-sm sm:text-base">Session Reminders</span>
              <p className="text-white/60 text-xs">Reminders before upcoming sessions</p>
            </div>
            <button className="w-12 h-6 bg-blue-500 rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
            </button>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-white text-sm sm:text-base">Payment Notifications</span>
              <p className="text-white/60 text-xs">When payments are received</p>
            </div>
            <button className="w-12 h-6 bg-gray-600 rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1"></div>
            </button>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-white text-sm sm:text-base">Review Notifications</span>
              <p className="text-white/60 text-xs">When students leave reviews</p>
            </div>
            <button className="w-12 h-6 bg-blue-500 rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="glass-card p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Privacy Settings</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-white text-sm sm:text-base">Profile Visibility</span>
              <p className="text-white/60 text-xs">Show your profile to students</p>
            </div>
            <button className="w-12 h-6 bg-blue-500 rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
            </button>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-white text-sm sm:text-base">Online Status</span>
              <p className="text-white/60 text-xs">Show when you're available</p>
            </div>
            <button className="w-12 h-6 bg-blue-500 rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
            </button>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-white text-sm sm:text-base">Contact Information</span>
              <p className="text-white/60 text-xs">Share contact details with students</p>
            </div>
            <button className="w-12 h-6 bg-gray-600 rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-card p-4 sm:p-6 border-l-4 border-red-500">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Danger Zone</h3>
        <div className="space-y-3">
          <button className="w-full btn-secondary text-left p-3 rounded-xl border-red-500/20">
            <div className="flex items-center justify-between">
              <span className="text-sm sm:text-base text-red-300">Deactivate Account</span>
              <span className="text-xl">⚠️</span>
            </div>
          </button>
          <button className="w-full btn-secondary text-left p-3 rounded-xl border-red-500/20">
            <div className="flex items-center justify-between">
              <span className="text-sm sm:text-base text-red-300">Delete Account</span>
              <span className="text-xl">🗑️</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default TutorSettings 