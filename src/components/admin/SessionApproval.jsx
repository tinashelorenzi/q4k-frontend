import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Tooltip,
  Badge,
  Divider,
  Snackbar,
} from '@mui/material';
import {
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ClockIcon,
  UserIcon,
  AcademicCapIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import apiService from '../../services/api';

const COLORS = {
  purple: '#8b5cf6',
  blue: '#3b82f6',
  green: '#10b981',
  yellow: '#f59e0b',
  red: '#ef4444',
  cyan: '#06b6d4',
  gray: '#6b7280',
};

const SessionApproval = () => {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openVerifyDialog, setOpenVerifyDialog] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, verified
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiService.apiCall('/gigs/sessions/');
      setSessions(response.results || response || []);
    } catch (err) {
      console.error('Error loading sessions:', err);
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = sessions.filter(session => {
    // Filter by status
    if (filter === 'pending' && session.is_verified) return false;
    if (filter === 'verified' && !session.is_verified) return false;
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        session.gig_info?.title?.toLowerCase().includes(searchLower) ||
        session.gig_info?.gig_id?.toLowerCase().includes(searchLower) ||
        session.gig_info?.tutor?.full_name?.toLowerCase().includes(searchLower) ||
        session.gig_info?.tutor?.tutor_id?.toLowerCase().includes(searchLower) ||
        session.gig_info?.client_name?.toLowerCase().includes(searchLower) ||
        session.session_notes?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const handleViewSession = (session) => {
    setSelectedSession(session);
    setOpenDetailDialog(true);
  };

  const handleVerifySession = (session) => {
    setSelectedSession(session);
    setVerificationNotes('');
    setOpenVerifyDialog(true);
  };

  const handleVerify = async () => {
    if (!selectedSession) return;
    
    try {
      setActionLoading(true);
      
      const result = await apiService.apiCall(`/gigs/${selectedSession.gig}/sessions/${selectedSession.id}/verify/`, {
        method: 'POST',
        body: JSON.stringify({
          verified: true,
          verification_notes: verificationNotes,
        }),
      });

      // Update local state
      setSessions(prev => prev.map(s => 
        s.id === selectedSession.id 
          ? { ...s, is_verified: true, verified_at: new Date().toISOString() }
          : s
      ));

      // Show success message with email status
      const emailStatus = result.email_sent ? 'Email sent to tutor.' : 'Email could not be sent.';
      setSnackbar({
        open: true,
        message: `Session verified successfully! ${emailStatus}`,
        severity: 'success'
      });

      setOpenVerifyDialog(false);
      setSelectedSession(null);
      setVerificationNotes('');
    } catch (err) {
      console.error('Error verifying session:', err);
      setError('Failed to verify session');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnverify = async (session) => {
    try {
      setActionLoading(true);
      
      await apiService.apiCall(`/gigs/${session.gig}/sessions/${session.id}/verify/`, {
        method: 'POST',
        body: JSON.stringify({
          verified: false,
          verification_notes: 'Session unverified',
        }),
      });

      // Update local state
      setSessions(prev => prev.map(s => 
        s.id === session.id 
          ? { ...s, is_verified: false, verified_at: null }
          : s
      ));
    } catch (err) {
      console.error('Error unverifying session:', err);
      setError('Failed to unverify session');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-ZA', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (session) => {
    if (session.is_verified) return COLORS.green;
    return COLORS.yellow;
  };

  const getStatusText = (session) => {
    if (session.is_verified) return 'Verified';
    return 'Pending';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress sx={{ color: '#8b5cf6' }} />
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

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, px: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 1 }}>
          Session Approval
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          Review and verify tutoring sessions
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ mb: 4, px: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} lg={3}>
            <Card
              elevation={0}
              sx={{
                bgcolor: '#1e293b',
                border: '1px solid rgba(139, 92, 246, 0.15)',
                height: '100%',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                      Total Sessions
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
                      {sessions.length}
                    </Typography>
                  </Box>
                  <ClockIcon className="h-8 w-8" style={{ color: COLORS.blue }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} lg={3}>
            <Card
              elevation={0}
              sx={{
                bgcolor: '#1e293b',
                border: '1px solid rgba(139, 92, 246, 0.15)',
                height: '100%',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                      Pending Approval
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.yellow }}>
                      {sessions.filter(s => !s.is_verified).length}
                    </Typography>
                  </Box>
                  <ExclamationTriangleIcon className="h-8 w-8" style={{ color: COLORS.yellow }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} lg={3}>
            <Card
              elevation={0}
              sx={{
                bgcolor: '#1e293b',
                border: '1px solid rgba(139, 92, 246, 0.15)',
                height: '100%',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                      Verified Sessions
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.green }}>
                      {sessions.filter(s => s.is_verified).length}
                    </Typography>
                  </Box>
                  <CheckCircleIcon className="h-8 w-8" style={{ color: COLORS.green }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} lg={3}>
            <Card
              elevation={0}
              sx={{
                bgcolor: '#1e293b',
                border: '1px solid rgba(139, 92, 246, 0.15)',
                height: '100%',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                      Total Hours
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.cyan }}>
                      {sessions.reduce((sum, s) => sum + parseFloat(s.hours_logged || 0), 0).toFixed(1)}
                    </Typography>
                  </Box>
                  <ClockIcon className="h-8 w-8" style={{ color: COLORS.cyan }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3, px: 1 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#1e293b',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  '& fieldset': { border: 'none' },
                  '&:hover fieldset': { border: 'none' },
                  '&.Mui-focused fieldset': { border: 'none' },
                },
                '& .MuiInputBase-input': { color: 'white' },
                '& .MuiInputBase-input::placeholder': { color: 'rgba(255, 255, 255, 0.5)' },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={8}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {[
                { key: 'all', label: 'All Sessions', count: sessions.length },
                { key: 'pending', label: 'Pending', count: sessions.filter(s => !s.is_verified).length },
                { key: 'verified', label: 'Verified', count: sessions.filter(s => s.is_verified).length },
              ].map((filterOption) => (
                <Chip
                  key={filterOption.key}
                  label={`${filterOption.label} (${filterOption.count})`}
                  onClick={() => setFilter(filterOption.key)}
                  variant={filter === filterOption.key ? 'filled' : 'outlined'}
                  sx={{
                    bgcolor: filter === filterOption.key ? COLORS.purple : 'transparent',
                    color: filter === filterOption.key ? 'white' : 'rgba(255, 255, 255, 0.7)',
                    borderColor: 'rgba(139, 92, 246, 0.3)',
                    '&:hover': {
                      bgcolor: filter === filterOption.key ? COLORS.purple : 'rgba(139, 92, 246, 0.1)',
                    },
                  }}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Sessions Table */}
      <Box sx={{ px: 1 }}>
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            bgcolor: '#1e293b',
            border: '1px solid rgba(139, 92, 246, 0.15)',
            borderRadius: 2,
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 600, borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                  Session Details
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600, borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                  Tutor
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600, borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                  Date & Time
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600, borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                  Hours
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600, borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                  Status
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600, borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSessions.map((session) => (
                <TableRow key={session.id} hover>
                  <TableCell sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                        {session.gig_info?.title || 'Unknown Subject'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                        {session.gig_info?.gig_id || 'Unknown Gig'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: COLORS.purple }}>
                        {session.gig_info?.tutor?.full_name?.charAt(0) || 'T'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ color: 'white' }}>
                          {session.gig_info?.tutor?.full_name || 'No Tutor Assigned'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                          {session.gig_info?.tutor?.tutor_id || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'white' }}>
                        {formatDate(session.session_date)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                        {formatTime(session.start_time)} - {formatTime(session.end_time)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                      {session.hours_logged} hrs
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <Chip
                      label={getStatusText(session)}
                      size="small"
                      sx={{
                        bgcolor: getStatusColor(session),
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewSession(session)}
                          sx={{ color: COLORS.blue }}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </IconButton>
                      </Tooltip>
                      
                      {!session.is_verified ? (
                        <Tooltip title="Verify Session">
                          <IconButton
                            size="small"
                            onClick={() => handleVerifySession(session)}
                            disabled={actionLoading}
                            sx={{ color: COLORS.green }}
                          >
                            <CheckIcon className="h-4 w-4" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Unverify Session">
                          <IconButton
                            size="small"
                            onClick={() => handleUnverify(session)}
                            disabled={actionLoading}
                            sx={{ color: COLORS.red }}
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Session Detail Dialog */}
      <Dialog
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#1e293b', border: '1px solid rgba(139, 92, 246, 0.2)' } }}
      >
        <DialogTitle sx={{ color: 'white', fontWeight: 600 }}>
          Session Details
        </DialogTitle>
        <DialogContent>
          {selectedSession && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                    Session Information
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Subject
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white' }}>
                        {selectedSession.gig_info?.title || 'Unknown'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Date & Time
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white' }}>
                        {formatDate(selectedSession.session_date)} at {formatTime(selectedSession.start_time)} - {formatTime(selectedSession.end_time)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Hours Logged
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                        {selectedSession.hours_logged} hours
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Student Attendance
                      </Typography>
                      <Chip
                        label={selectedSession.student_attendance ? 'Present' : 'Absent'}
                        size="small"
                        sx={{
                          bgcolor: selectedSession.student_attendance ? COLORS.green : COLORS.red,
                          color: 'white',
                        }}
                      />
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                    Tutor Information
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Tutor Name
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white' }}>
                        {selectedSession.gig_info?.tutor?.full_name || 'No Tutor Assigned'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Tutor ID
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white' }}>
                        {selectedSession.gig_info?.tutor?.tutor_id || 'N/A'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Email
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white' }}>
                        {selectedSession.gig_info?.tutor?.email_address || 'N/A'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Phone
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white' }}>
                        {selectedSession.gig_info?.tutor?.phone_number || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                    Client & Gig Information
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Client Name
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white' }}>
                        {selectedSession.gig_info?.client_name || 'Unknown'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Gig ID
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white' }}>
                        {selectedSession.gig_info?.gig_id || 'Unknown'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Gig Status
                      </Typography>
                      <Chip
                        label={selectedSession.gig_info?.status || 'Unknown'}
                        size="small"
                        sx={{
                          bgcolor: selectedSession.gig_info?.status === 'completed' ? COLORS.green : COLORS.yellow,
                          color: 'white',
                        }}
                      />
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                    Session Notes
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 2,
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      {selectedSession.session_notes || 'No notes provided'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDetailDialog(false)}>
            Close
          </Button>
          {selectedSession && !selectedSession.is_verified && (
            <Button
              variant="contained"
              onClick={() => {
                setOpenDetailDialog(false);
                handleVerifySession(selectedSession);
              }}
              sx={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' }}
            >
              Verify Session
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Verification Dialog */}
      <Dialog
        open={openVerifyDialog}
        onClose={() => !actionLoading && setOpenVerifyDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#1e293b', border: '1px solid rgba(139, 92, 246, 0.2)' } }}
      >
        <DialogTitle sx={{ color: 'white', fontWeight: 600 }}>
          Verify Session
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Session:</strong> {selectedSession?.gig_info?.title} - {selectedSession?.hours_logged} hours
                <br />
                <strong>Tutor:</strong> {selectedSession?.gig_info?.tutor?.full_name || 'No Tutor'} ({selectedSession?.gig_info?.tutor?.tutor_id || 'N/A'})
                <br />
                <strong>Date:</strong> {selectedSession && formatDate(selectedSession.session_date)}
              </Typography>
            </Alert>
            
            <TextField
              fullWidth
              label="Verification Notes (Optional)"
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              multiline
              rows={3}
              placeholder="Add any notes about this verification..."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenVerifyDialog(false)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleVerify}
            disabled={actionLoading}
            sx={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' }}
          >
            {actionLoading ? <CircularProgress size={20} /> : 'Verify Session'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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

export default SessionApproval;