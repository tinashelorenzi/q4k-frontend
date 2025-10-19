import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
  Autocomplete
} from '@mui/material';
import {
  Close,
  Save,
  Event,
  Schedule,
  CheckCircle
} from '@mui/icons-material';
import { ClockIcon } from '@heroicons/react/24/outline';
import apiService from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const COLORS = {
  darkSlate: '#0f172a',
  slate: '#1e293b',
  purple: '#8b5cf6',
  green: '#10b981',
  red: '#ef4444',
  yellow: '#f59e0b',
};

const LogSessionModal = ({ isOpen, onClose, onSuccess }) => {
  const { getTutorId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [gigs, setGigs] = useState([]);
  
  const [formData, setFormData] = useState({
    gig: null,
    session_date: new Date().toISOString().split('T')[0],
    start_time: '',
    end_time: '',
    hours_logged: '',
    session_notes: '',
    student_attendance: true
  });

  useEffect(() => {
    if (isOpen) {
      loadActiveGigs();
    }
  }, [isOpen]);

  const loadActiveGigs = async () => {
    try {
      setLoading(true);
      setError('');
      
      const tutorId = getTutorId();
      if (!tutorId) {
        setError('Unable to load tutor information');
        return;
      }

      const response = await apiService.getTutorGigs(tutorId);
      const activeGigs = (response.results || response || []).filter(gig => gig.status === 'active');
      setGigs(activeGigs);
    } catch (err) {
      console.error('Error loading gigs:', err);
      setError('Failed to load gigs');
    } finally {
      setLoading(false);
    }
  };

  const calculateHours = () => {
    if (formData.start_time && formData.end_time) {
      const start = new Date(`2000-01-01T${formData.start_time}`);
      const end = new Date(`2000-01-01T${formData.end_time}`);
      const diff = (end - start) / (1000 * 60 * 60); // Convert to hours
      return diff > 0 ? diff.toFixed(2) : '0.00';
    }
    return '';
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-calculate hours if times change
    if (field === 'start_time' || field === 'end_time') {
      const hours = calculateHours();
      if (hours && (field === 'end_time' || (field === 'start_time' && formData.end_time))) {
        const start = field === 'start_time' ? value : formData.start_time;
        const end = field === 'end_time' ? value : formData.end_time;
        if (start && end) {
          const startDate = new Date(`2000-01-01T${start}`);
          const endDate = new Date(`2000-01-01T${end}`);
          const diff = (endDate - startDate) / (1000 * 60 * 60);
          setFormData(prev => ({
            ...prev,
            hours_logged: diff > 0 ? diff.toFixed(2) : ''
          }));
        }
      }
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      // Validation
      if (!formData.gig) {
        setError('Please select a gig');
        return;
      }
      if (!formData.session_date) {
        setError('Please select a session date');
        return;
      }
      if (!formData.start_time || !formData.end_time) {
        setError('Please enter start and end times');
        return;
      }

      // Calculate hours if not already set or if invalid
      let hoursToLog = parseFloat(formData.hours_logged);
      if (!hoursToLog || hoursToLog <= 0) {
        // Auto-calculate from start and end times
        const start = new Date(`2000-01-01T${formData.start_time}`);
        const end = new Date(`2000-01-01T${formData.end_time}`);
        hoursToLog = (end - start) / (1000 * 60 * 60);
        
        if (hoursToLog <= 0) {
          setError('End time must be after start time');
          return;
        }
      }

      // Prepare payload
      const payload = {
        gig: formData.gig.id,
        session_date: formData.session_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        hours_logged: hoursToLog,
        session_notes: formData.session_notes,
        student_attendance: formData.student_attendance
      };

      await apiService.createGigSession(payload);
      
      setSuccess('Session logged successfully!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        handleClose();
      }, 1500);
    } catch (err) {
      console.error('Error logging session:', err);
      setError(err.message || 'Failed to log session');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      gig: null,
      session_date: new Date().toISOString().split('T')[0],
      start_time: '',
      end_time: '',
      hours_logged: '',
      session_notes: '',
      student_attendance: true
    });
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
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
      {/* Header */}
      <DialogTitle sx={{ p: 3, borderBottom: `1px solid rgba(255, 255, 255, 0.1)` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ClockIcon className="h-7 w-7" style={{ color: COLORS.purple }} />
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
              Log Session
            </Typography>
          </Box>
          <IconButton onClick={handleClose} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: COLORS.purple }} />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Select Gig */}
            <Autocomplete
              options={gigs}
              getOptionLabel={(option) => `${option.gig_id} - ${option.title}`}
              value={formData.gig}
              onChange={(event, newValue) => handleChange('gig', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Gig"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: COLORS.purple,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: COLORS.purple,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                  }}
                />
              )}
              sx={{
                '& .MuiAutocomplete-popupIndicator': { color: 'white' },
                '& .MuiAutocomplete-clearIndicator': { color: 'white' },
              }}
            />

            {/* Session Date */}
            <TextField
              label="Session Date"
              type="date"
              value={formData.session_date}
              onChange={(e) => handleChange('session_date', e.target.value)}
              required
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: COLORS.purple,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: COLORS.purple,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
              }}
            />

            {/* Start and End Time */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Start Time"
                type="time"
                value={formData.start_time}
                onChange={(e) => handleChange('start_time', e.target.value)}
                required
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: COLORS.purple,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: COLORS.purple,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                }}
              />

              <TextField
                label="End Time"
                type="time"
                value={formData.end_time}
                onChange={(e) => handleChange('end_time', e.target.value)}
                required
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: COLORS.purple,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: COLORS.purple,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                }}
              />
            </Box>

            {/* Hours Logged */}
            <TextField
              label="Hours Logged (Optional)"
              type="number"
              value={formData.hours_logged}
              onChange={(e) => handleChange('hours_logged', e.target.value)}
              inputProps={{ step: '0.01', min: '0' }}
              helperText="Auto-calculated from start and end time if left empty"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: COLORS.purple,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: COLORS.purple,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
                '& .MuiFormHelperText-root': {
                  color: 'rgba(255, 255, 255, 0.5)',
                },
              }}
            />

            {/* Session Notes */}
            <TextField
              label="Session Notes"
              multiline
              rows={4}
              value={formData.session_notes}
              onChange={(e) => handleChange('session_notes', e.target.value)}
              placeholder="What did you cover in this session?"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: COLORS.purple,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: COLORS.purple,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
              }}
            />

            {/* Student Attendance */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.student_attendance}
                  onChange={(e) => handleChange('student_attendance', e.target.checked)}
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&.Mui-checked': {
                      color: COLORS.green,
                    },
                  }}
                />
              }
              label={
                <Typography sx={{ color: 'white' }}>
                  Student was present
                </Typography>
              }
            />
          </Box>
        )}
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ p: 3, borderTop: `1px solid rgba(255, 255, 255, 0.1)` }}>
        <Button
          onClick={handleClose}
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting || !formData.gig}
          startIcon={submitting ? <CircularProgress size={20} /> : <Save />}
          sx={{
            bgcolor: COLORS.purple,
            '&:hover': {
              bgcolor: '#7c3aed',
            },
            '&:disabled': {
              bgcolor: 'rgba(139, 92, 246, 0.3)',
            },
          }}
        >
          {submitting ? 'Logging...' : 'Log Session'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogSessionModal;
