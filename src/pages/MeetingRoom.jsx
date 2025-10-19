import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Snackbar
} from '@mui/material';
import {
  VideoCameraIcon,
  ClockIcon,
  PlusCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import DigitalSambaEmbedded from '@digitalsamba/embedded-sdk';
import apiService from '../services/api';

const COLORS = {
  darkSlate: '#0f172a',
  slate: '#1e293b',
  purple: '#8b5cf6',
  green: '#10b981',
  red: '#ef4444',
  yellow: '#f59e0b',
};

const MeetingRoom = () => {
  const { meetingCode } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [session, setSession] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [sambaLoaded, setSambaLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  
  const [pinCode, setPinCode] = useState('');
  const [participantType, setParticipantType] = useState(searchParams.get('role') || 'tutor');
  const [error, setError] = useState('');
  
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [extendMinutes, setExtendMinutes] = useState(15);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const sambaContainerRef = useRef(null);
  const sambaApiRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    loadSessionInfo();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (sambaApiRef.current) {
        sambaApiRef.current.dispose();
      }
    };
  }, [meetingCode]);

  useEffect(() => {
    console.log('useEffect triggered:', { authenticated, session: !!session, sambaLoaded });
    if (authenticated && session && !sambaLoaded) {
      console.log('Initializing Digital Samba...');
      // Small delay to ensure container is properly sized
      setTimeout(() => {
        initializeDigitalSamba();
      }, 100);
    }
  }, [authenticated, session, sambaLoaded]);

  useEffect(() => {
    if (authenticated && session) {
      startTimer();
    }
  }, [authenticated, session]);

  const loadSessionInfo = async () => {
    try {
      setLoading(true);
      const result = await apiService.apiCall(`/gigs/online-sessions/code/${meetingCode}/`, {
        method: 'GET',
        requireAuth: false
      });
      
      setSession(result);
      setLoading(false);
    } catch (err) {
      console.error('Error loading session:', err);
      setError(err.message || 'Failed to load session information');
      setLoading(false);
    }
  };

  const handleValidateAndJoin = async () => {
    if (!pinCode.trim()) {
      setError('Please enter the PIN code');
      return;
    }

    try {
      setValidating(true);
      setError('');
      
      const result = await apiService.apiCall('/gigs/online-sessions/validate/', {
        method: 'POST',
        body: JSON.stringify({
          meeting_code: meetingCode,
          pin_code: pinCode,
          participant_type: participantType
        }),
        requireAuth: false
      });

      console.log('Validation result:', result);

      if (result.message === 'Access granted' && result.session) {
        setSession(result.session);
        setAuthenticated(true);
        setSnackbar({
          open: true,
          message: 'Successfully authenticated! Loading meeting...',
          severity: 'success'
        });
      } else {
        setError('Invalid PIN code or meeting code');
      }
    } catch (err) {
      console.error('Validation error:', err);
      setError(err.message || 'Failed to validate credentials');
    } finally {
      setValidating(false);
    }
  };

  const initializeDigitalSamba = () => {
    if (!session || !sambaContainerRef.current) return;

    try {
      // Check if Digital Samba SDK is loaded
      if (!DigitalSambaEmbedded) {
        console.error('Digital Samba SDK not loaded');
        setSnackbar({
          open: true,
          message: 'Digital Samba SDK not available',
          severity: 'error'
        });
        return;
      }

      console.log('Digital Samba SDK loaded:', DigitalSambaEmbedded);
      console.log('createControl method:', typeof DigitalSambaEmbedded.createControl);

      const roomUrl = session.digital_samba_room_url || session.digital_samba_url;
      console.log('Digital Samba Room URL:', roomUrl);
      console.log('Session data:', session);
      
      if (!roomUrl) {
        console.error('No Digital Samba room URL available');
        setSnackbar({
          open: true,
          message: 'No meeting room URL available',
          severity: 'error'
        });
        return;
      }

      const initOptions = {
        url: roomUrl,
        root: sambaContainerRef.current,
        roomSettings: {
          username: participantType === 'tutor' 
            ? session.tutor_info?.full_name || 'Tutor'
            : session.gig_info?.client_name || 'Student',
          layoutMode: 'auto',
          showToolbar: true,
          showTopbar: true,
          showCaptions: true,
          videoEnabled: true,
          audioEnabled: true,
          muteFrame: false,
          appLanguage: 'en'
        }
      };

      console.log('Digital Samba init options:', initOptions);

      const sambaFrame = DigitalSambaEmbedded.createControl(initOptions);
      sambaApiRef.current = sambaFrame;

      console.log('Digital Samba control created:', sambaFrame);
      console.log('Available methods:', Object.getOwnPropertyNames(sambaFrame));

      // Check if addEventListener exists, if not, try alternative event handling
      if (typeof sambaFrame.addEventListener === 'function') {
        console.log('Using addEventListener for event handling');
        
        // Handle meeting events
        sambaFrame.addEventListener('roomJoined', () => {
          console.log('User joined the meeting');
          setSambaLoaded(true);
        });

        sambaFrame.addEventListener('roomLeft', () => {
          console.log('User left the meeting');
          handleLeaveMeeting();
        });

        sambaFrame.addEventListener('error', (error) => {
          console.error('Digital Samba error:', error);
          setSnackbar({
            open: true,
            message: 'Failed to load meeting room',
            severity: 'error'
          });
        });
      } else {
        console.log('addEventListener not available, trying alternative event handling');
        
        // Try alternative event handling methods
        if (typeof sambaFrame.on === 'function') {
          sambaFrame.on('roomJoined', () => {
            console.log('User joined the meeting');
            setSambaLoaded(true);
          });
          
          sambaFrame.on('roomLeft', () => {
            console.log('User left the meeting');
            handleLeaveMeeting();
          });
          
          sambaFrame.on('error', (error) => {
            console.error('Digital Samba error:', error);
            setSnackbar({
              open: true,
              message: 'Failed to load meeting room',
              severity: 'error'
            });
          });
        } else {
          console.log('No event handling methods found, proceeding without events');
          // Set as loaded after a delay since we can't detect when it loads
          setTimeout(() => {
            setSambaLoaded(true);
          }, 3000);
        }
      }

      console.log('Loading Digital Samba room...');
      sambaFrame.load();
      
      // Set as loaded after a short delay to allow the room to initialize
      setTimeout(() => {
        console.log('Setting Digital Samba as loaded');
        setSambaLoaded(true);
      }, 2000);
      
      // Show fallback after 8 seconds if not loaded
      setTimeout(() => {
        if (!sambaLoaded) {
          console.log('Showing fallback dialog');
          setShowFallback(true);
        }
      }, 8000);
      
    } catch (err) {
      console.error('Error initializing Digital Samba:', err);
      setSnackbar({
        open: true,
        message: 'Failed to initialize meeting room',
        severity: 'error'
      });
    }
  };

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      const remaining = session.time_remaining_minutes;
      setTimeRemaining(remaining);

      // Show warning when 5 minutes remaining
      if (remaining <= 5 && remaining > 0 && !showTimeWarning) {
        setShowTimeWarning(true);
      }

      // Auto-complete when time runs out
      if (remaining === 0) {
        handleSessionEnd();
      }
    }, 1000);
  };

  const handleExtendSession = async () => {
    try {
      const result = await apiService.apiCall(`/gigs/online-sessions/${session.id}/extend/`, {
        method: 'POST',
        body: JSON.stringify({
          additional_minutes: extendMinutes
        }),
        requireAuth: false
      });

      setSession(result.session);
      setShowExtendDialog(false);
      setShowTimeWarning(false);
      
      setSnackbar({
        open: true,
        message: `Session extended by ${extendMinutes} minutes!`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Error extending session:', err);
      setSnackbar({
        open: true,
        message: 'Failed to extend session',
        severity: 'error'
      });
    }
  };

  const handleSessionEnd = async () => {
    try {
      await apiService.apiCall(`/gigs/online-sessions/${session.id}/complete/`, {
        method: 'POST',
        requireAuth: false
      });
      
      setSnackbar({
        open: true,
        message: 'Session completed successfully!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error completing session:', err);
    }
    
    if (sambaApiRef.current) {
      sambaApiRef.current.dispose();
    }
    
    navigate('/');
  };

  const handleLeaveMeeting = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    navigate('/');
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDateTime = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: COLORS.darkSlate
      }}>
        <CircularProgress sx={{ color: COLORS.purple }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: COLORS.darkSlate,
        p: 3
      }}>
        <Card sx={{ maxWidth: 500, p: 4, bgcolor: COLORS.slate, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
            Unable to Access Meeting
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 3 }}>
            {error}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            sx={{
              background: `linear-gradient(135deg, ${COLORS.purple} 0%, #6366f1 100%)`,
            }}
          >
            Go to Home
          </Button>
        </Card>
      </Box>
    );
  }

  if (!authenticated) {
    return (
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: COLORS.darkSlate,
        p: 3
      }}>
        <Card sx={{ maxWidth: 500, width: '100%', p: 4, bgcolor: COLORS.slate }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <VideoCameraIcon className="h-16 w-16 mx-auto mb-4" style={{ color: COLORS.purple }} />
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
              Join Online Session
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Enter your PIN code to join the meeting
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="PIN Code"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              type="password"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                  '&:hover fieldset': { borderColor: COLORS.purple },
                  '&.Mui-focused fieldset': { borderColor: COLORS.purple },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                '&.Mui-focused .MuiInputLabel-root': { color: COLORS.purple },
                '&.Mui-focused fieldset': { borderColor: COLORS.purple },
              }}
            />

            {searchParams.get('role') ? (
              <Alert severity="info" sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: 'white' }}>
                <Typography variant="body2">
                  Joining as: <strong>{participantType === 'tutor' ? 'Tutor' : 'Student/Client'}</strong>
                </Typography>
              </Alert>
            ) : (
              <FormControl fullWidth>
                <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>I am joining as</InputLabel>
                <Select
                  value={participantType}
                  onChange={(e) => setParticipantType(e.target.value)}
                  label="I am joining as"
                  sx={{
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.purple },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.purple },
                    '& .MuiSvgIcon-root': { color: 'rgba(255, 255, 255, 0.7)' }
                  }}
                >
                  <MenuItem value="tutor">Tutor</MenuItem>
                  <MenuItem value="client">Student/Client</MenuItem>
                </Select>
              </FormControl>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              fullWidth
              variant="contained"
              onClick={handleValidateAndJoin}
              disabled={validating || !pinCode.trim()}
              sx={{
                background: `linear-gradient(135deg, ${COLORS.purple} 0%, #6366f1 100%)`,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                '&:hover': {
                  background: `linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)`,
                }
              }}
            >
              {validating ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                'Join Session'
              )}
            </Button>
          </Box>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{
      height: '100vh',
      bgcolor: COLORS.darkSlate,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Top Bar */}
      <Box sx={{
        bgcolor: COLORS.slate,
        p: 2,
        borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <VideoCameraIcon className="h-6 w-6" style={{ color: COLORS.purple }} />
          <Box>
            <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>
              {session?.gig_info?.subject_name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              {session?.session_id}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            icon={<ClockIcon className="h-4 w-4" />}
            label={`Time Remaining: ${formatTime(timeRemaining)}`}
            sx={{
              bgcolor: timeRemaining < 300 ? COLORS.red : COLORS.green,
              color: 'white',
              fontWeight: 600
            }}
          />
          
          <Button
            variant="outlined"
            startIcon={<PlusCircleIcon className="h-5 w-5" />}
            onClick={() => setShowExtendDialog(true)}
            sx={{
              borderColor: COLORS.purple,
              color: COLORS.purple,
              '&:hover': {
                borderColor: '#7c3aed',
                bgcolor: 'rgba(139, 92, 246, 0.1)'
              }
            }}
          >
            Extend
          </Button>
        </Box>
      </Box>

      {/* Time Warning Banner */}
      {showTimeWarning && (
        <Alert
          severity="warning"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => setShowExtendDialog(true)}
            >
              Extend Session
            </Button>
          }
          sx={{ borderRadius: 0 }}
        >
          Your session will end in less than 5 minutes. Would you like to extend?
        </Alert>
      )}

      {/* Digital Samba Meeting Container */}
      <Box
        ref={sambaContainerRef}
        sx={{
          flex: 1,
          width: '100%',
          height: '100%',
          minHeight: 0,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          '& iframe': {
            width: '100% !important',
            height: '100% !important',
            border: 'none !important',
            borderRadius: '0 !important'
          }
        }}
      />
      
      {/* Fallback: Direct Digital Samba Link */}
      {session?.digital_samba_room_url && showFallback && !sambaLoaded && (
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          bgcolor: 'rgba(0, 0, 0, 0.8)',
          p: 3,
          borderRadius: 2,
          zIndex: 1000
        }}>
          <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
            Meeting Room Loading...
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
            If the meeting doesn't load automatically, click the link below:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="contained"
              href={session.digital_samba_room_url}
              target="_blank"
              sx={{
                background: `linear-gradient(135deg, ${COLORS.purple} 0%, #6366f1 100%)`,
                color: 'white',
                '&:hover': {
                  background: `linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)`,
                }
              }}
            >
              Open Digital Samba Room
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                // Try to load iframe directly
                const iframe = document.createElement('iframe');
                iframe.src = session.digital_samba_room_url;
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                iframe.style.border = 'none';
                sambaContainerRef.current.innerHTML = '';
                sambaContainerRef.current.appendChild(iframe);
                setShowFallback(false);
              }}
              sx={{
                borderColor: COLORS.green,
                color: COLORS.green,
                '&:hover': {
                  borderColor: '#059669',
                  bgcolor: 'rgba(16, 185, 129, 0.1)'
                }
              }}
            >
              Load in Frame
            </Button>
          </Box>
        </Box>
      )}

      {/* Extend Session Dialog */}
      <Dialog
        open={showExtendDialog}
        onClose={() => setShowExtendDialog(false)}
        PaperProps={{
          sx: {
            bgcolor: COLORS.slate,
            backgroundImage: 'none',
          }
        }}
      >
        <DialogTitle sx={{ color: 'white', fontWeight: 600 }}>
          Extend Session
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              How many additional minutes would you like to add?
            </Typography>
            <TextField
              type="number"
              value={extendMinutes}
              onChange={(e) => setExtendMinutes(parseInt(e.target.value) || 15)}
              inputProps={{ min: 5, max: 120 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                  '&:hover fieldset': { borderColor: COLORS.purple },
                  '&.Mui-focused fieldset': { borderColor: COLORS.purple },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowExtendDialog(false)}
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExtendSession}
            sx={{
              background: `linear-gradient(135deg, ${COLORS.purple} 0%, #6366f1 100%)`,
              color: 'white',
              '&:hover': {
                background: `linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)`,
              }
            }}
          >
            Extend Session
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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

export default MeetingRoom;