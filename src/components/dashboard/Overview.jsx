import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import LogSessionModal from './LogSessionModal';
import { 
  ExclamationTriangleIcon,
  HandRaisedIcon,
  BookOpenIcon,
  ClockIcon,
  ChatBubbleLeftIcon,
  ChartBarIcon,
  BookmarkIcon,
  PencilSquareIcon,
  UserIcon,
  CalendarIcon,
  AcademicCapIcon,
  CheckIcon,
  XMarkIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper
} from '@mui/material';

const COLORS = {
  darkSlate: '#0f172a',
  slate: '#1e293b',
  purple: '#8b5cf6',
  green: '#10b981',
  red: '#ef4444',
  yellow: '#f59e0b',
};

const Overview = () => {
  const { user, tutorProfile, isTutor, getTutorId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLogSession, setShowLogSession] = useState(false);
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
      thisMonthEarnings: 0
    }
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      if (isTutor()) {
        const tutorId = getTutorId();
        if (!tutorId) {
          throw new Error('Unable to load tutor information');
        }

        // Load tutor's gigs
        const gigsResponse = await apiService.apiCall(`/gigs/tutor/${tutorId}/`);
        const gigs = gigsResponse.results || gigsResponse;

        // Load tutor's sessions
        const sessionsResponse = await apiService.apiCall(`/gigs/sessions/tutor/${tutorId}/`);
        const sessions = sessionsResponse.results || sessionsResponse;

        // Create a map of gig ID to hourly rate for quick lookup
        const gigRateMap = {};
        gigs.forEach(gig => {
          gigRateMap[gig.id] = parseFloat(gig.hourly_rate_tutor || 0);
        });

        // Calculate stats
        const activeGigs = gigs.filter(gig => gig.status === 'active').length;
        
        // Filter verified sessions
        const verifiedSessions = sessions.filter(session => session.is_verified);
        
        const completedHours = verifiedSessions
          .reduce((total, session) => total + parseFloat(session.hours_logged || 0), 0);
        
        const pendingSessions = sessions.filter(session => !session.is_verified).length;
        
        // Calculate total earnings from verified sessions
        const totalEarnings = verifiedSessions
          .reduce((total, session) => {
            const gigId = session.gig;
            const hourlyRate = gigRateMap[gigId] || 0;
            const hours = parseFloat(session.hours_logged || 0);
            return total + (hourlyRate * hours);
          }, 0);

        // Calculate this week's hours and earnings
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const thisWeekSessions = verifiedSessions
          .filter(session => {
            const sessionDate = new Date(session.session_date);
            return sessionDate >= oneWeekAgo;
          });
        
        const thisWeekHours = thisWeekSessions
          .reduce((total, session) => total + parseFloat(session.hours_logged || 0), 0);
        
        // Calculate this month's earnings
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthSessions = verifiedSessions
          .filter(session => {
            const sessionDate = new Date(session.session_date);
            return sessionDate >= thisMonthStart;
          });
        
        const thisMonthEarnings = thisMonthSessions
          .reduce((total, session) => {
            const gigId = session.gig;
            const hourlyRate = gigRateMap[gigId] || 0;
            const hours = parseFloat(session.hours_logged || 0);
            return total + (hourlyRate * hours);
          }, 0);

        setDashboardData({
          gigs,
          recentSessions: sessions.slice(0, 5),
          stats: {
            totalGigs: gigs.length,
            activeGigs,
            completedHours,
            pendingSessions,
            totalEarnings,
            thisWeekHours,
            thisMonthEarnings
          }
        });
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
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

  if (loading) {
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

  const { stats, recentSessions } = dashboardData;

  return (
    <Box>
      {/* Stats Cards */}
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
                    {stats.totalGigs}
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
                  <ChartBarIcon className="h-6 w-6" />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                    {stats.activeGigs}
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
                    {stats.completedHours.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Hours Completed
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
                  <AcademicCapIcon className="h-6 w-6" />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                    {formatCurrency(stats.totalEarnings)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Total Earnings
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Time-based Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
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
                  <CurrencyDollarIcon className="h-6 w-6" />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                    {formatCurrency(stats.thisMonthEarnings)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    This Month Earnings
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ 
            bgcolor: COLORS.slate,
            border: `1px solid rgba(59, 130, 246, 0.2)`,
            backgroundImage: 'none'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ 
                  bgcolor: `rgba(59, 130, 246, 0.2)`, 
                  color: '#3b82f6',
                  mr: 2,
                  width: 48,
                  height: 48
                }}>
                  <ClockIcon className="h-6 w-6" />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                    {stats.thisWeekHours.toFixed(1)}h
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    This Week Hours
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
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
                  <ExclamationTriangleIcon className="h-6 w-6" />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                    {stats.pendingSessions}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Pending Sessions
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Sessions */}
        <Grid item xs={12} md={8}>
          <Card sx={{ 
            bgcolor: COLORS.slate,
            border: `1px solid rgba(139, 92, 246, 0.2)`,
            backgroundImage: 'none'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 3, fontWeight: 600 }}>
                Recent Sessions
              </Typography>
              
              {recentSessions.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <ClockIcon className="h-12 w-12 mx-auto mb-3" style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    No recent sessions found
                  </Typography>
                </Box>
              ) : (
                <List>
                  {recentSessions.map((session, index) => (
                    <Box key={session.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Avatar sx={{ 
                            bgcolor: session.is_verified ? `${COLORS.green}20` : `${COLORS.yellow}20`,
                            color: session.is_verified ? COLORS.green : COLORS.yellow,
                            width: 40,
                            height: 40
                          }}>
                            {session.is_verified ? (
                              <CheckIcon className="h-5 w-5" />
                            ) : (
                              <ClockIcon className="h-5 w-5" />
                            )}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                              {session.gig_info?.title || 'Session'}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                {formatDate(session.session_date)} • {session.hours_logged}h
                              </Typography>
                              {getStatusChip(session.is_verified ? 'verified' : 'pending')}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < recentSessions.length - 1 && (
                        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                      )}
                    </Box>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            bgcolor: COLORS.slate,
            border: `1px solid rgba(139, 92, 246, 0.2)`,
            backgroundImage: 'none'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 3, fontWeight: 600 }}>
                Quick Actions
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<BookOpenIcon className="h-5 w-5" />}
                  sx={{
                    borderColor: COLORS.purple,
                    color: COLORS.purple,
                    '&:hover': {
                      borderColor: '#7c3aed',
                      backgroundColor: 'rgba(139, 92, 246, 0.1)'
                    }
                  }}
                >
                  View My Gigs
                </Button>
                
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
                  Log Session
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<PencilSquareIcon className="h-5 w-5" />}
                  sx={{
                    borderColor: COLORS.yellow,
                    color: COLORS.yellow,
                    '&:hover': {
                      borderColor: '#d97706',
                      backgroundColor: 'rgba(245, 158, 11, 0.1)'
                    }
                  }}
                >
                  Update Profile
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Log Session Modal */}
      <LogSessionModal
        isOpen={showLogSession}
        onClose={() => setShowLogSession(false)}
        onSuccess={() => {
          setShowLogSession(false);
          loadDashboardData();
        }}
      />
    </Box>
  );
};

export default Overview;