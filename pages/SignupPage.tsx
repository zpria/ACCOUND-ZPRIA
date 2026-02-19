
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ZPRIA_MAIN_LOGO, COUNTRY_LIST } from '../constants';
import Captcha from '../components/Captcha';
import FloatingInput from '../components/FloatingInput';
import { supabase, hashPassword, checkAvailability } from '../services/supabaseService';
import { sendOTP } from '../services/emailService';

const STORAGE_KEY = 'zpria_signup_draft';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [captchaRefresh, setCaptchaRefresh] = useState(0);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  
  const [formData, setFormData] = useState(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEY);
    if (savedDraft) {
      try {
        return JSON.parse(savedDraft);
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
    return {
      firstName: '',
      lastName: '',
      dobMonth: '00',
      dobDay: '00',
      dobYear: '0000',
      gender: 'Not Specified',
      selectedCountry: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      countryCode: 'BD',
      mobile: '',
      agreed: false
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const passwordValidation = useMemo(() => {
    const pass = formData.password;
    const checks = {
      length: pass.length >= 8,
      number: /[0-9]/.test(pass),
      upper: /[A-Z]/.test(pass),
      lower: /[a-z]/.test(pass),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pass)
    };
    const metCount = Object.values(checks).filter(Boolean).length;
    return { checks, strength: Math.floor((metCount / 5) * 100) };
  }, [formData.password]);

  const isAgeValid = useMemo(() => {
    if (formData.dobYear === '0000' || formData.dobMonth === '00' || formData.dobDay === '00') return true;
    const birthDate = new Date(parseInt(formData.dobYear), parseInt(formData.dobMonth) - 1, parseInt(formData.dobDay));
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age >= 16;
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    setFormData((prev: any) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.firstName || !formData.lastName) return setError('Please enter your full name');
    if (formData.dobYear === '0000' || formData.dobMonth === '00' || formData.dobDay === '00') return setError('Please select your birth date');
    if (!isAgeValid) return setError('You must be at least 16 years old to join ZPRIA');
    if (formData.gender === 'Not Specified') return setError('Please select your gender');
    if (!formData.selectedCountry) return setError('Please select your country');
    if (formData.username.length < 5) return setError('Username must be at least 5 characters');
    if (!formData.email) return setError('Please provide a recovery email');
    if (passwordValidation.strength < 100) return setError('Please meet all password requirements');
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
    if (!isCaptchaVerified) return setError('Please solve the visual captcha');
    if (!formData.agreed) return setError('You must agree to the Privacy Policy and Rules');

    setIsLoading(true);
    try {
      const cleanUsername = formData.username.trim().toLowerCase();
      const loginId = `${cleanUsername}@prigod.com`;
      const otpCode = Math.floor(10000000 + Math.random() * 90000000).toString();

      const isUserAvailable = await checkAvailability('username', cleanUsername);
      const isEmailAvailable = await checkAvailability('email', formData.email.toLowerCase());
      
      if (!isUserAvailable) throw new Error('Username already taken');
      if (!isEmailAvailable) throw new Error('Recovery email already registered');

      const hPassword = await hashPassword(formData.password);
      
      const country = COUNTRY_LIST.find(c => c.value === formData.countryCode);
      const rawMobile = formData.mobile.trim();
      const cleanMobile = rawMobile.startsWith('0') ? rawMobile.slice(1) : rawMobile;
      const fullMobile = `${country?.code || ''}${cleanMobile}`;

      const { error: regError } = await supabase.from('pending_registrations').insert({
        username: cleanUsername,
        login_id: loginId,
        password_hash: hPassword,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email.toLowerCase(),
        mobile: fullMobile,
        dob: `${formData.dobYear}-${formData.dobMonth}-${formData.dobDay}`,
        gender: formData.gender,
        address: formData.selectedCountry
      });

      if (regError) throw regError;

      await supabase.from('otp_verifications').insert({
        email: formData.email.toLowerCase(),
        otp_code: otpCode,
        purpose: 'registration',
        expires_at: new Date(Date.now() + 600000).toISOString()
      });

      await sendOTP({ to_name: formData.firstName, to_email: formData.email.toLowerCase(), otp_code: otpCode });
      
      localStorage.setItem('zpria_verification_email', formData.email.toLowerCase());
      navigate('/verify-email');
    } catch (err: any) {
      setError(err.message);
      setCaptchaRefresh(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <h2 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-[#86868b] text-center mb-6 border-b border-gray-100 pb-3">
      {title}
    </h2>
  );

  return (
    <div className="max-w-[620px] mx-auto pt-4 px-6 pb-24 reveal-node">
      <div className="text-center mb-8 flex flex-col items-center">
        <ZPRIA_MAIN_LOGO className="w-[120px] h-[120px] mb-2" />
        <h1 className="text-[32px] font-black tracking-tighter text-[#1d1d1f] leading-none mb-1 uppercase">
          Sign Up
        </h1>
        <p className="text-[10px] text-[#86868b] font-black uppercase tracking-[0.3em] opacity-80">
          Universal Sovereign Identity
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-[#F43F5E] rounded-xl text-center font-bold text-xs border border-red-100 animate-shake">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* PERSONAL IDENTIFIER */}
        <section className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FloatingInput name="firstName" label="First Name" value={formData.firstName} onChange={handleChange} required />
            <FloatingInput name="lastName" label="Last Name" value={formData.lastName} onChange={handleChange} required />
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <FloatingInput name="dobMonth" label="Month" isSelect value={formData.dobMonth} onChange={handleChange}>
              <option value="00" disabled>Month</option>
              {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                <option key={m} value={String(i+1).padStart(2,'0')}>{m}</option>
              ))}
            </FloatingInput>
            <FloatingInput name="dobDay" label="Day" isSelect value={formData.dobDay} onChange={handleChange}>
              <option value="00" disabled>Day</option>
              {Array.from({length: 31}).map((_, i) => <option key={i+1} value={String(i+1).padStart(2,'0')}>{i+1}</option>)}
            </FloatingInput>
            <FloatingInput name="dobYear" label="Year" isSelect value={formData.dobYear} onChange={handleChange}>
              <option value="0000" disabled>Year</option>
              {Array.from({length: 100}).map((_, i) => <option key={i} value={String(2025-i)}>{2025-i}</option>)}
            </FloatingInput>
          </div>

          <FloatingInput name="gender" label="Gender" isSelect value={formData.gender} onChange={handleChange} required>
            <option value="Not Specified" disabled>Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Non-binary">Non-binary</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </FloatingInput>
        </section>

        {/* IDENTITY CLAIM */}
        <section className="space-y-4">
          <FloatingInput name="selectedCountry" label="Select Country" isSelect value={formData.selectedCountry} onChange={handleChange} required>
            <option value="" disabled>Select Country</option>
            {COUNTRY_LIST.map(c => <option key={c.value} value={c.label}>{c.label}</option>)}
          </FloatingInput>
          
          <div className="flex items-stretch w-full rounded-2xl border border-[#d2d2d7] overflow-hidden focus-within:ring-1 focus-within:ring-[#0071e3] transition-all bg-white group">
            <div className="flex-1">
              <FloatingInput name="username" label="Claim Username" value={formData.username} onChange={handleChange} required className="!border-0 !rounded-none !shadow-none" />
            </div>
            <div className="flex items-center px-6 bg-[#f5f5f7] border-l border-[#d2d2d7] font-black text-[#1d1d1f] text-[14px] select-none group-hover:bg-[#ebebed] transition-colors whitespace-nowrap">
              @prigod.com
            </div>
          </div>
        </section>

        {/* SECURITY CORE */}
        <section className="space-y-4">
          <FloatingInput name="email" label="Recovery Email" type="email" value={formData.email} onChange={handleChange} required />
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <FloatingInput name="password" label="Password" type="password" value={formData.password} onChange={handleChange} onFocus={() => setIsPasswordFocused(true)} onBlur={() => setIsPasswordFocused(false)} required />
              {isPasswordFocused && (
                <div className="absolute bottom-[calc(100%+12px)] left-0 z-50 w-[260px] pointer-events-none transition-all duration-300">
                  <div className="bg-[#f2f2f7]/95 backdrop-blur-xl rounded-[20px] border border-white/60 p-4 shadow-2xl">
                    <p className="text-[11px] font-bold text-[#1d1d1f] mb-2">Strength: {passwordValidation.strength}%</p>
                    <ul className="space-y-1">
                      {[
                        { met: passwordValidation.checks.length, text: "8+ characters" },
                        { met: passwordValidation.checks.number, text: "At least 1 number" },
                        { met: passwordValidation.checks.upper, text: "At least 1 uppercase" },
                        { met: passwordValidation.checks.special, text: "One special character" }
                      ].map((req, i) => (
                        <li key={i} className={`flex items-center gap-2 text-[10px] ${req.met ? 'text-green-600' : 'text-gray-400'}`}>
                          <div className={`w-1 h-1 rounded-full ${req.met ? 'bg-green-500' : 'bg-gray-300'}`} />
                          {req.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
            <FloatingInput name="confirmPassword" label="Confirm" type="password" value={formData.confirmPassword} onChange={handleChange} required />
          </div>
        </section>

        {/* HANDSHAKE NODE */}
        <section className="flex gap-4">
          <div className="w-[140px]">
            <FloatingInput name="countryCode" label="Region" isSelect value={formData.countryCode} onChange={handleChange}>
              {COUNTRY_LIST.map(c => <option key={c.value} value={c.value}>{c.code}</option>)}
            </FloatingInput>
          </div>
          <div className="flex-1">
            <FloatingInput name="mobile" label="Phone Number" type="tel" value={formData.mobile} onChange={handleChange} required />
          </div>
        </section>

        {/* HUMAN VERIFIED */}
        <section className="p-6 bg-[#fbfbfd] rounded-[24px] border border-gray-100 space-y-6">
           <Captcha onVerify={setIsCaptchaVerified} refreshKey={captchaRefresh} />
           <label className="flex items-start gap-3 cursor-pointer group select-none">
              <input type="checkbox" name="agreed" checked={formData.agreed} onChange={handleChange} className="mt-1 w-4 h-4 accent-[#0071e3] border-[#d2d2d7] rounded cursor-pointer" />
              <span className="text-[12px] text-[#424245] leading-tight font-medium group-hover:text-[#1d1d1f]">
                I agree to the ZPRIA <Link to="/privacy" className="text-[#0066cc] font-bold">Privacy Policy</Link> and <Link to="/terms" className="text-[#0066cc] font-bold">Rules</Link>.
              </span>
           </label>
        </section>

        <button 
          type="submit" 
          disabled={isLoading} 
          className="w-full py-4 bg-[#0071e3] text-white rounded-full font-black text-lg hover:scale-[1.01] active:scale-95 transition-all shadow-xl disabled:opacity-40 uppercase tracking-widest"
        >
          {isLoading ? "Provisioning..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
};

export default SignupPage;
