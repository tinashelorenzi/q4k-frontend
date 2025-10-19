import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import apiService from '../../services/api';
import GigDetailModal from './GigDetailModal';
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
  LinearProgress,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  BookOpenIcon,
  ClockIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const COLORS = {
  darkSlate: '#0f172a',
  slate: '#1e293b',
  purple: '#8b5cf6',
  green: '#10b981',
  red: '#ef4444',
  yellow: '#f59e0b',
};

const MyGigs = () => {
  const { tutorProfile, getTutorId } = useAuth();
  const [gigs, setGigs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGig, setSelectedGig] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadGigs();
  }, []);

  const loadGigs = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const tutorId = getTutorId();
      if (!tutorId) {
        setError('Unable to load tutor information');
        return;
      }

      // Get basic gigs list first
      const response = await apiService.getTutorGigs(tutorId);
      const basicGigs = response.results || response || [];

      // Get detailed information for each gig to have proper calculations
      const detailedGigs = await Promise.all(
        basicGigs.map(async (gig) => {
          try {
            const detailedGig = await apiService.getGigDetails(gig.id);
            return {
              ...detailedGig,
              // Use API calculated fields
              hours_remaining: parseFloat(detailedGig.total_hours_remaining || 0),
              completion_percentage: parseFloat(detailedGig.completion_percentage || 0),
              total_earned: parseFloat(detailedGig.hours_completed || 0) * parseFloat(detailedGig.hourly_rate_tutor || 0),
              potential_earnings: parseFloat(detailedGig.total_tutor_remuneration || 0)
            };
          } catch (err) {
            console.error(`Error loading details for gig ${gig.id}:`, err);
            // Fallback to basic gig data if details fail
            return {
              ...gig,
              hours_remaining: parseFloat(gig.total_hours_remaining || 0),
              completion_percentage: parseFloat(gig.completion_percentage || 0),
              total_earned: 0,
              potential_earnings: parseFloat(gig.hourly_rate_tutor || 0) * parseFloat(gig.total_hours || 0)
            };
          }
        })
      );

      setGigs(detailedGigs);
    } catch (err) {
      console.error('Error loading gigs:', err);
      setError(err.message || 'Failed to load gigs');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `R ${amount.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return COLORS.green;
      case 'completed': return COLORS.purple;
      case 'pending': return COLORS.yellow;
      case 'cancelled': return COLORS.red;
      default: return 'rgba(255, 255, 255, 0.5)';
    }
  };

  const getStatusChip = (status) => {
    const color = getStatusColor(status);
    return (
      <Chip
        label={status.charAt(0).toUpperCase() + status.slice(1)}
        size="small"
        sx={{
          backgroundColor: `${color}20`,
          color: color,
          fontWeight: 600,
          fontSize: '0.75rem'
        }}
      />
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return COLORS.red;
      case 'high': return COLORS.yellow;
      case 'medium': return COLORS.purple;
      case 'low': return COLORS.green;
      default: return 'rgba(255, 255, 255, 0.5)';
    }
  };

  const getPriorityChip = (priority) => {
    const color = getPriorityColor(priority);
    return (
      <Chip
        label={priority.charAt(0).toUpperCase() + priority.slice(1)}
        size="small"
        sx={{
          backgroundColor: `${color}20`,
          color: color,
          fontWeight: 600,
          fontSize: '0.75rem'
        }}
      />
    );
  };

  const handleViewGig = (gig) => {
    setSelectedGig(gig);
    setShowModal(true);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress sx={{ color: COLORS.purple }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (gigs.length === 0) {
    return (
      <Card sx={{ 
        bgcolor: COLORS.slate,
        border: `1px solid rgba(139, 92, 246, 0.2)`,
        backgroundImage: 'none'
      }}>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <BookOpenIcon className="h-16 w-16 mx-auto mb-4" style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
          <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
            No Gigs Assigned
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            You don't have any gigs assigned yet. Check back later or contact support.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {/* Summary Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            bgcolor: COLORS.slate,
            border: `1px solid rgba(139, 92, 246, 0.2)`,
            backgroundImage: 'none'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ 
                  bgcolor: `${COLORS.purple}20`, 
                  color: COLORS.purple,
                  mr: 2,
                  width: 48,
                  height: 48
                }}>
                  <BookOpenIcon className="h-6 w-6" />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                    {gigs.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Total Gigs
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            bgcolor: COLORS.slate,
            border: `1px solid rgba(16, 185, 129, 0.2)`,
            backgroundImage: 'none'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ 
                  bgcolor: `${COLORS.green}20`, 
                  color: COLORS.green,
                  mr: 2,
                  width: 48,
                  height: 48
                }}>
                  <CheckCircleIcon className="h-6 w-6" />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                    {gigs.filter(gig => gig.status === 'active').length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Active Gigs
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            bgcolor: COLORS.slate,
            border: `1px solid rgba(245, 158, 11, 0.2)`,
            backgroundImage: 'none'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ 
                  bgcolor: `${COLORS.yellow}20`, 
                  color: COLORS.yellow,
                  mr: 2,
                  width: 48,
                  height: 48
                }}>
                  <ClockIcon className="h-6 w-6" />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                    {gigs.reduce((total, gig) => total + gig.hours_remaining, 0).toFixed(1)}h
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Hours Remaining
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            bgcolor: COLORS.slate,
            border: `1px solid rgba(16, 185, 129, 0.2)`,
            backgroundImage: 'none'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ 
                  bgcolor: `${COLORS.green}20`, 
                  color: COLORS.green,
                  mr: 2,
                  width: 48,
                  height: 48
                }}>
                  <CurrencyDollarIcon className="h-6 w-6" />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                    {formatCurrency(gigs.reduce((total, gig) => total + gig.potential_earnings, 0))}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Potential Earnings
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gigs List */}
      <Grid container spacing={3}>
        {gigs.map((gig) => (
          <Grid item xs={12} md={6} lg={4} key={gig.id}>
            <Card sx={{ 
              bgcolor: COLORS.slate,
              border: `1px solid rgba(139, 92, 246, 0.2)`,
              backgroundImage: 'none',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, flexGrow: 1 }}>
                    {gig.title}
                  </Typography>
                  <Tooltip title="View Details">
                    <IconButton 
                      onClick={() => handleViewGig(gig)}
                      sx={{ color: COLORS.purple }}
                    >
                      <EyeIcon className="h-5 w-5" />
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Subject and Level */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                    {gig.subject_name} • {gig.level.charAt(0).toUpperCase() + gig.level.slice(1)}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {getStatusChip(gig.status)}
                    {getPriorityChip(gig.priority)}
                  </Box>
                </Box>

                {/* Client Info */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                    Client: {gig.client_name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {formatDate(gig.start_date)} - {formatDate(gig.end_date)}
                  </Typography>
                </Box>

                {/* Progress */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Progress
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                      {gig.completion_percentage.toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={gig.completion_percentage}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: COLORS.purple,
                        borderRadius: 4
                      }
                    }}
                  />
                </Box>

                {/* Hours and Earnings */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Hours Remaining
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                      {gig.hours_remaining.toFixed(1)}h
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Hourly Rate
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                      {formatCurrency(gig.hourly_rate_tutor)}
                    </Typography>
                  </Box>
                </Box>

                {/* Action Button */}
                <Button
                  variant="outlined"
                  onClick={() => handleViewGig(gig)}
                  sx={{
                    borderColor: COLORS.purple,
                    color: COLORS.purple,
                    '&:hover': {
                      borderColor: '#7c3aed',
                      backgroundColor: 'rgba(139, 92, 246, 0.1)'
                    }
                  }}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Gig Detail Modal */}
      {showModal && selectedGig && (
        <GigDetailModal
          gig={selectedGig}
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedGig(null);
          }}
        />
      )}
    </Box>
  );
};

export default MyGigs;