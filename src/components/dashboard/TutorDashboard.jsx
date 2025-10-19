import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ChartBarIcon, 
  BookOpenIcon, 
  ClockIcon, 
  Cog6ToothIcon,
  HandRaisedIcon 
} from '@heroicons/react/24/outline';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Avatar,
  Chip,
  CircularProgress,
  Grid,
  Paper
} from '@mui/material';

// Import your existing dashboard components
import Overview from './Overview';
import MyGigs from './MyGigs'; 
import TutorSessions from './TutorSessions';
import TutorSettings from './TutorSettings';

const COLORS = {
  darkSlate: '#0f172a',
  slate: '#1e293b',
  purple: '#8b5cf6',
  green: '#10b981',
  red: '#ef4444',
  yellow: '#f59e0b',
};

const TutorDashboard = () => {
  const { user, tutorProfile, tutor, getFormattedTutorId } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  // Define your tabs
  const tabs = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: ChartBarIcon,
      component: Overview 
    },
    { 
      id: 'gigs', 
      label: 'My Gigs', 
      icon: BookOpenIcon,
      component: MyGigs 
    },
    { 
      id: 'sessions', 
      label: 'Sessions', 
      icon: ClockIcon,
      component: TutorSessions 
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Cog6ToothIcon,
      component: TutorSettings 
    }
  ];

  // Get the current active component
  const getCurrentComponent = () => {
    const currentTab = tabs.find(tab => tab.id === activeTab);
    if (currentTab && currentTab.component) {
      const Component = currentTab.component;
      return <Component />;
    }
    return <Overview />; // Fallback to overview
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
        <Card sx={{ 
          p: 4, 
          bgcolor: COLORS.slate, 
          textAlign: 'center',
          border: `1px solid rgba(139, 92, 246, 0.2)`
        }}>
          <CircularProgress sx={{ color: COLORS.purple, mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
            Loading Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Please wait...
          </Typography>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '100%', px: 0 }}>
      {/* Welcome Section */}
      <Card sx={{ 
        mb: 3, 
        bgcolor: COLORS.slate,
        border: `1px solid rgba(139, 92, 246, 0.2)`,
        backgroundImage: 'none'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="h4" sx={{ 
                  color: 'white', 
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  Welcome back, {user?.first_name || 'Tutor'}!
                  <HandRaisedIcon className="h-8 w-8" style={{ color: COLORS.purple }} />
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                Tutor ID: {getFormattedTutorId()} • Ready to inspire minds today?
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                justifyContent: { xs: 'flex-start', md: 'flex-end' }
              }}>
                <Avatar sx={{
                  width: 56,
                  height: 56,
                  background: `linear-gradient(135deg, ${COLORS.green} 0%, ${COLORS.purple} 100%)`,
                  fontWeight: 700,
                  fontSize: '1.5rem'
                }}>
                  {user?.first_name?.charAt(0) || 'T'}
                </Avatar>
                <Box>
                  <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                    {user?.first_name} {user?.last_name}
                  </Typography>
                  <Chip
                    label="Active Tutor"
                    size="small"
                    sx={{
                      height: 24,
                      fontSize: '0.75rem',
                      background: `linear-gradient(135deg, ${COLORS.green} 0%, #059669 100%)`,
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <Card sx={{ 
        mb: 3, 
        bgcolor: COLORS.slate,
        border: `1px solid rgba(139, 92, 246, 0.2)`,
        backgroundImage: 'none'
      }}>
        <Box sx={{ p: 1 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: COLORS.purple,
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
                  key={tab.id}
                  value={tab.id}
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
      </Card>

      {/* Tab Content */}
      <Paper sx={{ 
        minHeight: 500,
        bgcolor: COLORS.slate,
        border: `1px solid rgba(139, 92, 246, 0.2)`,
        backgroundImage: 'none',
        borderRadius: 2
      }}>
        <Box sx={{ p: 3 }}>
          {getCurrentComponent()}
        </Box>
      </Paper>
    </Box>
  );
};

export default TutorDashboard;