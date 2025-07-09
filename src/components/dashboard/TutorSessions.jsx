import { useAuth } from '../../context/AuthContext'
import { useState, useEffect } from 'react'
import apiService from '../../services/api'

const TutorSessions = () => {
  const { tutorProfile, getTutorId } = useAuth()
  const [sessions, setSessions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      const tutorId = getTutorId()
      if (!tutorId) {
        setError('Unable to load tutor information')
        return
      }

      const response = await apiService.getTutorSessions(tutorId)
      setSessions(response.results || response || [])
    } catch (err) {
      console.error('Error loading sessions:', err)
      setError('Failed to load sessions. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogSession = () => {
    // TODO: Implement log session functionality
    console.log('Log session clicked')
  }

  const handleJoinSession = (sessionId) => {
    // TODO: Implement join session functionality
    console.log('Join session:', sessionId)
  }

  const handleRescheduleSession = (sessionId) => {
    // TODO: Implement reschedule session functionality
    console.log('Reschedule session:', sessionId)
  }

  const handleCancelSession = (sessionId) => {
    // TODO: Implement cancel session functionality
    console.log('Cancel session:', sessionId)
  }

  // Separate sessions by type
  const todaySessions = sessions.filter(session => {
    const today = new Date().toDateString()
    const sessionDate = new Date(session.scheduled_time).toDateString()
    return sessionDate === today && session.status === 'scheduled'
  })

  const recentSessions = sessions.filter(session => 
    session.status === 'completed'
  ).slice(0, 4)

  const upcomingSessions = sessions.filter(session => {
    const today = new Date()
    const sessionDate = new Date(session.scheduled_time)
    return sessionDate > today && session.status === 'scheduled'
  }).slice(0, 3)

  // Calculate statistics
  const totalSessions = sessions.length
  const completedSessions = sessions.filter(s => s.status === 'completed').length
  const totalEarnings = sessions
    .filter(s => s.status === 'completed')
    .reduce((sum, s) => sum + (s.earnings || 0), 0)
  const avgRating = sessions.length > 0 
    ? (sessions.reduce((sum, s) => sum + (s.rating || 0), 0) / sessions.length).toFixed(1)
    : 'N/A'

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Header with Log Session Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-white">Sessions</h3>
          <p className="text-white/60 text-sm">Manage your tutoring sessions</p>
        </div>
        <button 
          onClick={handleLogSession}
          className="btn-primary text-xs sm:text-sm px-4 py-2 self-start sm:self-auto"
        >
          + Log Session
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="glass-card p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/60">Loading your sessions...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="glass-card p-4 border-l-4 border-red-500">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Today's Sessions */}
      {!isLoading && !error && (
        <div className="glass-card p-4 sm:p-6">
          <h4 className="text-base sm:text-lg font-semibold text-white mb-4">Today's Sessions</h4>
          {todaySessions.length > 0 ? (
            <div className="space-y-3">
              {todaySessions.map((session) => (
                <div key={session.id} className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div className="flex-1">
                      <h5 className="text-white font-medium text-sm sm:text-base">{session.student_name}</h5>
                      <p className="text-white/70 text-xs sm:text-sm">{session.subject}</p>
                      <p className="text-white/60 text-xs">
                        {new Date(session.scheduled_time).toLocaleTimeString()} • {session.duration} minutes
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleJoinSession(session.id)}
                        className="btn-secondary text-xs px-3 py-1"
                      >
                        Join
                      </button>
                      <button 
                        onClick={() => handleRescheduleSession(session.id)}
                        className="btn-ghost text-xs px-3 py-1"
                      >
                        Reschedule
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/60 text-sm">No sessions scheduled for today.</p>
          )}
        </div>
      )}

      {/* Recent Sessions */}
      {!isLoading && !error && recentSessions.length > 0 && (
        <div className="glass-card p-4 sm:p-6">
          <h4 className="text-base sm:text-lg font-semibold text-white mb-4">Recent Sessions</h4>
          <div className="space-y-3">
            {recentSessions.map((session) => (
              <div key={session.id} className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div className="flex-1">
                    <h5 className="text-white font-medium text-sm sm:text-base">{session.student_name}</h5>
                    <p className="text-white/70 text-xs sm:text-sm">{session.subject}</p>
                    <p className="text-white/60 text-xs">
                      {new Date(session.completed_time).toLocaleDateString()} • {session.duration} minutes
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-400 text-xs sm:text-sm font-medium">${session.earnings}</span>
                    <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
                      {session.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session Statistics */}
      {!isLoading && !error && (
        <div className="glass-card p-4 sm:p-6">
          <h4 className="text-base sm:text-lg font-semibold text-white mb-4">Session Statistics</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{totalSessions}</div>
              <div className="text-xs text-white/70">Total Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">${totalEarnings}</div>
              <div className="text-xs text-white/70">Total Earnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{avgRating}</div>
              <div className="text-xs text-white/70">Avg Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{completedSessions}</div>
              <div className="text-xs text-white/70">Completed</div>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Sessions */}
      {!isLoading && !error && upcomingSessions.length > 0 && (
        <div className="glass-card p-4 sm:p-6">
          <h4 className="text-base sm:text-lg font-semibold text-white mb-4">Upcoming Sessions</h4>
          <div className="space-y-3">
            {upcomingSessions.map((session) => (
              <div key={session.id} className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div className="flex-1">
                    <h5 className="text-white font-medium text-sm sm:text-base">{session.student_name}</h5>
                    <p className="text-white/70 text-xs sm:text-sm">{session.subject}</p>
                    <p className="text-white/60 text-xs">
                      {new Date(session.scheduled_time).toLocaleDateString()} • {new Date(session.scheduled_time).toLocaleTimeString()} • {session.duration} minutes
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleRescheduleSession(session.id)}
                      className="btn-secondary text-xs px-3 py-1"
                    >
                      Reschedule
                    </button>
                    <button 
                      onClick={() => handleCancelSession(session.id)}
                      className="btn-ghost text-xs px-3 py-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TutorSessions 