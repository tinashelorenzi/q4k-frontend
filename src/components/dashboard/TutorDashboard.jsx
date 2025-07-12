import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

// Import your existing dashboard components
import Overview from './Overview'
import MyGigs from './MyGigs' 
import TutorSessions from './TutorSessions'
import TutorSettings from './TutorSettings'

const TutorDashboard = () => {
  const { user, tutorProfile, tutor, getFormattedTutorId } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)

  // Define your tabs
  const tabs = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: '📊',
      component: Overview 
    },
    { 
      id: 'gigs', 
      label: 'My Gigs', 
      icon: '📚',
      component: MyGigs 
    },
    { 
      id: 'sessions', 
      label: 'Sessions', 
      icon: '⏰',
      component: TutorSessions 
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: '⚙️',
      component: TutorSettings 
    }
  ]

  // Get the current active component
  const getCurrentComponent = () => {
    const currentTab = tabs.find(tab => tab.id === activeTab)
    if (currentTab && currentTab.component) {
      const Component = currentTab.component
      return <Component />
    }
    return <Overview /> // Fallback to overview
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading Dashboard</h2>
          <p className="text-white/70">Please wait...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Welcome back, {user?.first_name || 'Tutor'}! 👋
            </h1>
            <p className="text-white/70">
            Tutor ID: {getFormattedTutorId()} • Ready to inspire minds today?
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {user?.first_name?.charAt(0) || 'T'}
                </span>
              </div>
              <div className="text-right">
                <p className="text-white font-medium text-sm">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-white/60 text-xs">
                  Active Tutor
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="glass-card p-1">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {getCurrentComponent()}
      </div>
    </div>
  )
}

export default TutorDashboard