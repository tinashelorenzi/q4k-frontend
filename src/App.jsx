import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { darkTheme } from './theme/muiTheme'

// Context
import { AuthProvider, useAuth } from './context/AuthContext'

// Import components
import Header from './components/Header'
import Footer from './components/Footer'

// Pages
import HomePage from './pages/HomePage'
import FeaturesPage from './pages/FeaturesPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import LoginPage from './pages/LoginPage'
import LoginPageNew from './pages/LoginPageNew'
import Dashboard from './pages/Dashboard'
import DashboardNew from './pages/DashboardNew'
import AdminDashboard from './pages/AdminDashboard'
import AccountSetupPage from './pages/AccountSetupPage'
import AccountSetupPageNew from './pages/AccountSetupPageNew'
import MeetingRoom from './pages/MeetingRoom'

// Admin Layout and Pages
import AdminLayout from './layouts/AdminLayout'
import { 
  OverviewPage, 
  UsersPage, 
  TutorsPage, 
  GigsPage, 
  SessionsPage,
  OnlineSessionsPage, 
  SettingsPage 
} from './pages/admin'

// Tutor Layout and Pages
import TutorLayout from './layouts/TutorLayout'
import {
  TutorOverviewPage,
  TutorGigsPage,
  TutorSessionsPage,
  TutorSettingsPage
} from './pages/tutor'

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen animated-gradient flex items-center justify-center">
    <div className="glass-card p-8 text-center">
      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/25 animate-pulse">
        <span className="text-white font-bold text-2xl">Q4K</span>
      </div>
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-white">Loading...</p>
    </div>
  </div>
)

// Public Layout Component
const PublicLayout = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  
  const getCurrentPage = () => {
    switch (location.pathname) {
      case '/': return 'home'
      case '/features': return 'features'
      case '/about': return 'about'
      case '/contact': return 'contact'
      default: return 'home'
    }
  }

  const handleLogin = () => {
    navigate('/login')
  }

  const handleNavigation = (page) => {
    switch (page) {
      case 'home':
        navigate('/')
        break
      case 'features':
        navigate('/features')
        break
      case 'about':
        navigate('/about')
        break
      case 'contact':
        navigate('/contact')
        break
      default:
        navigate('/')
    }
  }

  return (
    <div className="min-h-screen animated-gradient">
      <Header 
        activeTab={getCurrentPage()} 
        setActiveTab={handleNavigation}
        onLogin={handleLogin}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {children}
      </main>
      <Footer />
    </div>
  )
}

// Main App Content (wrapped by AuthProvider)
const AppContent = () => {
  const { isAuthenticated, isLoading, user } = useAuth()
  const navigate = useNavigate()
  
  const handleLoginSuccess = (userData) => {
    console.log('Login successful, user data:', userData)
    // Redirect based on user type
    if (userData?.user?.user_type === 'admin' || 
        userData?.user?.user_type === 'manager' || 
        userData?.user?.user_type === 'staff') {
      navigate('/admin')
    } else {
      navigate('/dashboard')
    }
  }

  const handleSetupSuccess = () => {
    console.log('Account setup successful')
    navigate('/dashboard')
  }

  const handleBackToHome = () => {
    navigate('/')
  }

  // Show loading screen while auth is initializing
  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <Routes>
      {/* Root - Login Page */}
      <Route path="/" element={<LoginPageNew />} />
      
      {/* Public Routes */}
      <Route path="/home" element={
        <PublicLayout>
          <HomePage />
        </PublicLayout>
      } />
      
      <Route path="/features" element={
        <PublicLayout>
          <FeaturesPage />
        </PublicLayout>
      } />
      
      <Route path="/about" element={
        <PublicLayout>
          <AboutPage />
        </PublicLayout>
      } />
      
      <Route path="/contact" element={
        <PublicLayout>
          <ContactPage />
        </PublicLayout>
      } />

      {/* Auth Routes */}
      <Route path="/login" element={<LoginPageNew />} />
      
      <Route path="/login-old" element={
        <LoginPage 
          onBack={handleBackToHome} 
          onLoginSuccess={handleLoginSuccess}
        />
      } />

      <Route path="/setup-account" element={
        <AccountSetupPageNew 
          onSetupSuccess={handleSetupSuccess}
          onBack={handleBackToHome}
        />
      } />
      
      <Route path="/setup-account-old" element={
        <AccountSetupPage 
          onSetupSuccess={handleSetupSuccess}
          onBack={handleBackToHome}
        />
      } />

      {/* Public Meeting Room (No Auth Required) */}
      <Route path="/meeting/:meetingCode" element={<MeetingRoom />} />

      {/* Protected Routes - Tutor Dashboard with Nested Routes */}
      <Route path="/dashboard" element={
        isAuthenticated ? (
          user?.user_type === 'tutor' ? <TutorLayout /> : <AdminLayout />
        ) : <LoginPageNew />
      }>
        <Route index element={<TutorOverviewPage />} />
        <Route path="overview" element={<TutorOverviewPage />} />
        <Route path="gigs" element={<TutorGigsPage />} />
        <Route path="sessions" element={<TutorSessionsPage />} />
        <Route path="settings" element={<TutorSettingsPage />} />
      </Route>
      
      {/* Legacy dashboard route (deprecated) */}
      <Route path="/dashboard-old" element={
        isAuthenticated ? <DashboardNew /> : <LoginPageNew />
      } />
      
      {/* Admin Routes - Properly Nested with Layout */}
      <Route path="/admin" element={
        isAuthenticated ? (
          user?.user_type === 'admin' || user?.user_type === 'manager' || user?.user_type === 'staff' 
            ? <AdminLayout /> 
            : <DashboardNew />
        ) : <LoginPageNew />
      }>
        <Route index element={<OverviewPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="tutors" element={<TutorsPage />} />
        <Route path="gigs" element={<GigsPage />} />
        <Route path="sessions" element={<SessionsPage />} />
        <Route path="online-sessions" element={<OnlineSessionsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      
      {/* Legacy routes (deprecated) */}
      <Route path="/admin-old" element={
        isAuthenticated ? (
          user?.user_type === 'admin' || user?.user_type === 'manager' || user?.user_type === 'staff' 
            ? <AdminDashboard /> 
            : <DashboardNew />
        ) : <LoginPageNew />
      } />
      
      <Route path="/dashboard-legacy" element={
        isAuthenticated ? <Dashboard /> : <LoginPageNew />
      } />

      {/* Catch all route - redirect to login */}
      <Route path="*" element={<LoginPageNew />} />
    </Routes>
  )
}

// Root App Component
function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App