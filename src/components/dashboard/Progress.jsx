const Progress = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="glass-card p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Learning Progress</h3>
        
        <div className="space-y-4">
          {[
            { subject: 'Mathematics', progress: 85, color: 'bg-blue-500' },
            { subject: 'Physics', progress: 72, color: 'bg-green-500' },
            { subject: 'Chemistry', progress: 90, color: 'bg-purple-500' },
            { subject: 'Biology', progress: 68, color: 'bg-yellow-500' }
          ].map((subject, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white text-sm sm:text-base font-medium">{subject.subject}</span>
                <span className="text-white/70 text-xs sm:text-sm">{subject.progress}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className={`${subject.color} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${subject.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="glass-card p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Recent Achievements</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { title: 'Math Genius', icon: '🏆', description: 'Completed 10 math sessions' },
            { title: 'Perfect Week', icon: '⭐', description: 'Attended all sessions' },
            { title: 'Fast Learner', icon: '🚀', description: 'Improved 20% this month' }
          ].map((achievement, index) => (
            <div key={index} className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
              <div className="text-2xl mb-2">{achievement.icon}</div>
              <h4 className="text-white text-xs sm:text-sm font-medium mb-1">{achievement.title}</h4>
              <p className="text-white/60 text-xs">{achievement.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Progress 