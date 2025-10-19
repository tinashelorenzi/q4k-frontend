import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip,
  Container,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Logout,
  Settings,
  School,
  Person,
} from '@mui/icons-material';
import { 
  ChartBarIcon, 
  BookOpenIcon, 
  ClockIcon, 
  Cog6ToothIcon,
  HandRaisedIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const TutorLayout = () => {
  const { user, logout, getFormattedTutorId } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);

  // Get current tab from URL
  const getCurrentTab = () => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/dashboard/overview') return '/dashboard/overview';
    if (path.includes('/dashboard/gigs')) return '/dashboard/gigs';
    if (path.includes('/dashboard/sessions')) return '/dashboard/sessions';
    if (path.includes('/dashboard/settings')) return '/dashboard/settings';
    return '/dashboard/overview';
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/');
  };

  const handleTabChange = (event, newValue) => {
    navigate(newValue);
  };

  const getInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`;
    }
    return 'T';
  };

  // Define tabs
  const tabs = [
    { 
      value: '/dashboard/overview',
      label: 'Overview', 
      icon: ChartBarIcon,
    },
    { 
      value: '/dashboard/gigs',
      label: 'My Gigs', 
      icon: BookOpenIcon,
    },
    { 
      value: '/dashboard/sessions',
      label: 'Sessions', 
      icon: ClockIcon,
    },
    { 
      value: '/dashboard/settings',
      label: 'Settings', 
      icon: Cog6ToothIcon,
    }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#0f172a',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.03) 0%, transparent 100%)',
          pointerEvents: 'none',
        },
      }}
    >
      {/* AppBar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: '#1e293b',
          borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
        }}
      >
        <Toolbar>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
              }}
            >
              <School sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                Quest4Knowledge
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1 }}
              >
                Tutor Management Portal
              </Typography>
            </Box>
          </Box>

          {/* User Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {user?.first_name} {user?.last_name}
              </Typography>
              <Chip
                label={getFormattedTutorId()}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.75rem',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                  color: 'white',
                  fontWeight: 600,
                }}
              />
            </Box>

            <IconButton onClick={handleMenuOpen}>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                  fontWeight: 700,
                }}
              >
                {getInitials()}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  minWidth: 220,
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 2,
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {user?.first_name} {user?.last_name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
                >
                  {user?.email}
                </Typography>
              </Box>
              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  navigate('/dashboard/settings');
                }}
                sx={{
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  },
                }}
              >
                <Person sx={{ mr: 1.5, fontSize: 20 }} />
                Profile
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  navigate('/dashboard/settings');
                }}
                sx={{
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  },
                }}
              >
                <Settings sx={{ mr: 1.5, fontSize: 20 }} />
                Settings
              </MenuItem>
              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />
              <MenuItem
                onClick={handleLogout}
                sx={{
                  py: 1.5,
                  color: '#ef4444',
                  '&:hover': {
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  },
                }}
              >
                <Logout sx={{ mr: 1.5, fontSize: 20 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Welcome Section */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{
          mb: 3,
          p: 3,
          bgcolor: '#1e293b',
          borderRadius: 2,
          border: '1px solid rgba(139, 92, 246, 0.2)',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4" sx={{ 
              color: 'white', 
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              Welcome back, {user?.first_name || 'Tutor'}!
              <HandRaisedIcon className="h-8 w-8" style={{ color: '#8b5cf6' }} />
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 1 }}>
            Tutor ID: {getFormattedTutorId()} • Ready to inspire minds today?
          </Typography>
        </Box>

        {/* Tab Navigation */}
        <Box sx={{
          mb: 3,
          bgcolor: '#1e293b',
          borderRadius: 2,
          border: '1px solid rgba(139, 92, 246, 0.2)',
          p: 1,
        }}>
          <Tabs
            value={getCurrentTab()}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: '#8b5cf6',
                height: 3,
                borderRadius: '3px 3px 0 0'
              },
              '& .MuiTab-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.95rem',
                minHeight: 48,
                px: 3,
                '&.Mui-selected': {
                  color: 'white',
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  borderRadius: '8px 8px 0 0'
                },
                '&:hover': {
                  color: 'white',
                  backgroundColor: 'rgba(139, 92, 246, 0.05)'
                }
              }
            }}
          >
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <Tab
                  key={tab.value}
                  value={tab.value}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Icon className="h-5 w-5" />
                      <span>{tab.label}</span>
                    </Box>
                  }
                />
              );
            })}
          </Tabs>
        </Box>

        {/* Page Content */}
        <Box sx={{
          minHeight: 500,
          bgcolor: '#1e293b',
          borderRadius: 2,
          border: '1px solid rgba(139, 92, 246, 0.2)',
          p: 3,
        }}>
          <Outlet />
        </Box>
      </Container>
    </Box>
  );
};

export default TutorLayout;
