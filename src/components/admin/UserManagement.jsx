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
} from '@mui/material';
import {
  MagnifyingGlassIcon,
  UserPlusIcon,
  PencilIcon,
  TrashIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import apiService from '../../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [newUserForm, setNewUserForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    tutor_id: '',
    phone_number: '',
    physical_address: '',
  });

  const [editUserForm, setEditUserForm] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    is_active: true,
    is_verified: true,
    is_approved: true,
    user_type: 'tutor',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiService.apiCall('/auth/');
      const usersData = response.results || response || [];
      
      setUsers(usersData);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    return fullName.includes(searchLower) || user.email?.toLowerCase().includes(searchLower);
  });

  const getUserTypeColor = (type) => {
    switch (type) {
      case 'admin':
        return 'error';
      case 'manager':
        return 'warning';
      case 'tutor':
        return 'primary';
      case 'staff':
        return 'info';
      default:
        return 'default';
    }
  };

  const handleAddUser = async () => {
    try {
      setActionLoading(true);
      
      const response = await apiService.apiCall('/auth/create-tutor/', {
        method: 'POST',
        body: JSON.stringify(newUserForm),
      });

      showSnackbar(response.message || 'Tutor created successfully and email sent!', 'success');
      setOpenAddDialog(false);
      setNewUserForm({
        first_name: '',
        last_name: '',
        email: '',
        tutor_id: '',
        phone_number: '',
        physical_address: '',
      });
      
      // Reload users list
      loadUsers();
    } catch (err) {
      const errorMsg = err.message || 'Failed to create tutor';
      showSnackbar(errorMsg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditUser = async () => {
    try {
      setActionLoading(true);
      
      const response = await apiService.apiCall(`/auth/${selectedUser.id}/`, {
        method: 'PATCH',
        body: JSON.stringify(editUserForm),
      });

      showSnackbar('User updated successfully!', 'success');
      setOpenEditDialog(false);
      setSelectedUser(null);
      
      // Reload users list
      loadUsers();
    } catch (err) {
      const errorMsg = err.message || 'Failed to update user';
      showSnackbar(errorMsg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      const endpoint = user.is_active 
        ? `/auth/${user.id}/deactivate/`
        : `/auth/${user.id}/activate/`;
      
      const response = await apiService.apiCall(endpoint, { method: 'POST' });
      
      showSnackbar(response.message || `User ${user.is_active ? 'deactivated' : 'activated'} successfully!`, 'success');
      
      // Reload users list
      loadUsers();
    } catch (err) {
      const errorMsg = err.message || `Failed to ${user.is_active ? 'deactivate' : 'activate'} user`;
      showSnackbar(errorMsg, 'error');
    }
  };

  const handleDeleteUser = async () => {
    try {
      setActionLoading(true);
      
      const response = await apiService.apiCall(`/auth/${selectedUser.id}/delete/`, {
        method: 'DELETE',
      });

      showSnackbar('User deleted successfully!', 'success');
      setOpenDeleteDialog(false);
      setSelectedUser(null);
      
      // Reload users list
      loadUsers();
    } catch (err) {
      const errorMsg = err.message || 'Failed to delete user';
      showSnackbar(errorMsg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const openEdit = (user) => {
    setSelectedUser(user);
    setEditUserForm({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone_number: user.phone_number || '',
      is_active: user.is_active,
      is_verified: user.is_verified,
      is_approved: user.is_approved,
      user_type: user.user_type,
    });
    setOpenEditDialog(true);
  };

  const openDelete = (user) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
            User Management
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Manage all users in the system
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
          <TextField
            fullWidth
            placeholder="Search users by name or email..."
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
        </Box>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Button size="small" onClick={loadUsers} sx={{ ml: 2 }}>
            Retry
          </Button>
        </Alert>
      )}

      {/* Users Table */}
      <Card
        elevation={0}
        sx={{
          bgcolor: '#1e293b',
          border: '1px solid rgba(139, 92, 246, 0.15)',
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'white', mb: 3 }}>
            All Users ({filteredUsers.length})
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#8b5cf6' }} />
            </Box>
          ) : filteredUsers.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                No users found
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {filteredUsers.map((user) => (
                <Box
                  key={user.id}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(139, 92, 246, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    '&:hover': {
                      bgcolor: 'rgba(139, 92, 246, 0.05)',
                      borderColor: 'rgba(139, 92, 246, 0.2)',
                    },
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'white', mb: 0.5 }}>
                      {user.first_name} {user.last_name} {!user.first_name && !user.last_name && user.username}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 1 }}>
                      {user.email}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={user.user_type}
                        size="small"
                        color={getUserTypeColor(user.user_type)}
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                      {user.is_verified && (
                        <Chip
                          icon={<CheckCircleIcon className="h-3 w-3" />}
                          label="Verified"
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                      {!user.is_active && (
                        <Chip
                          label="Inactive"
                          size="small"
                          color="error"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => openEdit(user)}
                      title="Edit user"
                      sx={{
                        color: '#8b5cf6',
                        '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.1)' },
                      }}
                    >
                      <PencilIcon className="h-5 w-5" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleToggleActive(user)}
                      title={user.is_active ? 'Deactivate user' : 'Activate user'}
                      sx={{
                        color: user.is_active ? '#f59e0b' : '#10b981',
                        '&:hover': { bgcolor: user.is_active ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)' },
                      }}
                    >
                      {user.is_active ? (
                        <NoSymbolIcon className="h-5 w-5" />
                      ) : (
                        <CheckIcon className="h-5 w-5" />
                      )}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => openDelete(user)}
                      title="Delete user"
                      sx={{
                        color: '#ef4444',
                        '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' },
                      }}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Card>

      {/* Add Tutor Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={() => !actionLoading && setOpenAddDialog(false)}
        maxWidth="sm"
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
            <TextField
              fullWidth
              label="First Name"
              value={newUserForm.first_name}
              onChange={(e) => setNewUserForm({ ...newUserForm, first_name: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Last Name"
              value={newUserForm.last_name}
              onChange={(e) => setNewUserForm({ ...newUserForm, last_name: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={newUserForm.email}
              onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Tutor ID (Optional)"
              value={newUserForm.tutor_id}
              onChange={(e) => setNewUserForm({ ...newUserForm, tutor_id: e.target.value })}
              helperText="Leave blank to auto-generate (e.g., TUT-0001)"
            />
            <TextField
              fullWidth
              label="Phone Number (Optional)"
              value={newUserForm.phone_number}
              onChange={(e) => setNewUserForm({ ...newUserForm, phone_number: e.target.value })}
              placeholder="+27 XX XXX XXXX"
            />
            <TextField
              fullWidth
              label="Physical Address (Optional)"
              value={newUserForm.physical_address}
              onChange={(e) => setNewUserForm({ ...newUserForm, physical_address: e.target.value })}
              multiline
              rows={2}
            />
            <Alert severity="info" sx={{ mt: 1 }}>
              An account setup email will be sent to the tutor with a link to complete their registration.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={() => setOpenAddDialog(false)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddUser}
            disabled={actionLoading || !newUserForm.first_name || !newUserForm.last_name || !newUserForm.email}
            sx={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            }}
          >
            {actionLoading ? <CircularProgress size={20} /> : 'Create Tutor'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => !actionLoading && setOpenEditDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#1e293b',
            border: '1px solid rgba(139, 92, 246, 0.2)',
          },
        }}
      >
        <DialogTitle sx={{ color: 'white', fontWeight: 600 }}>
          Edit User
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="First Name"
              value={editUserForm.first_name}
              onChange={(e) => setEditUserForm({ ...editUserForm, first_name: e.target.value })}
            />
            <TextField
              fullWidth
              label="Last Name"
              value={editUserForm.last_name}
              onChange={(e) => setEditUserForm({ ...editUserForm, last_name: e.target.value })}
            />
            <TextField
              fullWidth
              label="Phone Number"
              value={editUserForm.phone_number}
              onChange={(e) => setEditUserForm({ ...editUserForm, phone_number: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>User Type</InputLabel>
              <Select
                value={editUserForm.user_type}
                onChange={(e) => setEditUserForm({ ...editUserForm, user_type: e.target.value })}
                label="User Type"
              >
                <MenuItem value="tutor">Tutor</MenuItem>
                <MenuItem value="staff">Staff</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={editUserForm.is_active ? 'active' : 'inactive'}
                onChange={(e) => setEditUserForm({ ...editUserForm, is_active: e.target.value === 'active' })}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Verified</InputLabel>
                <Select
                  value={editUserForm.is_verified ? 'yes' : 'no'}
                  onChange={(e) => setEditUserForm({ ...editUserForm, is_verified: e.target.value === 'yes' })}
                  label="Verified"
                >
                  <MenuItem value="yes">Yes</MenuItem>
                  <MenuItem value="no">No</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Approved</InputLabel>
                <Select
                  value={editUserForm.is_approved ? 'yes' : 'no'}
                  onChange={(e) => setEditUserForm({ ...editUserForm, is_approved: e.target.value === 'yes' })}
                  label="Approved"
                >
                  <MenuItem value="yes">Yes</MenuItem>
                  <MenuItem value="no">No</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={() => setOpenEditDialog(false)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleEditUser}
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
          Delete User
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Are you sure you want to delete <strong>{selectedUser?.first_name} {selectedUser?.last_name}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteUser}
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={20} /> : 'Delete'}
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

export default UserManagement;
