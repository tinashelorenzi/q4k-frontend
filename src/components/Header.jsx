// src/components/Header.jsx
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const Header = ({ activeTab, setActiveTab, onLogin }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, logout, user, tutorProfile } = useAuth()

  // Format tutor ID with TUT- prefix and 4-digit padding
  const formatTutorId = (id) => {
    if (!id) return ''
    const numericId = parseInt(id, 10)
    if (isNaN(numericId)) return id
    return `TUT-${numericId.toString().padStart(4, '0')}`
  }

  const navigation = [
    { name: 'Home', path: 'home' },
    { name: 'Features', path: 'features' },
    { name: 'About', path: 'about' },
    { name: 'Contact', path: 'contact' },
  ]

  const handleLogout = () => {
    logout()
    setActiveTab('home')
  }

  const isActivePath = (path) => {
    return activeTab === path
  }

  return (
    <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <button onClick={() => setActiveTab('home')} className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-purple-500/25">
              <span className="text-white font-bold text-lg">Q4K</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-white">Quest4Knowledge</h1>
              <p className="text-white/60 text-sm">Learning Management Platform</p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.path)}
                className={`text-white/80 hover:text-white transition-colors duration-300 font-medium ${
                  isActivePath(item.path) ? 'text-white border-b-2 border-blue-400' : ''
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="text-right mr-4">
                  <p className="text-white font-medium text-sm">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-white/60 text-xs">
                    {formatTutorId(tutorProfile?.tutor_id || user?.id)}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="text-white/80 hover:text-white transition-colors duration-300 font-medium"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-500/20 text-red-300 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-all duration-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={onLogin}
                className="bg-white/10 text-white px-6 py-2 rounded-lg hover:bg-white/20 transition-all duration-300 font-medium border border-white/20"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-white/20 py-4">
            <div className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveTab(item.path)
                    setIsMenuOpen(false)
                  }}
                  className={`text-white/80 hover:text-white transition-colors duration-300 font-medium px-2 py-1 ${
                    isActivePath(item.path) ? 'text-white bg-white/10 rounded' : ''
                  }`}
                >
                  {item.name}
                </button>
              ))}
              
              <div className="border-t border-white/20 pt-4">
                {isAuthenticated ? (
                  <>
                    <div className="px-2 py-3 mb-3 bg-white/5 rounded-lg">
                      <p className="text-white font-medium text-sm">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-white/60 text-xs">
                        {formatTutorId(tutorProfile?.tutor_id || user?.id)}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('dashboard')
                        setIsMenuOpen(false)
                      }}
                      className="block w-full text-left text-white/80 hover:text-white transition-colors duration-300 font-medium px-2 py-1 mb-2"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      className="block w-full text-left bg-red-500/20 text-red-300 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-all duration-300"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      onLogin()
                      setIsMenuOpen(false)
                    }}
                    className="block w-full bg-white/10 text-white px-6 py-2 rounded-lg hover:bg-white/20 transition-all duration-300 font-medium border border-white/20 text-center"
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Header