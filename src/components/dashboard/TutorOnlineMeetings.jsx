import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
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
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  VideoCameraIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  EyeIcon,
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

const TutorOnlineMeetings = () => {
  const { getTutorId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [requests, setRequests] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [gigs, setGigs] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const tutorId = getTutorId();
      if (!tutorId) {
        setError('Unable to load tutor information');
        return;
      }

      // Load online sessions for this tutor (backend already filters by tutor)
      const sessionsResponse = await apiService.apiCall('/gigs/online-sessions/');
      setSessions(sessionsResponse.results || sessionsResponse || []);

      // Load meeting requests
      const requestsResponse = await apiService.apiCall('/gigs/meeting-requests/');
      setRequests(requestsResponse || []);

      // Load active gigs for request modal
      const gigsResponse = await apiService.apiCall(`/gigs/tutor/${tutorId}/`);
      const activeGigs = (gigsResponse.results || gigsResponse || []).filter(gig => gig.status === 'active');
      setGigs(activeGigs);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return COLORS.blue;
      case 'active': return COLORS.green;
      case 'completed': return COLORS.purple;
      case 'cancelled': return COLORS.red;
      case 'pending': return COLORS.yellow;
      case 'approved': return COLORS.green;
      case 'rejected': return COLORS.red;
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

  const handleViewDetails = (session) => {
    setSelectedSession(session);
    setShowDetailsModal(true);
  };

  const upcomingSessions = sessions.filter(s => s.status === 'scheduled' || s.status === 'active');
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const reviewedRequests = requests.filter(r => r.status !== 'pending');

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress sx={{ color: COLORS.purple }} />
      </Box>
    );
  }

  return (
    <Box>
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
          Scheduled Online Meetings
        </Typography>
        <Button
          variant="contained"
          startIcon={<PlusIcon className="h-5 w-5" />}
          onClick={() => setShowRequestModal(true)}
          sx={{
            bgcolor: COLORS.purple,
            '&:hover': { bgcolor: '#7c3aed' }
          }}
        >
          Request Meeting
        </Button>
      </Box>

      {/* Tabs */}
      <Card sx={{ 
        mb: 3, 
        bgcolor: COLORS.slate,
        border: `1px solid rgba(139, 92, 246, 0.2)`,
        backgroundImage: 'none'
      }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
            '& .MuiTabs-indicator': {
              backgroundColor: COLORS.purple,
            },
            '& .MuiTab-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: 600,
              textTransform: 'none',
              '&.Mui-selected': {
                color: 'white',
              }
            }
          }}
        >
          <Tab label={`Upcoming (${upcomingSessions.length})`} />
          <Tab label={`Completed (${completedSessions.length})`} />
          <Tab label={`Requests (${pendingRequests.length})`} />
        </Tabs>
      </Card>

      {/* Tab Content */}
      <Box sx={{ minHeight: 400 }}>
        {/* Upcoming Sessions */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            {upcomingSessions.length === 0 ? (
              <Grid item xs={12}>
                <Card sx={{ bgcolor: COLORS.slate, border: `1px solid rgba(139, 92, 246, 0.2)`, backgroundImage: 'none' }}>
                  <CardContent sx={{ textAlign: 'center', py: 6 }}>
                    <VideoCameraIcon className="h-16 w-16 mx-auto mb-4" style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
                    <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                      No Upcoming Sessions
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      You don't have any scheduled online meetings. Request one to get started!
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ) : (
              upcomingSessions.map((session) => (
                <Grid item xs={12} md={6} key={session.id}>
                  <Card sx={{ bgcolor: COLORS.slate, border: `1px solid rgba(139, 92, 246, 0.2)`, backgroundImage: 'none' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                            {session.gig_info?.title || 'Online Session'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            {session.session_id}
                          </Typography>
                        </Box>
                        {getStatusChip(session.status)}
                      </Box>

                      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', my: 2 }} />

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarIcon className="h-4 w-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            {formatDateTime(session.scheduled_start)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ClockIcon className="h-4 w-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            {session.duration_minutes} minutes
                          </Typography>
                        </Box>
                      </Box>

                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<EyeIcon className="h-4 w-4" />}
                        onClick={() => handleViewDetails(session)}
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
              ))
            )}
          </Grid>
        )}

        {/* Completed Sessions */}
        {activeTab === 1 && (
          <Card sx={{ bgcolor: COLORS.slate, border: `1px solid rgba(139, 92, 246, 0.2)`, backgroundImage: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              {completedSessions.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CheckCircleIcon className="h-12 w-12 mx-auto mb-3" style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    No completed sessions yet
                  </Typography>
                </Box>
              ) : (
                <List>
                  {completedSessions.map((session, index) => (
                    <Box key={session.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText
                          primary={session.gig_info?.title || 'Online Session'}
                          secondary={
                            <React.Fragment>
                              <Box component="span" sx={{ display: 'inline-block', mr: 1 }}>
                                {formatDateTime(session.scheduled_start)}
                              </Box>
                              {getStatusChip(session.status)}
                            </React.Fragment>
                          }
                          primaryTypographyProps={{
                            sx: { color: 'white', fontWeight: 600 }
                          }}
                          secondaryTypographyProps={{
                            component: 'div',
                            sx: { color: 'rgba(255, 255, 255, 0.7)', mt: 0.5 }
                          }}
                        />
                        <Button
                          size="small"
                          onClick={() => handleViewDetails(session)}
                          sx={{ color: COLORS.purple }}
                        >
                          Details
                        </Button>
                      </ListItem>
                      {index < completedSessions.length - 1 && (
                        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                      )}
                    </Box>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        )}

        {/* Meeting Requests */}
        {activeTab === 2 && (
          <Card sx={{ bgcolor: COLORS.slate, border: `1px solid rgba(139, 92, 246, 0.2)`, backgroundImage: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 3, fontWeight: 600 }}>
                Your Meeting Requests
              </Typography>
              
              {requests.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CalendarIcon className="h-12 w-12 mx-auto mb-3" style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    No meeting requests yet
                  </Typography>
                </Box>
              ) : (
                <List>
                  {requests.map((request, index) => (
                    <Box key={request.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText
                          primary={request.gig_title || 'Meeting Request'}
                          secondary={
                            <React.Fragment>
                              <Box component="span" sx={{ display: 'inline-block', mr: 1 }}>
                                {formatDateTime(request.requested_start)} • {request.requested_duration} min
                              </Box>
                              {getStatusChip(request.status)}
                            </React.Fragment>
                          }
                          primaryTypographyProps={{
                            sx: { color: 'white', fontWeight: 600 }
                          }}
                          secondaryTypographyProps={{
                            component: 'div',
                            sx: { color: 'rgba(255, 255, 255, 0.7)', mt: 0.5 }
                          }}
                        />
                        {request.status === 'approved' && request.created_session_id && (
                          <Chip
                            label={`Session: ${request.created_session_id}`}
                            size="small"
                            sx={{
                              backgroundColor: `${COLORS.green}20`,
                              color: COLORS.green,
                              fontWeight: 600,
                            }}
                          />
                        )}
                      </ListItem>
                      {index < requests.length - 1 && (
                        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                      )}
                    </Box>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Session Details Modal */}
      {selectedSession && (
        <Dialog
          open={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: COLORS.slate,
              backgroundImage: 'none',
              border: `1px solid rgba(139, 92, 246, 0.2)`,
            }
          }}
        >
          <DialogTitle sx={{ borderBottom: `1px solid rgba(255, 255, 255, 0.1)` }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
              Session Details
            </Typography>
          </DialogTitle>

          <DialogContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Session ID
                </Typography>
                <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                  {selectedSession.session_id}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Meeting Code
                </Typography>
                <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                  {selectedSession.meeting_code}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  PIN Code
                </Typography>
                <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                  {selectedSession.pin_code}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Meeting URL
                </Typography>
                <Typography 
                  variant="body2" 
                  component="a" 
                  href={selectedSession.tutor_meeting_url}
                  target="_blank"
                  sx={{ color: COLORS.blue, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  {selectedSession.tutor_meeting_url}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Digital Samba Room
                </Typography>
                <Typography 
                  variant="body2" 
                  component="a" 
                  href={selectedSession.digital_samba_room_url}
                  target="_blank"
                  sx={{ color: COLORS.blue, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  {selectedSession.digital_samba_room_url}
                </Typography>
              </Box>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 3, borderTop: `1px solid rgba(255, 255, 255, 0.1)` }}>
            <Button onClick={() => setShowDetailsModal(false)} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Close
            </Button>
            <Button
              variant="contained"
              component="a"
              href={selectedSession.tutor_meeting_url}
              target="_blank"
              sx={{
                bgcolor: COLORS.green,
                '&:hover': { bgcolor: '#059669' }
              }}
            >
              Join Meeting
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Request Meeting Modal - Will be created next */}
      <RequestMeetingModal
        open={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        gigs={gigs}
        onSuccess={() => {
          setShowRequestModal(false);
          loadData();
          setSuccess('Meeting request submitted successfully!');
        }}
      />
    </Box>
  );
};

// Request Meeting Modal Component
const RequestMeetingModal = ({ open, onClose, gigs, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    gig: null,
    requested_start: '',
    requested_duration: 60,
    request_notes: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');

      if (!formData.gig) {
        setError('Please select a gig');
        return;
      }

      const payload = {
        gig: formData.gig.id,
        requested_start: new Date(formData.requested_start).toISOString(),
        requested_duration: formData.requested_duration,
        request_notes: formData.request_notes
      };

      await apiService.apiCall('/gigs/meeting-requests/', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      onSuccess();
      
      // Reset form
      setFormData({
        gig: null,
        requested_start: '',
        requested_duration: 60,
        request_notes: ''
      });
    } catch (err) {
      console.error('Error submitting request:', err);
      setError(err.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: COLORS.slate,
          backgroundImage: 'none',
          border: `1px solid rgba(139, 92, 246, 0.2)`,
        }
      }}
    >
      <DialogTitle sx={{ borderBottom: `1px solid rgba(255, 255, 255, 0.1)` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <VideoCameraIcon className="h-7 w-7" style={{ color: COLORS.purple }} />
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
            Request Online Meeting
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Select Gig */}
          <FormControl fullWidth>
            <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Select Gig</InputLabel>
            <Select
              value={formData.gig?.id || ''}
              onChange={(e) => {
                const selectedGig = gigs.find(g => g.id === e.target.value);
                handleChange('gig', selectedGig);
              }}
              label="Select Gig"
              sx={{
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.purple },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.purple },
              }}
            >
              {gigs.map((gig) => (
                <MenuItem key={gig.id} value={gig.id}>
                  {gig.gig_id} - {gig.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Start Date/Time */}
          <TextField
            label="Requested Start Time"
            type="datetime-local"
            value={formData.requested_start}
            onChange={(e) => handleChange('requested_start', e.target.value)}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                '&:hover fieldset': { borderColor: COLORS.purple },
                '&.Mui-focused fieldset': { borderColor: COLORS.purple },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
            }}
          />

            {/* Duration */}
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Duration</InputLabel>
              <Select
                value={formData.requested_duration}
                onChange={(e) => handleChange('requested_duration', e.target.value)}
                label="Duration"
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.purple },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.purple },
                }}
              >
                <MenuItem value={30}>30 minutes</MenuItem>
                <MenuItem value={45}>45 minutes</MenuItem>
                <MenuItem value={60}>1 hour</MenuItem>
                <MenuItem value={90}>1.5 hours</MenuItem>
                <MenuItem value={120}>2 hours</MenuItem>
              </Select>
            </FormControl>

            {/* Notes */}
            <TextField
              label="Notes (Optional)"
              multiline
              rows={3}
              value={formData.request_notes}
              onChange={(e) => handleChange('request_notes', e.target.value)}
              placeholder="Any specific topics or requirements for this session?"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover fieldset': { borderColor: COLORS.purple },
                  '&.Mui-focused fieldset': { borderColor: COLORS.purple },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
              }}
            />

          <Alert severity="info" sx={{ mt: 2 }}>
            Your request will be reviewed by an admin. If approved, an online session will be created and you'll receive an email with the meeting details.
          </Alert>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: `1px solid rgba(255, 255, 255, 0.1)` }}>
        <Button onClick={onClose} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting || !formData.gig}
          startIcon={submitting ? <CircularProgress size={20} /> : null}
          sx={{
            bgcolor: COLORS.purple,
            '&:hover': { bgcolor: '#7c3aed' },
            '&:disabled': { bgcolor: 'rgba(139, 92, 246, 0.3)' },
          }}
        >
          {submitting ? 'Submitting...' : 'Submit Request'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TutorOnlineMeetings;
