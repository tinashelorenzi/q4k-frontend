import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import apiService from '../../services/api'

const TutorDashboard = () => {
  const { user, tutorProfile, getTutorId } = useAuth()
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
      thisWeekHours: 0,
      thisMonthEarnings: 0,
      averageRating: 0,
      activeStudents: 0
    }
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError('')

      const tutorId = getTutorId()
      if (!tutorId) {
        throw new Error('Unable to load tutor information')
      }

      // Load tutor's gigs and sessions
      const [gigsResponse, sessionsResponse] = await Promise.all([
        apiService.getTutorGigs(tutorId, { limit: 10 }),
        apiService.getTutorSessions(tutorId, { limit: 10 })
      ])

      const gigsList = gigsResponse.results || gigsResponse || []
      const sessions = sessionsResponse.results || sessionsResponse || []

      // Get detailed information for each gig (to get proper calculations)
      const detailedGigs = await Promise.all(
        gigsList.slice(0, 5).map(async (gig) => {
          try {
            const detailedGig = await apiService.getGigDetails(gig.id)
            // The API already provides all calculated fields, so we just use them directly
            return {
              ...detailedGig,
              // Use API calculated fields directly
              hours_remaining: detailedGig.total_hours_remaining || 0,
              completion_percentage: parseFloat(detailedGig.completion_percentage) || 0,
              total_earned: parseFloat(detailedGig.hours_completed || 0) * parseFloat(detailedGig.hourly_rate_tutor || 0),
              potential_earnings: parseFloat(detailedGig.total_tutor_remuneration || 0)
            }
          } catch (err) {
            console.error(`Error loading details for gig ${gig.id}:`, err)
            // Fallback to basic gig data if details fail
            return {
              ...gig,
              hours_remaining: (gig.total_hours || 0) - (gig.hours_completed || 0),
              completion_percentage: gig.total_hours > 0 
                ? ((gig.hours_completed || 0) / gig.total_hours) * 100 
                : 0,
              total_earned: (gig.hours_completed || 0) * (gig.hourly_rate_tutor || 0),
              potential_earnings: (gig.total_hours || 0) * (gig.hourly_rate_tutor || 0)
            }
          }
        })
      )

      // Calculate comprehensive statistics using detailed gig data
      const stats = calculateTutorStats(detailedGigs, sessions)

      setDashboardData({
        gigs: detailedGigs,
        recentSessions: sessions.slice(0, 5),
        stats
      })
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const calculateTutorStats = (detailedGigs, sessions) => {
    // Get all gigs for comprehensive stats using the API calculated fields
    const totalGigs = detailedGigs.length
    const activeGigs = detailedGigs.filter(gig => gig.status === 'active').length
    const completedHours = detailedGigs.reduce((total, gig) => 
      total + parseFloat(gig.hours_completed || 0), 0
    )
    const pendingSessions = sessions.filter(session => session.status === 'pending').length
    
    // Use the properly calculated earnings from API
    const totalEarnings = detailedGigs.reduce((total, gig) => 
      total + (parseFloat(gig.hours_completed || 0) * parseFloat(gig.hourly_rate_tutor || 0)), 0
    )

    // Calculate this week's hours
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const thisWeekSessions = sessions.filter(session => 
      new Date(session.session_date) >= oneWeekAgo
    )
    const thisWeekHours = thisWeekSessions.reduce((total, session) => 
      total + parseFloat(session.hours_logged || 0), 0
    )

    // Calculate this month's earnings using detailed gig data
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    const thisMonthSessions = sessions.filter(session => 
      new Date(session.session_date) >= oneMonthAgo
    )
    const thisMonthEarnings = thisMonthSessions.reduce((total, session) => {
      const gig = detailedGigs.find(g => g.id === session.gig)
      return total + (parseFloat(session.hours_logged || 0) * parseFloat(gig?.hourly_rate_tutor || 0))
    }, 0)

    // Calculate unique students (approximate from gigs)
    const activeStudents = detailedGigs.filter(gig => gig.status === 'active').length

    // Mock rating for now (could be added to API later)
    const averageRating = 4.8

    return {
      totalGigs,
      activeGigs,
      completedHours,
      pendingSessions,
      totalEarnings,
      thisWeekHours,
      thisMonthEarnings,
      averageRating,
      activeStudents
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

  const getActivityIcon = (type) => {
    switch (type) {
      case 'session':
        return { icon: '📚', color: 'bg-green-400' }
      case 'booking':
        return { icon: '📅', color: 'bg-blue-400' }
      case 'payment':
        return { icon: '💰', color: 'bg-yellow-400' }
      case 'review':
        return { icon: '⭐', color: 'bg-purple-400' }
      default:
        return { icon: '📋', color: 'bg-gray-400' }
    }
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
      month: 'short'
    })
  }

  const formatTime = (timeString) => {
    if (!timeString) return 'Not set'
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-ZA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const getRecentActivity = () => {
    const activities = []
    
    // Add recent sessions as activities
    dashboardData.recentSessions.slice(0, 3).forEach(session => {
      if (session.status === 'completed') {
        activities.push({
          title: `Session with ${session.gig_title || 'student'} completed`,
          time: getTimeAgo(session.session_date),
          type: 'session',
          amount: `${session.hours_logged || 0}h logged`
        })
      }
    })

    // Add recent gig updates
    dashboardData.gigs.slice(0, 2).forEach(gig => {
      if (gig.status === 'active') {
        activities.push({
          title: `Working on ${gig.subject_name} - ${gig.level}`,
          time: getTimeAgo(gig.updated_at),
          type: 'booking',
          amount: formatCurrency(gig.hourly_rate_tutor || 0) + '/hr'
        })
      }
    })

    return activities.slice(0, 4) // Return max 4 activities
  }

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} days ago`
    const diffInWeeks = Math.floor(diffInDays / 7)
    return `${diffInWeeks} weeks ago`
  }

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-3 sm:p-4 animate-pulse">
              <div className="h-8 bg-white/10 rounded mb-2"></div>
              <div className="h-6 bg-white/10 rounded mb-1"></div>
              <div className="h-4 bg-white/10 rounded"></div>
            </div>
          ))}
        </div>
        <div className="glass-card p-4 sm:p-6 animate-pulse">
          <div className="h-6 bg-white/10 rounded mb-4 w-48"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-white/10 rounded"></div>
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
      
      {/* Quick Stats - Mobile Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-card p-3 sm:p-4 text-center">
          <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">📚</div>
          <div className="text-lg sm:text-xl font-bold text-white">
            {dashboardData.stats.completedHours}
          </div>
          <div className="text-xs sm:text-sm text-white/70">Hours Taught</div>
        </div>
        <div className="glass-card p-3 sm:p-4 text-center">
          <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">💰</div>
          <div className="text-lg sm:text-xl font-bold text-white">
            {formatCurrency(dashboardData.stats.thisMonthEarnings)}
          </div>
          <div className="text-xs sm:text-sm text-white/70">This Month</div>
        </div>
        <div className="glass-card p-3 sm:p-4 text-center">
          <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">⭐</div>
          <div className="text-lg sm:text-xl font-bold text-white">
            {dashboardData.stats.averageRating}
          </div>
          <div className="text-xs sm:text-sm text-white/70">Rating</div>
        </div>
        <div className="glass-card p-3 sm:p-4 text-center">
          <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">👥</div>
          <div className="text-lg sm:text-xl font-bold text-white">
            {dashboardData.stats.activeGigs}
          </div>
          <div className="text-xs sm:text-sm text-white/70">Active Gigs</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {getRecentActivity().length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📋</div>
              <p className="text-white/70">No recent activity</p>
              <p className="text-white/50 text-sm">Start logging sessions to see activity here</p>
            </div>
          ) : (
            getRecentActivity().map((activity, index) => {
              const { icon, color } = getActivityIcon(activity.type)
              return (
                <div key={index} className="flex items-center space-x-3 py-2">
                  <div className={`w-2 h-2 rounded-full ${color}`}></div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{activity.title}</p>
                    <p className="text-white/60 text-xs">{activity.time}</p>
                  </div>
                  <span className="text-white/70 text-xs font-medium">{activity.amount}</span>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <button className="btn-primary p-3 sm:p-4 text-center space-y-1 sm:space-y-2 rounded-xl hover:scale-105 transition-transform">
            <div className="text-xl sm:text-2xl">📚</div>
            <div className="text-xs sm:text-sm font-medium">My Gigs</div>
          </button>
          <button className="btn-primary p-3 sm:p-4 text-center space-y-1 sm:space-y-2 rounded-xl hover:scale-105 transition-transform">
            <div className="text-xl sm:text-2xl">⏰</div>
            <div className="text-xs sm:text-sm font-medium">Log Session</div>
          </button>
          <button className="btn-secondary p-3 sm:p-4 text-center space-y-1 sm:space-y-2 rounded-xl hover:scale-105 transition-transform">
            <div className="text-xl sm:text-2xl">💬</div>
            <div className="text-xs sm:text-sm font-medium">Messages</div>
          </button>
          <button className="btn-secondary p-3 sm:p-4 text-center space-y-1 sm:space-y-2 rounded-xl hover:scale-105 transition-transform">
            <div className="text-xl sm:text-2xl">📊</div>
            <div className="text-xs sm:text-sm font-medium">Analytics</div>
          </button>
        </div>
      </div>

      {/* Current Gigs Overview */}
      <div className="glass-card p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-white">Current Gigs</h3>
          <span className="text-xs sm:text-sm text-white/70">
            {dashboardData.stats.activeGigs} active
          </span>
        </div>
        
        {dashboardData.gigs.filter(gig => gig.status === 'active').length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📚</div>
            <p className="text-white/70">No active gigs</p>
            <p className="text-white/50 text-sm">New gig assignments will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dashboardData.gigs
              .filter(gig => gig.status === 'active')
              .slice(0, 3)
              .map((gig) => {
                const progress = gig.total_hours > 0 
                  ? ((gig.hours_completed || 0) / gig.total_hours) * 100 
                  : 0
                
                return (
                  <div key={gig.id} className="bg-white/5 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">
                          {gig.subject_name} - {gig.level}
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
                        <span>{parseFloat(gig.hours_completed || 0).toFixed(1)} / {parseFloat(gig.total_hours || 0).toFixed(1)} hours</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-500 bg-gradient-to-r from-blue-500 to-purple-500"
                          style={{ width: `${Math.min(parseFloat(gig.completion_percentage) || 0, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-white/60 mt-1">
                        {parseFloat(gig.completion_percentage || 0).toFixed(1)}% Complete • {parseFloat(gig.total_hours_remaining || 0).toFixed(1)} hours remaining
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-white/70">
                        Rate: {formatCurrency(parseFloat(gig.hourly_rate_tutor || 0))}/hr
                      </span>
                      <span className="text-green-400 font-medium">
                        Earned: {formatCurrency(parseFloat(gig.hours_completed || 0) * parseFloat(gig.hourly_rate_tutor || 0))}
                      </span>
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </div>

      {/* Upcoming Sessions */}
      <div className="glass-card p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Recent Sessions</h3>
        <div className="space-y-3">
          {dashboardData.recentSessions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">⏰</div>
              <p className="text-white/70">No recent sessions</p>
              <p className="text-white/50 text-sm">Logged sessions will appear here</p>
            </div>
          ) : (
            dashboardData.recentSessions.slice(0, 3).map((session, index) => (
              <div key={index} className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div className="flex-1">
                    <h4 className="text-white font-medium text-sm sm:text-base">
                      {session.gig_title || 'Session'}
                    </h4>
                    <p className="text-white/70 text-xs sm:text-sm">
                      {formatDate(session.session_date)} • {formatTime(session.start_time)} - {formatTime(session.end_time)}
                    </p>
                    <p className="text-white/60 text-xs">
                      Duration: {session.hours_logged || 0} hours • 
                      {session.student_attendance ? ' ✓ Present' : ' ✗ Absent'}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(session.status)}`}>
                      {session.status?.charAt(0).toUpperCase() + session.status?.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default TutorDashboard