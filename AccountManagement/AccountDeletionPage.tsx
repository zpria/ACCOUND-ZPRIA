import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trash2, AlertTriangle, User, Mail, MessageCircle, Heart, Shield, X } from 'lucide-react';
import { supabase } from '../services/supabaseService';

interface DeletionReason {
  id: string;
  title: string;
  description: string;
  icon: any;
}

const AccountDeletionPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'reason' | 'confirm' | 'password' | 'otp' | 'complete'>('reason');
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const deletionReasons: DeletionReason[] = [
    {
      id: 'privacy',
      title: 'Privacy Concerns',
      description: 'I\'m concerned about how my data is being used',
      icon: Shield
    },
    {
      id: 'unused',
      title: 'No Longer Use',
      description: 'I don\'t use this account anymore',
      icon: User
    },
    {
      id: 'better_option',
      title: 'Found Better Alternative',
      description: 'I found a better service/platform',
      icon: Heart
    },
    {
      id: 'technical_issues',
      title: 'Technical Issues',
      description: 'I\'m experiencing too many bugs or problems',
      icon: AlertTriangle
    },
    {
      id: 'support',
      title: 'Poor Support',
      description: 'Customer support hasn\'t been helpful',
      icon: MessageCircle
    },
    {
      id: 'other',
      title: 'Other Reason',
      description: 'Something else (please specify)',
      icon: Mail
    }
  ];

  const handleReasonSelect = (reasonId: string) => {
    setSelectedReason(reasonId);
    if (reasonId !== 'other') {
      setCustomReason('');
    }
  };

  const handleContinue = () => {
    if (step === 'reason') {
      if (!selectedReason) {
        setError('Please select a reason for deleting your account');
        return;
      }
      if (selectedReason === 'other' && !customReason.trim()) {
        setError('Please specify your reason');
        return;
      }
      setStep('confirm');
      setError('');
    } else if (step === 'confirm') {
      setStep('password');
    }
  };

  const handlePasswordSubmit = async () => {
    if (!password) {
      setError('Please enter your password');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      // Verify password
      const savedUser = localStorage.getItem('zpria_user');
      if (!savedUser) {
        throw new Error('User not found');
      }

      const userData = JSON.parse(savedUser);
      
      // In a real implementation, you would verify the password against the database
      // For now, we'll simulate this
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Send OTP to user's email
      await sendOtpToEmail(userData.email);

      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to verify password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendOtpToEmail = async (email: string) => {
    // In a real implementation, you would send an actual OTP
    // For now, we'll just simulate it
    console.log(`Sending OTP to ${email}`);
    // Store OTP in localStorage for verification (in real app, this would be server-side)
    const fakeOtp = '123456';
    localStorage.setItem('account_deletion_otp', fakeOtp);
  };

  const handleOtpSubmit = async () => {
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      // Verify OTP
      const storedOtp = localStorage.getItem('account_deletion_otp');
      if (otp !== storedOtp) {
        throw new Error('Invalid OTP');
      }

      // Deactivate account
      await deactivateAccount();

      setStep('complete');
      localStorage.removeItem('account_deletion_otp');
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deactivateAccount = async () => {
    const savedUser = localStorage.getItem('zpria_user');
    if (!savedUser) {
      throw new Error('User not found');
    }

    const userData = JSON.parse(savedUser);
    
    const deletionScheduledFor = new Date();
    deletionScheduledFor.setDate(deletionScheduledFor.getDate() + 30); // 30 days from now

    const { error } = await supabase
      .from('users')
      .update({
        account_status: 'deactivated',
        deactivated_at: new Date().toISOString(),
        scheduled_for_permanent_deletion: deletionScheduledFor.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userData.id);

    if (error) throw error;

    // Also update privacy settings
    await supabase
      .from('user_privacy_settings')
      .update({
        last_updated: new Date().toISOString()
      })
      .eq('user_id', userData.id);
  };

  const handleComplete = () => {
    // Clear local storage and redirect
    localStorage.removeItem('zpria_user');
    localStorage.removeItem('zpria_theme_id');
    navigate('/');
  };

  const getSelectedReasonText = () => {
    if (selectedReason === 'other') {
      return customReason;
    }
    const reason = deletionReasons.find(r => r.id === selectedReason);
    return reason ? reason.description : '';
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] py-8 px-4">
      <div className="max-w-[600px] mx-auto">
        {/* Header */}
        <header className="mb-8">
          <button 
            onClick={() => {
              if (step === 'reason') {
                navigate('/account/privacy');
              } else {
                if (step === 'confirm') setStep('reason');
                if (step === 'password') setStep('confirm');
                if (step === 'otp') setStep('password');
              }
            }}
            className="flex items-center gap-2 text-[#0071e3] font-medium mb-4 hover:underline"
          >
            <ChevronLeft className="w-5 h-5" />
            {step === 'reason' ? 'Back to Privacy' : 'Back'}
          </button>
          
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-[32px] font-semibold text-[#1d1d1f]">Delete Account</h1>
                <p className="text-[#86868b]">
                  {step === 'reason' && 'Help us improve by sharing why you\'re leaving'}
                  {step === 'confirm' && 'Review your decision before proceeding'}
                  {step === 'password' && 'Verify your identity'}
                  {step === 'otp' && 'Enter the code sent to your email'}
                  {step === 'complete' && 'Account scheduled for deletion'}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-2">
            <X className="w-5 h-5" />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 text-green-600 rounded-2xl flex items-center gap-2">
            <X className="w-5 h-5" />
            {success}
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          {step === 'reason' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[24px] font-semibold text-[#1d1d1f] mb-2">Why are you leaving?</h2>
                <p className="text-[#86868b]">
                  Your feedback helps us improve. All responses are anonymous.
                </p>
              </div>

              <div className="space-y-3">
                {deletionReasons.map((reason) => {
                  const Icon = reason.icon;
                  return (
                    <button
                      key={reason.id}
                      onClick={() => handleReasonSelect(reason.id)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        selectedReason === reason.id
                          ? 'border-[#0071e3] bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          selectedReason === reason.id ? 'bg-[#0071e3] text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-[#1d1d1f]">{reason.title}</h3>
                          <p className="text-sm text-[#86868b]">{reason.description}</p>
                        </div>
                        {selectedReason === reason.id && (
                          <div className="w-5 h-5 rounded-full bg-[#0071e3] flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedReason === 'other' && (
                <div className="pt-4">
                  <label className="block text-sm font-medium text-[#86868b] mb-2">
                    Please specify your reason
                  </label>
                  <textarea
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Tell us more about your experience..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all min-h-[100px] resize-none"
                  />
                </div>
              )}

              <div className="pt-6 border-t border-gray-200">
                <button
                  onClick={handleContinue}
                  disabled={!selectedReason || (selectedReason === 'other' && !customReason.trim())}
                  className="w-full py-4 bg-[#0071e3] text-white rounded-full font-semibold hover:bg-[#0051a3] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[24px] font-semibold text-[#1d1d1f] mb-2">Review Your Decision</h2>
                <p className="text-[#86868b]">
                  You've selected: <span className="font-medium text-[#1d1d1f]">{getSelectedReasonText()}</span>
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-red-700 mb-2">Important Information</h3>
                    <ul className="text-sm text-red-600 space-y-1">
                      <li>• Your account will be deactivated immediately</li>
                      <li>• All data will be permanently deleted in 30 days</li>
                      <li>• You won't be able to recover your account after deletion</li>
                      <li>• You can reactivate within 30 days by logging in</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep('reason')}
                  className="flex-1 py-4 bg-gray-100 text-[#1d1d1f] rounded-full font-semibold hover:bg-gray-200 transition-all"
                >
                  Go Back
                </button>
                <button
                  onClick={handleContinue}
                  className="flex-1 py-4 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 transition-all"
                >
                  Proceed to Delete
                </button>
              </div>
            </div>
          )}

          {step === 'password' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[24px] font-semibold text-[#1d1d1f] mb-2">Verify Your Identity</h2>
                <p className="text-[#86868b]">
                  For security, please enter your password to confirm account deletion.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#86868b] mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep('confirm')}
                  className="flex-1 py-4 bg-gray-100 text-[#1d1d1f] rounded-full font-semibold hover:bg-gray-200 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  disabled={isSubmitting || !password}
                  className="flex-1 py-4 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Password'
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[24px] font-semibold text-[#1d1d1f] mb-2">Enter Verification Code</h2>
                <p className="text-[#86868b]">
                  We've sent a 6-digit code to your email. Please enter it below.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#86868b] mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all text-center text-2xl tracking-widest"
                  maxLength={6}
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep('password')}
                  className="flex-1 py-4 bg-gray-100 text-[#1d1d1f] rounded-full font-semibold hover:bg-gray-200 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleOtpSubmit}
                  disabled={isSubmitting || otp.length !== 6}
                  className="flex-1 py-4 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Confirm Deletion'
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'complete' && (
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <X className="w-6 h-6 text-white" />
                </div>
              </div>

              <div>
                <h2 className="text-[24px] font-semibold text-[#1d1d1f] mb-2">Account Scheduled for Deletion</h2>
                <p className="text-[#86868b]">
                  Your account has been deactivated. All data will be permanently deleted in 30 days.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-left">
                <h3 className="font-semibold text-blue-700 mb-2">Important Notes</h3>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• You can reactivate your account by logging in within 30 days</li>
                  <li>• After 30 days, all data will be permanently deleted</li>
                  <li>• You won't receive any further emails from us</li>
                  <li>• Your username will be released after deletion</li>
                </ul>
              </div>

              <button
                onClick={handleComplete}
                className="w-full py-4 bg-[#0071e3] text-white rounded-full font-semibold hover:bg-[#0051a3] transition-all"
              >
                Return to Homepage
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountDeletionPage;