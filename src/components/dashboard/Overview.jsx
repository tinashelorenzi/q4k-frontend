import { useAuth } from '../../context/AuthContext'

const Overview = () => {
  const { isTutor } = useAuth()

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Quick Stats - Mobile Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-card p-3 sm:p-4 text-center">
          <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">📚</div>
          <div className="text-lg sm:text-xl font-bold text-white">12</div>
          <div className="text-xs sm:text-sm text-white/70">Sessions</div>
        </div>
        <div className="glass-card p-3 sm:p-4 text-center">
          <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">⏱️</div>
          <div className="text-lg sm:text-xl font-bold text-white">24h</div>
          <div className="text-xs sm:text-sm text-white/70">Total Time</div>
        </div>
        <div className="glass-card p-3 sm:p-4 text-center">
          <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">🎯</div>
          <div className="text-lg sm:text-xl font-bold text-white">85%</div>
          <div className="text-xs sm:text-sm text-white/70">Progress</div>
        </div>
        <div className="glass-card p-3 sm:p-4 text-center">
          <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">⭐</div>
          <div className="text-lg sm:text-xl font-bold text-white">4.8</div>
          <div className="text-xs sm:text-sm text-white/70">Rating</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { title: 'Math Session Completed', time: '2 hours ago', type: 'session' },
            { title: 'Assignment Submitted', time: '1 day ago', type: 'assignment' },
            { title: 'New Message from Tutor', time: '2 days ago', type: 'message' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-3 py-2">
              <div className={`w-2 h-2 rounded-full ${
                activity.type === 'session' ? 'bg-green-400' :
                activity.type === 'assignment' ? 'bg-blue-400' : 'bg-purple-400'
              }`}></div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm sm:text-base font-medium truncate">{activity.title}</p>
                <p className="text-white/60 text-xs sm:text-sm">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions Grid - Mobile Optimized */}
      <div className="glass-card p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {isTutor() ? (
            <>
              <button className="btn-primary p-3 sm:p-4 text-center space-y-1 sm:space-y-2 rounded-xl">
                <div className="text-xl sm:text-2xl">📚</div>
                <div className="text-xs sm:text-sm font-medium">My Gigs</div>
              </button>
              <button className="btn-primary p-3 sm:p-4 text-center space-y-1 sm:space-y-2 rounded-xl">
                <div className="text-xl sm:text-2xl">⏰</div>
                <div className="text-xs sm:text-sm font-medium">Log Session</div>
              </button>
              <button className="btn-secondary p-3 sm:p-4 text-center space-y-1 sm:space-y-2 rounded-xl">
                <div className="text-xl sm:text-2xl">💬</div>
                <div className="text-xs sm:text-sm font-medium">Messages</div>
              </button>
              <button className="btn-secondary p-3 sm:p-4 text-center space-y-1 sm:space-y-2 rounded-xl">
                <div className="text-xl sm:text-2xl">📊</div>
                <div className="text-xs sm:text-sm font-medium">Analytics</div>
              </button>
            </>
          ) : (
            <>
              <button className="btn-primary p-3 sm:p-4 text-center space-y-1 sm:space-y-2 rounded-xl">
                <div className="text-xl sm:text-2xl">📖</div>
                <div className="text-xs sm:text-sm font-medium">Study</div>
              </button>
              <button className="btn-primary p-3 sm:p-4 text-center space-y-1 sm:space-y-2 rounded-xl">
                <div className="text-xl sm:text-2xl">📝</div>
                <div className="text-xs sm:text-sm font-medium">Homework</div>
              </button>
              <button className="btn-secondary p-3 sm:p-4 text-center space-y-1 sm:space-y-2 rounded-xl">
                <div className="text-xl sm:text-2xl">👨‍🏫</div>
                <div className="text-xs sm:text-sm font-medium">Find Tutor</div>
              </button>
              <button className="btn-secondary p-3 sm:p-4 text-center space-y-1 sm:space-y-2 rounded-xl">
                <div className="text-xl sm:text-2xl">📅</div>
                <div className="text-xs sm:text-sm font-medium">Schedule</div>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Overview 