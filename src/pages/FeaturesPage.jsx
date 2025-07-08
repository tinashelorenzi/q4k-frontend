const FeaturesPage = () => {
    const features = [
      {
        title: 'Tutor Management',
        description: 'Comprehensive tutor profiles, qualification tracking, and performance analytics with detailed reporting.',
        icon: '👨‍🏫',
        gradient: 'from-blue-500 to-cyan-500',
        details: [
          'Qualification verification system',
          'Performance tracking and analytics',
          'Automated onboarding process',
          'Profile management tools'
        ]
      },
      {
        title: 'Session Tracking',
        description: 'Track tutoring sessions, verify attendance, and manage comprehensive session notes and progress.',
        icon: '📊',
        gradient: 'from-purple-500 to-pink-500',
        details: [
          'Real-time session logging',
          'Attendance verification',
          'Progress note management',
          'Session quality assurance'
        ]
      },
      {
        title: 'Gig Assignment',
        description: 'Efficiently assign tutoring gigs to qualified tutors based on expertise and availability.',
        icon: '🎯',
        gradient: 'from-indigo-500 to-purple-500',
        details: [
          'Smart matching algorithm',
          'Availability management',
          'Skill-based assignments',
          'Workload balancing'
        ]
      },
      {
        title: 'Progress Monitoring',
        description: 'Monitor student progress and tutor performance with detailed analytics and insights.',
        icon: '📈',
        gradient: 'from-green-500 to-teal-500',
        details: [
          'Student progress tracking',
          'Performance analytics',
          'Custom reporting dashboards',
          'Trend analysis tools'
        ]
      },
      {
        title: 'Payment Management',
        description: 'Handle tutor payments, client billing, and comprehensive financial reporting seamlessly.',
        icon: '💰',
        gradient: 'from-yellow-500 to-orange-500',
        details: [
          'Automated payment processing',
          'Invoice generation',
          'Financial reporting',
          'Tax documentation'
        ]
      },
      {
        title: 'Admin Dashboard',
        description: 'Comprehensive admin panel with role-based access and complete system oversight.',
        icon: '⚡',
        gradient: 'from-red-500 to-pink-500',
        details: [
          'Role-based access control',
          'System monitoring tools',
          'User management',
          'Audit trail logging'
        ]
      }
    ]
  
    return (
      <div className="space-y-12 animate-slide-up">
        {/* Header */}
        <div className="text-center space-y-4">
          <h2 className="text-responsive-lg font-bold text-white mb-4">
            Powerful <span className="gradient-text-blue">Features</span>
          </h2>
          <p className="text-responsive-md text-white/80 max-w-3xl mx-auto">
            Everything you need to manage your tutoring operations efficiently and effectively
          </p>
        </div>
        
        {/* Features Grid */}
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className={`icon-container bg-gradient-to-r ${feature.gradient} mb-6 group-hover:scale-110`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">{feature.title}</h3>
              <p className="text-white/80 leading-relaxed mb-6">{feature.description}</p>
              
              {/* Feature Details */}
              <div className="space-y-2">
                {feature.details.map((detail, detailIndex) => (
                  <div key={detailIndex} className="flex items-center space-x-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
                    <span className="text-white/70">{detail}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
  
        {/* Feature Highlights */}
        <div className="grid md:grid-cols-2 gap-8 mt-16">
          <div className="glass-card p-8">
            <h3 className="text-2xl font-bold text-white mb-6">For Administrators</h3>
            <div className="space-y-4">
              {[
                {
                  title: 'Complete Oversight',
                  description: 'Monitor all aspects of your tutoring business from a single dashboard'
                },
                {
                  title: 'Quality Control',
                  description: 'Ensure high teaching standards with built-in verification systems'
                },
                {
                  title: 'Financial Management',
                  description: 'Track revenue, expenses, and profitability with detailed reporting'
                },
                {
                  title: 'Scalable Operations',
                  description: 'Manage everything from small teams to large tutoring networks'
                }
              ].map((item, index) => (
                <div key={index} className="border-l-2 border-blue-400 pl-4">
                  <h4 className="font-semibold text-white">{item.title}</h4>
                  <p className="text-white/70 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
  
          <div className="glass-card p-8">
            <h3 className="text-2xl font-bold text-white mb-6">For Tutors</h3>
            <div className="space-y-4">
              {[
                {
                  title: 'Streamlined Workflow',
                  description: 'Focus on teaching while we handle the administrative tasks'
                },
                {
                  title: 'Performance Insights',
                  description: 'Track your progress and improve with detailed analytics'
                },
                {
                  title: 'Easy Session Management',
                  description: 'Log sessions, track progress, and communicate with students'
                },
                {
                  title: 'Professional Development',
                  description: 'Access tools and resources to enhance your teaching skills'
                }
              ].map((item, index) => (
                <div key={index} className="border-l-2 border-purple-400 pl-4">
                  <h4 className="font-semibold text-white">{item.title}</h4>
                  <p className="text-white/70 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
  
        {/* Integration Section */}
        <div className="glass-card p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Seamless Integration</h3>
          <p className="text-white/80 mb-6 max-w-2xl mx-auto">
            Our management platform integrates perfectly with the main Quest4Knowledge platform, 
            providing a unified experience for all stakeholders.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://quest4knowledge.co.za" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Explore Main Platform
            </a>
            <button className="btn-secondary">
              View API Documentation
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  export default FeaturesPage