
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, Plus, ChevronLeft, Home, Briefcase, Building2,
  Check, Trash2, Edit2, Star, AlertCircle, CheckCircle2,
  Loader2, X
} from 'lucide-react';
import { supabase } from '../services/supabaseService';
import LoadingOverlay from '../components/LoadingOverlay';
import { dbConfig } from '../config';

interface Address {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  area?: string;
  postal_code?: string;
  country: string;
  is_default: boolean;
  is_commercial: boolean;
  latitude?: number;
  longitude?: number;
  delivery_instructions?: string;
  gate_code?: string;
  building_name?: string;
  floor_number?: string;
  apartment_number?: string;
  created_at: string;
}

const AddressesPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    label: 'Home' as 'Home' | 'Work' | 'Other',
    full_name: '',
    phone: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    area: '',
    postal_code: '',
    country: 'Bangladesh',
    is_default: false,
    is_commercial: false,
    delivery_instructions: '',
    gate_code: '',
    building_name: '',
    floor_number: '',
    apartment_number: ''
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const savedUser = localStorage.getItem('zpria_user');
      if (!savedUser) {
        navigate('/signin');
        return;
      }

      const userData = JSON.parse(savedUser);
      
      const { data, error } = await supabase
        .from(dbConfig.tables.user_addresses)
        .select('*')
        .eq('user_id', userData.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (err: any) {
      console.error('Failed to load addresses:', err);
      setError('Failed to load addresses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const savedUser = localStorage.getItem('zpria_user');
      if (!savedUser) return;
      const userData = JSON.parse(savedUser);

      const addressData = {
        user_id: userData.id,
        ...formData
      };

      if (editingAddress) {
        // Update existing
        const { error } = await supabase
          .from(dbConfig.tables.user_addresses)
          .update(addressData)
          .eq('id', editingAddress.id);

        if (error) throw error;
        setSuccess('Address updated successfully');
      } else {
        // Create new
        const { error } = await supabase
          .from(dbConfig.tables.user_addresses)
          .insert(addressData);

        if (error) throw error;
        setSuccess('Address added successfully');
      }

      setShowAddModal(false);
      setEditingAddress(null);
      resetForm();
      loadAddresses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save address');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const { error } = await supabase
        .from(dbConfig.tables.user_addresses)
        .delete()
        .eq('id', addressId);

      if (error) throw error;
      setSuccess('Address deleted successfully');
      loadAddresses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete address');
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const savedUser = localStorage.getItem('zpria_user');
      if (!savedUser) return;
      const userData = JSON.parse(savedUser);

      // Remove default from all addresses
      await supabase
        .from(dbConfig.tables.user_addresses)
        .update({ is_default: false })
        .eq('user_id', userData.id);

      // Set new default
      const { error } = await supabase
        .from(dbConfig.tables.user_addresses)
        .update({ is_default: true })
        .eq('id', addressId);

      if (error) throw error;
      setSuccess('Default address updated');
      loadAddresses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update default address');
    }
  };

  const startEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      label: address.label,
      full_name: address.full_name,
      phone: address.phone || '',
      address_line_1: address.address_line_1,
      address_line_2: address.address_line_2 || '',
      city: address.city,
      area: address.area || '',
      postal_code: address.postal_code || '',
      country: address.country,
      is_default: address.is_default,
      is_commercial: address.is_commercial,
      delivery_instructions: address.delivery_instructions || '',
      gate_code: address.gate_code || '',
      building_name: address.building_name || '',
      floor_number: address.floor_number || '',
      apartment_number: address.apartment_number || ''
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      label: 'Home',
      full_name: '',
      phone: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      area: '',
      postal_code: '',
      country: 'Bangladesh',
      is_default: false,
      is_commercial: false,
      delivery_instructions: '',
      gate_code: '',
      building_name: '',
      floor_number: '',
      apartment_number: ''
    });
  };

  const getLabelIcon = (label: string) => {
    switch (label) {
      case 'Home':
        return <Home className="w-5 h-5" />;
      case 'Work':
        return <Briefcase className="w-5 h-5" />;
      default:
        return <Building2 className="w-5 h-5" />;
    }
  };

  const getLabelColor = (label: string) => {
    switch (label) {
      case 'Home':
        return 'bg-blue-100 text-blue-700';
      case 'Work':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return <LoadingOverlay message="Loading addresses..." />;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-[1200px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/account-dashboard')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-[28px] font-semibold text-[#1d1d1f]">My Addresses</h1>
                <p className="text-[#86868b] text-sm">Manage your delivery addresses</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingAddress(null);
                resetForm();
                setShowAddModal(true);
              }}
              className="px-4 py-2 bg-[#6366f1] text-white rounded-xl font-medium hover:bg-[#5558e0] transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Address
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Addresses List */}
        {addresses.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">No Addresses Saved</h3>
            <p className="text-[#86868b] mb-6">Add your first delivery address to get started</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-[#6366f1] text-white rounded-xl font-medium hover:bg-[#5558e0] transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Your First Address
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`bg-white rounded-2xl p-6 border-2 transition-all ${
                  address.is_default ? 'border-[#6366f1]' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getLabelColor(address.label)}`}>
                      {getLabelIcon(address.label)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-[#1d1d1f]">{address.label}</h3>
                        {address.is_default && (
                          <span className="px-2 py-0.5 bg-[#6366f1] text-white text-xs rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            Default
                          </span>
                        )}
                        {address.is_commercial && (
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                            Commercial
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#86868b]">{address.full_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(address)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 text-[#1d1d1f]">
                  <p>{address.address_line_1}</p>
                  {address.address_line_2 && <p>{address.address_line_2}</p>}
                  <p>
                    {address.city}{address.area && `, ${address.area}`}
                    {address.postal_code && ` - ${address.postal_code}`}
                  </p>
                  <p>{address.country}</p>
                  {address.phone && (
                    <p className="text-[#86868b] mt-2">Phone: {address.phone}</p>
                  )}
                </div>

                {address.delivery_instructions && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-[#86868b]">
                      <span className="font-medium">Delivery Instructions:</span> {address.delivery_instructions}
                    </p>
                  </div>
                )}

                {!address.is_default && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="text-[#6366f1] font-medium hover:underline flex items-center gap-1"
                    >
                      <Star className="w-4 h-4" />
                      Set as Default
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-[#1d1d1f]">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingAddress(null);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Label Selection */}
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Address Type</label>
                <div className="flex gap-3">
                  {(['Home', 'Work', 'Other'] as const).map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setFormData({ ...formData, label })}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-colors flex items-center justify-center gap-2 ${
                        formData.label === label
                          ? 'border-[#6366f1] bg-[#6366f1]/5 text-[#6366f1]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {getLabelIcon(label)}
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Address Line 1 *</label>
                <input
                  type="text"
                  required
                  value={formData.address_line_1}
                  onChange={(e) => setFormData({ ...formData, address_line_1: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                  placeholder="Street address, house number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Address Line 2</label>
                <input
                  type="text"
                  value={formData.address_line_2}
                  onChange={(e) => setFormData({ ...formData, address_line_2: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                  placeholder="Apartment, suite, unit, etc. (optional)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1d1d1f] mb-2">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Area</label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                    placeholder="Enter area"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Postal Code</label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                    placeholder="Enter postal code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Country *</label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                  />
                </div>
              </div>

              {/* Building Details */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Building Name</label>
                  <input
                    type="text"
                    value={formData.building_name}
                    onChange={(e) => setFormData({ ...formData, building_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                    placeholder="Building name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Floor</label>
                  <input
                    type="text"
                    value={formData.floor_number}
                    onChange={(e) => setFormData({ ...formData, floor_number: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                    placeholder="Floor number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Apartment</label>
                  <input
                    type="text"
                    value={formData.apartment_number}
                    onChange={(e) => setFormData({ ...formData, apartment_number: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                    placeholder="Apt number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Gate Code</label>
                <input
                  type="text"
                  value={formData.gate_code}
                  onChange={(e) => setFormData({ ...formData, gate_code: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                  placeholder="Gate code (if applicable)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Delivery Instructions</label>
                <textarea
                  value={formData.delivery_instructions}
                  onChange={(e) => setFormData({ ...formData, delivery_instructions: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366f1] resize-none"
                  placeholder="Special instructions for delivery (optional)"
                />
              </div>

              {/* Options */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                    className="w-5 h-5 text-[#6366f1] rounded focus:ring-[#6366f1]"
                  />
                  <span className="text-[#1d1d1f]">Set as default address</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_commercial}
                    onChange={(e) => setFormData({ ...formData, is_commercial: e.target.checked })}
                    className="w-5 h-5 text-[#6366f1] rounded focus:ring-[#6366f1]"
                  />
                  <span className="text-[#1d1d1f]">Commercial address</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingAddress(null);
                    resetForm();
                  }}
                  className="flex-1 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 bg-[#6366f1] text-white rounded-xl font-medium hover:bg-[#5558e0] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingAddress ? 'Update Address' : 'Add Address'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressesPage;
