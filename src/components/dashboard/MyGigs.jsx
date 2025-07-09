import { useAuth } from '../../context/AuthContext'
import { useState, useEffect } from 'react'
import apiService from '../../services/api'

const MyGigs = () => {
  const { tutorProfile, getTutorId } = useAuth()
  const [gigs, setGigs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadGigs()
  }, [])

  const loadGigs = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      const tutorId = getTutorId()
      if (!tutorId) {
        setError('Unable to load tutor information')
        return
      }

      const response = await apiService.getTutorGigs(tutorId)
      setGigs(response.results || response || [])
    } catch (err) {
      console.error('Error loading gigs:', err)
      setError('Failed to load gigs. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateGig = () => {
    // TODO: Implement create gig functionality
    console.log('Create gig clicked')
  }

  const handleEditGig = (gigId) => {
    // TODO: Implement edit gig functionality
    console.log('Edit gig:', gigId)
  }

  const handlePauseGig = (gigId) => {
    // TODO: Implement pause gig functionality
    console.log('Pause gig:', gigId)
  }

  const handleResumeGig = (gigId) => {
    // TODO: Implement resume gig functionality
    console.log('Resume gig:', gigId)
  }

  const handleDeleteGig = (gigId) => {
    // TODO: Implement delete gig functionality
    console.log('Delete gig:', gigId)
  }

  // Separate active and paused gigs
  const activeGigs = gigs.filter(gig => gig.status === 'active')
  const pausedGigs = gigs.filter(gig => gig.status === 'paused')

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Header with Create Gig Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-white">My Gigs</h3>
          <p className="text-white/60 text-sm">Manage your tutoring services</p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="glass-card p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/60">Loading your gigs...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="glass-card p-4 border-l-4 border-red-500">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Active Gigs */}
      {!isLoading && !error && (
        <div className="glass-card p-4 sm:p-6">
          <h4 className="text-base sm:text-lg font-semibold text-white mb-4">Active Gigs</h4>
          {activeGigs.length > 0 ? (
            <div className="space-y-4">
              {activeGigs.map((gig) => (
                <div key={gig.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h5 className="text-white font-medium text-sm sm:text-base">{gig.title}</h5>
                        <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
                          {gig.status}
                        </span>
                      </div>
                      <p className="text-white/70 text-xs sm:text-sm mb-2">{gig.subject} • {gig.level}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm">
                        <span className="text-white/80">💰 ${gig.hourly_rate}/hour</span>
                        <span className="text-white/80">👥 {gig.student_count || 0} students</span>
                        <span className="text-white/80">⭐ {gig.rating || 'N/A'}</span>
                        <span className="text-white/80">📚 {gig.session_count || 0} sessions</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditGig(gig.id)}
                        className="btn-secondary text-xs px-3 py-1"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handlePauseGig(gig.id)}
                        className="btn-ghost text-xs px-3 py-1"
                      >
                        Pause
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/60 text-sm">No active gigs found.</p>
          )}
        </div>
      )}

      {/* Paused Gigs */}
      {!isLoading && !error && pausedGigs.length > 0 && (
        <div className="glass-card p-4 sm:p-6">
          <h4 className="text-base sm:text-lg font-semibold text-white mb-4">Paused Gigs</h4>
          <div className="space-y-4">
            {pausedGigs.map((gig) => (
              <div key={gig.id} className="bg-white/5 rounded-xl p-4 border border-white/10 opacity-60">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h5 className="text-white font-medium text-sm sm:text-base">{gig.title}</h5>
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full">
                        {gig.status}
                      </span>
                    </div>
                    <p className="text-white/70 text-xs sm:text-sm mb-2">{gig.subject} • {gig.level}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm">
                      <span className="text-white/80">💰 ${gig.hourly_rate}/hour</span>
                      <span className="text-white/80">👥 {gig.student_count || 0} students</span>
                      <span className="text-white/80">⭐ {gig.rating || 'N/A'}</span>
                      <span className="text-white/80">📚 {gig.session_count || 0} sessions</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleResumeGig(gig.id)}
                      className="btn-secondary text-xs px-3 py-1"
                    >
                      Resume
                    </button>
                    <button 
                      onClick={() => handleDeleteGig(gig.id)}
                      className="btn-ghost text-xs px-3 py-1"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gig Analytics */}
      {!isLoading && !error && (
        <div className="glass-card p-4 sm:p-6">
          <h4 className="text-base sm:text-lg font-semibold text-white mb-4">Gig Performance</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{activeGigs.length}</div>
              <div className="text-xs text-white/70">Active Gigs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                ${gigs.reduce((sum, gig) => sum + (gig.monthly_earnings || 0), 0)}
              </div>
              <div className="text-xs text-white/70">Monthly Earnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {gigs.reduce((sum, gig) => sum + (gig.student_count || 0), 0)}
              </div>
              <div className="text-xs text-white/70">Total Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {gigs.reduce((sum, gig) => sum + (gig.session_count || 0), 0)}
              </div>
              <div className="text-xs text-white/70">Total Sessions</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyGigs