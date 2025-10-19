import { useAuth } from '../../context/AuthContext'
import { useState, useEffect } from 'react'
import apiService from '../../services/api'
import LogSessionModal from './LogSessionModal'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Avatar,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper
} from '@mui/material'
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

const COLORS = {
  darkSlate: '#0f172a',
  slate: '#1e293b',
  purple: '#8b5cf6',
  green: '#10b981',
  red: '#ef4444',
  yellow: '#f59e0b',
};

const TutorSessions = () => {
  const { tutorProfile, getTutorId } = useAuth()
  const [sessions, setSessions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showLogSession, setShowLogSession] = useState(false)
  const [activeTab, setActiveTab] = useState(0) // 0 for pending, 1 for validated

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
          <Button
            variant="outlined"
            startIcon={<ClockIcon className="h-5 w-5" />}
            onClick={() => setShowLogSession(true)}
            sx={{
              borderColor: COLORS.green,
              color: COLORS.green,
              '&:hover': {
                borderColor: '#059669',
                backgroundColor: 'rgba(16, 185, 129, 0.1)'
              }
            }}
          >
            Log New Session
          </Button>
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

      {/* Log Session Modal */}
      <LogSessionModal
        isOpen={showLogSession}
        onClose={() => setShowLogSession(false)}
        onSuccess={() => {
          setShowLogSession(false);
          loadSessions();
        }}
      />
    </div>
  )
}

export default TutorSessions