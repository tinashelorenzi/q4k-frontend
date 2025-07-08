const AboutPage = () => {
    return (
      <div className="max-w-5xl mx-auto space-y-12 animate-slide-up">
        {/* Header */}
        <div className="text-center space-y-4">
          <h2 className="text-responsive-lg font-bold text-white mb-4">
            About <span className="gradient-text-blue">Quest4Knowledge</span>
          </h2>
          <p className="text-responsive-md text-white/80">Management Platform</p>
        </div>
        
        {/* Main Content */}
        <div className="glass-card p-8 md:p-12">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-500/25">
                <span className="text-white font-bold text-3xl">Q4K</span>
              </div>
              <h3 className="text-3xl font-bold text-white">The Platform Behind the Platform</h3>
            </div>
            
            <p className="text-white/90 text-lg leading-relaxed text-center">
              Quest4Knowledge Management Platform is the administrative backbone of our tutoring ecosystem. 
              While students and tutors connect through our main platform at 
              <a href="https://quest4knowledge.co.za" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 mx-1 underline transition-colors">
                quest4knowledge.co.za
              </a>, 
              this portal provides the comprehensive tools needed to manage operations efficiently and ensure quality education delivery.
            </p>
          </div>
        </div>
  
        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* For Administrators */}
          <div className="glass-card p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👨‍💼</span>
              </div>
              <h3 className="text-2xl font-semibold text-white">For Administrators</h3>
            </div>
            <ul className="space-y-4 text-white/80">
              {[
                {
                  title: 'Tutor Verification & Onboarding',
                  description: 'Comprehensive screening and qualification verification process'
                },
                {
                  title: 'Session Verification & Quality Control',
                  description: 'Ensure teaching quality with robust monitoring systems'
                },
                {
                  title: 'Financial Reporting & Analytics',
                  description: 'Track revenue, expenses, and profitability across the platform'
                },
                {
                  title: 'System Monitoring & Management',
                  description: 'Oversee platform health and performance metrics'
                }
              ].map((item, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-white">{item.title}</h4>
                    <p className="text-sm text-white/60">{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          {/* For Tutors */}
          <div className="glass-card p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👨‍🏫</span>
              </div>
              <h3 className="text-2xl font-semibold text-white">For Tutors</h3>
            </div>
            <ul className="space-y-4 text-white/80">
              {[
                {
                  title: 'Profile & Qualification Management',
                  description: 'Maintain professional profiles and showcase expertise'
                },
                {
                  title: 'Session Logging & Progress Tracking',
                  description: 'Document teaching sessions and student progress efficiently'
                },
                {
                  title: 'Gig Assignment & Scheduling',
                  description: 'Receive and manage tutoring assignments based on skills'
                },
                {
                  title: 'Performance Analytics & Feedback',
                  description: 'Access insights to improve teaching effectiveness'
                }
              ].map((item, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-white">{item.title}</h4>
                    <p className="text-sm text-white/60">{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
  
        {/* Mission & Vision */}
        <div className="glass-card p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
              <p className="text-white/80 leading-relaxed">
                To empower educational excellence by providing innovative management tools that streamline tutoring operations, 
                ensuring quality education delivery and meaningful learning outcomes for all students.
              </p>
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
              <p className="text-white/80 leading-relaxed">
                To become the leading platform that bridges the gap between educational aspirations and achievements, 
                making quality tutoring accessible, efficient, and impactful across South Africa and beyond.
              </p>
            </div>
          </div>
        </div>
  
        {/* Technology Stack */}
        <div className="glass-card p-8">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Built with Modern Technology</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">🚀</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Backend</h4>
              <p className="text-white/70 text-sm">Django REST Framework with robust API architecture</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">⚡</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Frontend</h4>
              <p className="text-white/70 text-sm">React with modern UI/UX design principles</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">🔒</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Security</h4>
              <p className="text-white/70 text-sm">Enterprise-grade security with JWT authentication</p>
            </div>
          </div>
        </div>
  
        {/* Call to Action */}
        <div className="glass-card p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to Transform Your Tutoring Business?</h3>
          <p className="text-white/80 mb-6 max-w-2xl mx-auto">
            Join the Quest4Knowledge ecosystem and experience the difference that professional management tools can make.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary">
              Schedule a Demo
            </button>
            <a 
              href="https://quest4knowledge.co.za" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              Explore Main Platform
            </a>
          </div>
        </div>
      </div>
    )
  }
  
  export default AboutPage