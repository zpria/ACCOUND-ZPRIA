
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ZPRIA_MAIN_LOGO } from './constants';

const HelpPage: React.FC = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      q: "What is a Zipra Account?",
      a: "A Zipra Account is the personal account you use to access Zipra services like the App Store, iCloud, Messages, the Zipra Online Store, FaceTime, and more. It includes the information you use to sign in, as well as all the contact, payment, and security details that you’ll use across Zipra services."
    },
    {
      q: "What is the difference between a ZPRIA ID and a Zipra Account?",
      a: "With the latest releases of ZPRIA OS, ZPRIA ID is renamed to Zipra Account for a consistent sign-in experience across Zipra services and devices, and relies on a user’s existing credentials."
    },
    {
      q: "When do I use my Zipra Account?",
      a: "Any time you set up a new device, make a purchase, or use any Zipra service, you will be asked to sign in with your Zipra Account email or phone number and password. Once signed in you’ll have access to the service and all your personal information."
    },
    {
      q: "How many Zipra Accounts do I need?",
      a: "Just one. Use the same Zipra Account everywhere you sign in to ensure that all your Zipra services and devices work together seamlessly and you can access your personal information from all your devices."
    },
    {
      q: "If I have multiple Zipra Accounts can I merge them together?",
      a: "Zipra Accounts are for individual use and cannot be merged together."
    },
    {
      q: "Can I share a Zipra Account with someone else?",
      a: "Your Zipra Account should not be shared with anyone else. It provides access to your personal information including contacts, photos, device backups, and more. Sharing your Zipra Account with someone else means you are giving them access to all your personal content and may lead to confusion over who actually owns the account."
    },
    {
      q: "How can I keep my Zipra Account secure?",
      a: "Security and privacy are very important to Zipra and we provide a number of ways to secure your Zipra Account and protect your privacy including strong passwords, two-factor authentication, and more."
    },
    {
      q: "Do I have to pay for a Zipra Account?",
      a: "No, you do not need to pay for a Zipra Account. It is a free service provided to all users of the Zipra ecosystem."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="max-w-[1000px] mx-auto pt-16 pb-24 px-6 reveal-node flex flex-col items-center">
        <div className="mb-12">
          <ZPRIA_MAIN_LOGO className="w-[120px] h-[120px] md:w-[160px] md:h-[160px]" />
        </div>
        <h1 className="text-[40px] md:text-[56px] font-black tracking-tighter text-[#1d1d1f] text-center leading-tight mb-4 uppercase">
          Zipra Account Support
        </h1>
        <Link to="/signup" className="text-[#0066cc] text-[17px] font-medium hover:underline flex items-center gap-1">
          Learn more about Zipra Account <span className="text-xs">→</span>
        </Link>
      </div>

      {/* Quick Actions Grid */}
      <div className="bg-[#f5f5f7] py-24">
        <div className="max-w-[1000px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Forgot Password */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-2">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
              <h2 className="text-[21px] font-black text-[#1d1d1f] uppercase tracking-tight">Forgot your password?</h2>
              <p className="text-[15px] text-[#424245] leading-relaxed">
                Here’s how to reset your Zipra Account password and regain access to your account.
              </p>
              <button 
                onClick={() => navigate('/forgot-password')}
                className="mt-4 px-6 py-2 bg-[#0071e3] text-white rounded-full text-[14px] font-black uppercase tracking-wider hover:bg-[#0077ed] transition-all"
              >
                Reset your password
              </button>
            </div>

            {/* Locked Account */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-2">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              </div>
              <h2 className="text-[21px] font-black text-[#1d1d1f] uppercase tracking-tight">Access a locked account</h2>
              <p className="text-[15px] text-[#424245] leading-relaxed">
                Learn how to request access if your account is locked, inactive, or disabled.
              </p>
              <Link to="/support" className="text-[#0066cc] text-[15px] font-medium hover:underline flex items-center gap-1 mt-2">
                Regain access <span className="text-xs">→</span>
              </Link>
            </div>

            {/* Update Details */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-2">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <h2 className="text-[21px] font-black text-[#1d1d1f] uppercase tracking-tight">Update account details</h2>
              <p className="text-[15px] text-[#424245] leading-relaxed">
                Sign in to review or update important information like your name, password, and security details.
              </p>
              <button 
                onClick={() => navigate('/signin')}
                className="text-[#0066cc] text-[15px] font-medium hover:underline flex items-center gap-1 mt-2"
              >
                Sign in <span className="text-xs">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-[800px] mx-auto py-24 px-6">
        <h2 className="text-[32px] md:text-[40px] font-black text-[#1d1d1f] mb-12 tracking-tighter uppercase text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-12">
          {faqs.map((faq, i) => (
            <div key={i} className="space-y-4">
              <h3 className="text-[19px] md:text-[22px] font-black text-[#1d1d1f] tracking-tight">
                {faq.q}
              </h3>
              <p className="text-[17px] text-[#424245] leading-relaxed font-medium">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-gray-100 bg-[#fbfbfd] py-16">
        <div className="max-w-[1000px] mx-auto px-6 text-center">
          <p className="text-[15px] text-[#86868b] mb-8 max-w-2xl mx-auto">
            For more information or help, visit Zipra Support. We are committed to providing you with the best possible experience.
          </p>
          <button 
            onClick={() => navigate(-1)} 
            className="px-16 py-4 bg-[#1d1d1f] text-white rounded-full font-black text-[16px] tracking-[0.2em] uppercase hover:scale-105 transition-all shadow-xl"
          >
            OK
          </button>
          <div className="mt-12 pt-12 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[11px] text-[#86868b] font-black uppercase tracking-[0.3em]">
              Copyright © 2026 Zipra Inc. All rights reserved.
            </p>
            <div className="flex gap-6 text-[11px] font-black uppercase tracking-[0.2em] text-[#86868b]">
              <Link to="/privacy" className="hover:text-[#1d1d1f]">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-[#1d1d1f]">Terms of Use</Link>
              <Link to="/legal" className="hover:text-[#1d1d1f]">Legal</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
