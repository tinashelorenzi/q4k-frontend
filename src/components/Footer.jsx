import React from 'react'

const Footer = () => {
  return (
    <footer className="footer-blur mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Q4K</span>
            </div>
            <div>
              <p className="text-white/60 text-sm">
                &copy; 2024 Quest4Knowledge. All rights reserved.
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <a 
              href="https://quest4knowledge.co.za" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors text-sm"
            >
              Main Platform
            </a>
            <span className="text-white/30">|</span>
            <a 
              href="mailto:admin@quest4knowledge.co.za"
              className="text-white/60 hover:text-white transition-colors text-sm"
            >
              Support
            </a>
            <span className="text-white/30">|</span>
            <span className="text-white/40 text-sm">
              Management Portal v1.0
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer