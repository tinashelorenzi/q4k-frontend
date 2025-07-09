import { useEffect, useState } from 'react'

const GigDetailModal = ({ gig, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview')

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'completed': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'paused': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'cancelled': return 'bg-red-500/20 text-red-300 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getProgressColor = (percentage) => {
    if (percentage < 30) return 'bg-red-500'
    if (percentage < 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'client', label: 'Client Info', icon: '👤' },
    { id: 'sessions', label: 'Sessions', icon: '📚' },
    { id: 'financial', label: 'Financial', icon: '💰' }
  ]

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">📋</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{gig.title}</h2>
                <p className="text-white/60 text-sm">{gig.gig_id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Status and Priority */}
          <div className="flex items-center space-x-4 mt-4">
            <span className={`px-3 py-1 border text-sm rounded-full ${getStatusColor(gig.status)}`}>
              {gig.status}
            </span>
            {gig.priority && (
              <span className={`text-sm ${getPriorityColor(gig.priority)}`}>
                ● {gig.priority} priority
              </span>
            )}
            {gig.is_overdue && (
              <span className="px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/30 text-sm rounded-full">
                ⚠️ Overdue
              </span>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex space-x-1 bg-white/5 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Progress Section */}
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Progress Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{gig.completion_percentage?.toFixed(1)}%</div>
                    <div className="text-xs text-white/70">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{gig.hours_completed}</div>
                    <div className="text-xs text-white/70">Hours Done</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{gig.total_hours_remaining}</div>
                    <div className="text-xs text-white/70">Hours Left</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{gig.total_hours}</div>
                    <div className="text-xs text-white/70">Total Hours</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-white/10 rounded-full h-4 mb-2">
                  <div 
                    className={`h-4 rounded-full transition-all duration-500 ${getProgressColor(gig.completion_percentage)}`}
                    style={{ width: `${gig.completion_percentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-white/70 text-center">
                  {gig.completion_percentage?.toFixed(1)}% Complete
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Timeline</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Start Date:</span>
                    <span className="text-white">{formatDate(gig.start_date)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">End Date:</span>
                    <span className="text-white">{formatDate(gig.end_date)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Actual Start:</span>
                    <span className="text-white">{formatDate(gig.actual_start_date)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Days Remaining:</span>
                    <span className={`font-medium ${gig.days_remaining < 7 ? 'text-red-400' : 'text-white'}`}>
                      {gig.days_remaining} days
                    </span>
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
                    <span className="text-white font-medium">{gig.client_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Email:</span>
                    <a href={`mailto:${gig.client_email}`} className="text-blue-400 hover:text-blue-300">
                      {gig.client_email}
                    </a>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Phone:</span>
                    <a href={`tel:${gig.client_phone}`} className="text-blue-400 hover:text-blue-300">
                      {gig.client_phone}
                    </a>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Subject:</span>
                    <span className="text-white">{gig.subject_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Level:</span>
                    <span className="text-white capitalize">{gig.level?.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              {/* Tutor Details */}
              {gig.tutor_details && (
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Tutor Details</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Name:</span>
                      <span className="text-white font-medium">{gig.tutor_details.full_name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">ID:</span>
                      <span className="text-white">{gig.tutor_details.tutor_id}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Email:</span>
                      <span className="text-white">{gig.tutor_details.email_address}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Phone:</span>
                      <span className="text-white">{gig.tutor_details.phone_number}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Qualification:</span>
                      <span className="text-white capitalize">{gig.tutor_details.highest_qualification}</span>
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
                    <div className="text-2xl font-bold text-white">{gig.sessions_count}</div>
                    <div className="text-xs text-white/70">Total Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{gig.hours_completed}</div>
                    <div className="text-xs text-white/70">Hours Logged</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {gig.recent_sessions?.filter(s => s.is_verified).length || 0}
                    </div>
                    <div className="text-xs text-white/70">Verified</div>
                  </div>
                </div>
              </div>

              {/* Recent Sessions */}
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Sessions</h3>
                {gig.recent_sessions && gig.recent_sessions.length > 0 ? (
                  <div className="space-y-3">
                    {gig.recent_sessions.map((session) => (
                      <div key={session.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <span className="text-white font-medium">{session.session_id}</span>
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
                          <span>📚 {session.hours_logged}h</span>
                          <span className={session.student_attendance ? 'text-green-400' : 'text-red-400'}>
                            {session.student_attendance ? '✓ Present' : '✗ Absent'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/70 text-center py-4">No sessions recorded yet</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="space-y-6">
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Financial Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{formatCurrency(gig.total_tutor_remuneration)}</div>
                    <div className="text-xs text-white/70">Your Earnings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{formatCurrency(gig.total_client_fee)}</div>
                    <div className="text-xs text-white/70">Client Fee</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{formatCurrency(gig.profit_margin)}</div>
                    <div className="text-xs text-white/70">Profit Margin</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{gig.profit_percentage?.toFixed(1)}%</div>
                    <div className="text-xs text-white/70">Profit %</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Hourly Rates</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Your Hourly Rate:</span>
                    <span className="text-white font-medium">{formatCurrency(gig.hourly_rate_tutor)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Client Hourly Rate:</span>
                    <span className="text-white font-medium">{formatCurrency(gig.hourly_rate_client)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Rate Difference:</span>
                    <span className="text-white font-medium">
                      {formatCurrency(gig.hourly_rate_client - gig.hourly_rate_tutor)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Earnings Breakdown</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Hours Completed:</span>
                    <span className="text-white">{gig.hours_completed}h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Earnings So Far:</span>
                    <span className="text-green-400 font-medium">
                      {formatCurrency(gig.hours_completed * gig.hourly_rate_tutor)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Remaining Earnings:</span>
                    <span className="text-white font-medium">
                      {formatCurrency(gig.total_hours_remaining * gig.hourly_rate_tutor)}
                    </span>
                  </div>
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">Total Potential:</span>
                      <span className="text-white font-bold text-lg">
                        {formatCurrency(gig.total_tutor_remuneration)}
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
  )
}

export default GigDetailModal