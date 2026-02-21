
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Calendar, Briefcase, GraduationCap, Heart, Camera, ChevronLeft, Save, X } from 'lucide-react';
import { ZPRIA_MAIN_LOGO, COUNTRY_LIST } from '../pages/constants';
import LoadingOverlay from '../components/LoadingOverlay';
import { supabase } from '../services/supabaseService';
import { updateUserProfile } from '../services/userAccountService';
import { dataIds, colors } from '../config';

interface UserProfile {
  id: string;
  username: string;
  login_id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  address: string;
  dob: string;
  gender: string;
  avatarUrl?: string;
  bio?: string;
  occupation?: string;
  education?: string;
  maritalStatus?: string;
  hasChildren?: boolean;
  monthlyIncomeRange?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  language?: string;
  religion?: string;
  lifestyle?: string;
  themePreference?: string;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'personal' | 'contact' | 'professional' | 'preferences'>('personal');
  
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    username: '',
    login_id: '',
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    address: '',
    dob: '',
    gender: '',
    bio: '',
    occupation: '',
    education: '',
    maritalStatus: '',
    hasChildren: false,
    monthlyIncomeRange: '',
    city: '',
    country: '',
    postalCode: '',
    language: 'bn',
    religion: '',
    lifestyle: '',
    themePreference: 'purple'
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const savedUser = localStorage.getItem('zpria_user');
      if (!savedUser) {
        navigate('/signin');
        return;
      }

      const userData = JSON.parse(savedUser);
      
      // Fetch full profile from database
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userData.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          id: data.id || '',
          username: data.username || '',
          login_id: data.login_id || '',
          firstName: data.firstName || data.first_name || '',
          lastName: data.lastName || data.last_name || '',
          email: data.email || '',
          mobile: data.mobile || '',
          address: data.address || '',
          dob: data.dob || '',
          gender: data.gender || '',
          bio: data.bio || '',
          occupation: data.occupation || '',
          education: data.education || '',
          maritalStatus: data.maritalStatus || data.marital_status || '',
          hasChildren: data.hasChildren || data.has_children || false,
          monthlyIncomeRange: data.monthlyIncomeRange || data.monthly_income_range || '',
          city: data.city || '',
          country: data.country || '',
          postalCode: data.postalCode || data.postal_code || '',
          language: data.language || 'bn',
          religion: data.religion || '',
          lifestyle: data.lifestyle || '',
          themePreference: data.themePreference || data.theme_preference || 'purple',
          avatarUrl: data.avatarUrl || data.avatar_url || '',
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      // Use the user account service to update profile
      console.log('Updating profile with:', {
        firstName: profile.firstName,
        lastName: profile.lastName,
        address: profile.address,
        dob: profile.dob,
        gender: profile.gender,
        bio: profile.bio,
        occupation: profile.occupation,
        education: profile.education,
        maritalStatus: profile.maritalStatus,
        hasChildren: profile.hasChildren,
        monthlyIncomeRange: profile.monthlyIncomeRange,
        city: profile.city,
        country: profile.country,
        postalCode: profile.postalCode,
        language: profile.language,
        religion: profile.religion,
        lifestyle: profile.lifestyle,
        updatedAt: new Date().toISOString()
      });
      
      const updateSuccess = await updateUserProfile(profile.id, {
        firstName: profile.firstName,
        lastName: profile.lastName,
        address: profile.address,
        dob: profile.dob,
        gender: profile.gender,
        bio: profile.bio,
        occupation: profile.occupation,
        education: profile.education,
        maritalStatus: profile.maritalStatus,
        hasChildren: profile.hasChildren,
        monthlyIncomeRange: profile.monthlyIncomeRange,
        city: profile.city,
        country: profile.country,
        postalCode: profile.postalCode,
        language: profile.language,
        religion: profile.religion,
        lifestyle: profile.lifestyle,
        themePreference: profile.themePreference,
        updatedAt: new Date().toISOString()
      });

      if (!updateSuccess) {
        throw new Error('Failed to update profile');
      }

