import { useAuth } from '../../context/AuthContext'
import { useState, useEffect } from 'react'
import apiService from '../../services/api'
import GigDetailModal from './GigDetailModal'

const MyGigs = () => {
  const { tutorProfile, getTutorId } = useAuth()
  const [gigs, setGigs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedGig, setSelectedGig] = useState(null)
  const [showModal, setShowModal] = useState(false)

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

  const handleGigClick = async (gig) => {
    try {
      // Get detailed gig information
      const gigDetails = await apiService.getGigDetails(gig.id)
      setSelectedGig(gigDetails)
      setShowModal(true)
    } catch (err) {
      console.error('Error loading gig details:', err)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedGig(null)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount || 0)
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

  const getProgressPercentage = (gig) => {
    const totalHours = gig.total_hours || 0
    const completedHours = gig.hours_completed || 0
    return totalHours > 0 ? (completedHours / totalHours) * 100 : 0
  }

  const getProgressColor = (percentage) => {
    if (percentage < 30) return 'bg-red-500'
    if (percentage < 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const HoursMeter = ({ gig }) => {
    const totalHours = gig.total_hours || 0
    const completedHours = gig.hours_completed || 0
    const remainingHours = totalHours - completedHours
    const progressPercentage = getProgressPercentage(gig)

    return (
      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-white">Hours Progress</h4>
          <span className="text-xs text-white/70">{progressPercentage.toFixed(1)}%</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-2 mb-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(progressPercentage)}`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        {/* Hours Info */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="text-sm font-semibold text-green-400">{completedHours}</div>
            <div className="text-white/60">Done</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-yellow-400">{remainingHours}</div>
            <div className="text-white/60">Left</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-blue-400">{totalHours}</div>
            <div className="text-white/60">Total</div>
          </div>
        </div>
      </div>
    )
  }

  const GigCard = ({ gig }) => (
    <div 
      className="glass-card p-4 hover:bg-white/10 transition-all duration-200 cursor-pointer group"
      onClick={() => handleGigClick(gig)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-blue-300 transition-colors">
            {gig.title || `${gig.subject_name} - ${gig.level}`}
          </h3>
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(gig.status)}`}>
              {gig.status?.charAt(0).toUpperCase() + gig.status?.slice(1)}
            </span>
            <span className="text-xs text-white/60">ID: {gig.gig_id}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-green-400">
            {formatCurrency(gig.hourly_rate_tutor)}
          </div>
          <div className="text-xs text-white/60">per hour</div>
        </div>
      </div>

      {/* Client Info */}
      <div className="bg-white/5 rounded-lg p-3 mb-3">
        <h4 className="text-sm font-medium text-white mb-2">Client Information</h4>
        <div className="space-y-1 text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-white/70">👤</span>
            <span className="text-white">{gig.client_name || 'N/A'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-white/70">📧</span>
            <a 
              href={`mailto:${gig.client_email}`} 
              className="text-blue-400 hover:text-blue-300 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {gig.client_email || 'N/A'}
            </a>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-white/70">📱</span>
            <a 
              href={`tel:${gig.client_phone}`} 
              className="text-blue-400 hover:text-blue-300 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {gig.client_phone || 'N/A'}
            </a>
          </div>
        </div>
      </div>

      {/* Hours Meter */}
      <HoursMeter gig={gig} />

      {/* Additional Info */}
      <div className="grid grid-cols-2 gap-4 mt-3 text-xs">
        <div className="text-center">
          <div className="text-sm font-semibold text-white">{gig.sessions_count || 0}</div>
          <div className="text-white/60">Sessions</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold text-purple-400">
            {formatCurrency((gig.hours_completed || 0) * (gig.hourly_rate_tutor || 0))}
          </div>
          <div className="text-white/60">Earned</div>
        </div>
      </div>

      {/* Click indicator */}
      <div className="mt-3 text-center">
        <span className="text-xs text-white/40 group-hover:text-white/60 transition-colors">
          Click for full details →
        </span>
      </div>
    </div>
  )

  // Filter gigs by status
  const activeGigs = gigs.filter(gig => gig.status === 'active')
  const pendingGigs = gigs.filter(gig => gig.status === 'pending')
  const pausedGigs = gigs.filter(gig => gig.status === 'paused')
  const completedGigs = gigs.filter(gig => gig.status === 'completed')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h3 className="text-2xl font-bold text-white">My Gigs</h3>
          <p className="text-white/60">Manage your tutoring assignments and track progress</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-white/60">Total: {gigs.length}</span>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="glass-card p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white/60">Loading your gigs...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="glass-card p-4 border-l-4 border-red-500">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{activeGigs.length}</div>
            <div className="text-sm text-white/70">Active Gigs</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{pendingGigs.length}</div>
            <div className="text-sm text-white/70">Pending</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {formatCurrency(gigs.reduce((sum, gig) => sum + ((gig.hours_completed || 0) * (gig.hourly_rate_tutor || 0)), 0))}
            </div>
            <div className="text-sm text-white/70">Total Earned</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {gigs.reduce((sum, gig) => sum + (gig.hours_completed || 0), 0)}h
            </div>
            <div className="text-sm text-white/70">Hours Logged</div>
          </div>
        </div>
      )}

      {/* Active Gigs */}
      {!isLoading && !error && activeGigs.length > 0 && (
        <div>
          <h4 className="text-xl font-semibold text-white mb-4">Active Gigs</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeGigs.map(gig => (
              <GigCard key={gig.id} gig={gig} />
            ))}
          </div>
        </div>
      )}

      {/* Pending Gigs */}
      {!isLoading && !error && pendingGigs.length > 0 && (
        <div>
          <h4 className="text-xl font-semibold text-white mb-4">Pending Gigs</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingGigs.map(gig => (
              <GigCard key={gig.id} gig={gig} />
            ))}
          </div>
        </div>
      )}

      {/* Paused Gigs */}
      {!isLoading && !error && pausedGigs.length > 0 && (
        <div>
          <h4 className="text-xl font-semibold text-white mb-4">Paused Gigs</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-75">
            {pausedGigs.map(gig => (
              <GigCard key={gig.id} gig={gig} />
            ))}
          </div>
        </div>
      )}

      {/* Recently Completed */}
      {!isLoading && !error && completedGigs.length > 0 && (
        <div>
          <h4 className="text-xl font-semibold text-white mb-4">Recently Completed</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedGigs.slice(0, 6).map(gig => (
              <GigCard key={gig.id} gig={gig} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && gigs.length === 0 && (
        <div className="glass-card p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">📚</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Gigs Yet</h3>
          <p className="text-white/60 mb-4">
            Your gigs will appear here once they're assigned to you by the Quest4Knowledge team.
          </p>
        </div>
      )}

      {/* Gig Detail Modal */}
      {showModal && selectedGig && (
        <GigDetailModal 
          gig={selectedGig} 
          onClose={closeModal}
        />
      )}
    </div>
  )
}

export default MyGigs