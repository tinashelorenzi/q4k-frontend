import { useState } from 'react'
import apiService from '../services/api'

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitStatus({ type: 'error', message: 'Please fill in all required fields.' })
      setIsSubmitting(false)
      return
    }

    try {
      // Use API service to submit contact form
      await apiService.submitContactForm(formData)
      
      setSubmitStatus({ 
        type: 'success', 
        message: 'Thank you for your message! We\'ll get back to you within 24 hours.' 
      })
      
      // Reset form
      setFormData({ name: '', email: '', subject: '', message: '' })
      
    } catch (error) {
      console.error('Contact form error:', error)
      setSubmitStatus({ 
        type: 'error', 
        message: error.message || 'Something went wrong. Please try again later.' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-responsive-lg font-bold text-white mb-4">
          Get in <span className="gradient-text-blue">Touch</span>
        </h2>
        <p className="text-responsive-md text-white/80">Need access or support? We're here to help.</p>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Contact Information */}
        <div className="space-y-6">
          <div className="glass-card p-8">
            <h3 className="text-2xl font-semibold text-white mb-6">Contact Information</h3>
            <div className="space-y-6">
              {[
                { 
                  icon: '📧', 
                  label: 'Email',
                  text: 'admin@quest4knowledge.co.za', 
                  color: 'bg-blue-500/20 text-blue-400',
                  href: 'mailto:admin@quest4knowledge.co.za'
                },
                { 
                  icon: '📞', 
                  label: 'Phone',
                  text: '087 255 3614', 
                  color: 'bg-purple-500/20 text-purple-400',
                  href: 'tel:0872553614'
                },
                { 
                  icon: '🌐', 
                  label: 'Website',
                  text: 'quest4knowledge.co.za', 
                  color: 'bg-pink-500/20 text-pink-400', 
                  href: 'https://quest4knowledge.co.za',
                  external: true
                },
                { 
                  icon: '📍', 
                  label: 'Location',
                  text: 'South Africa', 
                  color: 'bg-green-500/20 text-green-400'
                }
              ].map((contact, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${contact.color}`}>
                    <span className="text-xl">{contact.icon}</span>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">{contact.label}</p>
                    {contact.href ? (
                      <a 
                        href={contact.href} 
                        target={contact.external ? "_blank" : "_self"}
                        rel={contact.external ? "noopener noreferrer" : ""}
                        className="text-white hover:text-blue-300 transition-colors"
                      >
                        {contact.text}
                      </a>
                    ) : (
                      <span className="text-white">{contact.text}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Access */}
          <div className="glass-card p-8">
            <h3 className="text-2xl font-semibold text-white mb-6">Quick Access</h3>
            <div className="space-y-3">
              <button className="w-full btn-primary">
                Request Admin Access
              </button>
              <button className="w-full btn-secondary">
                Tutor Portal Login
              </button>
              <a 
                href="https://quest4knowledge.co.za" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full btn-ghost text-center"
              >
                Visit Main Platform
              </a>
              <a 
                href="https://quest4knowledge.co.za/tutors-application/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full btn-ghost text-center"
              >
                Apply as Tutor
              </a>
            </div>
          </div>

          {/* Office Hours */}
          <div className="glass-card p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Support Hours</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/70">Monday - Friday</span>
                <span className="text-white">8:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Saturday</span>
                <span className="text-white">9:00 AM - 4:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Sunday</span>
                <span className="text-white/60">Closed</span>
              </div>
              <div className="text-xs text-white/50 mt-2">
                *Times are in South African Standard Time (SAST)
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="glass-card p-8">
          <h3 className="text-2xl font-semibold text-white mb-6">Send us a Message</h3>
          
          {submitStatus && (
            <div className={`mb-6 p-4 rounded-lg ${
              submitStatus.type === 'success' 
                ? 'bg-green-500/20 border border-green-500/30' 
                : 'bg-red-500/20 border border-red-500/30'
            }`}>
              <p className={`text-sm ${
                submitStatus.type === 'success' ? 'text-green-300' : 'text-red-300'
              }`}>
                {submitStatus.message}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name and Email Row */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-white font-medium mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-white font-medium mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-white font-medium mb-2">
                Subject
              </label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              >
                <option value="" className="bg-gray-800">Select a subject</option>
                <option value="admin-access" className="bg-gray-800">Request Admin Access</option>
                <option value="tutor-support" className="bg-gray-800">Tutor Support</option>
                <option value="technical-issue" className="bg-gray-800">Technical Issue</option>
                <option value="billing" className="bg-gray-800">Billing Question</option>
                <option value="general" className="bg-gray-800">General Inquiry</option>
                <option value="other" className="bg-gray-800">Other</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-white font-medium mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows="6"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-vertical"
                placeholder="Tell us how we can help you..."
                required
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full btn-primary flex items-center justify-center space-x-2 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Sending...</span>
                </>
              ) : (
                <span>Send Message</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              We typically respond within 24 hours during business days.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactPage