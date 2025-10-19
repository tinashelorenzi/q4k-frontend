import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
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
  Snackbar,
  Grid,
  Tabs,
  Tab,
} from '@mui/material';
import {
  MagnifyingGlassIcon,
  UserPlusIcon,
  PencilIcon,
  TrashIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  CheckIcon,
  XMarkIcon,
  AcademicCapIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import apiService from '../../services/api';

const TutorManagement = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [newTutorForm, setNewTutorForm] = useState({
    first_name: '',
    last_name: '',
    email_address: '',
    phone_number: '',
    physical_address: '',
    highest_qualification: 'bachelors',
  });

  const [editTutorForm, setEditTutorForm] = useState({
    first_name: '',
    last_name: '',
    email_address: '',
    phone_number: '',
    physical_address: '',
    highest_qualification: 'bachelors',
  });

  const qualifications = [
    { value: 'high_school', label: 'High School Diploma' },
    { value: 'certificate', label: 'Certificate' },
    { value: 'diploma', label: 'Diploma' },
    { value: 'bachelors', label: "Bachelor's Degree" },
    { value: 'masters', label: "Master's Degree" },
    { value: 'phd', label: 'PhD/Doctorate' },
    { value: 'other', label: 'Other' },
  ];

  useEffect(() => {
    loadTutors();
  }, []);

  const loadTutors = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiService.apiCall('/tutors/?page_size=1000');
      let allTutors = response.results || response || [];
      
      // If paginated, fetch all pages
      if (response.next) {
        let nextUrl = response.next;
        while (nextUrl) {
          try {
            const nextResponse = await fetch(nextUrl, {
              headers: apiService.getAuthHeaders(),
            });
            const data = await nextResponse.json();
            allTutors = [...allTutors, ...(data.results || [])];
            nextUrl = data.next;
          } catch (err) {
            console.error('Error loading next page:', err);
            break;
          }
        }
      }
      
      console.log(`Loaded ${allTutors.length} tutors`);
      setTutors(allTutors);
    } catch (err) {
      console.error('Error loading tutors:', err);
      setError('Failed to load tutors');
    } finally {
      setLoading(false);
    }
  };

  const filteredTutors = tutors.filter(tutor => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const fullName = `${tutor.first_name || ''} ${tutor.last_name || ''}`.toLowerCase();
      const tutorId = tutor.tutor_id?.toLowerCase() || '';
      if (!fullName.includes(searchLower) && 
          !tutor.email_address?.toLowerCase().includes(searchLower) &&
          !tutorId.includes(searchLower)) {
        return false;
      }
    }

    // Status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'active' && !tutor.is_active) return false;
      if (filterStatus === 'inactive' && tutor.is_active) return false;
      if (filterStatus === 'blocked' && !tutor.is_blocked) return false;
    }

    return true;
  });

  const getQualificationLabel = (value) => {
    const qual = qualifications.find(q => q.value === value);
    return qual ? qual.label : value;
  };

  const handleAddTutor = async () => {
    try {
      setActionLoading(true);
      
      const response = await apiService.apiCall('/tutors/', {
        method: 'POST',
        body: JSON.stringify(newTutorForm),
      });

      showSnackbar(
        `Tutor created successfully! Temporary password: ${response.temporary_password}`,
        'success'
      );
      setOpenAddDialog(false);
      setNewTutorForm({
        first_name: '',
        last_name: '',
        email_address: '',
        phone_number: '',
        physical_address: '',
        highest_qualification: 'bachelors',
      });
      
      loadTutors();
    } catch (err) {
      const errorMsg = err.message || 'Failed to create tutor';
      showSnackbar(errorMsg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditTutor = async () => {
    try {
      setActionLoading(true);
      
      await apiService.apiCall(`/tutors/${selectedTutor.id}/`, {
        method: 'PATCH',
        body: JSON.stringify(editTutorForm),
      });

      showSnackbar('Tutor updated successfully!', 'success');
      setOpenEditDialog(false);
      setSelectedTutor(null);
      
      loadTutors();
    } catch (err) {
      const errorMsg = err.message || 'Failed to update tutor';
      showSnackbar(errorMsg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (tutor) => {
    try {
      const endpoint = tutor.is_active 
        ? `/tutors/${tutor.id}/deactivate/`
        : `/tutors/${tutor.id}/activate/`;
      
      await apiService.apiCall(endpoint, { 
        method: 'POST',
        body: JSON.stringify({ reason: 'Admin action' }),
      });
      
      showSnackbar(
        `Tutor ${tutor.is_active ? 'deactivated' : 'activated'} successfully!`,
        'success'
      );
      
      loadTutors();
    } catch (err) {
      const errorMsg = err.message || `Failed to ${tutor.is_active ? 'deactivate' : 'activate'} tutor`;
      showSnackbar(errorMsg, 'error');
    }
  };

  const handleToggleBlock = async (tutor) => {
    try {
      const endpoint = tutor.is_blocked 
        ? `/tutors/${tutor.id}/unblock/`
        : `/tutors/${tutor.id}/block/`;
      
      await apiService.apiCall(endpoint, { 
        method: 'POST',
        body: JSON.stringify({ reason: 'Admin action' }),
      });
      
      showSnackbar(
        `Tutor ${tutor.is_blocked ? 'unblocked' : 'blocked'} successfully!`,
        'success'
      );
      
      loadTutors();
    } catch (err) {
      const errorMsg = err.message || `Failed to ${tutor.is_blocked ? 'unblock' : 'block'} tutor`;
      showSnackbar(errorMsg, 'error');
    }
  };

  const handleDeleteTutor = async () => {
    try {
      setActionLoading(true);
      
      await apiService.apiCall(`/tutors/${selectedTutor.id}/`, {
        method: 'DELETE',
      });

      showSnackbar('Tutor deleted successfully!', 'success');
      setOpenDeleteDialog(false);
      setSelectedTutor(null);
      
      loadTutors();
    } catch (err) {
      const errorMsg = err.message || 'Failed to delete tutor';
      showSnackbar(errorMsg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const openEdit = (tutor) => {
    setSelectedTutor(tutor);
    setEditTutorForm({
      first_name: tutor.first_name || '',
      last_name: tutor.last_name || '',
      email_address: tutor.email_address || '',
      phone_number: tutor.phone_number || '',
      physical_address: tutor.physical_address || '',
      highest_qualification: tutor.highest_qualification || 'bachelors',
    });
    setOpenEditDialog(true);
  };

  const openDelete = (tutor) => {
    setSelectedTutor(tutor);
    setOpenDeleteDialog(true);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const getStatusChip = (tutor) => {
    if (tutor.is_blocked) {
      return (
        <Chip
          icon={<NoSymbolIcon className="h-3 w-3" />}
          label="Blocked"
          size="small"
          color="error"
          sx={{ height: 20, fontSize: '0.7rem' }}
        />
      );
    }
    if (tutor.is_active) {
      return (
        <Chip
          icon={<CheckCircleIcon className="h-3 w-3" />}
          label="Active"
          size="small"
          color="success"
          sx={{ height: 20, fontSize: '0.7rem' }}
        />
      );
    }
    return (
      <Chip
        icon={<XMarkIcon className="h-3 w-3" />}
        label="Inactive"
        size="small"
        color="default"
        sx={{ height: 20, fontSize: '0.7rem' }}
      />
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
            Tutor Management
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Manage tutor profiles and assignments
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<UserPlusIcon className="h-5 w-5" />}
          onClick={() => setOpenAddDialog(true)}
          sx={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            textTransform: 'none',
          }}
        >
          Add Tutor
        </Button>
      </Box>

      {/* Search and Filters */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          bgcolor: '#1e293b',
          border: '1px solid rgba(139, 92, 246, 0.15)',
        }}
      >
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Search tutors by name, email, or Tutor ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MagnifyingGlassIcon className="h-5 w-5 text-white/50" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Filter by Status"
                >
                  <MenuItem value="all">All Tutors</MenuItem>
                  <MenuItem value="active">Active Only</MenuItem>
                  <MenuItem value="inactive">Inactive Only</MenuItem>
                  <MenuItem value="blocked">Blocked Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </Card>

      {/* Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card
            elevation={0}
            sx={{
              bgcolor: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              textAlign: 'center',
              py: 2,
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#8b5cf6' }}>
              {tutors.length}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Total Tutors
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card
            elevation={0}
            sx={{
              bgcolor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              textAlign: 'center',
              py: 2,
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981' }}>
              {tutors.filter(t => t.is_active && !t.is_blocked).length}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Active
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card
            elevation={0}
            sx={{
              bgcolor: 'rgba(107, 114, 128, 0.1)',
              border: '1px solid rgba(107, 114, 128, 0.3)',
              textAlign: 'center',
              py: 2,
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#6b7280' }}>
              {tutors.filter(t => !t.is_active && !t.is_blocked).length}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Inactive
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card
            elevation={0}
            sx={{
              bgcolor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              textAlign: 'center',
              py: 2,
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#ef4444' }}>
              {tutors.filter(t => t.is_blocked).length}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Blocked
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Button size="small" onClick={loadTutors} sx={{ ml: 2 }}>
            Retry
          </Button>
        </Alert>
      )}

      {/* Tutors List */}
      <Card
        elevation={0}
        sx={{
          bgcolor: '#1e293b',
          border: '1px solid rgba(139, 92, 246, 0.15)',
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'white', mb: 3 }}>
            All Tutors ({filteredTutors.length})
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#8b5cf6' }} />
            </Box>
          ) : filteredTutors.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <AcademicCapIcon className="h-20 w-20 mx-auto mb-3 text-white/30" />
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                No tutors found
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {filteredTutors.map((tutor) => (
                <Card
                  key={tutor.id}
                  elevation={0}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(139, 92, 246, 0.1)',
                    transition: 'all 0.3s',
                    '&:hover': {
                      bgcolor: 'rgba(139, 92, 246, 0.05)',
                      borderColor: 'rgba(139, 92, 246, 0.2)',
                    },
                  }}
                >
                  <Box sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
                            {tutor.full_name}
                          </Typography>
                          <Chip
                            label={tutor.tutor_id}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(139, 92, 246, 0.2)',
                              color: '#a78bfa',
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              height: 20,
                            }}
                          />
                          {getStatusChip(tutor)}
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <EnvelopeIcon className="h-4 w-4 text-white/50" />
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                              {tutor.email_address}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PhoneIcon className="h-4 w-4 text-white/50" />
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                              {tutor.phone_number || 'Not provided'}
                            </Typography>
                          </Box>
                          {tutor.physical_address && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <MapPinIcon className="h-4 w-4 text-white/50" />
                              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                {tutor.physical_address}
                              </Typography>
                            </Box>
                          )}
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            icon={<AcademicCapIcon className="h-3 w-3" />}
                            label={getQualificationLabel(tutor.highest_qualification)}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: 'rgba(59, 130, 246, 0.3)',
                              color: '#60a5fa',
                              height: 24,
                              fontSize: '0.75rem',
                            }}
                          />
                          {tutor.gigs_count > 0 && (
                            <Chip
                              label={`${tutor.gigs_count} Gigs`}
                              size="small"
                              variant="outlined"
                              sx={{
                                borderColor: 'rgba(16, 185, 129, 0.3)',
                                color: '#34d399',
                                height: 24,
                                fontSize: '0.75rem',
                              }}
                            />
                          )}
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => openEdit(tutor)}
                          title="Edit tutor"
                          sx={{
                            color: '#8b5cf6',
                            '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.1)' },
                          }}
                        >
                          <PencilIcon className="h-5 w-5" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleActive(tutor)}
                          title={tutor.is_active ? 'Deactivate tutor' : 'Activate tutor'}
                          disabled={tutor.is_blocked}
                          sx={{
                            color: tutor.is_active ? '#f59e0b' : '#10b981',
                            '&:hover': { 
                              bgcolor: tutor.is_active ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)' 
                            },
                          }}
                        >
                          {tutor.is_active ? (
                            <XMarkIcon className="h-5 w-5" />
                          ) : (
                            <CheckIcon className="h-5 w-5" />
                          )}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleBlock(tutor)}
                          title={tutor.is_blocked ? 'Unblock tutor' : 'Block tutor'}
                          sx={{
                            color: tutor.is_blocked ? '#10b981' : '#ef4444',
                            '&:hover': { 
                              bgcolor: tutor.is_blocked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' 
                            },
                          }}
                        >
                          <NoSymbolIcon className="h-5 w-5" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => openDelete(tutor)}
                          title="Delete tutor"
                          sx={{
                            color: '#dc2626',
                            '&:hover': { bgcolor: 'rgba(220, 38, 38, 0.1)' },
                          }}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      </Card>

      {/* Add Tutor Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={() => !actionLoading && setOpenAddDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#1e293b',
            border: '1px solid rgba(139, 92, 246, 0.2)',
          },
        }}
      >
        <DialogTitle sx={{ color: 'white', fontWeight: 600 }}>
          Add New Tutor
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={newTutorForm.first_name}
                  onChange={(e) => setNewTutorForm({ ...newTutorForm, first_name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={newTutorForm.last_name}
                  onChange={(e) => setNewTutorForm({ ...newTutorForm, last_name: e.target.value })}
                  required
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={newTutorForm.email_address}
              onChange={(e) => setNewTutorForm({ ...newTutorForm, email_address: e.target.value })}
              required
            />

            <TextField
              fullWidth
              label="Phone Number"
              value={newTutorForm.phone_number}
              onChange={(e) => setNewTutorForm({ ...newTutorForm, phone_number: e.target.value })}
              placeholder="+27 XX XXX XXXX"
              helperText="Required for tutor profile"
            />

            <TextField
              fullWidth
              label="Physical Address"
              value={newTutorForm.physical_address}
              onChange={(e) => setNewTutorForm({ ...newTutorForm, physical_address: e.target.value })}
              multiline
              rows={2}
            />

            <FormControl fullWidth>
              <InputLabel>Highest Qualification</InputLabel>
              <Select
                value={newTutorForm.highest_qualification}
                onChange={(e) => setNewTutorForm({ ...newTutorForm, highest_qualification: e.target.value })}
                label="Highest Qualification"
              >
                {qualifications.map((qual) => (
                  <MenuItem key={qual.value} value={qual.value}>
                    {qual.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Alert severity="info" sx={{ mt: 1 }}>
              A temporary password will be generated for this tutor. They will be prompted to change it on first login.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={() => setOpenAddDialog(false)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddTutor}
            disabled={actionLoading || !newTutorForm.first_name || !newTutorForm.last_name || !newTutorForm.email_address}
            sx={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            }}
          >
            {actionLoading ? <CircularProgress size={20} /> : 'Create Tutor'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Tutor Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => !actionLoading && setOpenEditDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#1e293b',
            border: '1px solid rgba(139, 92, 246, 0.2)',
          },
        }}
      >
        <DialogTitle sx={{ color: 'white', fontWeight: 600 }}>
          Edit Tutor - {selectedTutor?.tutor_id}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={editTutorForm.first_name}
                  onChange={(e) => setEditTutorForm({ ...editTutorForm, first_name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={editTutorForm.last_name}
                  onChange={(e) => setEditTutorForm({ ...editTutorForm, last_name: e.target.value })}
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={editTutorForm.email_address}
              onChange={(e) => setEditTutorForm({ ...editTutorForm, email_address: e.target.value })}
            />

            <TextField
              fullWidth
              label="Phone Number"
              value={editTutorForm.phone_number}
              onChange={(e) => setEditTutorForm({ ...editTutorForm, phone_number: e.target.value })}
            />

            <TextField
              fullWidth
              label="Physical Address"
              value={editTutorForm.physical_address}
              onChange={(e) => setEditTutorForm({ ...editTutorForm, physical_address: e.target.value })}
              multiline
              rows={2}
            />

            <FormControl fullWidth>
              <InputLabel>Highest Qualification</InputLabel>
              <Select
                value={editTutorForm.highest_qualification}
                onChange={(e) => setEditTutorForm({ ...editTutorForm, highest_qualification: e.target.value })}
                label="Highest Qualification"
              >
                {qualifications.map((qual) => (
                  <MenuItem key={qual.value} value={qual.value}>
                    {qual.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={() => setOpenEditDialog(false)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleEditTutor}
            disabled={actionLoading}
            sx={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            }}
          >
            {actionLoading ? <CircularProgress size={20} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => !actionLoading && setOpenDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#1e293b',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          },
        }}
      >
        <DialogTitle sx={{ color: 'white', fontWeight: 600 }}>
          Delete Tutor
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2 }}>
            Are you sure you want to delete <strong>{selectedTutor?.full_name}</strong> ({selectedTutor?.tutor_id})?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            This will also delete the associated user account and cannot be undone.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteTutor}
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={20} /> : 'Delete Tutor'}
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

export default TutorManagement;
