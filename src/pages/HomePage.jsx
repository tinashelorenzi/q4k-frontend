const HomePage = () => {
    return (
      <div className="text-center space-y-12 animate-slide-up">
        {/* Hero Section */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-responsive-xl font-bold text-white leading-tight">
              Tutoring 
              <span className="block gradient-text">
                Management
              </span>
              <span className="block text-5xl md:text-6xl">Made Simple</span>
            </h2>
            <p className="text-responsive-md text-white/80 max-w-4xl mx-auto leading-relaxed">
              Streamline your tutoring business with our comprehensive management platform. 
              From tutor onboarding to session tracking and payment management.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button className="btn-primary text-lg animate-float">
              Access Management Portal
            </button>
            <a 
              href="https://quest4knowledge.co.za" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-secondary text-lg"
            >
              Visit Main Platform
            </a>
          </div>
        </div>
  
        {/* Value Proposition */}
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
              Why Choose Quest4Knowledge Management?
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Comprehensive Tracking</h4>
                    <p className="text-white/70 text-sm">Monitor every aspect of your tutoring operations in real-time</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Quality Assurance</h4>
                    <p className="text-white/70 text-sm">Built-in verification systems ensure teaching quality</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Financial Management</h4>
                    <p className="text-white/70 text-sm">Automated billing, payments, and financial reporting</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Scalable Platform</h4>
                    <p className="text-white/70 text-sm">Grows with your business from 1 to 1000+ tutors</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          {[
            { number: '500+', label: 'Active Tutors', color: 'from-blue-400 to-cyan-400', description: 'Qualified educators on our platform' },
            { number: '10k+', label: 'Sessions Managed', color: 'from-purple-400 to-pink-400', description: 'Successfully tracked and verified' },
            { number: '98%', label: 'Success Rate', color: 'from-green-400 to-teal-400', description: 'Client satisfaction rating' }
          ].map((stat, index) => (
            <div key={index} className="stat-card group">
              <div className={`text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${stat.color} mb-2 group-hover:scale-110 transition-transform duration-300`}>
                {stat.number}
              </div>
              <div className="text-white/90 text-lg font-medium mb-1">{stat.label}</div>
              <div className="text-white/60 text-sm">{stat.description}</div>
            </div>
          ))}
        </div>
  
        {/* CTA Section */}
        <div className="glass-card p-8 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h3>
          <p className="text-white/80 mb-6">
            Join hundreds of tutoring businesses that trust Quest4Knowledge to manage their operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary">
              Request Demo
            </button>
            <a 
              href="https://quest4knowledge.co.za/tutors-application/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              Become a Tutor
            </a>
          </div>
        </div>
      </div>
    )
  }
  
  export default HomePage