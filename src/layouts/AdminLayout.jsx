import { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
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
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Logout,
  Settings,
  Person,
  Menu as MenuIcon,
} from '@mui/icons-material';
import {
  ChartBarIcon,
  UsersIcon,
  AcademicCapIcon,
  BookOpenIcon,
  CheckCircleIcon,
  VideoCameraIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 260;

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon, path: '/admin' },
    { id: 'users', label: 'User Management', icon: UsersIcon, path: '/admin/users' },
    { id: 'tutors', label: 'Tutor Management', icon: AcademicCapIcon, path: '/admin/tutors' },
    { id: 'gigs', label: 'Gig Management', icon: BookOpenIcon, path: '/admin/gigs' },
    { id: 'sessions', label: 'Session Approval', icon: CheckCircleIcon, path: '/admin/sessions' },
    { id: 'online-sessions', label: 'Online Sessions', icon: VideoCameraIcon, path: '/admin/online-sessions' },
    { id: 'settings', label: 'Settings', icon: Cog6ToothIcon, path: '/admin/settings' },
  ];

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

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const getInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`;
    }
    return 'A';
  };

  const getRoleBadgeColor = () => {
    switch (user?.user_type) {
      case 'admin':
        return 'error';
      case 'manager':
        return 'warning';
      case 'staff':
        return 'info';
      default:
        return 'default';
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Drawer Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
          bgcolor: '#1e293b',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
            }}
          >
            <ShieldCheckIcon className="h-6 w-6 text-white" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Admin Panel
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Quest4Knowledge
            </Typography>
          </Box>
        </Box>
        <Chip
          label={user?.user_type?.toUpperCase() || 'ADMIN'}
          size="small"
          color={getRoleBadgeColor()}
          sx={{ fontWeight: 600, fontSize: '0.7rem' }}
        />
      </Box>

      {/* Navigation Menu */}
      <List sx={{ flexGrow: 1, py: 2 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  mx: 1.5,
                  borderRadius: 2,
                  bgcolor: isActive ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid transparent',
                  '&:hover': {
                    bgcolor: 'rgba(139, 92, 246, 0.1)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Icon className={`h-5 w-5 ${isActive ? 'text-purple-400' : 'text-white/70'}`} />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.7)',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Drawer Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid rgba(139, 92, 246, 0.2)',
        }}
      >
        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block' }}>
          © 2025 Quest4Knowledge
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
          Admin Portal v1.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0f172a' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          backgroundColor: '#1e293b',
          borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
        }}
      >
        <Toolbar>
          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Page Title */}
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {menuItems.find((item) => item.path === location.pathname)?.label || 'Dashboard'}
            </Typography>
          </Box>

          {/* User Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {user?.first_name} {user?.last_name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                {user?.email}
              </Typography>
            </Box>

            <IconButton onClick={handleMenuOpen}>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
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
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  {user?.email}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip
                    label={user?.user_type?.toUpperCase()}
                    size="small"
                    color={getRoleBadgeColor()}
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                </Box>
              </Box>
              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />
              <MenuItem
                onClick={handleMenuClose}
                sx={{
                  py: 1.5,
                  '&:hover': { backgroundColor: 'rgba(139, 92, 246, 0.1)' },
                }}
              >
                <Person sx={{ mr: 1.5, fontSize: 20 }} />
                Profile
              </MenuItem>
              <MenuItem
                onClick={handleMenuClose}
                sx={{
                  py: 1.5,
                  '&:hover': { backgroundColor: 'rgba(139, 92, 246, 0.1)' },
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
                  '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
                }}
              >
                <Logout sx={{ mr: 1.5, fontSize: 20 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              backgroundColor: '#1e293b',
              borderRight: '1px solid rgba(139, 92, 246, 0.2)',
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              backgroundColor: '#1e293b',
              borderRight: '1px solid rgba(139, 92, 246, 0.2)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: '64px',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'fixed',
            top: 0,
            left: { xs: 0, md: `${DRAWER_WIDTH}px` },
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.03) 0%, transparent 100%)',
            pointerEvents: 'none',
            zIndex: 0,
          },
        }}
      >
        <Box sx={{ maxWidth: 'xl', mx: 'auto', position: 'relative', zIndex: 1 }}>
          {/* Outlet renders the child routes */}
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;

