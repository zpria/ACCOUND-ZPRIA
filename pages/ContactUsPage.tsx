
import React from 'react';
import { Link } from 'react-router-dom';
// Fix: Use ZPRIA_MAIN_LOGO instead of non-existent ZIPRA_LOGO
import { ZPRIA_MAIN_LOGO } from '../constants';

const ContactUsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white py-32 px-6">
      <div className="max-w-[1000px] mx-auto reveal-node">
        <header className="mb-20">
          {/* Fix: Use ZPRIA_MAIN_LOGO and remove color prop */}
          <Link to="/support"><ZPRIA_MAIN_LOGO className="w-14 h-14 mb-10" /></Link>
          <h1 className="text-[54px] md:text-[72px] font-black tracking-tighter text-gray-900 leading-none">Contact <span className="text-blue-500">Identity</span></h1>
          <p className="text-2xl text-gray-400 font-medium mt-6">The ZPRIA Identity Group is here to resolve your structural access needs.</p>
        </header>

        <div className="bg-gray-50 p-16 rounded-[4rem] text-center">
           <h3 className="text-4xl font-black text-gray-900 mb-8 uppercase tracking-tight">Connect with a Specialist</h3>
           <p className="text-xl text-gray-500 font-medium max-w-xl mx-auto mb-12 leading-relaxed">For enterprise identity provisioning or critical security restoration, our specialists are available 24/7 globally.</p>
           <button className="px-16 py-5 btn-premium text-white font-black rounded-full uppercase tracking-widest text-lg shadow-xl">Initiate Session</button>
        </div>

        <div className="mt-20 text-center">
           <Link to="/support" className="text-blue-500 font-black uppercase tracking-[0.2em] text-[12px] hover:underline">Back to Support</Link>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;
