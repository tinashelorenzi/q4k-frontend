import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Grid,
  Chip,
  LinearProgress,
  Divider,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Paper
} from '@mui/material';
import {
  Close,
  Email,
  Phone,
  Assignment,
  Person,
  Event,
  AttachMoney,
  CheckCircle,
  Schedule
} from '@mui/icons-material';
import {
  BookOpenIcon,
  ClockIcon,
  AcademicCapIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const COLORS = {
  darkSlate: '#0f172a',
  slate: '#1e293b',
  purple: '#8b5cf6',
  green: '#10b981',
  red: '#ef4444',
  yellow: '#f59e0b',
  blue: '#3b82f6',
};

const GigDetailModal = ({ gig, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!gig) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `R ${(amount || 0).toFixed(2)}`;
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

  const progressPercentage = gig.completion_percentage || 0;
  const remainingHours = (gig.total_hours || 0) - (gig.hours_completed || 0);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: COLORS.slate,
          backgroundImage: 'none',
          border: `1px solid rgba(139, 92, 246, 0.2)`,
          maxHeight: '90vh'
        }
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ p: 3, borderBottom: `1px solid rgba(255, 255, 255, 0.1)` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ 
              width: 56, 
              height: 56, 
              background: `linear-gradient(135deg, ${COLORS.blue} 0%, ${COLORS.purple} 100%)` 
            }}>
              <BookOpenIcon className="h-6 w-6" />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                {gig.title || `${gig.subject_name} - ${gig.level}`}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  ID: {gig.gig_id}
                </Typography>
                {getStatusChip(gig.status)}
              </Box>
            </Box>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Tab Navigation */}
      <Box sx={{ borderBottom: `1px solid rgba(255, 255, 255, 0.1)`, px: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: COLORS.purple,
            },
            '& .MuiTab-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: 600,
              '&.Mui-selected': {
                color: 'white',
              }
            }
          }}
        >
          <Tab label="Overview" />
          <Tab label="Client Info" />
          <Tab label="Sessions" />
          <Tab label="Financial" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <DialogContent sx={{ p: 3 }}>
        {/* Overview Tab */}
        {activeTab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Hours Progress */}
            <Paper sx={{ p: 3, bgcolor: 'rgba(255, 255, 255, 0.05)', backgroundImage: 'none' }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 3, fontWeight: 600 }}>
                Hours Progress
              </Typography>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: COLORS.green, fontWeight: 700 }}>
                      {gig.hours_completed || 0}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Hours Completed
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: COLORS.yellow, fontWeight: 700 }}>
                      {remainingHours.toFixed(1)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Hours Remaining
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: COLORS.blue, fontWeight: 700 }}>
                      {gig.total_hours || 0}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Total Hours
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <LinearProgress
                variant="determinate"
                value={progressPercentage}
                sx={{
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: COLORS.purple,
                    borderRadius: 6
                  }
                }}
              />
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', display: 'block', textAlign: 'center', mt: 1 }}>
                {progressPercentage.toFixed(1)}% Complete
              </Typography>
            </Paper>

            {/* Key Information */}
            <Paper sx={{ p: 3, bgcolor: 'rgba(255, 255, 255, 0.05)', backgroundImage: 'none' }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 3, fontWeight: 600 }}>
                Key Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Subject:</Typography>
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>{gig.subject_name || 'N/A'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Level:</Typography>
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, textTransform: 'capitalize' }}>
                      {gig.level?.replace('_', ' ') || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Your Rate:</Typography>
                    <Typography variant="body2" sx={{ color: COLORS.green, fontWeight: 600 }}>
                      {formatCurrency(gig.hourly_rate_tutor)}/hr
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Start Date:</Typography>
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>{formatDate(gig.start_date)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>End Date:</Typography>
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>{formatDate(gig.end_date)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Sessions:</Typography>
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>{gig.sessions_count || 0}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Description */}
            {gig.description && (
              <Paper sx={{ p: 3, bgcolor: 'rgba(255, 255, 255, 0.05)', backgroundImage: 'none' }}>
                <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
                  Description
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6 }}>
                  {gig.description}
                </Typography>
              </Paper>
            )}
          </Box>
        )}

        {/* Client Info Tab */}
        {activeTab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Paper sx={{ p: 3, bgcolor: 'rgba(255, 255, 255, 0.05)', backgroundImage: 'none' }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 3, fontWeight: 600 }}>
                Client Information
              </Typography>
              <List>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary={<Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Name</Typography>}
                    secondary={<Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>{gig.client_name || 'N/A'}</Typography>}
                  />
                </ListItem>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary={<Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Email</Typography>}
                    secondary={
                      <Typography variant="body1" sx={{ color: COLORS.blue, cursor: 'pointer' }} component="a" href={`mailto:${gig.client_email}`}>
                        {gig.client_email || 'N/A'}
                      </Typography>
                    }
                  />
                </ListItem>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary={<Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Phone</Typography>}
                    secondary={
                      <Typography variant="body1" sx={{ color: COLORS.blue, cursor: 'pointer' }} component="a" href={`tel:${gig.client_phone}`}>
                        {gig.client_phone || 'N/A'}
                      </Typography>
                    }
                  />
                </ListItem>
              </List>
            </Paper>

            <Paper sx={{ p: 3, bgcolor: 'rgba(255, 255, 255, 0.05)', backgroundImage: 'none' }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 3, fontWeight: 600 }}>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Email />}
                    component="a"
                    href={`mailto:${gig.client_email}`}
                    sx={{
                      borderColor: COLORS.blue,
                      color: COLORS.blue,
                      '&:hover': {
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)'
                      }
                    }}
                  >
                    Send Email
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Phone />}
                    component="a"
                    href={`tel:${gig.client_phone}`}
                    sx={{
                      borderColor: COLORS.green,
                      color: COLORS.green,
                      '&:hover': {
                        borderColor: '#059669',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)'
                      }
                    }}
                  >
                    Call Client
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        )}

        {/* Sessions Tab */}
        {activeTab === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Paper sx={{ p: 3, bgcolor: 'rgba(255, 255, 255, 0.05)', backgroundImage: 'none' }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 3, fontWeight: 600 }}>
                Session Summary
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                      {gig.sessions_count || 0}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Total Sessions
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: COLORS.blue, fontWeight: 700 }}>
                      {gig.hours_completed || 0}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Hours Logged
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: COLORS.green, fontWeight: 700 }}>
                      {gig.recent_sessions?.filter(s => s.is_verified).length || 0}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Verified
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3, bgcolor: 'rgba(255, 255, 255, 0.05)', backgroundImage: 'none' }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 3, fontWeight: 600 }}>
                Recent Sessions
              </Typography>
              {gig.recent_sessions && gig.recent_sessions.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {gig.recent_sessions.map((session, index) => (
                    <Paper
                      key={session.id || index}
                      sx={{
                        p: 2,
                        bgcolor: 'rgba(255, 255, 255, 0.03)',
                        backgroundImage: 'none',
                        border: `1px solid rgba(255, 255, 255, 0.1)`
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                          {session.session_id || `Session ${index + 1}`}
                        </Typography>
                        <Chip
                          label={session.is_verified ? 'Verified' : 'Pending'}
                          size="small"
                          sx={{
                            backgroundColor: session.is_verified ? `${COLORS.green}20` : `${COLORS.yellow}20`,
                            color: session.is_verified ? COLORS.green : COLORS.yellow,
                            fontWeight: 600,
                            fontSize: '0.7rem'
                          }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', display: 'block' }}>
                        {formatDate(session.session_date)} • {formatTime(session.start_time)} - {formatTime(session.end_time)} • {session.hours_logged || 0}h
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <ClockIcon className="h-16 w-16 mx-auto mb-3" style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    No sessions recorded yet
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        )}

        {/* Financial Tab */}
        {activeTab === 3 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Paper sx={{ p: 3, bgcolor: 'rgba(255, 255, 255, 0.05)', backgroundImage: 'none' }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 3, fontWeight: 600 }}>
                Financial Overview
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: COLORS.green, fontWeight: 700 }}>
                      {formatCurrency((gig.hours_completed || 0) * (gig.hourly_rate_tutor || 0))}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Your Earnings
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: COLORS.yellow, fontWeight: 700 }}>
                      {formatCurrency(remainingHours * (gig.hourly_rate_tutor || 0))}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Potential Remaining
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3, bgcolor: 'rgba(255, 255, 255, 0.05)', backgroundImage: 'none' }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 3, fontWeight: 600 }}>
                Earnings Breakdown
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Hours Completed:</Typography>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>{gig.hours_completed || 0}h</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Earnings So Far:</Typography>
                  <Typography variant="body2" sx={{ color: COLORS.green, fontWeight: 600 }}>
                    {formatCurrency((gig.hours_completed || 0) * (gig.hourly_rate_tutor || 0))}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Remaining Hours:</Typography>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>{remainingHours.toFixed(1)}h</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Potential Remaining:</Typography>
                  <Typography variant="body2" sx={{ color: COLORS.yellow, fontWeight: 600 }}>
                    {formatCurrency(remainingHours * (gig.hourly_rate_tutor || 0))}
                  </Typography>
                </Box>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1" sx={{ color: 'white', fontWeight: 700 }}>Total Potential:</Typography>
                  <Typography variant="body1" sx={{ color: 'white', fontWeight: 700 }}>
                    {formatCurrency((gig.total_hours || 0) * (gig.hourly_rate_tutor || 0))}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        )}
      </DialogContent>

      {/* Footer */}
      <Box sx={{ p: 3, borderTop: `1px solid rgba(255, 255, 255, 0.1)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          Created: {formatDate(gig.created_at)} | Updated: {formatDate(gig.updated_at)}
        </Typography>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            bgcolor: COLORS.purple,
            '&:hover': {
              bgcolor: '#7c3aed'
            }
          }}
        >
          Close
        </Button>
      </Box>
    </Dialog>
  );
};

export default GigDetailModal;