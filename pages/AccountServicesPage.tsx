
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Smartphone, User, Lock, ChevronRight } from 'lucide-react';
import { ZPRIA_MAIN_LOGO } from '../constants';

const AccountServicesPage: React.FC = () => {
  const services = [
    {
      id: 'profile',
      title: 'Profile Information',
      description: 'Update your name, email, phone number, and other personal details',
      icon: User,
      path: '/account/profile',
      color: 'bg-blue-500',
    },
    {
      id: 'security',
      title: 'Security',
      description: 'Manage passwords, two-factor authentication, and active sessions',
      icon: Shield,
      path: '/security',
      color: 'bg-green-500',
    },
    {
      id: 'devices',
      title: 'Devices',
      description: 'View and manage devices signed in to your account',
      icon: Smartphone,
      path: '/security/devices',
      color: 'bg-purple-500',
    },
    {
      id: 'privacy',
      title: 'Privacy & Data',
      description: 'Control your privacy settings and manage your data',
      icon: Lock,
      path: '/privacy',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f7] py-12 px-6">
      <div className="max-w-[800px] mx-auto">
        {/* Header */}
        <header className="mb-12 text-center">
          <Link to="/" className="inline-block mb-6">
            <ZPRIA_MAIN_LOGO className="w-16 h-16 mx-auto" />
          </Link>
          <h1 className="text-[40px] md:text-[48px] font-semibold text-[#1d1d1f] tracking-tight mb-4">
            Account Services
          </h1>
          <p className="text-[19px] text-[#86868b]">
            Manage your ZPRIA account settings and preferences
          </p>
        </header>

        {/* Services Grid */}
        <div className="space-y-4">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Link
                key={service.id}
                to={service.path}
                className="flex items-center gap-4 bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all group"
              >
                <div className={`w-14 h-14 ${service.color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-1">
                    {service.title}
                  </h3>
                  <p className="text-[14px] text-[#86868b]">
                    {service.description}
                  </p>
                </div>
                <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-[#0071e3] transition-colors" />
              </Link>
            );
          })}
        </div>

        {/* Help Section */}
        <div className="mt-12 text-center">
          <p className="text-[14px] text-[#86868b] mb-4">
            Need help with your account?
          </p>
          <Link 
            to="/support" 
            className="text-[#0071e3] font-semibold hover:underline"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccountServicesPage;
