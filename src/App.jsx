import { useState } from 'react'

// Context
import { AuthProvider, useAuth } from './context/AuthContext'

// Components
import Header from './components/Header'
import Footer from './components/Footer'

// Pages
import HomePage from './pages/HomePage'
import FeaturesPage from './pages/FeaturesPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'

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
  
  // Handle page navigation (ready for React Router replacement)
  const navigateTo = (page) => {
    setCurrentPage(page)
    // Scroll to top when navigating
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle login flow
  const handleLogin = () => {
    setCurrentPage('login')
  }

  const handleBackToHome = () => {
    setCurrentPage('home')
  }

  const handleLoginSuccess = (userData) => {
    console.log('Login successful, user data:', userData)
    // The AuthContext will handle the state update
    // We can add additional logic here if needed
  }

  // Show loading screen while auth is initializing
  if (isLoading) {
    return <LoadingScreen />
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