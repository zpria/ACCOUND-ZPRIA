
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ZPRIA_MAIN_LOGO } from './constants';
import { Search, Lock, User, Mail, Phone, Shield, HelpCircle, MessageCircle, ChevronRight } from 'lucide-react';

const SupportCard = ({ 
  icon: Icon, 
  title, 
  description, 
  onClick,
  href
}: { 
  icon: React.ElementType, 
  title: string, 
  description: string, 
  onClick?: () => void,
  href?: string
}) => {
  const content = (
    <>
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
        <Icon className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
      </div>
      <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-2">{title}</h3>
      <p className="text-[14px] text-[#86868b] leading-relaxed">{description}</p>
    </>
  );

  const className = "group block p-6 bg-white border border-gray-200 rounded-2xl hover:shadow-lg transition-all duration-300 text-left";

  if (href) {
    return (
      <Link to={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={className}>
      {content}
    </button>
  );
};

const TopicLink = ({ title, href }: { title: string, href: string }) => (
  <Link 
    to={href} 
    className="flex items-center justify-between py-4 border-b border-gray-100 hover:bg-gray-50 px-4 -mx-4 rounded-lg transition-colors group"
  >
    <span className="text-[17px] text-[#1d1d1f] group-hover:text-blue-600 transition-colors">{title}</span>
    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
  </Link>
);

const SupportPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search functionality can be implemented here
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-[1024px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <ZPRIA_MAIN_LOGO className="w-10 h-10" />
            <span className="text-[21px] font-semibold text-[#1d1d1f]">ZPRIA Account</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/help" className="text-[12px] text-[#1d1d1f] hover:text-blue-600 transition-colors">Help</Link>
            <Link to="/contact" className="text-[12px] text-[#1d1d1f] hover:text-blue-600 transition-colors">Contact</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white pb-16 pt-12">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <h1 className="text-[40px] md:text-[48px] font-semibold text-[#1d1d1f] tracking-tight mb-4">
            ZPRIA Account Support
          </h1>
          <p className="text-[19px] text-[#86868b] mb-10 max-w-[600px] mx-auto">
            Learn how to set up and use your ZPRIA Account. Find all the topics, resources, and contact options you need.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative max-w-[600px] mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search Support"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-[#f5f5f7] rounded-xl text-[17px] text-[#1d1d1f] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </form>
        </div>
      </section>

      {/* Quick Links Grid */}
      <section className="py-16 px-6">
        <div className="max-w-[1024px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SupportCard
              icon={Lock}
              title="Forgot Password"
              description="Reset your password or recover account access quickly and securely."
              href="/forgot-password"
            />
            <SupportCard
              icon={User}
              title="Account Settings"
              description="Manage your profile, security settings, and preferences."
              href="/account-services"
            />
            <SupportCard
              icon={Shield}
              title="Privacy & Security"
              description="Learn about our Z to A Privacy Protocol and security features."
              href="/policy"
            />
            <SupportCard
              icon={Mail}
              title="Verify Email"
              description="Confirm your email address to secure your account."
              href="/verify-email"
            />
            <SupportCard
              icon={Phone}
              title="Phone Verification"
              description="Add and verify your phone number for extra security."
              href="/verify-phone"
            />
            <SupportCard
              icon={MessageCircle}
              title="Contact Support"
              description="Get in touch with our support team for personalized help."
              href="/contact"
            />
          </div>
        </div>
      </section>

      {/* Topics Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-[800px] mx-auto">
          <h2 className="text-[28px] font-semibold text-[#1d1d1f] mb-8">Popular Topics</h2>
          <div className="space-y-0">
            <TopicLink title="How to create a ZPRIA Account" href="/signup" />
            <TopicLink title="Sign in to your account" href="/signin" />
            <TopicLink title="Change or reset your password" href="/forgot-password" />
            <TopicLink title="Update your account information" href="/account-services" />
            <TopicLink title="Two-factor authentication" href="/help" />
            <TopicLink title="Account security best practices" href="/policy" />
            <TopicLink title="Delete or deactivate your account" href="/contact" />
            <TopicLink title="Troubleshooting sign-in issues" href="/diagnostics" />
          </div>
        </div>
      </section>

      {/* Contact Banner */}
      <section className="py-16 px-6">
        <div className="max-w-[800px] mx-auto text-center">
          <div className="bg-[#1d1d1f] rounded-3xl p-10 md:p-16">
            <HelpCircle className="w-12 h-12 text-white mx-auto mb-6" />
            <h2 className="text-[28px] md:text-[32px] font-semibold text-white mb-4">
              Still need help?
            </h2>
            <p className="text-[17px] text-gray-400 mb-8 max-w-[500px] mx-auto">
              Our support team is available 24/7 to assist you with any questions or concerns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/contact"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-[#1d1d1f] rounded-full font-medium hover:bg-gray-100 transition-colors"
              >
                Contact Support
              </Link>
              <Link 
                to="/help"
                className="inline-flex items-center justify-center px-8 py-3 border border-gray-600 text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
              >
                Browse Help Topics
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#f5f5f7] border-t border-gray-200 py-8 px-6">
        <div className="max-w-[1024px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-[#86868b]">
            Copyright &copy; {new Date().getFullYear()} ZPRIA Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-[12px] text-[#424245] hover:underline">Privacy Policy</Link>
            <Link to="/terms" className="text-[12px] text-[#424245] hover:underline">Terms of Use</Link>
            <Link to="/legal" className="text-[12px] text-[#424245] hover:underline">Legal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SupportPage;
