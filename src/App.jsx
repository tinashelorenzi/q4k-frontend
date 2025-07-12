// src/App.jsx - Updated to use React Router while preserving Dashboard functionality
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

// Context
import { AuthProvider, useAuth } from './context/AuthContext'

// Import your existing components
import Header from './components/Header'
import Footer from './components/Footer'

// Pages
import HomePage from './pages/HomePage'
import FeaturesPage from './pages/FeaturesPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard' // Your existing Dashboard that uses TutorDashboard component
import AccountSetupPage from './pages/AccountSetupPage'

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
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  
  const handleLoginSuccess = (userData) => {
    console.log('Login successful, user data:', userData)
    navigate('/dashboard')
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
      {/* Public Routes */}
      <Route path="/" element={
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
      <Route path="/login" element={
        <LoginPage 
          onBack={handleBackToHome} 
          onLoginSuccess={handleLoginSuccess}
        />
      } />

      <Route path="/setup-account" element={
        <AccountSetupPage 
          onSetupSuccess={handleSetupSuccess}
          onBack={handleBackToHome}
        />
      } />

      {/* Protected Routes - UNCHANGED Dashboard usage */}
      <Route path="/dashboard" element={
        isAuthenticated ? <Dashboard /> : <LoginPage onBack={handleBackToHome} onLoginSuccess={handleLoginSuccess} />
      } />

      {/* Catch all route - redirect to home */}
      <Route path="*" element={
        <PublicLayout>
          <HomePage />
        </PublicLayout>
      } />
    </Routes>
  )
}

// Root App Component
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App