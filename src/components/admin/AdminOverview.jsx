import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  UsersIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ClockIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
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

const AdminOverview = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTutors: 0,
    activeTutors: 0,
    totalGigs: 0,
    activeGigs: 0,
    totalSessions: 0,
    verifiedSessions: 0,
    pendingSessions: 0,
    totalRevenue: 0,
    totalProfit: 0,
    thisMonthRevenue: 0,
    thisMonthProfit: 0,
    totalHoursBilled: 0,
    thisMonthHours: 0,
  });
  const [chartData, setChartData] = useState({
    statusDistribution: [],
    revenueByMonth: [],
    tutorStatus: [],
  });

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError('');

      // Load analytics and users data
      const [analyticsResponse, usersResponse] = await Promise.all([
        apiService.apiCall('/gigs/analytics/').catch(err => {
          console.warn('Analytics endpoint error:', err);
          return null;
        }),
        apiService.apiCall('/auth/').catch(err => {
          console.warn('Users endpoint error:', err);
          return { results: [], count: 0 };
        }),
      ]);

      const users = usersResponse.results || usersResponse || [];
      const tutors = users.filter(u => u.user_type === 'tutor');
      const activeTutors = tutors.filter(t => t.is_active && t.is_verified && t.is_approved).length;

      // If analytics data is available, use it
      if (analyticsResponse) {
        setStats({
          totalUsers: usersResponse.count || users.length,
          totalTutors: tutors.length,
          activeTutors: activeTutors,
          totalGigs: analyticsResponse.gigs.total,
          activeGigs: analyticsResponse.gigs.by_status.active,
          totalSessions: analyticsResponse.sessions.total,
          verifiedSessions: analyticsResponse.sessions.verified,
          pendingSessions: analyticsResponse.sessions.pending_verification,
          totalRevenue: analyticsResponse.revenue.total_client_revenue,
          totalProfit: analyticsResponse.revenue.total_profit,
          thisMonthRevenue: analyticsResponse.revenue.this_month_client_revenue,
          thisMonthProfit: analyticsResponse.revenue.this_month_profit,
          totalHoursBilled: analyticsResponse.revenue.total_hours_billed,
          thisMonthHours: analyticsResponse.revenue.this_month_hours,
        });

        // Prepare chart data
        prepareChartData(analyticsResponse, tutors);
      } else {
        // Fallback if analytics endpoint fails
        setStats({
          totalUsers: usersResponse.count || users.length,
          totalTutors: tutors.length,
          activeTutors: activeTutors,
          totalGigs: 0,
          activeGigs: 0,
          totalSessions: 0,
          verifiedSessions: 0,
          pendingSessions: 0,
          totalRevenue: 0,
          totalProfit: 0,
          thisMonthRevenue: 0,
          thisMonthProfit: 0,
          totalHoursBilled: 0,
          thisMonthHours: 0,
        });
      }
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = (analytics, tutors) => {
    // Status Distribution
    const statusData = analytics.gigs.by_status;
    const statusDistribution = [
      { name: 'Pending', value: statusData.pending, color: COLORS.yellow },
      { name: 'Active', value: statusData.active, color: COLORS.green },
      { name: 'On Hold', value: statusData.on_hold, color: COLORS.gray },
      { name: 'Completed', value: statusData.completed, color: COLORS.blue },
      { name: 'Cancelled', value: statusData.cancelled, color: COLORS.red },
    ].filter(item => item.value > 0);

    // Revenue by Month
    const revenueByMonth = analytics.trends.monthly_revenue.map(month => ({
      month: month.month,
      revenue: month.revenue,
      profit: month.profit,
      sessions: month.sessions,
      hours: month.hours,
    }));

    // Tutor Status
    const tutorStatus = [
      { name: 'Active', value: tutors.filter(t => t.is_active && t.is_verified).length, color: COLORS.green },
      { name: 'Inactive', value: tutors.filter(t => !t.is_active).length, color: COLORS.gray },
      { name: 'Pending', value: tutors.filter(t => t.is_active && !t.is_verified).length, color: COLORS.yellow },
    ].filter(item => item.value > 0);

    setChartData({
      statusDistribution,
      revenueByMonth,
      tutorStatus,
    });
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        bgcolor: '#1e293b',
        border: '1px solid rgba(139, 92, 246, 0.15)',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: 'rgba(139, 92, 246, 0.3)',
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)',
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: `${color}15`,
            }}
          >
            <Icon className="h-6 w-6" style={{ color }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const formatCurrency = (value) => {
    return `R ${Math.round(value).toLocaleString('en-ZA')}`;
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
    <Box sx={{ maxWidth: '100%', px: 0 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4, px: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 1 }}>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          Monitor platform performance and revenue from client payments
        </Typography>
      </Box>

      {/* Revenue Stats */}
      <Box sx={{ mb: 4, px: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} xl={3}>
            <StatCard
              title="Total Revenue"
              value={formatCurrency(stats.totalRevenue)}
              subtitle={`${stats.totalHoursBilled.toFixed(1)} hours billed`}
              icon={CurrencyDollarIcon}
              color={COLORS.purple}
            />
          </Grid>
          <Grid item xs={12} sm={6} xl={3}>
            <StatCard
              title="Total Profit"
              value={formatCurrency(stats.totalProfit)}
              subtitle="Client fee - Tutor pay"
              icon={BanknotesIcon}
              color={COLORS.green}
            />
          </Grid>
          <Grid item xs={12} sm={6} xl={3}>
            <StatCard
              title="This Month Revenue"
              value={formatCurrency(stats.thisMonthRevenue)}
              subtitle={`${stats.thisMonthHours.toFixed(1)} hours`}
              icon={ChartBarIcon}
              color={COLORS.cyan}
            />
          </Grid>
          <Grid item xs={12} sm={6} xl={3}>
            <StatCard
              title="This Month Profit"
              value={formatCurrency(stats.thisMonthProfit)}
              subtitle="From client payments"
              icon={CurrencyDollarIcon}
              color={COLORS.blue}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Platform Stats */}
      <Box sx={{ mb: 4, px: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} xl={3}>
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={UsersIcon}
              color={COLORS.blue}
            />
          </Grid>
          <Grid item xs={12} sm={6} xl={3}>
            <StatCard
              title="Active Tutors"
              value={`${stats.activeTutors}/${stats.totalTutors}`}
              icon={AcademicCapIcon}
              color={COLORS.purple}
            />
          </Grid>
          <Grid item xs={12} sm={6} xl={3}>
            <StatCard
              title="Total Gigs"
              value={stats.totalGigs}
              subtitle={`${stats.activeGigs} active`}
              icon={BookOpenIcon}
              color={COLORS.green}
            />
          </Grid>
          <Grid item xs={12} sm={6} xl={3}>
            <StatCard
              title="Sessions"
              value={stats.totalSessions}
              subtitle={`${stats.pendingSessions} pending approval`}
              icon={CheckCircleIcon}
              color={COLORS.yellow}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Revenue Trend Chart - Full Width */}
      <Box sx={{ mb: 4, px: 2 }}>
        <Card
          elevation={0}
          sx={{
            bgcolor: '#1e293b',
            border: '1px solid rgba(139, 92, 246, 0.15)',
            minHeight: 400,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'white', mb: 1 }}>
              Revenue & Profit Trend (Last 6 Months)
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 3 }}>
              Based on gig creation (client payments)
            </Typography>
            {chartData.revenueByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData.revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis 
                    dataKey="month" 
                    stroke="rgba(255, 255, 255, 0.7)"
                    tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 14 }}
                  />
                  <YAxis 
                    stroke="rgba(255, 255, 255, 0.7)"
                    tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 14 }}
                    tickFormatter={(value) => `R${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: 8,
                      color: 'white'
                    }}
                    formatter={(value, name) => {
                      if (name === 'revenue') return [`R${value.toLocaleString()}`, 'Client Revenue'];
                      if (name === 'profit') return [`R${value.toLocaleString()}`, 'Profit'];
                      if (name === 'hours') return [value.toFixed(1), 'Hours'];
                      return [value, name];
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ color: 'rgba(255, 255, 255, 0.7)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={COLORS.purple} 
                    strokeWidth={3}
                    dot={{ fill: COLORS.purple, r: 6 }}
                    activeDot={{ r: 8 }}
                    name="Client Revenue"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke={COLORS.green} 
                    strokeWidth={3}
                    dot={{ fill: COLORS.green, r: 6 }}
                    name="Profit"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="hours" 
                    stroke={COLORS.cyan} 
                    strokeWidth={2}
                    dot={{ fill: COLORS.cyan, r: 5 }}
                    name="Hours Tutored"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 350 }}>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                  No revenue data yet. Revenue is calculated from client payments.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4, px: 2 }}>
        {/* Gig Status Distribution */}
        <Grid item xs={12} lg={6}>
          <Card
            elevation={0}
            sx={{
              bgcolor: '#1e293b',
              border: '1px solid rgba(139, 92, 246, 0.15)',
              minHeight: 400,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: 'white', mb: 3 }}>
                Gig Status Distribution
              </Typography>
              {chartData.statusDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={chartData.statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: 8,
                        color: 'white'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320 }}>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>No gigs data</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Tutor Status */}
        <Grid item xs={12} lg={6}>
          <Card
            elevation={0}
            sx={{
              bgcolor: '#1e293b',
              border: '1px solid rgba(139, 92, 246, 0.15)',
              minHeight: 400,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: 'white', mb: 3 }}>
                Tutor Status Overview
              </Typography>
              {chartData.tutorStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={chartData.tutorStatus}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis 
                      dataKey="name" 
                      stroke="rgba(255, 255, 255, 0.7)"
                      tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 14 }}
                    />
                    <YAxis 
                      stroke="rgba(255, 255, 255, 0.7)"
                      tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 14 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: 8,
                        color: 'white'
                      }}
                    />
                    <Bar dataKey="value" fill={COLORS.purple} radius={[4, 4, 0, 0]}>
                      {chartData.tutorStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320 }}>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>No tutor data</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Key Insights */}
      <Box sx={{ px: 2 }}>
        <Card
          elevation={0}
          sx={{
            bgcolor: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            mb: 4,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'white', mb: 3 }}>
              💡 Key Insights
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: 'rgba(255, 255, 255, 0.03)', 
                  borderRadius: 2,
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    transform: 'translateY(-2px)',
                  }
                }}>
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1, fontWeight: 500 }}>
                    Average Hourly Rate
                  </Typography>
                  <Typography variant="h4" sx={{ color: COLORS.purple, fontWeight: 700 }}>
                    {stats.totalHoursBilled > 0 
                      ? formatCurrency(stats.totalRevenue / stats.totalHoursBilled)
                      : 'R 0'
                    } /hr
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: 'rgba(255, 255, 255, 0.03)', 
                  borderRadius: 2,
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    transform: 'translateY(-2px)',
                  }
                }}>
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1, fontWeight: 500 }}>
                    Profit Margin
                  </Typography>
                  <Typography variant="h4" sx={{ color: COLORS.green, fontWeight: 700 }}>
                    {stats.totalRevenue > 0 
                      ? ((stats.totalProfit / stats.totalRevenue) * 100).toFixed(1)
                      : '0'
                    }%
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: 'rgba(255, 255, 255, 0.03)', 
                  borderRadius: 2,
                  border: '1px solid rgba(6, 182, 212, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    transform: 'translateY(-2px)',
                  }
                }}>
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1, fontWeight: 500 }}>
                    Session Verification Rate
                  </Typography>
                  <Typography variant="h4" sx={{ color: COLORS.cyan, fontWeight: 700 }}>
                    {stats.totalSessions > 0 
                      ? ((stats.verifiedSessions / stats.totalSessions) * 100).toFixed(1)
                      : '0'
                    }%
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default AdminOverview;
