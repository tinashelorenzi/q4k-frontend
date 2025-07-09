import { useAuth } from '../../context/AuthContext'
import { useState, useEffect } from 'react'
import apiService from '../../services/api'

const TutorSessions = () => {
  const { tutorProfile, getTutorId } = useAuth()
  const [sessions, setSessions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('pending') // 'pending' or 'validated'
  const [formData, setFormData] = useState({
    gig: '',
    session_date: '',
    start_time: '',
    end_time: '',
    hours_logged: '',
    session_notes: '',
    student_attendance: true
  })

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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Calculate hours logged if start and end times are provided
      let calculatedHours = formData.hours_logged
      if (formData.start_time && formData.end_time && !formData.hours_logged) {
        const start = new Date(`2000-01-01T${formData.start_time}`)
        const end = new Date(`2000-01-01T${formData.end_time}`)
        const diffMs = end - start
        calculatedHours = (diffMs / (1000 * 60 * 60)).toFixed(2)
      }

      const sessionData = {
        ...formData,
        hours_logged: calculatedHours
      }

      await apiService.createSession(sessionData)
      
      // Reset form and close modal
      setFormData({
        gig: '',
        session_date: '',
        start_time: '',
        end_time: '',
        hours_logged: '',
        session_notes: '',
        student_attendance: true
      })
      setShowModal(false)
      
      // Reload sessions
      await loadSessions()
      
    } catch (err) {
      console.error('Error creating session:', err)
      setError(err.message || 'Failed to create session. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (timeStr) => {
    return timeStr ? new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }) : ''
  }

  // Separate sessions by validation status
  const pendingSessions = sessions.filter(session => !session.is_verified)
  const validatedSessions = sessions.filter(session => session.is_verified)

  // Calculate statistics
  const totalSessions = sessions.length
  const pendingCount = pendingSessions.length
  const validatedCount = validatedSessions.length
  const totalHours = sessions.reduce((sum, s) => sum + (parseFloat(s.hours_logged) || 0), 0)
  const pendingHours = pendingSessions.reduce((sum, s) => sum + (parseFloat(s.hours_logged) || 0), 0)
  const validatedHours = validatedSessions.reduce((sum, s) => sum + (parseFloat(s.hours_logged) || 0), 0)

  const SessionCard = ({ session }) => (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-white font-medium text-sm">
            {session.gig_info?.title || `${session.gig_info?.subject_name} - ${session.gig_info?.level}` || 'Session'}
          </h4>
          <p className="text-white/70 text-xs">
            Gig ID: {session.gig_info?.gig_id || 'N/A'}
          </p>
          {session.gig_info?.client_name && (
            <p className="text-white/60 text-xs">
              Client: {session.gig_info.client_name}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs rounded-full border ${
            session.is_verified 
              ? 'bg-green-500/20 border-green-500/30 text-green-400' 
              : 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'
          }`}>
            {session.is_verified ? 'Validated' : 'Pending'}
          </span>
          <span className="text-white/60 text-xs">
            {session.hours_logged}h
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-white/50 text-xs">Date</p>
          <p className="text-white text-sm">{formatDate(session.session_date)}</p>
        </div>
        <div>
          <p className="text-white/50 text-xs">Time</p>
          <p className="text-white text-sm">
            {formatTime(session.start_time)} - {formatTime(session.end_time)}
          </p>
        </div>
      </div>

      {session.session_notes && (
        <div className="mb-3">
          <p className="text-white/50 text-xs">Notes</p>
          <p className="text-white/70 text-sm">{session.session_notes}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${
            session.student_attendance ? 'bg-green-400' : 'bg-red-400'
          }`}></span>
          <span className="text-white/60 text-xs">
            {session.student_attendance ? 'Student attended' : 'Student absent'}
          </span>
        </div>
        
        {session.is_verified && session.verified_by_name && (
          <div className="text-right">
            <p className="text-white/50 text-xs">Verified by</p>
            <p className="text-white/70 text-xs">{session.verified_by_name}</p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Session Logs</h3>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <span>📝</span>
            <span>Log New Session</span>
          </button>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{totalSessions}</div>
            <div className="text-xs text-white/70">Total Sessions</div>
            <div className="text-xs text-white/50">{totalHours.toFixed(1)}h</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{pendingCount}</div>
            <div className="text-xs text-white/70">Pending</div>
            <div className="text-xs text-white/50">{pendingHours.toFixed(1)}h</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{validatedCount}</div>
            <div className="text-xs text-white/70">Validated</div>
            <div className="text-xs text-white/50">{validatedHours.toFixed(1)}h</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {validatedCount > 0 ? ((validatedCount / totalSessions) * 100).toFixed(0) : 0}%
            </div>
            <div className="text-xs text-white/70">Validation Rate</div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <span className="text-yellow-400 text-lg">⚠️</span>
            <div>
              <h4 className="text-yellow-400 font-medium text-sm">Important Notice</h4>
              <p className="text-yellow-300/80 text-xs mt-1">
                Your session logs need to be validated by an administrator before they count towards your gig hours. 
                Pending sessions are not yet validated and may require additional verification.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-white/5 p-1 rounded-xl backdrop-blur-sm">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === 'pending'
              ? 'bg-white/20 text-white'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          <span>⏳</span>
          <span>Pending Validation ({pendingCount})</span>
        </button>
        <button
          onClick={() => setActiveTab('validated')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === 'validated'
              ? 'bg-white/20 text-white'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          <span>✅</span>
          <span>Validated ({validatedCount})</span>
        </button>
      </div>

      {/* Sessions List */}
      {isLoading ? (
        <div className="glass-card p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <span className="ml-2 text-white/70">Loading sessions...</span>
          </div>
        </div>
      ) : error ? (
        <div className="glass-card p-6">
          <div className="text-center">
            <div className="text-red-400 mb-2">❌</div>
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={loadSessions}
              className="mt-4 btn-secondary"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-card p-6">
          <div className="space-y-4">
            {activeTab === 'pending' && pendingSessions.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📋</div>
                <p className="text-white/70">No pending sessions</p>
                <p className="text-white/50 text-sm">All your sessions have been validated!</p>
              </div>
            )}
            
            {activeTab === 'validated' && validatedSessions.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">✨</div>
                <p className="text-white/70">No validated sessions yet</p>
                <p className="text-white/50 text-sm">Start logging sessions to see them here after validation</p>
              </div>
            )}

            {activeTab === 'pending' && pendingSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}

            {activeTab === 'validated' && validatedSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      )}

      {/* Session Logging Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Log New Session</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                >
                  <span className="text-white">✕</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    Gig ID <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="gig"
                    value={formData.gig}
                    onChange={handleInputChange}
                    placeholder="e.g., GIG-0001"
                    required
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:border-white/30 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    Session Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    name="session_date"
                    value={formData.session_date}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-white/30 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-2">
                      Start Time <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="time"
                      name="start_time"
                      value={formData.start_time}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-white/30 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-2">
                      End Time <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="time"
                      name="end_time"
                      value={formData.end_time}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-white/30 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    Hours Logged <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="hours_logged"
                    value={formData.hours_logged}
                    onChange={handleInputChange}
                    step="0.25"
                    min="0.25"
                    max="24"
                    placeholder="Auto-calculated from times"
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:border-white/30 focus:outline-none"
                  />
                  <p className="text-white/50 text-xs mt-1">
                    Leave blank to auto-calculate from start/end times
                  </p>
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    Session Notes
                  </label>
                  <textarea
                    name="session_notes"
                    value={formData.session_notes}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="What was covered in this session?"
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:border-white/30 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="student_attendance"
                    checked={formData.student_attendance}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-500 bg-white/5 border border-white/10 rounded focus:ring-blue-500"
                  />
                  <label className="text-white/70 text-sm">
                    Student attended the session
                  </label>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-400 text-lg">ℹ️</span>
                    <div>
                      <h4 className="text-blue-400 font-medium text-sm">Note</h4>
                      <p className="text-blue-300/80 text-xs mt-1">
                        This session will be marked as "Pending" until an administrator validates it. 
                        You can view all your pending sessions in the Pending tab.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 btn-primary"
                  >
                    {isSubmitting ? 'Logging...' : 'Log Session'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TutorSessions