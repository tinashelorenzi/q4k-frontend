import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Cog6ToothIcon,
  UserIcon,
  BellIcon,
  LockClosedIcon,
  EyeIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';

const COLORS = {
  darkSlate: '#0f172a',
  slate: '#1e293b',
  purple: '#8b5cf6',
  green: '#10b981',
  red: '#ef4444',
  yellow: '#f59e0b',
};

const TutorSettings = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // State for all settings
  const [userSettings, setUserSettings] = useState({
    // Profile data
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    
    // Notification settings
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    marketing_emails: false,
    login_notifications: true,
    
    // Preferences
    language_preference: 'en',
    timezone: 'Africa/Johannesburg',
    date_format: 'YYYY-MM-DD',
    time_format: '24h',
    theme_preference: 'dark',
    
    // Privacy settings
    profile_visible: true,
    show_online_status: true,
    show_email: false,
    show_phone: false,
    
    // Security settings
    two_factor_enabled: false,
    session_timeout: 1440
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (user) {
        setUserSettings(prev => ({
          ...prev,
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email || '',
          phone_number: user.phone_number || '',
          email_notifications: user.email_notifications ?? true,
          sms_notifications: user.sms_notifications ?? false,
          push_notifications: user.push_notifications ?? true,
          marketing_emails: user.marketing_emails ?? false,
          login_notifications: user.login_notifications ?? true,
          language_preference: user.language_preference || 'en',
          timezone: user.timezone || 'Africa/Johannesburg',
          date_format: user.date_format || 'YYYY-MM-DD',
          time_format: user.time_format || '24h',
          theme_preference: user.theme_preference || 'dark',
          profile_visible: user.profile_visible ?? true,
          show_online_status: user.show_online_status ?? true,
          show_email: user.show_email ?? false,
          show_phone: user.show_phone ?? false,
          two_factor_enabled: user.two_factor_enabled ?? false,
          session_timeout: user.session_timeout || 1440
        }));
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setUserSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const profileData = {
        first_name: userSettings.first_name,
        last_name: userSettings.last_name,
        email: userSettings.email,
        phone_number: userSettings.phone_number
      };
      
      const settingsData = {
        email_notifications: userSettings.email_notifications,
        sms_notifications: userSettings.sms_notifications,
        push_notifications: userSettings.push_notifications,
        marketing_emails: userSettings.marketing_emails,
        login_notifications: userSettings.login_notifications,
        language_preference: userSettings.language_preference,
        timezone: userSettings.timezone,
        date_format: userSettings.date_format,
        time_format: userSettings.time_format,
        theme_preference: userSettings.theme_preference,
        profile_visible: userSettings.profile_visible,
        show_online_status: userSettings.show_online_status,
        show_email: userSettings.show_email,
        show_phone: userSettings.show_phone,
        two_factor_enabled: userSettings.two_factor_enabled,
        session_timeout: userSettings.session_timeout
      };

      await Promise.all([
        apiService.partialUpdateUserProfile(profileData),
        apiService.partialUpdateUserSettings(settingsData)
      ]);

      updateUser({ ...user, ...profileData });
      setSuccess('Settings saved successfully!');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match!');
      return;
    }

    try {
      await apiService.changePassword(passwordData);
      setShowPasswordModal(false);
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      setSuccess('Password changed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error changing password:', err);
      setError('Error changing password. Please check your current password.');
    }
  };

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
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

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
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
            '& .MuiTabs-indicator': {
              backgroundColor: COLORS.purple,
            },
            '& .MuiTab-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: 600,
              textTransform: 'none',
              px: 3,
              '&.Mui-selected': {
                color: 'white',
              }
            }
          }}
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <UserIcon className="h-5 w-5" />
                <span>Profile</span>
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BellIcon className="h-5 w-5" />
                <span>Notifications</span>
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Cog6ToothIcon className="h-5 w-5" />
                <span>Preferences</span>
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EyeIcon className="h-5 w-5" />
                <span>Privacy</span>
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LockClosedIcon className="h-5 w-5" />
                <span>Security</span>
              </Box>
            } 
          />
        </Tabs>
      </Card>

      {/* Tab Content - Fixed height to prevent animation */}
      <Box sx={{ minHeight: 400 }}>
        {/* Profile Tab */}
        {activeTab === 0 && (
          <Card sx={{ 
            bgcolor: COLORS.slate,
            border: `1px solid rgba(139, 92, 246, 0.2)`,
            backgroundImage: 'none'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 3, fontWeight: 600 }}>
                Profile Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="First Name"
                    value={userSettings.first_name}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    fullWidth
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
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Last Name"
                    value={userSettings.last_name}
                    onChange={(e) => handleChange('last_name', e.target.value)}
                    fullWidth
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
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email"
                    type="email"
                    value={userSettings.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    fullWidth
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
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone Number"
                    value={userSettings.phone_number}
                    onChange={(e) => handleChange('phone_number', e.target.value)}
                    fullWidth
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
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleSaveSettings}
                  disabled={saving}
                  sx={{
                    bgcolor: COLORS.purple,
                    '&:hover': { bgcolor: '#7c3aed' },
                    '&:disabled': { bgcolor: 'rgba(139, 92, 246, 0.3)' },
                  }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Notifications Tab */}
        {activeTab === 1 && (
          <Card sx={{ 
            bgcolor: COLORS.slate,
            border: `1px solid rgba(139, 92, 246, 0.2)`,
            backgroundImage: 'none'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 3, fontWeight: 600 }}>
                Notification Preferences
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.email_notifications}
                      onChange={(e) => handleChange('email_notifications', e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: COLORS.green },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: COLORS.green },
                      }}
                    />
                  }
                  label={<Typography sx={{ color: 'white' }}>Email Notifications</Typography>}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.sms_notifications}
                      onChange={(e) => handleChange('sms_notifications', e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: COLORS.green },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: COLORS.green },
                      }}
                    />
                  }
                  label={<Typography sx={{ color: 'white' }}>SMS Notifications</Typography>}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.push_notifications}
                      onChange={(e) => handleChange('push_notifications', e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: COLORS.green },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: COLORS.green },
                      }}
                    />
                  }
                  label={<Typography sx={{ color: 'white' }}>Push Notifications</Typography>}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.login_notifications}
                      onChange={(e) => handleChange('login_notifications', e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: COLORS.green },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: COLORS.green },
                      }}
                    />
                  }
                  label={<Typography sx={{ color: 'white' }}>Login Notifications</Typography>}
                />
              </Box>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleSaveSettings}
                  disabled={saving}
                  sx={{
                    bgcolor: COLORS.purple,
                    '&:hover': { bgcolor: '#7c3aed' },
                    '&:disabled': { bgcolor: 'rgba(139, 92, 246, 0.3)' },
                  }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Preferences Tab */}
        {activeTab === 2 && (
          <Card sx={{ 
            bgcolor: COLORS.slate,
            border: `1px solid rgba(139, 92, 246, 0.2)`,
            backgroundImage: 'none'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 3, fontWeight: 600 }}>
                Preferences
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Language</InputLabel>
                    <Select
                      value={userSettings.language_preference}
                      onChange={(e) => handleChange('language_preference', e.target.value)}
                      label="Language"
                      sx={{
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.purple },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.purple },
                      }}
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="af">Afrikaans</MenuItem>
                      <MenuItem value="zu">Zulu</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Timezone</InputLabel>
                    <Select
                      value={userSettings.timezone}
                      onChange={(e) => handleChange('timezone', e.target.value)}
                      label="Timezone"
                      sx={{
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.purple },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.purple },
                      }}
                    >
                      <MenuItem value="Africa/Johannesburg">South Africa (SAST)</MenuItem>
                      <MenuItem value="UTC">UTC</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Date Format</InputLabel>
                    <Select
                      value={userSettings.date_format}
                      onChange={(e) => handleChange('date_format', e.target.value)}
                      label="Date Format"
                      sx={{
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.purple },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.purple },
                      }}
                    >
                      <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                      <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                      <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Time Format</InputLabel>
                    <Select
                      value={userSettings.time_format}
                      onChange={(e) => handleChange('time_format', e.target.value)}
                      label="Time Format"
                      sx={{
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.purple },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.purple },
                      }}
                    >
                      <MenuItem value="24h">24 Hour</MenuItem>
                      <MenuItem value="12h">12 Hour (AM/PM)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleSaveSettings}
                  disabled={saving}
                  sx={{
                    bgcolor: COLORS.purple,
                    '&:hover': { bgcolor: '#7c3aed' },
                    '&:disabled': { bgcolor: 'rgba(139, 92, 246, 0.3)' },
                  }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Privacy Tab */}
        {activeTab === 3 && (
          <Card sx={{ 
            bgcolor: COLORS.slate,
            border: `1px solid rgba(139, 92, 246, 0.2)`,
            backgroundImage: 'none'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 3, fontWeight: 600 }}>
                Privacy Settings
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.profile_visible}
                      onChange={(e) => handleChange('profile_visible', e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: COLORS.green },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: COLORS.green },
                      }}
                    />
                  }
                  label={<Typography sx={{ color: 'white' }}>Make Profile Visible</Typography>}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.show_online_status}
                      onChange={(e) => handleChange('show_online_status', e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: COLORS.green },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: COLORS.green },
                      }}
                    />
                  }
                  label={<Typography sx={{ color: 'white' }}>Show Online Status</Typography>}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.show_email}
                      onChange={(e) => handleChange('show_email', e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: COLORS.green },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: COLORS.green },
                      }}
                    />
                  }
                  label={<Typography sx={{ color: 'white' }}>Show Email Publicly</Typography>}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.show_phone}
                      onChange={(e) => handleChange('show_phone', e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: COLORS.green },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: COLORS.green },
                      }}
                    />
                  }
                  label={<Typography sx={{ color: 'white' }}>Show Phone Publicly</Typography>}
                />
              </Box>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleSaveSettings}
                  disabled={saving}
                  sx={{
                    bgcolor: COLORS.purple,
                    '&:hover': { bgcolor: '#7c3aed' },
                    '&:disabled': { bgcolor: 'rgba(139, 92, 246, 0.3)' },
                  }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Security Tab */}
        {activeTab === 4 && (
          <Card sx={{ 
            bgcolor: COLORS.slate,
            border: `1px solid rgba(139, 92, 246, 0.2)`,
            backgroundImage: 'none'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 3, fontWeight: 600 }}>
                Security Settings
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<KeyIcon className="h-5 w-5" />}
                  onClick={() => setShowPasswordModal(true)}
                  sx={{
                    borderColor: COLORS.purple,
                    color: COLORS.purple,
                    py: 1.5,
                    '&:hover': {
                      borderColor: '#7c3aed',
                      backgroundColor: 'rgba(139, 92, 246, 0.1)'
                    }
                  }}
                >
                  Change Password
                </Button>

                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.two_factor_enabled}
                      onChange={(e) => handleChange('two_factor_enabled', e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: COLORS.green },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: COLORS.green },
                      }}
                    />
                  }
                  label={<Typography sx={{ color: 'white' }}>Enable Two-Factor Authentication</Typography>}
                />

                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Session Timeout (minutes)</InputLabel>
                  <Select
                    value={userSettings.session_timeout}
                    onChange={(e) => handleChange('session_timeout', e.target.value)}
                    label="Session Timeout (minutes)"
                    sx={{
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.purple },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.purple },
                    }}
                  >
                    <MenuItem value={30}>30 minutes</MenuItem>
                    <MenuItem value={60}>1 hour</MenuItem>
                    <MenuItem value={120}>2 hours</MenuItem>
                    <MenuItem value={1440}>24 hours</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleSaveSettings}
                  disabled={saving}
                  sx={{
                    bgcolor: COLORS.purple,
                    '&:hover': { bgcolor: '#7c3aed' },
                    '&:disabled': { bgcolor: 'rgba(139, 92, 246, 0.3)' },
                  }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Password Change Modal */}
      <Dialog
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
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
            Change Password
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <TextField
              label="Current Password"
              type="password"
              value={passwordData.current_password}
              onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
              fullWidth
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

            <TextField
              label="New Password"
              type="password"
              value={passwordData.new_password}
              onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
              fullWidth
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

            <TextField
              label="Confirm New Password"
              type="password"
              value={passwordData.confirm_password}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
              fullWidth
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
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: `1px solid rgba(255, 255, 255, 0.1)` }}>
          <Button
            onClick={() => setShowPasswordModal(false)}
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePasswordChange}
            variant="contained"
            sx={{
              bgcolor: COLORS.purple,
              '&:hover': { bgcolor: '#7c3aed' }
            }}
          >
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TutorSettings;