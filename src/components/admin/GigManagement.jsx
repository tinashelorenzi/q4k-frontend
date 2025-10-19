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
  LinearProgress,
  Menu,
  ListItemIcon,
  ListItemText,
  Autocomplete,
} from '@mui/material';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  BookOpenIcon,
  PlayIcon,
  CheckIcon,
  XMarkIcon,
  PauseIcon,
  ArrowPathIcon,
  UserPlusIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import apiService from '../../services/api';

const GigManagement = () => {
  const [gigs, setGigs] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [selectedGig, setSelectedGig] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuGig, setMenuGig] = useState(null);

  const [gigForm, setGigForm] = useState({
    title: '',
    subject_name: '',
    level: 'high_school',
    total_tutor_remuneration: '',
    total_client_fee: '',
    total_hours: '',
    description: '',
    priority: 'medium',
    client_name: '',
    client_email: '',
    client_phone: '',
    start_date: '',
    end_date: '',
  });

  const [assignForm, setAssignForm] = useState({
    tutor: null,
    notes: '',
  });

  const levels = [
    { value: 'primary', label: 'Primary School' },
    { value: 'middle', label: 'Middle School' },
    { value: 'high_school', label: 'High School' },
    { value: 'college_prep', label: 'College Preparatory' },
    { value: 'undergraduate', label: 'Undergraduate' },
    { value: 'graduate', label: 'Graduate Level' },
    { value: 'professional', label: 'Professional Development' },
    { value: 'adult_education', label: 'Adult Education' },
    { value: 'other', label: 'Other' },
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: '#6b7280' },
    { value: 'medium', label: 'Medium', color: '#3b82f6' },
    { value: 'high', label: 'High', color: '#f59e0b' },
    { value: 'urgent', label: 'Urgent', color: '#ef4444' },
  ];

  const statuses = [
    { value: 'pending', label: 'Pending', color: '#f59e0b' },
    { value: 'active', label: 'Active', color: '#10b981' },
    { value: 'on_hold', label: 'On Hold', color: '#6b7280' },
    { value: 'completed', label: 'Completed', color: '#3b82f6' },
    { value: 'cancelled', label: 'Cancelled', color: '#ef4444' },
    { value: 'expired', label: 'Expired', color: '#dc2626' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load gigs and all tutors (with large page size to get all)
      const [gigsResponse, tutorsResponse] = await Promise.all([
        apiService.apiCall('/gigs/'),
        apiService.apiCall('/tutors/?page_size=1000'), // Request all tutors
      ]);
      
      setGigs(gigsResponse.results || gigsResponse || []);
      
      // Handle paginated response - collect all tutors
      let allTutors = tutorsResponse.results || tutorsResponse || [];
      
      // If response has pagination and there are more pages, fetch them
      if (tutorsResponse.next) {
        console.log('Tutors are paginated, loading all pages...');
        let nextUrl = tutorsResponse.next;
        while (nextUrl) {
          try {
            const response = await fetch(nextUrl, {
              headers: apiService.getAuthHeaders(),
            });
            const data = await response.json();
            allTutors = [...allTutors, ...(data.results || [])];
            nextUrl = data.next;
          } catch (err) {
            console.error('Error loading next page of tutors:', err);
            break;
          }
        }
      }
      
      console.log(`Loaded ${allTutors.length} tutors total`);
      setTutors(allTutors);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load gigs');
    } finally {
      setLoading(false);
    }
  };

  const filteredGigs = gigs.filter(gig => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (!gig.title?.toLowerCase().includes(searchLower) &&
          !gig.subject_name?.toLowerCase().includes(searchLower) &&
          !gig.client_name?.toLowerCase().includes(searchLower) &&
          !gig.gig_id?.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    if (filterStatus !== 'all' && gig.status !== filterStatus) {
      return false;
    }

    return true;
  });

  const getStatusInfo = (status) => {
    const info = statuses.find(s => s.value === status);
    return info || { value: status, label: status, color: '#6b7280' };
  };

  const getPriorityInfo = (priority) => {
    const info = priorities.find(p => p.value === priority);
    return info || { value: priority, label: priority, color: '#6b7280' };
  };

  const handleCreateGig = async () => {
    try {
      setActionLoading(true);
      
      // Don't include tutor in creation - will be assigned separately
      await apiService.apiCall('/gigs/', {
        method: 'POST',
        body: JSON.stringify(gigForm),
      });

      showSnackbar('Gig created successfully! You can now assign a tutor.', 'success');
      setOpenAddDialog(false);
      resetGigForm();
      loadData();
    } catch (err) {
      showSnackbar(err.message || 'Failed to create gig', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateGig = async () => {
    try {
      setActionLoading(true);
      
      await apiService.apiCall(`/gigs/${selectedGig.id}/`, {
        method: 'PATCH',
        body: JSON.stringify(gigForm),
      });

      showSnackbar('Gig updated successfully!', 'success');
      setOpenEditDialog(false);
      setSelectedGig(null);
      loadData();
    } catch (err) {
      showSnackbar(err.message || 'Failed to update gig', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignTutor = async () => {
    try {
      setActionLoading(true);
      
      const response = await apiService.apiCall(`/gigs/${selectedGig.id}/assign/`, {
        method: 'POST',
        body: JSON.stringify({
          tutor_id: assignForm.tutor.id,
          notes: assignForm.notes,
        }),
      });

      // Show success message with email status
      let message = response.message || 'Tutor assigned successfully!';
      if (response.emails_sent) {
        const emailStatus = [];
        if (response.emails_sent.tutor) emailStatus.push('tutor');
        if (response.emails_sent.client) emailStatus.push('client');
        if (emailStatus.length > 0) {
          message += ` Emails sent to ${emailStatus.join(' and ')}.`;
        }
      }
      
      showSnackbar(message, 'success');
      setOpenAssignDialog(false);
      setSelectedGig(null);
      setAssignForm({ tutor: null, notes: '' });
      loadData();
    } catch (err) {
      showSnackbar(err.message || 'Failed to assign tutor', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (gig, action) => {
    try {
      await apiService.apiCall(`/gigs/${gig.id}/${action}/`, {
        method: 'POST',
        body: JSON.stringify({ reason: 'Admin action' }),
      });

      showSnackbar(`Gig ${action}ed successfully!`, 'success');
      handleMenuClose();
      loadData();
    } catch (err) {
      showSnackbar(err.message || `Failed to ${action} gig`, 'error');
    }
  };

  const handleDeleteGig = async () => {
    try {
      setActionLoading(true);
      
      await apiService.apiCall(`/gigs/${selectedGig.id}/`, {
        method: 'DELETE',
      });

      showSnackbar('Gig deleted successfully!', 'success');
      setOpenDeleteDialog(false);
      setSelectedGig(null);
      loadData();
    } catch (err) {
      showSnackbar(err.message || 'Failed to delete gig', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const openEdit = (gig) => {
    setSelectedGig(gig);
    setGigForm({
      title: gig.title || '',
      subject_name: gig.subject_name || '',
      level: gig.level || 'high_school',
      total_tutor_remuneration: gig.total_tutor_remuneration || '',
      total_client_fee: gig.total_client_fee || '',
      total_hours: gig.total_hours || '',
      description: gig.description || '',
      priority: gig.priority || 'medium',
      client_name: gig.client_name || '',
      client_email: gig.client_email || '',
      client_phone: gig.client_phone || '',
      start_date: gig.start_date || '',
      end_date: gig.end_date || '',
    });
    setOpenEditDialog(true);
  };

  const openAssign = (gig) => {
    setSelectedGig(gig);
    setAssignForm({ tutor: null, notes: '' });
    setOpenAssignDialog(true);
  };

  const resetGigForm = () => {
    setGigForm({
      title: '',
      subject_name: '',
      level: 'high_school',
      total_tutor_remuneration: '',
      total_client_fee: '',
      total_hours: '',
      description: '',
      priority: 'medium',
      client_name: '',
      client_email: '',
      client_phone: '',
      start_date: '',
      end_date: '',
    });
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleMenuClick = (event, gig) => {
    setAnchorEl(event.currentTarget);
    setMenuGig(gig);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuGig(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
            Gig Management
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Create and manage tutoring gigs
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PlusIcon className="h-5 w-5" />}
          onClick={() => setOpenAddDialog(true)}
          sx={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            textTransform: 'none',
          }}
        >
          Create Gig
        </Button>
      </Box>

      {/* Search and Filters */}
      <Card elevation={0} sx={{ mb: 3, bgcolor: '#1e293b', border: '1px solid rgba(139, 92, 246, 0.15)' }}>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Search gigs by title, subject, client, or Gig ID..."
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
                <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} label="Filter by Status">
                  <MenuItem value="all">All Gigs</MenuItem>
                  {statuses.map(s => (
                    <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </Card>

      {/* Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card elevation={0} sx={{ bgcolor: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)', textAlign: 'center', py: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#8b5cf6' }}>{gigs.length}</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Total Gigs</Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card elevation={0} sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', textAlign: 'center', py: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981' }}>
              {gigs.filter(g => g.status === 'active').length}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Active</Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card elevation={0} sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', textAlign: 'center', py: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#f59e0b' }}>
              {gigs.filter(g => g.status === 'pending').length}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Pending</Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card elevation={0} sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', textAlign: 'center', py: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#3b82f6' }}>
              {gigs.filter(g => g.status === 'completed').length}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Completed</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Button size="small" onClick={loadData} sx={{ ml: 2 }}>Retry</Button>
        </Alert>
      )}

      {/* Gigs List */}
      <Card elevation={0} sx={{ bgcolor: '#1e293b', border: '1px solid rgba(139, 92, 246, 0.15)' }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'white', mb: 3 }}>
            All Gigs ({filteredGigs.length})
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#8b5cf6' }} />
            </Box>
          ) : filteredGigs.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <BookOpenIcon className="h-20 w-20 mx-auto mb-3 text-white/30" />
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>No gigs found</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {filteredGigs.map((gig) => {
                const statusInfo = getStatusInfo(gig.status);
                const priorityInfo = getPriorityInfo(gig.priority);
                
                return (
                  <Card
                    key={gig.id}
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
                      {/* Header */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
                              {gig.title || `${gig.subject_name} - ${gig.level}`}
                            </Typography>
                            <Chip
                              label={gig.gig_id}
                              size="small"
                              sx={{ bgcolor: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', fontWeight: 600, fontSize: '0.7rem', height: 20 }}
                            />
                            <Chip
                              label={statusInfo.label}
                              size="small"
                              sx={{ bgcolor: `${statusInfo.color}20`, color: statusInfo.color, fontWeight: 600, fontSize: '0.7rem', height: 20 }}
                            />
                            <Chip
                              label={priorityInfo.label}
                              size="small"
                              variant="outlined"
                              sx={{ borderColor: priorityInfo.color, color: priorityInfo.color, fontSize: '0.7rem', height: 20 }}
                            />
                          </Box>

                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 1 }}>
                            {gig.subject_name} • {levels.find(l => l.value === gig.level)?.label}
                          </Typography>

                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <AcademicCapIcon className="h-4 w-4 text-white/50" />
                              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                {gig.tutor_name || 'Unassigned'}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <CalendarIcon className="h-4 w-4 text-white/50" />
                              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                {gig.start_date} to {gig.end_date}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <ClockIcon className="h-4 w-4 text-white/50" />
                              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                {gig.hours_completed || 0}/{gig.total_hours || 0} hrs
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <CurrencyDollarIcon className="h-4 w-4 text-white/50" />
                              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                Client: {formatCurrency(gig.total_client_fee || 0)}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Progress Bar */}
                          <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                Progress
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                {Math.round((gig.hours_completed || 0) / (gig.total_hours || 1) * 100)}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={Math.round((gig.hours_completed || 0) / (gig.total_hours || 1) * 100)}
                              sx={{
                                height: 6,
                                borderRadius: 1,
                                bgcolor: 'rgba(255, 255, 255, 0.1)',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: gig.completion_percentage >= 75 ? '#10b981' : 
                                          gig.completion_percentage >= 50 ? '#3b82f6' : 
                                          gig.completion_percentage >= 25 ? '#f59e0b' : '#ef4444',
                                },
                              }}
                            />
                          </Box>
                        </Box>

                        {/* Actions */}
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                          <IconButton
                            size="small"
                            onClick={() => openEdit(gig)}
                            title="Edit gig"
                            sx={{ color: '#8b5cf6', '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.1)' } }}
                          >
                            <PencilIcon className="h-5 w-5" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => openAssign(gig)}
                            title={gig.tutor ? 'Reassign tutor' : 'Assign tutor'}
                            sx={{ 
                              color: gig.tutor ? '#f59e0b' : '#10b981', 
                              '&:hover': { bgcolor: gig.tutor ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)' } 
                            }}
                          >
                            <UserPlusIcon className="h-5 w-5" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuClick(e, gig)}
                            title="More actions"
                            sx={{ color: 'rgba(255, 255, 255, 0.7)', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' } }}
                          >
                            <EllipsisVerticalIcon className="h-5 w-5" />
                          </IconButton>
                        </Box>
                      </Box>

                      {/* Client Info */}
                      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600 }}>
                          Client:
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                          {gig.client_name} • {gig.client_email}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                );
              })}
            </Box>
          )}
        </Box>
      </Card>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            bgcolor: '#1e293b',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            minWidth: 180,
          },
        }}
      >
        {menuGig?.status === 'pending' && (
          <MenuItem onClick={() => handleStatusChange(menuGig, 'start')}>
            <ListItemIcon><PlayIcon className="h-5 w-5 text-green-400" /></ListItemIcon>
            <ListItemText>Start Gig</ListItemText>
          </MenuItem>
        )}
        {menuGig?.status === 'active' && (
          <>
            <MenuItem onClick={() => handleStatusChange(menuGig, 'complete')}>
              <ListItemIcon><CheckIcon className="h-5 w-5 text-blue-400" /></ListItemIcon>
              <ListItemText>Complete</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleStatusChange(menuGig, 'hold')}>
              <ListItemIcon><PauseIcon className="h-5 w-5 text-yellow-400" /></ListItemIcon>
              <ListItemText>Put on Hold</ListItemText>
            </MenuItem>
          </>
        )}
        {menuGig?.status === 'on_hold' && (
          <MenuItem onClick={() => handleStatusChange(menuGig, 'resume')}>
            <ListItemIcon><ArrowPathIcon className="h-5 w-5 text-green-400" /></ListItemIcon>
            <ListItemText>Resume</ListItemText>
          </MenuItem>
        )}
        {menuGig?.status !== 'completed' && menuGig?.status !== 'cancelled' && (
          <MenuItem onClick={() => handleStatusChange(menuGig, 'cancel')}>
            <ListItemIcon><XMarkIcon className="h-5 w-5 text-red-400" /></ListItemIcon>
            <ListItemText>Cancel Gig</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => { handleMenuClose(); setSelectedGig(menuGig); setOpenDeleteDialog(true); }}>
          <ListItemIcon><TrashIcon className="h-5 w-5 text-red-500" /></ListItemIcon>
          <ListItemText sx={{ color: '#ef4444' }}>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Create/Edit Gig Dialog */}
      <GigFormDialog
        open={openAddDialog || openEditDialog}
        onClose={() => { setOpenAddDialog(false); setOpenEditDialog(false); resetGigForm(); }}
        form={gigForm}
        setForm={setGigForm}
        levels={levels}
        priorities={priorities}
        onSubmit={openAddDialog ? handleCreateGig : handleUpdateGig}
        loading={actionLoading}
        isEdit={openEditDialog}
        gigId={selectedGig?.gig_id}
      />

      {/* Assign Tutor Dialog */}
      <Dialog
        open={openAssignDialog}
        onClose={() => !actionLoading && setOpenAssignDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#1e293b', border: '1px solid rgba(139, 92, 246, 0.2)' } }}
      >
        <DialogTitle sx={{ color: 'white', fontWeight: 600 }}>
          {selectedGig?.tutor ? 'Reassign' : 'Assign'} Tutor to {selectedGig?.gig_id}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
              <strong>Gig:</strong> {selectedGig?.title || selectedGig?.subject_name}
              <br />
              <strong>Client:</strong> {selectedGig?.client_name}
              {selectedGig?.tutor && (
                <>
                  <br />
                  <strong>Current Tutor:</strong> {selectedGig.tutor_name}
                </>
              )}
            </Alert>

            {selectedGig?.tutor && (
              <Alert severity="warning" sx={{ fontSize: '0.875rem' }}>
                This gig is currently assigned to <strong>{selectedGig.tutor_name}</strong>. 
                Selecting a new tutor will reassign this gig.
              </Alert>
            )}

            <Autocomplete
              options={tutors.filter(t => t.is_active && !t.is_blocked)}
              getOptionLabel={(option) => `${option.full_name} (${option.tutor_id})`}
              value={assignForm.tutor}
              onChange={(e, newValue) => setAssignForm({ ...assignForm, tutor: newValue })}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Search for Tutor" 
                  placeholder="Type tutor name or ID..."
                  helperText="Search by name or Tutor ID"
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {option.full_name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                        {option.tutor_id}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                        • {option.email_address}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
              filterOptions={(options, { inputValue }) => {
                const searchLower = inputValue.toLowerCase();
                return options.filter(option => 
                  option.full_name.toLowerCase().includes(searchLower) ||
                  option.tutor_id.toLowerCase().includes(searchLower) ||
                  option.email_address.toLowerCase().includes(searchLower)
                );
              }}
              noOptionsText="No active tutors found"
            />

            <TextField
              fullWidth
              label={selectedGig?.tutor ? 'Reassignment Notes (Optional)' : 'Assignment Notes (Optional)'}
              value={assignForm.notes}
              onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
              multiline
              rows={3}
              placeholder={selectedGig?.tutor 
                ? "Explain the reason for reassignment (optional)..." 
                : "Add any special instructions or notes about this assignment..."
              }
            />

            <Alert severity="success" sx={{ fontSize: '0.875rem' }}>
              📧 Email notifications will be sent to:
              <br />
              • The tutor with gig details and client contact info
              <br />
              • The client with tutor details and contact info
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={() => setOpenAssignDialog(false)} disabled={actionLoading}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAssignTutor}
            disabled={actionLoading || !assignForm.tutor}
            sx={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' }}
          >
            {actionLoading ? <CircularProgress size={20} /> : (selectedGig?.tutor ? 'Reassign Tutor' : 'Assign Tutor')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => !actionLoading && setOpenDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#1e293b', border: '1px solid rgba(239, 68, 68, 0.3)' } }}
      >
        <DialogTitle sx={{ color: 'white', fontWeight: 600 }}>Delete Gig</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2 }}>
            Are you sure you want to delete <strong>{selectedGig?.gig_id}</strong>?
          </Typography>
          <Alert severity="warning">This action cannot be undone.</Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} disabled={actionLoading}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteGig} disabled={actionLoading}>
            {actionLoading ? <CircularProgress size={20} /> : 'Delete Gig'}
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
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Separate component for the form dialog to keep it clean
const GigFormDialog = ({ open, onClose, form, setForm, levels, priorities, onSubmit, loading, isEdit, gigId }) => {
  return (
    <Dialog
      open={open}
      onClose={() => !loading && onClose()}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { bgcolor: '#1e293b', border: '1px solid rgba(139, 92, 246, 0.2)' } }}
    >
      <DialogTitle sx={{ color: 'white', fontWeight: 600 }}>
        {isEdit ? `Edit Gig - ${gigId}` : 'Create New Gig'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Basic Info */}
          <Typography variant="subtitle2" sx={{ color: '#8b5cf6', fontWeight: 600 }}>Basic Information</Typography>
          
          <TextField
            fullWidth
            label="Gig Title (Optional)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            helperText="Leave blank to auto-generate from subject and level"
          />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Subject"
                value={form.subject_name}
                onChange={(e) => setForm({ ...form, subject_name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Level</InputLabel>
                <Select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} label="Level">
                  {levels.map(l => <MenuItem key={l.value} value={l.value}>{l.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <TextField
            fullWidth
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            multiline
            rows={3}
            placeholder="Describe the tutoring requirements, goals, and any special considerations..."
          />

          {/* Client Info */}
          <Typography variant="subtitle2" sx={{ color: '#8b5cf6', fontWeight: 600, mt: 2 }}>Client Information</Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Client Name"
                value={form.client_name}
                onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Client Email"
                type="email"
                value={form.client_email}
                onChange={(e) => setForm({ ...form, client_email: e.target.value })}
                required
              />
            </Grid>
          </Grid>

          <TextField
            fullWidth
            label="Client Phone"
            value={form.client_phone}
            onChange={(e) => setForm({ ...form, client_phone: e.target.value })}
            placeholder="+27 XX XXX XXXX"
          />

          {/* Financial & Hours */}
          <Typography variant="subtitle2" sx={{ color: '#8b5cf6', fontWeight: 600, mt: 2 }}>Financial & Hours</Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Total Hours"
                type="number"
                value={form.total_hours}
                onChange={(e) => setForm({ ...form, total_hours: e.target.value })}
                required
                inputProps={{ min: 0.5, step: 0.5 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Tutor Remuneration (R)"
                type="number"
                value={form.total_tutor_remuneration}
                onChange={(e) => setForm({ ...form, total_tutor_remuneration: e.target.value })}
                required
                inputProps={{ min: 0, step: 50 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Client Fee (R)"
                type="number"
                value={form.total_client_fee}
                onChange={(e) => setForm({ ...form, total_client_fee: e.target.value })}
                required
                inputProps={{ min: 0, step: 50 }}
              />
            </Grid>
          </Grid>

          {/* Dates & Settings */}
          <Typography variant="subtitle2" sx={{ color: '#8b5cf6', fontWeight: 600, mt: 2 }}>Schedule & Settings</Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
          </Grid>

          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} label="Priority">
              {priorities.map(p => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
            </Select>
          </FormControl>

          {!isEdit && (
            <Alert severity="info" sx={{ mt: 1 }}>
              You can assign a tutor after creating the gig.
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={loading || !form.subject_name || !form.client_name || !form.client_email || !form.total_hours || !form.total_client_fee || !form.total_tutor_remuneration || !form.start_date || !form.end_date}
          sx={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' }}
        >
          {loading ? <CircularProgress size={20} /> : (isEdit ? 'Save Changes' : 'Create Gig')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GigManagement;
