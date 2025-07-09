import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import apiService from '../services/api'

export const useGigs = () => {
  const { getTutorId } = useAuth()
  const [gigs, setGigs] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedGig, setSelectedGig] = useState(null)

  const loadGigs = useCallback(async (params = {}) => {
    try {
      setIsLoading(true)
      setError('')
      
      const tutorId = getTutorId()
      if (!tutorId) {
        throw new Error('Unable to load tutor information')
      }

      const response = await apiService.getTutorGigs(tutorId, params)
      const gigsData = response.results || response || []
      
      // Ensure each gig has the required fields with defaults
      const processedGigs = gigsData.map(gig => ({
        ...gig,
        // Core fields
        id: gig.id,
        gig_id: gig.gig_id || `GIG-${gig.id}`,
        title: gig.title || `${gig.subject_name} - ${gig.level}`,
        status: gig.status || 'pending',
        
        // Client information
        client_name: gig.client_name || 'Not specified',
        client_email: gig.client_email || 'Not specified',
        client_phone: gig.client_phone || 'Not specified',
        
        // Subject and level
        subject_name: gig.subject_name || 'General',
        level: gig.level || 'intermediate',
        
        // Hours tracking
        total_hours: gig.total_hours || 0,
        hours_completed: gig.hours_completed || 0,
        hours_remaining: (gig.total_hours || 0) - (gig.hours_completed || 0),
        
        // Rates
        hourly_rate_tutor: gig.hourly_rate_tutor || 0,
        hourly_rate_client: gig.hourly_rate_client || 0,
        
        // Session info
        sessions_count: gig.sessions_count || 0,
        recent_sessions: gig.recent_sessions || [],
        
        // Dates
        start_date: gig.start_date,
        end_date: gig.end_date,
        created_at: gig.created_at,
        updated_at: gig.updated_at,
        
        // Additional fields
        description: gig.description || '',
        notes: gig.notes || '',
        tutor_details: gig.tutor_details || null,
        
        // Calculated fields
        completion_percentage: gig.total_hours > 0 
          ? ((gig.hours_completed || 0) / gig.total_hours) * 100 
          : 0,
        total_earned: (gig.hours_completed || 0) * (gig.hourly_rate_tutor || 0),
        potential_earnings: (gig.total_hours || 0) * (gig.hourly_rate_tutor || 0)
      }))

      setGigs(processedGigs)
      return processedGigs
    } catch (err) {
      const errorMessage = err.message || 'Failed to load gigs. Please try again.'
      setError(errorMessage)
      console.error('Error loading gigs:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [getTutorId])

  const getGigDetails = useCallback(async (gigId) => {
    try {
      const response = await apiService.getGigDetails(gigId)
      
      // Process the detailed gig data similar to loadGigs
      const processedGig = {
        ...response,
        // Ensure all required fields are present
        client_name: response.client_name || 'Not specified',
        client_email: response.client_email || 'Not specified',
        client_phone: response.client_phone || 'Not specified',
        total_hours: response.total_hours || 0,
        hours_completed: response.hours_completed || 0,
        hours_remaining: (response.total_hours || 0) - (response.hours_completed || 0),
        completion_percentage: response.total_hours > 0 
          ? ((response.hours_completed || 0) / response.total_hours) * 100 
          : 0,
        total_earned: (response.hours_completed || 0) * (response.hourly_rate_tutor || 0),
        potential_earnings: (response.total_hours || 0) * (response.hourly_rate_tutor || 0)
      }
      
      setSelectedGig(processedGig)
      return processedGig
    } catch (err) {
      console.error('Error loading gig details:', err)
      throw err
    }
  }, [])

  const updateGig = useCallback(async (gigId, updates) => {
    try {
      const response = await apiService.updateGig(gigId, updates)
      
      // Update the gig in the local state
      setGigs(prevGigs => 
        prevGigs.map(gig => 
          gig.id === gigId ? { ...gig, ...response } : gig
        )
      )
      
      // Update selected gig if it's the one being updated
      if (selectedGig && selectedGig.id === gigId) {
        setSelectedGig(prev => ({ ...prev, ...response }))
      }
      
      return response
    } catch (err) {
      console.error('Error updating gig:', err)
      throw err
    }
  }, [selectedGig])

  const refreshGigs = useCallback(() => {
    return loadGigs()
  }, [loadGigs])

  // Filter functions
  const getActiveGigs = useCallback(() => {
    return gigs.filter(gig => gig.status === 'active')
  }, [gigs])

  const getPendingGigs = useCallback(() => {
    return gigs.filter(gig => gig.status === 'pending')
  }, [gigs])

  const getPausedGigs = useCallback(() => {
    return gigs.filter(gig => gig.status === 'paused')
  }, [gigs])

  const getCompletedGigs = useCallback(() => {
    return gigs.filter(gig => gig.status === 'completed')
  }, [gigs])

  // Calculate summary statistics
  const getGigStats = useCallback(() => {
    const totalEarned = gigs.reduce((sum, gig) => sum + (gig.total_earned || 0), 0)
    const totalHours = gigs.reduce((sum, gig) => sum + (gig.hours_completed || 0), 0)
    const totalSessions = gigs.reduce((sum, gig) => sum + (gig.sessions_count || 0), 0)
    const averageHourlyRate = gigs.length > 0 
      ? gigs.reduce((sum, gig) => sum + (gig.hourly_rate_tutor || 0), 0) / gigs.length 
      : 0

    return {
      totalGigs: gigs.length,
      activeGigs: getActiveGigs().length,
      pendingGigs: getPendingGigs().length,
      pausedGigs: getPausedGigs().length,
      completedGigs: getCompletedGigs().length,
      totalEarned,
      totalHours,
      totalSessions,
      averageHourlyRate
    }
  }, [gigs, getActiveGigs, getPendingGigs, getPausedGigs, getCompletedGigs])

  // Load gigs on mount
  useEffect(() => {
    loadGigs()
  }, [loadGigs])

  return {
    // Data
    gigs,
    selectedGig,
    isLoading,
    error,
    
    // Actions
    loadGigs,
    getGigDetails,
    updateGig,
    refreshGigs,
    setSelectedGig,
    
    // Filters
    getActiveGigs,
    getPendingGigs,
    getPausedGigs,
    getCompletedGigs,
    
    // Statistics
    getGigStats
  }
}