import { useState } from 'react'

const Header = ({ activeTab, setActiveTab, onLogin }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = ['home', 'features', 'about', 'contact']

  return (
    <header className="header-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
              <span className="text-white font-bold text-xl">Q4K</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Quest4Knowledge</h1>
              <p className="text-sm text-white/60">Management Portal</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            <nav className="flex space-x-6">
              {navItems.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={activeTab === tab ? 'nav-item-active' : 'nav-item-inactive'}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
            
            <div className="flex space-x-3 ml-6">
              <a 
                href="https://quest4knowledge.co.za" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-ghost text-sm"
              >
                Main Site
              </a>
              <button onClick={onLogin} className="btn-primary text-sm">
                Login
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden pb-4 border-t border-white/10 mt-4 pt-4">
            <nav className="flex flex-col space-y-2">
              {navItems.map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab)
                    setIsMobileMenuOpen(false)
                  }}
                  className={`text-left px-4 py-3 rounded-lg transition-all duration-300 ${
                    activeTab === tab
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
              
              <div className="flex flex-col space-y-2 pt-4 border-t border-white/10 mt-4">
                <a 
                  href="https://quest4knowledge.co.za" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-ghost text-center"
                >
                  Visit Main Site
                </a>
                <button onClick={onLogin} className="btn-primary">
                  Access Portal
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header