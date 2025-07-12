import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import apiService from '../../services/api'

const TutorSettings = () => {
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // State for all settings
  const [userSettings, setUserSettings] = useState({
    // Profile data
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    
    // Notification settings
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    marketing_emails: false,
    login_notifications: true,
    
    // Preferences
    language_preference: 'en',
    timezone: 'Africa/Johannesburg',
    date_format: 'YYYY-MM-DD',
    time_format: '24h',
    theme_preference: 'light',
    
    // Privacy settings
    profile_visible: true,
    show_online_status: true,
    show_email: false,
    show_phone: false,
    
    // Security settings
    two_factor_enabled: false,
    session_timeout: 1440
  })

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  const [tutorProfile, setTutorProfile] = useState(null)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      setLoading(true)
      
      // Load user profile
      const profileResponse = await apiService.getUserProfile()
      const settingsResponse = await apiService.getUserSettings()
      
      // Update state with current data
      setUserSettings({
        ...userSettings,
        first_name: profileResponse.user.first_name || '',
        last_name: profileResponse.user.last_name || '',
        email: profileResponse.user.email || '',
        phone_number: profileResponse.user.phone_number || '',
        ...settingsResponse
      })

      // Load tutor profile if available
      if (profileResponse.tutor_profile) {
        setTutorProfile(profileResponse.tutor_profile)
      }
      
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = (key, value) => {
    setUserSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const saveSettings = async (settingsToSave = userSettings) => {
    try {
      setSaving(true)
      
      // Separate profile data from settings data
      const profileData = {
        first_name: settingsToSave.first_name,
        last_name: settingsToSave.last_name,
        email: settingsToSave.email,
        phone_number: settingsToSave.phone_number
      }
      
      const settingsData = {
        email_notifications: settingsToSave.email_notifications,
        sms_notifications: settingsToSave.sms_notifications,
        push_notifications: settingsToSave.push_notifications,
        marketing_emails: settingsToSave.marketing_emails,
        login_notifications: settingsToSave.login_notifications,
        language_preference: settingsToSave.language_preference,
        timezone: settingsToSave.timezone,
        date_format: settingsToSave.date_format,
        time_format: settingsToSave.time_format,
        theme_preference: settingsToSave.theme_preference,
        profile_visible: settingsToSave.profile_visible,
        show_online_status: settingsToSave.show_online_status,
        show_email: settingsToSave.show_email,
        show_phone: settingsToSave.show_phone,
        two_factor_enabled: settingsToSave.two_factor_enabled,
        session_timeout: settingsToSave.session_timeout
      }

      // Save both profile and settings
      await Promise.all([
        apiService.partialUpdateUserProfile(profileData),
        apiService.partialUpdateUserSettings(settingsData)
      ])

      // Update auth context
      updateUser({ ...user, ...profileData })
      
      // Show success message (you can implement a toast notification)
      console.log('Settings saved successfully!')
      
    } catch (error) {
      console.error('Error saving settings:', error)
      // Show error message
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      alert('New passwords do not match!')
      return
    }

    try {
      await apiService.changePassword(passwordData)
      setShowPasswordModal(false)
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' })
      alert('Password changed successfully!')
    } catch (error) {
      console.error('Error changing password:', error)
      alert('Error changing password. Please check your current password.')
    }
  }

  const handleAccountDeactivation = async () => {
    const password = prompt('Enter your password to confirm deactivation:')
    if (!password) return

    try {
      await apiService.deactivateAccount(password)
      alert('Account deactivated successfully')
      // Logout user
      window.location.reload()
    } catch (error) {
      console.error('Error deactivating account:', error)
      alert('Error deactivating account. Please check your password.')
    }
  }

  // Toggle component for settings
  const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <span className="text-white text-sm sm:text-base">{label}</span>
        {description && <p className="text-white/60 text-xs">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`w-12 h-6 rounded-full relative transition-colors ${
          checked ? 'bg-blue-500' : 'bg-gray-600'
        }`}
      >
        <div
          className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )

  // Dropdown component for select options
  const SelectField = ({ value, onChange, options, label }) => (
    <div className="py-2">
      <label className="text-white text-sm block mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
      >
        {options.map(option => (
          <option key={option.value} value={option.value} className="bg-gray-800">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )

  // Input field component
  const InputField = ({ type = 'text', value, onChange, label, placeholder }) => (
    <div className="py-2">
      <label className="text-white text-sm block mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-blue-500"
      />
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <h2 className="text-2xl font-bold text-white mb-2">Settings</h2>
        <p className="text-white/70">Manage your account preferences and privacy settings</p>
      </div>

      {/* Tab Navigation */}
      <div className="glass-card p-1">
        <div className="flex space-x-1">
          {[
            { id: 'profile', label: 'Profile', icon: '👤' },
            { id: 'notifications', label: 'Notifications', icon: '🔔' },
            { id: 'preferences', label: 'Preferences', icon: '⚙️' },
            { id: 'privacy', label: 'Privacy', icon: '🔒' },
            { id: 'security', label: 'Security', icon: '🛡️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="hidden sm:inline">{tab.icon} {tab.label}</span>
              <span className="sm:hidden">{tab.icon}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="First Name"
                value={userSettings.first_name}
                onChange={(value) => handleSettingChange('first_name', value)}
                placeholder="Enter your first name"
              />
              <InputField
                label="Last Name"
                value={userSettings.last_name}
                onChange={(value) => handleSettingChange('last_name', value)}
                placeholder="Enter your last name"
              />
              <InputField
                type="email"
                label="Email Address"
                value={userSettings.email}
                onChange={(value) => handleSettingChange('email', value)}
                placeholder="Enter your email"
              />
              <InputField
                type="tel"
                label="Phone Number"
                value={userSettings.phone_number}
                onChange={(value) => handleSettingChange('phone_number', value)}
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          {tutorProfile && (
            <div className="glass-card p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Tutor Profile</h3>
              <div className="space-y-2 text-white/70">
                <div className="flex justify-between">
                  <span>Hourly Rate:</span>
                  <span>R{tutorProfile.hourly_rate || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Experience:</span>
                  <span>{tutorProfile.years_of_experience || 0} years</span>
                </div>
                <div className="flex justify-between">
                  <span>Subjects:</span>
                  <span>{tutorProfile.subjects_of_expertise || 'Not specified'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Notification Preferences</h3>
          <div className="space-y-1">
            <ToggleSwitch
              checked={userSettings.email_notifications}
              onChange={(checked) => handleSettingChange('email_notifications', checked)}
              label="Email Notifications"
              description="Receive notifications via email"
            />
            <ToggleSwitch
              checked={userSettings.sms_notifications}
              onChange={(checked) => handleSettingChange('sms_notifications', checked)}
              label="SMS Notifications"
              description="Receive notifications via SMS"
            />
            <ToggleSwitch
              checked={userSettings.push_notifications}
              onChange={(checked) => handleSettingChange('push_notifications', checked)}
              label="Push Notifications"
              description="Receive browser push notifications"
            />
            <ToggleSwitch
              checked={userSettings.marketing_emails}
              onChange={(checked) => handleSettingChange('marketing_emails', checked)}
              label="Marketing Emails"
              description="Receive promotional and marketing emails"
            />
            <ToggleSwitch
              checked={userSettings.login_notifications}
              onChange={(checked) => handleSettingChange('login_notifications', checked)}
              label="Login Notifications"
              description="Get notified of new login attempts"
            />
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold text-white mb-4">App Preferences</h3>
          <div className="space-y-4">
            <SelectField
              label="Language"
              value={userSettings.language_preference}
              onChange={(value) => handleSettingChange('language_preference', value)}
              options={[
                { value: 'en', label: 'English' },
                { value: 'af', label: 'Afrikaans' },
                { value: 'zu', label: 'Zulu' },
                { value: 'xh', label: 'Xhosa' }
              ]}
            />
            <SelectField
              label="Theme"
              value={userSettings.theme_preference}
              onChange={(value) => handleSettingChange('theme_preference', value)}
              options={[
                { value: 'light', label: 'Light Theme' },
                { value: 'dark', label: 'Dark Theme' },
                { value: 'auto', label: 'Auto (System)' }
              ]}
            />
            <SelectField
              label="Date Format"
              value={userSettings.date_format}
              onChange={(value) => handleSettingChange('date_format', value)}
              options={[
                { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-12-31)' },
                { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2024)' },
                { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2024)' },
                { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY (31-12-2024)' }
              ]}
            />
            <SelectField
              label="Time Format"
              value={userSettings.time_format}
              onChange={(value) => handleSettingChange('time_format', value)}
              options={[
                { value: '24h', label: '24 Hour (14:30)' },
                { value: '12h', label: '12 Hour (2:30 PM)' }
              ]}
            />
            <InputField
              type="number"
              label="Session Timeout (minutes)"
              value={userSettings.session_timeout}
              onChange={(value) => handleSettingChange('session_timeout', parseInt(value))}
              placeholder="1440"
            />
          </div>
        </div>
      )}

      {/* Privacy Tab */}
      {activeTab === 'privacy' && (
        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Privacy Settings</h3>
          <div className="space-y-1">
            <ToggleSwitch
              checked={userSettings.profile_visible}
              onChange={(checked) => handleSettingChange('profile_visible', checked)}
              label="Profile Visibility"
              description="Show your profile to other users"
            />
            <ToggleSwitch
              checked={userSettings.show_online_status}
              onChange={(checked) => handleSettingChange('show_online_status', checked)}
              label="Online Status"
              description="Show when you're available"
            />
            <ToggleSwitch
              checked={userSettings.show_email}
              onChange={(checked) => handleSettingChange('show_email', checked)}
              label="Show Email"
              description="Display email address in profile"
            />
            <ToggleSwitch
              checked={userSettings.show_phone}
              onChange={(checked) => handleSettingChange('show_phone', checked)}
              label="Show Phone"
              description="Display phone number in profile"
            />
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Security Settings</h3>
            <div className="space-y-4">
              <ToggleSwitch
                checked={userSettings.two_factor_enabled}
                onChange={(checked) => handleSettingChange('two_factor_enabled', checked)}
                label="Two-Factor Authentication"
                description="Add an extra layer of security to your account"
              />
              
              <div className="border-t border-white/20 pt-4">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full btn-secondary text-left p-3 rounded-xl"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm sm:text-base">Change Password</span>
                    <span className="text-xl">🔒</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="glass-card p-6 border-l-4 border-red-500">
            <h3 className="text-xl font-semibold text-white mb-4">Danger Zone</h3>
            <div className="space-y-3">
              <button
                onClick={handleAccountDeactivation}
                className="w-full btn-secondary text-left p-3 rounded-xl border border-red-500/20 hover:border-red-500/40"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base text-red-300">Deactivate Account</span>
                  <span className="text-xl">⚠️</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="glass-card p-4">
        <button
          onClick={() => saveSettings()}
          disabled={saving}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-purple-700 transition-all"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glass-card p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-4">Change Password</h3>
            <div className="space-y-4">
              <InputField
                type="password"
                label="Current Password"
                value={passwordData.current_password}
                onChange={(value) => setPasswordData(prev => ({ ...prev, current_password: value }))}
                placeholder="Enter current password"
              />
              <InputField
                type="password"
                label="New Password"
                value={passwordData.new_password}
                onChange={(value) => setPasswordData(prev => ({ ...prev, new_password: value }))}
                placeholder="Enter new password"
              />
              <InputField
                type="password"
                label="Confirm New Password"
                value={passwordData.confirm_password}
                onChange={(value) => setPasswordData(prev => ({ ...prev, confirm_password: value }))}
                placeholder="Confirm new password"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 btn-secondary py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordChange}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TutorSettings