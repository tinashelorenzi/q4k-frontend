import { useState } from 'react'

function App() {
  const [activeTab, setActiveTab] = useState('home')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">Q4K</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Quest4Knowledge</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              {['home', 'features', 'about', 'contact'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`capitalize px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    activeTab === tab
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === 'home' && (
          <div className="text-center">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Quest4Knowledge</span>
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
              Embark on a journey of discovery and learning. Your quest for knowledge starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary text-lg px-8 py-3">
                Start Your Quest
              </button>
              <button className="btn-secondary text-lg px-8 py-3">
                Learn More
              </button>
            </div>
          </div>
        )}

        {activeTab === 'features' && (
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Interactive Learning',
                description: 'Engage with dynamic content that adapts to your learning style.',
                icon: '🎯'
              },
              {
                title: 'Progress Tracking',
                description: 'Monitor your learning journey with detailed analytics and insights.',
                icon: '📊'
              },
              {
                title: 'Community',
                description: 'Connect with fellow learners and share knowledge together.',
                icon: '🤝'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-white/80">{feature.description}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-8 text-center">About Quest4Knowledge</h2>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
              <p className="text-white/90 text-lg leading-relaxed mb-6">
                Quest4Knowledge is a modern learning platform designed to make education engaging, 
                accessible, and personalized. We believe that everyone deserves the opportunity to 
                pursue their quest for knowledge.
              </p>
              <p className="text-white/90 text-lg leading-relaxed">
                Built with cutting-edge technology including React, Vite, and Tailwind CSS, 
                our platform provides a seamless learning experience that adapts to your needs 
                and helps you achieve your educational goals.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-8 text-center">Get in Touch</h2>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
              <form className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Message</label>
                  <textarea
                    rows="4"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your message..."
                  ></textarea>
                </div>
                <button type="submit" className="w-full btn-primary">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/5 border-t border-white/20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-white/60">
            <p>&copy; 2024 Quest4Knowledge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