      // Update localStorage with new profile data
      const savedUser = localStorage.getItem('zpria_user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        userData.firstName = profile.firstName;
        userData.lastName = profile.lastName;
        userData.address = profile.address;
        userData.dob = profile.dob;
        userData.gender = profile.gender;
        userData.bio = profile.bio;
        userData.occupation = profile.occupation;
        userData.education = profile.education;
        userData.maritalStatus = profile.maritalStatus;
        userData.hasChildren = profile.hasChildren;
        userData.monthlyIncomeRange = profile.monthlyIncomeRange;
        userData.city = profile.city;
        userData.country = profile.country;
        userData.postalCode = profile.postalCode;
        userData.language = profile.language;
        userData.religion = profile.religion;
        userData.lifestyle = profile.lifestyle;
        userData.themePreference = profile.themePreference;
        localStorage.setItem('zpria_user', JSON.stringify(userData));
      }

      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSaving(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        
        // Update profile with new avatar
        const updateSuccess = await updateUserProfile(profile.id, {
          avatarUrl: base64,
          updatedAt: new Date().toISOString()
        });

        if (!updateSuccess) {
          throw new Error('Failed to update profile picture');
        }

        // Update localStorage with new avatar
        const savedUser = localStorage.getItem('zpria_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          userData.avatarUrl = base64;
          localStorage.setItem('zpria_user', JSON.stringify(userData));
        }
        
        // Reload profile to reflect changes
        await loadProfile();
        
        setSuccess('Profile picture updated successfully');
        setTimeout(() => setSuccess(''), 3000);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'contact', label: 'Contact & Location', icon: MapPin },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'preferences', label: 'Preferences', icon: Heart }
  ];

  if (isLoading) {
    return <LoadingOverlay isLoading={true} />;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] py-8 px-4">
      <div className="max-w-[800px] mx-auto">
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
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-[#0071e3] to-[#00c6ff] rounded-full flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                  {profile.avatarUrl ? (
                    <img 
                      src={profile.avatarUrl} 
                      alt={`${profile.firstName} ${profile.lastName}`}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-[#0071e3] rounded-full flex items-center justify-center text-white hover:bg-[#0051a3] transition-colors cursor-pointer">
                  <Camera className="w-4 h-4" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleAvatarUpload}
                  />
                </label>
              </div>
              <div>
                <h1 className="text-[32px] font-semibold text-[#1d1d1f]">
                  {profile.first_name} {profile.last_name}
                </h1>
                <p className="text-[#86868b]">{profile.login_id}</p>
                <p className="text-[#86868b] text-sm mt-1">Member since 2025</p>
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
            <Save className="w-5 h-5" />
            {success}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#0071e3] text-white'
                    : 'bg-white text-[#1d1d1f] hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <h2 className="text-[24px] font-semibold text-[#1d1d1f] mb-6">Personal Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#86868b] mb-2">First Name</label>
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#86868b] mb-2">Last Name</label>
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#86868b] mb-2">Username</label>
                <input
                  type="text"
                  value={profile.username}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-[#86868b] mt-1">Username cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#86868b] mb-2">Bio</label>
                <textarea
                  value={profile.bio || ''}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  rows={4}
                  placeholder="Tell us about yourself..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#86868b] mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={profile.dob}
                    onChange={(e) => handleChange('dob', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#86868b] mb-2">Gender</label>
                  <select
                    value={profile.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all bg-white"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#86868b] mb-2">Marital Status</label>
                  <select
                    value={profile.maritalStatus || ''}
                    onChange={(e) => handleChange('maritalStatus', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all bg-white"
                  >
                    <option value="">Select Status</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#86868b] mb-2">Has Children</label>
                  <select
                    value={profile.hasChildren ? 'yes' : 'no'}
                    onChange={(e) => handleChange('hasChildren', e.target.value === 'yes')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all bg-white"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-6">
              <h2 className="text-[24px] font-semibold text-[#1d1d1f] mb-6">Contact & Location</h2>
              
              <div>
                <label className="block text-sm font-medium text-[#86868b] mb-2">Email</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <span className="px-4 py-3 bg-green-100 text-green-700 rounded-xl text-sm font-medium">
                    Verified
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#86868b] mb-2">Mobile Number</label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={profile.mobile}
                    disabled
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <span className="px-4 py-3 bg-green-100 text-green-700 rounded-xl text-sm font-medium">
                    Verified
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#86868b] mb-2">Full Address</label>
                <textarea
                  value={profile.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#86868b] mb-2">City</label>
                  <input
                    type="text"
                    value={profile.city || ''}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#86868b] mb-2">Country</label>
                  <select
                    value={profile.country || ''}
                    onChange={(e) => handleChange('country', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all bg-white"
                  >
                    <option value="">Select Country</option>
                    {COUNTRY_LIST.map(c => (
                      <option key={c.value} value={c.label}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#86868b] mb-2">Postal Code</label>
                <input
                  type="text"
                  value={profile.postalCode || ''}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all"
                />
              </div>
            </div>
          )}

          {activeTab === 'professional' && (
            <div className="space-y-6">
              <h2 className="text-[24px] font-semibold text-[#1d1d1f] mb-6">Professional Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-[#86868b] mb-2">Occupation</label>
                <input
                  type="text"
                  value={profile.occupation || ''}
                  onChange={(e) => handleChange('occupation', e.target.value)}
                  placeholder="e.g. Software Engineer"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#86868b] mb-2">Education</label>
                <select
                  value={profile.education || ''}
                  onChange={(e) => handleChange('education', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all bg-white"
                >
                  <option value="">Select Education</option>
                  <option value="High School">High School</option>
                  <option value="Bachelor">Bachelor's Degree</option>
                  <option value="Master">Master's Degree</option>
                  <option value="PhD">PhD</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#86868b] mb-2">Monthly Income Range</label>
                <select
                  value={profile.monthlyIncomeRange || ''}
                  onChange={(e) => handleChange('monthlyIncomeRange', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all bg-white"
                >
                  <option value="">Select Range</option>
                  <option value="0-20000">৳0 - ৳20,000</option>
                  <option value="20000-50000">৳20,000 - ৳50,000</option>
                  <option value="50000-100000">৳50,000 - ৳100,000</option>
                  <option value="100000-200000">৳100,000 - ৳200,000</option>
                  <option value="200000+">৳200,000+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#86868b] mb-2">Preferred Language</label>
                <select
                  value={profile.language || 'bn'}
                  onChange={(e) => handleChange('language', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all bg-white"
                >
                  <option value="bn">বাংলা (Bengali)</option>
                  <option value="en">English</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#86868b] mb-2">Religion (Optional)</label>
                <select
                  value={profile.religion || ''}
                  onChange={(e) => handleChange('religion', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all bg-white"
                >
                  <option value="">Prefer not to say</option>
                  <option value="Islam">Islam</option>
                  <option value="Hinduism">Hinduism</option>
                  <option value="Christianity">Christianity</option>
                  <option value="Buddhism">Buddhism</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#86868b] mb-2">Lifestyle</label>
                <select
                  value={profile.lifestyle || ''}
                  onChange={(e) => handleChange('lifestyle', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all bg-white"
                >
                  <option value="">Select Lifestyle</option>
                  <option value="Active">Active</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Relaxed">Relaxed</option>
                  <option value="Busy">Busy</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h2 className="text-[24px] font-semibold text-[#1d1d1f] mb-6">Preferences</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#86868b] mb-2">Theme Preference</label>
                  <select
                    value={profile.themePreference || 'purple'}
                    onChange={(e) => handleChange('themePreference', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all bg-white"
                  >
                    <option value="purple">Purple</option>
                    <option value="ocean">Ocean</option>
                    <option value="dark">Dark</option>
                    <option value="coral">Coral</option>
                    <option value="lime">Lime</option>
                    <option value="forest">Forest</option>
                    <option value="indigo">Indigo</option>
                    <option value="royal">Royal</option>
                    <option value="sunset">Sunset</option>
                    <option value="nature">Nature</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#86868b] mb-2">Font Size</label>
                  <select
                    value={profile.preferredFontSize || 'medium'}
                    onChange={(e) => handleChange('preferredFontSize', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all bg-white"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full md:w-auto px-8 py-4 bg-[#0071e3] text-white rounded-full font-semibold hover:bg-[#0051a3] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
