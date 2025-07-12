import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import apiService from '../../services/api'

const Overview = () => {
  const { user, tutorProfile, isTutor, getTutorId } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dashboardData, setDashboardData] = useState({
    gigs: [],
    recentSessions: [],
    stats: {
      totalGigs: 0,
      activeGigs: 0,
      completedHours: 0,
      pendingSessions: 0,
      totalEarnings: 0,
      thisWeekHours: 0
    }
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError('')

      if (isTutor()) {
        const tutorId = getTutorId()
        if (!tutorId) {
          throw new Error('Unable to load tutor information')
        }

        // Load tutor's gigs and sessions
        const [gigsResponse, sessionsResponse] = await Promise.all([
          apiService.getTutorGigs(tutorId, { limit: 10 }),
          apiService.getTutorSessions(tutorId, { limit: 5 })
        ])

        const gigs = gigsResponse.results || gigsResponse || []
        const sessions = sessionsResponse.results || sessionsResponse || []

        // Calculate statistics
        const stats = calculateTutorStats(gigs, sessions)

        setDashboardData({
          gigs: gigs.slice(0, 5), // Show only 5 recent gigs
          recentSessions: sessions,
          stats
        })
      } else {
        // For regular users, load their session data
        // This would be implemented based on your student/user endpoints
        setDashboardData({
          gigs: [],
          recentSessions: [],
          stats: {
            totalGigs: 0,
            activeGigs: 0,
            completedHours: 0,
            pendingSessions: 0,
            totalEarnings: 0,
            thisWeekHours: 0
          }
        })
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const calculateTutorStats = (gigs, sessions) => {
    const totalGigs = gigs.length
    const activeGigs = gigs.filter(gig => gig.status === 'active').length
    const completedHours = gigs.reduce((total, gig) => total + (gig.hours_completed || 0), 0)
    const pendingSessions = sessions.filter(session => session.status === 'pending').length
    const totalEarnings = gigs.reduce((total, gig) => 
      total + ((gig.hours_completed || 0) * (gig.hourly_rate_tutor || 0)), 0
    )

    // Calculate this week's hours
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const thisWeekSessions = sessions.filter(session => 
      new Date(session.session_date) >= oneWeekAgo
    )
    const thisWeekHours = thisWeekSessions.reduce((total, session) => 
      total + (session.hours_logged || 0), 0
    )

    return {
      totalGigs,
      activeGigs,
      completedHours,
      pendingSessions,
      totalEarnings,
      thisWeekHours
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'text-green-400 bg-green-400/10 border-green-400/20'
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      case 'completed':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
      case 'cancelled':
        return 'text-red-400 bg-red-400/10 border-red-400/20'
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20'
    }
  }

  const getProgressColor = (percentage) => {
    if (percentage >= 75) return 'bg-gradient-to-r from-green-500 to-green-400'
    if (percentage >= 50) return 'bg-gradient-to-r from-blue-500 to-blue-400'
    if (percentage >= 25) return 'bg-gradient-to-r from-yellow-500 to-yellow-400'
    return 'bg-gradient-to-r from-red-500 to-red-400'
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-ZA', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="h-4 bg-white/10 rounded mb-2"></div>
              <div className="h-8 bg-white/10 rounded"></div>
            </div>
          ))}
        </div>
        <div className="glass-card p-6 animate-pulse">
          <div className="h-6 bg-white/10 rounded mb-4 w-48"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-white/10 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-card p-6 border-l-4 border-red-500">
        <div className="flex items-center space-x-3">
          <span className="text-red-500 text-xl">⚠️</span>
          <div>
            <h3 className="text-white font-semibold">Error Loading Dashboard</h3>
            <p className="text-white/70 text-sm">{error}</p>
            <button 
              onClick={loadDashboardData}
              className="mt-2 btn-primary text-xs py-1 px-3"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Section */}
      <div className="glass-card p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
          Welcome back, {user?.first_name || 'User'}! 👋
        </h2>
        <p className="text-white/70 text-sm sm:text-base">
          {isTutor() 
            ? "Here's your tutoring overview and recent activity." 
            : "Here's your learning progress and upcoming sessions."
          }
        </p>
      </div>

      {/* Statistics Cards */}
      {isTutor() && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="glass-card p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-blue-400">
              {dashboardData.stats.totalGigs}
            </div>
            <div className="text-xs sm:text-sm text-white/70">Total Gigs</div>
          </div>
          
          <div className="glass-card p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-green-400">
              {dashboardData.stats.activeGigs}
            </div>
            <div className="text-xs sm:text-sm text-white/70">Active Gigs</div>
          </div>
          
          <div className="glass-card p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-purple-400">
              {dashboardData.stats.completedHours}
            </div>
            <div className="text-xs sm:text-sm text-white/70">Hours Taught</div>
          </div>
          
          <div className="glass-card p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-yellow-400">
              {formatCurrency(dashboardData.stats.totalEarnings)}
            </div>
            <div className="text-xs sm:text-sm text-white/70">Total Earned</div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="glass-card p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
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

      {/* Tutor-specific content */}
      {isTutor() && (
        <>
          {/* Recent Gigs */}
          <div className="glass-card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-white">Recent Gigs</h3>
              <span className="text-xs sm:text-sm text-white/70">
                {dashboardData.gigs.length} of {dashboardData.stats.totalGigs} total
              </span>
            </div>
            
            {dashboardData.gigs.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📚</div>
                <p className="text-white/70">No gigs yet</p>
                <p className="text-white/50 text-sm">Your assigned gigs will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboardData.gigs.slice(0, 5).map((gig) => (
                  <div key={gig.id} className="bg-white/5 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">
                          {gig.title || `${gig.subject_name} - ${gig.level}`}
                        </h4>
                        <p className="text-white/70 text-sm">
                          Client: {gig.client_name || 'Not specified'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(gig.status)}`}>
                        {gig.status?.charAt(0).toUpperCase() + gig.status?.slice(1)}
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-white/70 mb-1">
                        <span>Progress</span>
                        <span>
                          {gig.hours_completed || 0} / {gig.total_hours || 0} hours
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            getProgressColor(gig.total_hours > 0 
                              ? ((gig.hours_completed || 0) / gig.total_hours) * 100 
                              : 0)
                          }`}
                          style={{ 
                            width: `${gig.total_hours > 0 
                              ? ((gig.hours_completed || 0) / gig.total_hours) * 100 
                              : 0}%` 
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-white/70">
                        Rate: {formatCurrency(gig.hourly_rate_tutor || 0)}/hr
                      </span>
                      <span className="text-green-400 font-medium">
                        Earned: {formatCurrency((gig.hours_completed || 0) * (gig.hourly_rate_tutor || 0))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Sessions */}
          <div className="glass-card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-white">Recent Sessions</h3>
              <span className="text-xs sm:text-sm text-white/70">
                Last 5 sessions
              </span>
            </div>
            
            {dashboardData.recentSessions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">⏰</div>
                <p className="text-white/70">No sessions yet</p>
                <p className="text-white/50 text-sm">Your logged sessions will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboardData.recentSessions.map((session) => (
                  <div key={session.id} className="bg-white/5 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-white">
                          {session.gig_title || 'Session'}
                        </h4>
                        <p className="text-white/70 text-sm">
                          {formatDate(session.session_date)} • {session.start_time} - {session.end_time}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(session.status)}`}>
                        {session.status?.charAt(0).toUpperCase() + session.status?.slice(1)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-white/70">
                        Duration: {session.hours_logged || 0} hours
                      </span>
                      <span className="text-blue-400">
                        {session.student_attendance ? '✓ Student Present' : '✗ Student Absent'}
                      </span>
                    </div>
                    
                    {session.session_notes && (
                      <p className="text-white/60 text-sm mt-2 italic">
                        "{session.session_notes.length > 100 
                          ? session.session_notes.substring(0, 100) + '...' 
                          : session.session_notes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weekly Summary */}
          <div className="glass-card p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">This Week</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {dashboardData.stats.thisWeekHours}
                </div>
                <div className="text-sm text-white/70">Hours Taught</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {dashboardData.stats.pendingSessions}
                </div>
                <div className="text-sm text-white/70">Pending Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {formatCurrency(dashboardData.stats.thisWeekHours * 
                    (dashboardData.gigs[0]?.hourly_rate_tutor || 0))}
                </div>
                <div className="text-sm text-white/70">Week's Earnings</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Regular user content */}
      {!isTutor() && (
        <div className="glass-card p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Your Learning Journey</h3>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎓</div>
            <h4 className="text-white font-semibold mb-2">Ready to Start Learning?</h4>
            <p className="text-white/70 mb-4">
              Connect with expert tutors and begin your educational journey.
            </p>
            <button className="btn-primary px-6 py-2">
              Find a Tutor
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Overview