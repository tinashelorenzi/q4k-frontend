const Sessions = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="glass-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-white">Upcoming Sessions</h3>
          <button className="btn-primary text-xs sm:text-sm px-3 py-2 self-start sm:self-auto">
            + Book Session
          </button>
        </div>
        
        <div className="space-y-3">
          {[
            { subject: 'Mathematics', tutor: 'Dr. Smith', time: 'Today, 3:00 PM', duration: '1 hour' },
            { subject: 'Physics', tutor: 'Prof. Johnson', time: 'Tomorrow, 10:00 AM', duration: '1.5 hours' },
            { subject: 'Chemistry', tutor: 'Ms. Brown', time: 'Friday, 2:00 PM', duration: '1 hour' }
          ].map((session, index) => (
            <div key={index} className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="flex-1">
                  <h4 className="text-white font-medium text-sm sm:text-base">{session.subject}</h4>
                  <p className="text-white/70 text-xs sm:text-sm">with {session.tutor}</p>
                  <p className="text-white/60 text-xs">{session.time} • {session.duration}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="btn-secondary text-xs px-3 py-1">Join</button>
                  <button className="btn-ghost text-xs px-3 py-1">Reschedule</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Sessions 