import { useAuth } from '../../context/AuthContext'

const TutorSessions = () => {
  const { tutorProfile } = useAuth()

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Header with Log Session Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-white">Sessions</h3>
          <p className="text-white/60 text-sm">Manage your tutoring sessions</p>
        </div>
        <button className="btn-primary text-xs sm:text-sm px-4 py-2 self-start sm:self-auto">
          + Log Session
        </button>
      </div>

      {/* Today's Sessions */}
      <div className="glass-card p-4 sm:p-6">
        <h4 className="text-base sm:text-lg font-semibold text-white mb-4">Today's Sessions</h4>
        <div className="space-y-3">
          {[
            { student: 'Sarah M.', subject: 'Mathematics', time: '10:00 AM', duration: '1 hour', status: 'upcoming' },
            { student: 'John D.', subject: 'Physics', time: '2:00 PM', duration: '1.5 hours', status: 'upcoming' },
            { student: 'Emma L.', subject: 'Chemistry', time: '4:30 PM', duration: '1 hour', status: 'upcoming' }
          ].map((session, index) => (
            <div key={index} className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="flex-1">
                  <h5 className="text-white font-medium text-sm sm:text-base">{session.student}</h5>
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

      {/* Recent Sessions */}
      <div className="glass-card p-4 sm:p-6">
        <h4 className="text-base sm:text-lg font-semibold text-white mb-4">Recent Sessions</h4>
        <div className="space-y-3">
          {[
            { student: 'Sarah M.', subject: 'Mathematics', date: 'Yesterday', duration: '1 hour', status: 'completed', earnings: '$45' },
            { student: 'John D.', subject: 'Physics', date: '2 days ago', duration: '1.5 hours', status: 'completed', earnings: '$75' },
            { student: 'Emma L.', subject: 'Chemistry', date: '3 days ago', duration: '1 hour', status: 'completed', earnings: '$40' },
            { student: 'Mike R.', subject: 'Mathematics', date: '1 week ago', duration: '1 hour', status: 'completed', earnings: '$45' }
          ].map((session, index) => (
            <div key={index} className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="flex-1">
                  <h5 className="text-white font-medium text-sm sm:text-base">{session.student}</h5>
                  <p className="text-white/70 text-xs sm:text-sm">{session.subject}</p>
                  <p className="text-white/60 text-xs">{session.date} • {session.duration}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-400 text-xs sm:text-sm font-medium">{session.earnings}</span>
                  <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
                    {session.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Session Statistics */}
      <div className="glass-card p-4 sm:p-6">
        <h4 className="text-base sm:text-lg font-semibold text-white mb-4">Session Statistics</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">24</div>
            <div className="text-xs text-white/70">This Month</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">$1,240</div>
            <div className="text-xs text-white/70">Monthly Earnings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">4.9</div>
            <div className="text-xs text-white/70">Avg Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">19</div>
            <div className="text-xs text-white/70">Total Students</div>
          </div>
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="glass-card p-4 sm:p-6">
        <h4 className="text-base sm:text-lg font-semibold text-white mb-4">Upcoming Sessions</h4>
        <div className="space-y-3">
          {[
            { student: 'Sarah M.', subject: 'Mathematics', date: 'Tomorrow', time: '10:00 AM', duration: '1 hour' },
            { student: 'John D.', subject: 'Physics', date: 'Friday', time: '2:00 PM', duration: '1.5 hours' },
            { student: 'Emma L.', subject: 'Chemistry', date: 'Monday', time: '4:30 PM', duration: '1 hour' }
          ].map((session, index) => (
            <div key={index} className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="flex-1">
                  <h5 className="text-white font-medium text-sm sm:text-base">{session.student}</h5>
                  <p className="text-white/70 text-xs sm:text-sm">{session.subject}</p>
                  <p className="text-white/60 text-xs">{session.date} • {session.time} • {session.duration}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="btn-secondary text-xs px-3 py-1">Reschedule</button>
                  <button className="btn-ghost text-xs px-3 py-1">Cancel</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TutorSessions 