import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, ChevronLeft, ArrowRight, Check } from 'lucide-react';
import { supabase, hashPassword } from '../services/supabaseService';
import LoadingOverlay from '../components/LoadingOverlay';

const PasswordVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const savedUser = localStorage.getItem('zpria_user');
      if (!savedUser) {
        navigate('/signin');
        return;
      }
      
      const userData = JSON.parse(savedUser);
      const hPassword = await hashPassword(password);
      
      // Verify password against database
      const { data, error: authError } = await supabase
        .from('users')
        .select('id, password_hash')
        .eq('id', userData.id)
        .single();
      
      if (authError) throw authError;
      
      if (data.password_hash !== hPassword) {
        throw new Error('Incorrect password');
      }
      
      // Password verified - set verification flag and redirect to security settings
      setIsVerified(true);
      setTimeout(() => {
        navigate('/security-settings');
      }, 1000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to verify password');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 shadow-sm max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-[24px] font-semibold text-[#1d1d1f] mb-2">Password Verified</h2>
          <p className="text-[#86868b] mb-6">Redirecting to security settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] py-8 px-4">
      <div className="max-w-[500px] mx-auto">
        {/* Header */}
        <header className="mb-8">
          <button 
            onClick={() => navigate('/account-services')}
            className="flex items-center gap-2 text-[#0071e3] font-medium mb-4 hover:underline"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Account Services
          </button>
          
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#0071e3] rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-[32px] font-semibold text-[#1d1d1f] mb-2">Security Verification</h1>
              <p className="text-[#86868b]">Please enter your password to access security settings</p>
            </div>
          </div>
        </header>

        {/* Verification Form */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#86868b] mb-2">
                Account Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !password}
              className="w-full px-6 py-4 bg-[#0071e3] text-white rounded-full font-semibold hover:bg-[#0051a3] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify Password
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
      
      {isLoading && <LoadingOverlay isLoading={true} message="Verifying password..." />}
    </div>
  );
};

export default PasswordVerificationPage;