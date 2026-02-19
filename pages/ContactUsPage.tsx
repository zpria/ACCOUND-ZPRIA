
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ZPRIA_MAIN_LOGO } from '../constants';
import LoadingOverlay from '../components/LoadingOverlay';
import { Send, AlertCircle, CheckCircle, Mail, User, Building, MessageSquare, ChevronDown } from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  category: string;
  department: string;
  subject: string;
  description: string;
}

const categories = [
  { value: '', label: 'Select a category' },
  { value: 'account-access', label: 'Account Access Issue' },
  { value: 'password-reset', label: 'Password Reset Problem' },
  { value: 'verification', label: 'Email/Phone Verification' },
  { value: 'security', label: 'Security Concern' },
  { value: 'billing', label: 'Billing & Subscription' },
  { value: 'technical', label: 'Technical Issue' },
  { value: 'feature-request', label: 'Feature Request' },
  { value: 'other', label: 'Other' }
];

const departments = [
  { value: '', label: 'Select department' },
  { value: 'technical-support', label: 'Technical Support' },
  { value: 'account-security', label: 'Account Security' },
  { value: 'billing', label: 'Billing Department' },
  { value: 'customer-service', label: 'Customer Service' },
  { value: 'enterprise', label: 'Enterprise Solutions' }
];

const ContactUsPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    category: '',
    department: '',
    subject: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Prepare email data
    const emailData = {
      to: 'help.zpria@gmail.com',
      subject: `[ZPRIA Support] ${formData.subject}`,
      body: `
Name: ${formData.name}
Email: ${formData.email}
Category: ${categories.find(c => c.value === formData.category)?.label}
Department: ${departments.find(d => d.value === formData.department)?.label}

Description:
${formData.description}
      `,
      formData: formData
    };

    try {
      // Here you would typically send to your backend
      // For now, we'll simulate the email sending
      console.log('Sending email to help.zpria@gmail.com:', emailData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        category: '',
        department: '',
        subject: '',
        description: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-[1024px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <ZPRIA_MAIN_LOGO className="w-10 h-10" />
            <span className="text-[21px] font-semibold text-[#1d1d1f]">ZPRIA Support</span>
          </Link>
          <nav className="flex items-center gap-8">
            <Link to="/support" className="text-[12px] text-[#1d1d1f] hover:text-blue-600 transition-colors">Support Home</Link>
            <Link to="/help" className="text-[12px] text-[#1d1d1f] hover:text-blue-600 transition-colors">Help</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-16 px-6">
        <div className="max-w-[680px] mx-auto">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-[40px] md:text-[48px] font-semibold text-[#1d1d1f] tracking-tight mb-4">
              Contact Us
            </h1>
            <p className="text-[19px] text-[#86868b] max-w-[500px] mx-auto">
              Tell us about your issue so we can help you better. We typically respond within 24 hours.
            </p>
          </div>

          {/* Success Message */}
          {submitStatus === 'success' && (
            <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-[17px] font-semibold text-green-800 mb-1">Thank you for contacting us!</h3>
                <p className="text-[14px] text-green-700">
                  Your message has been sent to our support team. We'll get back to you at {formData.email || 'your email'} as soon as possible.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {submitStatus === 'error' && (
            <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-[17px] font-semibold text-red-800 mb-1">Something went wrong</h3>
                <p className="text-[14px] text-red-700">
                  Please try again later or contact us directly at help.zpria@gmail.com
                </p>
              </div>
            </div>
          )}

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-200">
            {/* Name Field */}
            <div className="mb-6">
              <label htmlFor="name" className="block text-[14px] font-semibold text-[#1d1d1f] mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                  className="w-full pl-12 pr-4 py-4 bg-[#f5f5f7] rounded-xl text-[17px] text-[#1d1d1f] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="mb-6">
              <label htmlFor="email" className="block text-[14px] font-semibold text-[#1d1d1f] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your.email@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-[#f5f5f7] rounded-xl text-[17px] text-[#1d1d1f] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Category Dropdown */}
            <div className="mb-6">
              <label htmlFor="category" className="block text-[14px] font-semibold text-[#1d1d1f] mb-2">
                What is your issue about?
              </label>
              <div className="relative">
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full pl-4 pr-12 py-4 bg-[#f5f5f7] rounded-xl text-[17px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Department Dropdown */}
            <div className="mb-6">
              <label htmlFor="department" className="block text-[14px] font-semibold text-[#1d1d1f] mb-2">
                Which department should handle this?
              </label>
              <div className="relative">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-12 py-4 bg-[#f5f5f7] rounded-xl text-[17px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                >
                  {departments.map(dept => (
                    <option key={dept.value} value={dept.value}>{dept.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Subject Field */}
            <div className="mb-6">
              <label htmlFor="subject" className="block text-[14px] font-semibold text-[#1d1d1f] mb-2">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="Brief summary of your issue"
                className="w-full px-4 py-4 bg-[#f5f5f7] rounded-xl text-[17px] text-[#1d1d1f] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Description Field */}
            <div className="mb-8">
              <label htmlFor="description" className="block text-[14px] font-semibold text-[#1d1d1f] mb-2">
                Describe your issue in detail
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Please provide as much detail as possible about your issue..."
                  className="w-full pl-12 pr-4 py-4 bg-[#f5f5f7] rounded-xl text-[17px] text-[#1d1d1f] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-[#0071e3] text-white rounded-xl font-semibold text-[17px] hover:bg-[#0077ed] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Message
                </>
              )}
            </button>

            <p className="mt-6 text-center text-[12px] text-[#86868b]">
              By submitting this form, you agree to our{' '}
              <Link to="/privacy" className="text-[#0071e3] hover:underline">Privacy Policy</Link>
              {' '}and{' '}
              <Link to="/terms" className="text-[#0071e3] hover:underline">Terms of Service</Link>.
            </p>
          </form>

          {/* Alternative Contact */}
          <div className="mt-12 text-center">
            <p className="text-[14px] text-[#86868b]">
              Prefer to email us directly?{' '}
              <a 
                href="mailto:help.zpria@gmail.com" 
                className="text-[#0071e3] hover:underline font-medium"
              >
                help.zpria@gmail.com
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 px-6">
        <div className="max-w-[1024px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-[#86868b]">
            Copyright &copy; {new Date().getFullYear()} ZPRIA Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-[12px] text-[#424245] hover:underline">Privacy Policy</Link>
            <Link to="/terms" className="text-[12px] text-[#424245] hover:underline">Terms of Use</Link>
            <Link to="/support" className="text-[12px] text-[#424245] hover:underline">Support</Link>
          </div>
        </div>
      </footer>
      
      <LoadingOverlay isLoading={isSubmitting} />
    </div>
  );
};

export default ContactUsPage;
