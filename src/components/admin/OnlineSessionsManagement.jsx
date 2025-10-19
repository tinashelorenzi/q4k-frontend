import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Grid,
  Autocomplete,
  Tabs,
  Tab,
} from '@mui/material';
import {
  VideoCameraIcon,
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import apiService from '../../services/api';

const COLORS = {
  darkSlate: '#0f172a',
  slate: '#1e293b',
  purple: '#8b5cf6',
  green: '#10b981',
  red: '#ef4444',
  yellow: '#f59e0b',
  blue: '#3b82f6',
};

const OnlineSessionsManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [meetingRequests, setMeetingRequests] = useState([]);
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const [sessionForm, setSessionForm] = useState({
    gig: null,
    tutor: null,
    scheduled_start: '',
    scheduled_end: '',
    session_notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load online sessions
      const sessionsData = await apiService.apiCall('/gigs/online-sessions/');
      setSessions(sessionsData.results || []);
      
      // Load meeting requests
      const requestsData = await apiService.apiCall('/gigs/meeting-requests/');
      setMeetingRequests(requestsData || []);
      
      // Load gigs with assigned tutors
      const gigsData = await apiService.apiCall('/gigs/?status=active&page_size=100');
      setGigs(gigsData.results?.filter(g => g.tutor) || []);
      
    } catch (error) {
      console.error('Error loading data:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load online sessions',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async () => {
    if (!sessionForm.gig || !sessionForm.scheduled_start || !sessionForm.scheduled_end) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }

    if (!sessionForm.gig.tutor_details) {
      setSnackbar({
        open: true,
        message: 'Selected gig does not have an assigned tutor',
        severity: 'error'
      });
      return;
    }

    try {
      const result = await apiService.apiCall('/gigs/online-sessions/', {
        method: 'POST',
        body: JSON.stringify({
          gig: sessionForm.gig.id,
          // Tutor is automatically assigned from the gig
          scheduled_start: sessionForm.scheduled_start,
          scheduled_end: sessionForm.scheduled_end,
          session_notes: sessionForm.session_notes
        }),
      });

      setSnackbar({
        open: true,
        message: `Session created! ${result.emails_sent?.tutor_email_sent && result.emails_sent?.client_email_sent ? 'Invitations sent.' : 'Check email status.'}`,
        severity: 'success'
      });

      setCreateDialogOpen(false);
      setSessionForm({
        gig: null,
        tutor: null,
        scheduled_start: '',
        scheduled_end: '',
        session_notes: ''
      });
      
      loadData();
    } catch (error) {
      console.error('Error creating session:', error);
      setSnackbar({
        open: true,
        message: error.details || 'Failed to create online session',
        severity: 'error'
      });
    }
  };

  const handleCancelSession = async (sessionId) => {
    if (!confirm('Are you sure you want to cancel this online session?')) return;

    try {
      await apiService.apiCall(`/gigs/online-sessions/${sessionId}/`, {
        method: 'DELETE',
      });

      setSnackbar({
        open: true,
        message: 'Session cancelled successfully',
        severity: 'success'
      });

      loadData();
    } catch (error) {
      console.error('Error cancelling session:', error);
      setSnackbar({
        open: true,
        message: 'Failed to cancel session',
        severity: 'error'
      });
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setSnackbar({
      open: true,
      message: `${label} copied to clipboard!`,
      severity: 'success'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return COLORS.blue;
      case 'active': return COLORS.green;
      case 'completed': return COLORS.slate;
      case 'cancelled': return COLORS.red;
      default: return COLORS.slate;
    }
  };

  const formatDateTime = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleReviewRequest = async (action) => {
    if (!selectedRequest) return;

    try {
      const response = await apiService.apiCall(`/gigs/meeting-requests/${selectedRequest.id}/review/`, {
        method: 'POST',
        body: JSON.stringify({ action })
      });

      showSnackbar(response.message || `Request ${action}d successfully`, 'success');
      setReviewDialogOpen(false);
      setSelectedRequest(null);
      loadData();
    } catch (error) {
      console.error('Error reviewing request:', error);
      showSnackbar(error.message || `Failed to ${action} request`, 'error');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ color: COLORS.purple }} />
      </Box>
    );
  }

  const pendingRequests = meetingRequests.filter(r => r.status === 'pending');

  return (
    <Box sx={{ maxWidth: '100%', px: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <VideoCameraIcon className="h-8 w-8" style={{ color: COLORS.purple }} />
            Online Sessions
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mt: 1 }}>
            Schedule and manage virtual tutoring sessions with Jitsi Meet
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PlusIcon className="h-5 w-5" />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{
            background: `linear-gradient(135deg, ${COLORS.purple} 0%, #6366f1 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)`,
            }
          }}
        >
          Create Online Session
        </Button>
      </Box>

      {/* Tabs */}
      <Card sx={{ mb: 3, bgcolor: COLORS.slate, border: `1px solid rgba(139, 92, 246, 0.2)`, backgroundImage: 'none' }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
            '& .MuiTabs-indicator': { backgroundColor: COLORS.purple },
            '& .MuiTab-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: 600,
              textTransform: 'none',
              '&.Mui-selected': { color: 'white' }
            }
          }}
        >
          <Tab label={`All Sessions (${sessions.length})`} />
          <Tab label={`Pending Requests (${pendingRequests.length})`} />
        </Tabs>
      </Card>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: COLORS.slate, p: 3 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 1 }}>
              Scheduled
            </Typography>
            <Typography variant="h4" sx={{ color: COLORS.blue, fontWeight: 600 }}>
              {sessions.filter(s => s.status === 'scheduled').length}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: COLORS.slate, p: 3 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 1 }}>
              Active Now
            </Typography>
            <Typography variant="h4" sx={{ color: COLORS.green, fontWeight: 600 }}>
              {sessions.filter(s => s.status === 'active').length}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: COLORS.slate, p: 3 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 1 }}>
              Completed
            </Typography>
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
              {sessions.filter(s => s.status === 'completed').length}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: COLORS.slate, p: 3 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 1 }}>
              Total Sessions
            </Typography>
            <Typography variant="h4" sx={{ color: COLORS.purple, fontWeight: 600 }}>
              {sessions.length}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* All Sessions Tab */}
      {activeTab === 0 && (
        <Card sx={{ bgcolor: COLORS.slate, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(139, 92, 246, 0.1)' }}>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Session</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Subject</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Tutor / Client</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Scheduled Time</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Duration</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <VideoCameraIcon className="h-16 w-16 mx-auto mb-4" style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
                    <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                      No online sessions yet
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.4)', mt: 1 }}>
                      Create your first virtual session to get started
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((session) => (
                  <TableRow key={session.id} hover sx={{ '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.05)' } }}>
                    <TableCell sx={{ color: 'white' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {session.session_id}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                          {session.meeting_code}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: 'white' }}>
                      <Typography variant="body2">{session.gig_info?.subject_name}</Typography>
                    </TableCell>
                    <TableCell sx={{ color: 'white' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                          {session.tutor_info?.full_name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                          {session.gig_info?.client_name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: 'white' }}>
                      <Typography variant="body2">{formatDateTime(session.scheduled_start)}</Typography>
                    </TableCell>
                    <TableCell sx={{ color: 'white' }}>
                      <Typography variant="body2">{session.duration_minutes} min</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={session.status}
                        size="small"
                        sx={{
                          bgcolor: getStatusColor(session.status),
                          color: 'white',
                          fontWeight: 600,
                          textTransform: 'capitalize'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedSession(session);
                              setDetailsDialogOpen(true);
                            }}
                            sx={{ color: COLORS.purple }}
                          >
                            <CalendarIcon className="h-5 w-5" />
                          </IconButton>
                        </Tooltip>
                        {session.status !== 'completed' && session.status !== 'cancelled' && (
                          <Tooltip title="Cancel Session">
                            <IconButton
                              size="small"
                              onClick={() => handleCancelSession(session.id)}
                              sx={{ color: COLORS.red }}
                            >
                              <XCircleIcon className="h-5 w-5" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
      )}

      {/* Pending Requests Tab */}
      {activeTab === 1 && (
        <Card sx={{ bgcolor: COLORS.slate, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'rgba(139, 92, 246, 0.1)' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Request ID</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Tutor</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Gig</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Requested Start</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Duration</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {meetingRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 8, color: 'rgba(255, 255, 255, 0.5)' }}>
                      No meeting requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  meetingRequests.map((request) => (
                    <TableRow
                      key={request.id}
                      sx={{
                        '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.05)' },
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                      }}
                    >
                      <TableCell sx={{ color: 'white' }}>{request.request_id}</TableCell>
                      <TableCell sx={{ color: 'white' }}>{request.tutor_name}</TableCell>
                      <TableCell sx={{ color: 'white' }}>
                        {request.gig_id}
                        <Typography variant="caption" sx={{ display: 'block', color: 'rgba(255, 255, 255, 0.6)' }}>
                          {request.gig_title}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ color: 'white' }}>{formatDateTime(request.requested_start)}</TableCell>
                      <TableCell sx={{ color: 'white' }}>{request.requested_duration} min</TableCell>
                      <TableCell>
                        <Chip
                          label={request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          size="small"
                          sx={{
                            bgcolor: request.status === 'pending' ? `${COLORS.yellow}30` : 
                                     request.status === 'approved' ? `${COLORS.green}30` : `${COLORS.red}30`,
                            color: request.status === 'pending' ? COLORS.yellow : 
                                   request.status === 'approved' ? COLORS.green : COLORS.red,
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {request.status === 'pending' ? (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Approve Request">
                              <IconButton
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setReviewDialogOpen(true);
                                }}
                                sx={{ color: COLORS.green }}
                              >
                                <CheckCircleIcon className="h-5 w-5" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject Request">
                              <IconButton
                                onClick={() => {
                                  setSelectedRequest(request);
                                  handleReviewRequest('reject');
                                }}
                                sx={{ color: COLORS.red }}
                              >
                                <XCircleIcon className="h-5 w-5" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ) : request.status === 'approved' && request.created_session_id ? (
                          <Chip
                            label={`Session: ${request.created_session_id}`}
                            size="small"
                            sx={{ bgcolor: `${COLORS.green}20`, color: COLORS.green }}
                          />
                        ) : (
                          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                            {request.status === 'rejected' ? 'Rejected' : '—'}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Create Session Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: COLORS.slate,
            backgroundImage: 'none',
          }
        }}
      >
        <DialogTitle sx={{ color: 'white', fontWeight: 600 }}>
          Create Online Session
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            <Autocomplete
              options={gigs}
              getOptionLabel={(option) => `${option.gig_id} - ${option.subject_name} (${option.tutor_details?.full_name || option.tutor_name || 'No Tutor'})`}
              value={sessionForm.gig}
              onChange={(e, newValue) => setSessionForm({ ...sessionForm, gig: newValue })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Gig"
                  required
                  sx={{
                    '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                    },
                  }}
                />
              )}
            />

            {sessionForm.gig && sessionForm.gig.tutor_details && (
              <Alert severity="info" sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: 'white' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Tutor: {sessionForm.gig.tutor_details.full_name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  {sessionForm.gig.tutor_details.email_address} • {sessionForm.gig.tutor_details.phone_number}
                </Typography>
              </Alert>
            )}
            
            {sessionForm.gig && !sessionForm.gig.tutor_details && (
              <Alert severity="warning">
                This gig does not have an assigned tutor. Please assign a tutor to the gig first.
              </Alert>
            )}

            <TextField
              label="Start Date & Time"
              type="datetime-local"
              value={sessionForm.scheduled_start}
              onChange={(e) => setSessionForm({ ...sessionForm, scheduled_start: e.target.value })}
              required
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                },
              }}
            />

            <TextField
              label="End Date & Time"
              type="datetime-local"
              value={sessionForm.scheduled_end}
              onChange={(e) => setSessionForm({ ...sessionForm, scheduled_end: e.target.value })}
              required
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                },
              }}
            />

            <TextField
              label="Session Notes (Optional)"
              multiline
              rows={3}
              value={sessionForm.session_notes}
              onChange={(e) => setSessionForm({ ...sessionForm, session_notes: e.target.value })}
              sx={{
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                },
              }}
            />

            <Alert severity="info">
              Meeting codes and invitations will be generated and sent automatically to both tutor and client.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setCreateDialogOpen(false)} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateSession}
            variant="contained"
            sx={{
              background: `linear-gradient(135deg, ${COLORS.purple} 0%, #6366f1 100%)`,
            }}
          >
            Create Session
          </Button>
        </DialogActions>
      </Dialog>

      {/* Session Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: COLORS.slate,
            backgroundImage: 'none',
          }
        }}
      >
        {selectedSession && (
          <>
            <DialogTitle sx={{ color: 'white', fontWeight: 600 }}>
              Session Details - {selectedSession.session_id}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
                {/* Meeting Codes */}
                <Card sx={{ bgcolor: `${COLORS.purple}20`, p: 3 }}>
                  <Typography variant="h6" sx={{ color: COLORS.purple, mb: 2 }}>
                    Digital Samba Access Codes
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Meeting Code:
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'white', fontWeight: 600, fontFamily: 'monospace' }}>
                          {selectedSession.meeting_code}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(selectedSession.meeting_code, 'Meeting code')}
                          sx={{ color: COLORS.purple }}
                        >
                          <DocumentDuplicateIcon className="h-4 w-4" />
                        </IconButton>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Digital Samba Room URL:
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'white', fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                          {selectedSession.digital_samba_room_url || 'Not created yet'}
                        </Typography>
                        {selectedSession.digital_samba_room_url && (
                          <IconButton
                            size="small"
                            onClick={() => copyToClipboard(selectedSession.digital_samba_room_url, 'Room URL')}
                            sx={{ color: COLORS.green }}
                          >
                            <DocumentDuplicateIcon className="h-4 w-4" />
                          </IconButton>
                        )}
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          PIN Code:
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'white', fontWeight: 600, fontFamily: 'monospace' }}>
                          {selectedSession.pin_code}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(selectedSession.pin_code, 'PIN code')}
                          sx={{ color: COLORS.purple }}
                        >
                          <DocumentDuplicateIcon className="h-4 w-4" />
                        </IconButton>
                      </Box>
                    </Grid>
                  </Grid>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      href={selectedSession.tutor_meeting_url}
                      target="_blank"
                      sx={{ borderColor: COLORS.purple, color: COLORS.purple }}
                    >
                      Tutor Link
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      href={selectedSession.client_meeting_url}
                      target="_blank"
                      sx={{ borderColor: COLORS.green, color: COLORS.green }}
                    >
                      Client Link
                    </Button>
                  </Box>
                </Card>

                {/* Session Info */}
                <Box>
                  <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>Session Information</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>Subject</Typography>
                      <Typography variant="body1" sx={{ color: 'white' }}>{selectedSession.gig_info?.subject_name}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>Status</Typography>
                      <Chip
                        label={selectedSession.status}
                        size="small"
                        sx={{
                          bgcolor: getStatusColor(selectedSession.status),
                          color: 'white',
                          textTransform: 'capitalize'
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>Tutor</Typography>
                      <Typography variant="body1" sx={{ color: 'white' }}>{selectedSession.tutor_info?.full_name}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>Client</Typography>
                      <Typography variant="body1" sx={{ color: 'white' }}>{selectedSession.gig_info?.client_name}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>Start Time</Typography>
                      <Typography variant="body1" sx={{ color: 'white' }}>{formatDateTime(selectedSession.scheduled_start)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>Duration</Typography>
                      <Typography variant="body1" sx={{ color: 'white' }}>{selectedSession.duration_minutes} minutes</Typography>
                    </Grid>
                  </Grid>
                </Box>

                {selectedSession.session_notes && (
                  <Box>
                    <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>Notes</Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      {selectedSession.session_notes}
                    </Typography>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setDetailsDialogOpen(false)} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Review Request Dialog */}
      <Dialog
        open={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: COLORS.slate,
            backgroundImage: 'none',
          }
        }}
      >
        <DialogTitle sx={{ color: 'white', fontWeight: 600 }}>
          Approve Meeting Request
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ pt: 2 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Approving this request will automatically create an online session and send invitation emails to the tutor and client.
              </Alert>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Request ID
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                    {selectedRequest.request_id}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Tutor
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                    {selectedRequest.tutor_name}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Gig
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                    {selectedRequest.gig_id} - {selectedRequest.gig_title}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Requested Time
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                    {formatDateTime(selectedRequest.requested_start)} ({selectedRequest.requested_duration} minutes)
                  </Typography>
                </Box>
                
                {selectedRequest.request_notes && (
                  <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Notes
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'white' }}>
                      {selectedRequest.request_notes}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setReviewDialogOpen(false)} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Cancel
          </Button>
          <Button
            onClick={() => handleReviewRequest('approve')}
            variant="contained"
            sx={{
              bgcolor: COLORS.green,
              '&:hover': { bgcolor: '#059669' }
            }}
          >
            Approve & Create Session
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OnlineSessionsManagement;
