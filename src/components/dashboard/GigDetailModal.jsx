import { useState } from 'react'

const GigDetailModal = ({ gig, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview')

  if (!gig) return null

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A'
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount || 0)
  }

  const getProgressColor = (percentage) => {
    if (percentage < 30) return 'bg-red-500'
    if (percentage < 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'paused':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30'
      case 'completed':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'cancelled':
        return 'bg-red-500/20 text-red-300 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  const calculateProgress = () => {
    const totalHours = gig.total_hours || 0
    const completedHours = gig.hours_completed || 0
    return totalHours > 0 ? (completedHours / totalHours) * 100 : 0
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'client', label: 'Client Info', icon: '👤' },
    { id: 'sessions', label: 'Sessions', icon: '📚' },
    { id: 'financial', label: 'Financial', icon: '💰' }
  ]

  const progressPercentage = calculateProgress()
  const remainingHours = (gig.total_hours || 0) - (gig.hours_completed || 0)

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">📋</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {gig.title || `${gig.subject_name} - ${gig.level}`}
                </h2>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-white/60 text-sm">ID: {gig.gig_id}</span>
                  <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(gig.status)}`}>
                    {gig.status?.charAt(0).toUpperCase() + gig.status?.slice(1)}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
            >
              <span className="text-white">✕</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-white/10">
          <div className="flex space-x-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Hours Progress */}
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Hours Progress</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{gig.hours_completed || 0}</div>
                    <div className="text-xs text-white/70">Hours Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{remainingHours}</div>
                    <div className="text-xs text-white/70">Hours Remaining</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{gig.total_hours || 0}</div>
                    <div className="text-xs text-white/70">Total Hours</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-white/10 rounded-full h-4 mb-2">
                  <div 
                    className={`h-4 rounded-full transition-all duration-500 ${getProgressColor(progressPercentage)}`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="text-xs text-white/70 text-center">
                  {progressPercentage.toFixed(1)}% Complete
                </div>
              </div>

              {/* Key Information */}
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Key Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/70">Subject:</span>
                      <span className="text-white">{gig.subject_name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Level:</span>
                      <span className="text-white capitalize">{gig.level?.replace('_', ' ') || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Your Rate:</span>
                      <span className="text-green-400 font-medium">{formatCurrency(gig.hourly_rate_tutor)}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/70">Start Date:</span>
                      <span className="text-white">{formatDate(gig.start_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">End Date:</span>
                      <span className="text-white">{formatDate(gig.end_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Sessions:</span>
                      <span className="text-white">{gig.sessions_count || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Earnings:</span>
                      <span className="text-purple-400 font-medium">
                        {formatCurrency((gig.hours_completed || 0) * (gig.hourly_rate_tutor || 0))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {gig.description && (
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                  <p className="text-white/80 leading-relaxed">{gig.description}</p>
                </div>
              )}

              {/* Notes */}
              {gig.notes && (
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Notes</h3>
                  <p className="text-white/80 leading-relaxed">{gig.notes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'client' && (
            <div className="space-y-6">
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Client Information</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Name:</span>
                    <span className="text-white font-medium">{gig.client_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Email:</span>
                    <a href={`mailto:${gig.client_email}`} className="text-blue-400 hover:text-blue-300 transition-colors">
                      {gig.client_email || 'N/A'}
                    </a>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Phone:</span>
                    <a href={`tel:${gig.client_phone}`} className="text-blue-400 hover:text-blue-300 transition-colors">
                      {gig.client_phone || 'N/A'}
                    </a>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Subject:</span>
                    <span className="text-white">{gig.subject_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Level:</span>
                    <span className="text-white capitalize">{gig.level?.replace('_', ' ') || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Contact Actions */}
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <a
                    href={`mailto:${gig.client_email}`}
                    className="flex items-center justify-center space-x-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-4 py-2 rounded-lg transition-colors"
                  >
                    <span>📧</span>
                    <span>Send Email</span>
                  </a>
                  <a
                    href={`tel:${gig.client_phone}`}
                    className="flex items-center justify-center space-x-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 px-4 py-2 rounded-lg transition-colors"
                  >
                    <span>📱</span>
                    <span>Call Client</span>
                  </a>
                </div>
              </div>

              {/* Tutor Details */}
              {gig.tutor_details && (
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Tutor Details</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Name:</span>
                      <span className="text-white font-medium">{gig.tutor_details.full_name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">ID:</span>
                      <span className="text-white">{gig.tutor_details.tutor_id || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Email:</span>
                      <span className="text-white">{gig.tutor_details.email_address || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Phone:</span>
                      <span className="text-white">{gig.tutor_details.phone_number || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Qualification:</span>
                      <span className="text-white capitalize">{gig.tutor_details.highest_qualification || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="space-y-6">
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Session Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{gig.sessions_count || 0}</div>
                    <div className="text-xs text-white/70">Total Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{gig.hours_completed || 0}</div>
                    <div className="text-xs text-white/70">Hours Logged</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {gig.recent_sessions?.filter(s => s.is_verified).length || 0}
                    </div>
                    <div className="text-xs text-white/70">Verified Sessions</div>
                  </div>
                </div>
              </div>

              {/* Recent Sessions */}
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Sessions</h3>
                {gig.recent_sessions && gig.recent_sessions.length > 0 ? (
                  <div className="space-y-3">
                    {gig.recent_sessions.map((session, index) => (
                      <div key={session.id || index} className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <span className="text-white font-medium">{session.session_id || `Session ${index + 1}`}</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              session.is_verified 
                                ? 'bg-green-500/20 text-green-300' 
                                : 'bg-yellow-500/20 text-yellow-300'
                            }`}>
                              {session.is_verified ? 'Verified' : 'Pending'}
                            </span>
                          </div>
                          <span className="text-white/70 text-sm">{formatDate(session.session_date)}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-white/70">
                          <span>⏰ {formatTime(session.start_time)} - {formatTime(session.end_time)}</span>
                          <span>📚 {session.hours_logged || 0}h</span>
                          <span className={session.student_attendance ? 'text-green-400' : 'text-red-400'}>
                            {session.student_attendance ? '✓ Present' : '✗ Absent'}
                          </span>
                        </div>
                        {session.notes && (
                          <div className="mt-2 text-sm text-white/80">
                            <span className="text-white/60">Notes: </span>
                            {session.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white/60 text-2xl">📚</span>
                    </div>
                    <p className="text-white/60">No sessions recorded yet</p>
                    <p className="text-white/40 text-sm mt-1">Sessions will appear here once you start logging them</p>
                  </div>
                )}
              </div>

              {/* Session Actions */}
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Session Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button className="flex items-center justify-center space-x-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-4 py-2 rounded-lg transition-colors">
                    <span>➕</span>
                    <span>Log New Session</span>
                  </button>
                  <button className="flex items-center justify-center space-x-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 px-4 py-2 rounded-lg transition-colors">
                    <span>📅</span>
                    <span>Schedule Session</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="space-y-6">
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Financial Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {formatCurrency((gig.hours_completed || 0) * (gig.hourly_rate_tutor || 0))}
                    </div>
                    <div className="text-xs text-white/70">Your Earnings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">
                      {formatCurrency(remainingHours * (gig.hourly_rate_tutor || 0))}
                    </div>
                    <div className="text-xs text-white/70">Potential Remaining</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Your Hourly Rate</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Your Hourly Rate:</span>
                    <span className="text-green-400 font-medium">{formatCurrency(gig.hourly_rate_tutor)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Earnings Breakdown</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Hours Completed:</span>
                    <span className="text-white">{gig.hours_completed || 0}h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Earnings So Far:</span>
                    <span className="text-green-400 font-medium">
                      {formatCurrency((gig.hours_completed || 0) * (gig.hourly_rate_tutor || 0))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Remaining Hours:</span>
                    <span className="text-white">{remainingHours}h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Potential Remaining:</span>
                    <span className="text-yellow-400 font-medium">
                      {formatCurrency(remainingHours * (gig.hourly_rate_tutor || 0))}
                    </span>
                  </div>
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">Total Potential:</span>
                      <span className="text-white font-bold text-lg">
                        {formatCurrency((gig.total_hours || 0) * (gig.hourly_rate_tutor || 0))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-white/5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-white/70">
              Created: {formatDate(gig.created_at)} | Updated: {formatDate(gig.updated_at)}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GigDetailModal