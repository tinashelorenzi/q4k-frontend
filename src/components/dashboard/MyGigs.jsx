import { useAuth } from '../../context/AuthContext'

const MyGigs = () => {
  const { tutorProfile } = useAuth()

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Header with Create Gig Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-white">My Gigs</h3>
          <p className="text-white/60 text-sm">Manage your tutoring services</p>
        </div>
        <button className="btn-primary text-xs sm:text-sm px-4 py-2 self-start sm:self-auto">
          + Create New Gig
        </button>
      </div>

      {/* Active Gigs */}
      <div className="glass-card p-4 sm:p-6">
        <h4 className="text-base sm:text-lg font-semibold text-white mb-4">Active Gigs</h4>
        <div className="space-y-4">
          {[
            { 
              title: 'Mathematics Tutoring', 
              subject: 'Mathematics', 
              level: 'High School & College',
              rate: '$45/hour',
              status: 'active',
              students: 8,
              rating: 4.9,
              sessions: 24
            },
            { 
              title: 'Physics Help', 
              subject: 'Physics', 
              level: 'College Level',
              rate: '$50/hour',
              status: 'active',
              students: 5,
              rating: 4.8,
              sessions: 18
            },
            { 
              title: 'Chemistry Support', 
              subject: 'Chemistry', 
              level: 'High School',
              rate: '$40/hour',
              status: 'active',
              students: 6,
              rating: 4.7,
              sessions: 15
            }
          ].map((gig, index) => (
            <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h5 className="text-white font-medium text-sm sm:text-base">{gig.title}</h5>
                    <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
                      {gig.status}
                    </span>
                  </div>
                  <p className="text-white/70 text-xs sm:text-sm mb-2">{gig.subject} • {gig.level}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm">
                    <span className="text-white/80">💰 {gig.rate}</span>
                    <span className="text-white/80">👥 {gig.students} students</span>
                    <span className="text-white/80">⭐ {gig.rating}</span>
                    <span className="text-white/80">📚 {gig.sessions} sessions</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="btn-secondary text-xs px-3 py-1">Edit</button>
                  <button className="btn-ghost text-xs px-3 py-1">Pause</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Paused Gigs */}
      <div className="glass-card p-4 sm:p-6">
        <h4 className="text-base sm:text-lg font-semibold text-white mb-4">Paused Gigs</h4>
        <div className="space-y-4">
          {[
            { 
              title: 'Biology Tutoring', 
              subject: 'Biology', 
              level: 'High School',
              rate: '$35/hour',
              status: 'paused',
              students: 3,
              rating: 4.6,
              sessions: 8
            }
          ].map((gig, index) => (
            <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10 opacity-60">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h5 className="text-white font-medium text-sm sm:text-base">{gig.title}</h5>
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full">
                      {gig.status}
                    </span>
                  </div>
                  <p className="text-white/70 text-xs sm:text-sm mb-2">{gig.subject} • {gig.level}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm">
                    <span className="text-white/80">💰 {gig.rate}</span>
                    <span className="text-white/80">👥 {gig.students} students</span>
                    <span className="text-white/80">⭐ {gig.rating}</span>
                    <span className="text-white/80">📚 {gig.sessions} sessions</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="btn-secondary text-xs px-3 py-1">Resume</button>
                  <button className="btn-ghost text-xs px-3 py-1">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gig Analytics */}
      <div className="glass-card p-4 sm:p-6">
        <h4 className="text-base sm:text-lg font-semibold text-white mb-4">Gig Performance</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">3</div>
            <div className="text-xs text-white/70">Active Gigs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">$1,240</div>
            <div className="text-xs text-white/70">Monthly Earnings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">19</div>
            <div className="text-xs text-white/70">Total Students</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">57</div>
            <div className="text-xs text-white/70">Total Sessions</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyGigs 