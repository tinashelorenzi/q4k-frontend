// src/App.jsx - Updated to include account setup functionality
import { useState, useEffect } from 'react'

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
import AccountSetupPage from './pages/AccountSetupPage' // New import

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

// Main App Content (wrapped by AuthProvider)
const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth()
  const [currentPage, setCurrentPage] = useState('home')
  
  // Check for setup token on app load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    
    // If there's a token in URL, show account setup page
    if (token && window.location.pathname === '/setup-account') {
      setCurrentPage('setup-account')
    }
  }, [])
  
  // Handle page navigation (ready for React Router replacement)
  const navigateTo = (page) => {
    setCurrentPage(page)
    // Scroll to top when navigating
    window.scrollTo({ top: 0, behavior: 'smooth' })
    
    // Update URL for setup page
    if (page === 'setup-account') {
      window.history.pushState({}, '', '/setup-account' + window.location.search)
    } else {
      window.history.pushState({}, '', '/')
    }
  }

  // Handle login flow
  const handleLogin = () => {
    setCurrentPage('login')
  }

  const handleBackToHome = () => {
    setCurrentPage('home')
    window.history.pushState({}, '', '/')
  }

  const handleLoginSuccess = (userData) => {
    console.log('Login successful, user data:', userData)
    // The AuthContext will handle the state update
    // We can add additional logic here if needed
  }

  // Handle successful account setup
  const handleSetupSuccess = () => {
    // After successful setup, the user is automatically logged in
    // The auth context will handle the state change
    console.log('Account setup successful')
  }

  // Show loading screen while auth is initializing
  if (isLoading) {
    return <LoadingScreen />
  }

  // Show account setup page if on setup route (regardless of auth status)
  if (currentPage === 'setup-account') {
    return (
      <AccountSetupPage 
        onSetupSuccess={handleSetupSuccess}
        onBack={handleBackToHome}
      />
    )
  }

  // Show dashboard if user is authenticated
  if (isAuthenticated) {
    return <Dashboard />
  }

  // Render login page separately (full screen)
  if (currentPage === 'login') {
    return (
      <LoginPage 
        onBack={handleBackToHome} 
        onLoginSuccess={handleLoginSuccess}
      />
    )
  }

  // Render public pages
  return (
    <div className="min-h-screen animated-gradient">
      {/* Header with navigation */}
      <Header 
        activeTab={currentPage} 
        setActiveTab={navigateTo}
        onLogin={handleLogin}
      />

      {/* Main content area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'features' && <FeaturesPage />}
        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'contact' && <ContactPage />}
      </main>

      {/* Footer */}
      <Footer />
    </div>
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