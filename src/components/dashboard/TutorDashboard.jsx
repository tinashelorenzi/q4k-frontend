import { useAuth } from '../../context/AuthContext'

const TutorDashboard = () => {
  const { tutorProfile } = useAuth()

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Quick Stats - Mobile Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-card p-3 sm:p-4 text-center">
          <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">📚</div>
          <div className="text-lg sm:text-xl font-bold text-white">24</div>
          <div className="text-xs sm:text-sm text-white/70">Total Sessions</div>
        </div>
        <div className="glass-card p-3 sm:p-4 text-center">
          <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">💰</div>
          <div className="text-lg sm:text-xl font-bold text-white">$1,240</div>
          <div className="text-xs sm:text-sm text-white/70">This Month</div>
        </div>
        <div className="glass-card p-3 sm:p-4 text-center">
          <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">⭐</div>
          <div className="text-lg sm:text-xl font-bold text-white">4.9</div>
          <div className="text-xs sm:text-sm text-white/70">Rating</div>
        </div>
        <div className="glass-card p-3 sm:p-4 text-center">
          <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">👥</div>
          <div className="text-lg sm:text-xl font-bold text-white">12</div>
          <div className="text-xs sm:text-sm text-white/70">Active Students</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { title: 'Session with Sarah M. completed', time: '2 hours ago', type: 'session', amount: '$45' },
            { title: 'New booking from John D.', time: '4 hours ago', type: 'booking', amount: '$60' },
            { title: 'Review received from Emma L.', time: '1 day ago', type: 'review', amount: '5 stars' },
            { title: 'Payment received', time: '2 days ago', type: 'payment', amount: '$120' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-3 py-2">
              <div className={`w-2 h-2 rounded-full ${
                activity.type === 'session' ? 'bg-green-400' :
                activity.type === 'booking' ? 'bg-blue-400' : 
                activity.type === 'review' ? 'bg-yellow-400' : 'bg-purple-400'
              }`}></div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm sm:text-base font-medium truncate">{activity.title}</p>
                <p className="text-white/60 text-xs sm:text-sm">{activity.time}</p>
              </div>
              <div className="text-right">
                <span className="text-white/80 text-xs sm:text-sm font-medium">{activity.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions Grid - Mobile Optimized */}
      <div className="glass-card p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          <button className="btn-primary p-3 sm:p-4 text-center space-y-1 sm:space-y-2 rounded-xl">
            <div className="text-xl sm:text-2xl">📚</div>
            <div className="text-xs sm:text-sm font-medium">Create Gig</div>
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
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="glass-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-white">Today's Sessions</h3>
          <span className="text-white/60 text-sm">3 sessions today</span>
        </div>
        
        <div className="space-y-3">
          {[
            { student: 'Sarah M.', subject: 'Mathematics', time: '10:00 AM', duration: '1 hour', status: 'upcoming' },
            { student: 'John D.', subject: 'Physics', time: '2:00 PM', duration: '1.5 hours', status: 'upcoming' },
            { student: 'Emma L.', subject: 'Chemistry', time: '4:30 PM', duration: '1 hour', status: 'upcoming' }
          ].map((session, index) => (
            <div key={index} className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="flex-1">
                  <h4 className="text-white font-medium text-sm sm:text-base">{session.student}</h4>
                  <p className="text-white/70 text-xs sm:text-sm">{session.subject}</p>
                  <p className="text-white/60 text-xs">{session.time} • {session.duration}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="btn-secondary text-xs px-3 py-1">Join</button>
                  <button className="btn-ghost text-xs px-3 py-1">Reschedule</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TutorDashboard 