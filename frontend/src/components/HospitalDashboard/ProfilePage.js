import React, { useState, useEffect } from 'react';
import { User, Building, Mail, Phone, MapPin, FileText, Edit2, Save, X } from 'lucide-react';
import API_BASE_URL from '../../config/api';

function ProfilePage({ hospitalProfile, setHospitalProfile, handleShowSuccessPopup }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');
  const [editedProfile, setEditedProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    license: ''
  });

  // Fetch profile from backend on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setIsFetching(true);
      setError('');
      try {
        const response = await fetch(`${API_BASE_URL}/api/hospitals/profile`, {
          credentials: 'include'
        });

        if (!response.ok) {
          // Try to get error message from backend
          let errorMessage = 'Failed to fetch hospital profile.';
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (parseError) {
            // If we can't parse the error, use status-based message
            if (response.status === 401) {
              errorMessage = 'Authentication required. Please log in again.';
            } else if (response.status === 404) {
              errorMessage = 'Hospital profile not found.';
            } else if (response.status >= 500) {
              errorMessage = 'Server error. Please try again later.';
            }
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        setHospitalProfile(data);
        setEditedProfile({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          license: data.license || ''
        });
        setError(''); // Clear any previous errors on success
      } catch (err) {
        console.error('Error fetching profile:', err);
        
        // If we have profile data from parent, use it as fallback (don't show error)
        if (hospitalProfile && hospitalProfile.email) {
          console.warn('Using fallback profile data from parent component');
          setEditedProfile({
            name: hospitalProfile.name || '',
            email: hospitalProfile.email || '',
            phone: hospitalProfile.phone || '',
            address: hospitalProfile.address || '',
            license: hospitalProfile.license || ''
          });
          setError(''); // Don't show error if we have fallback data
        } else {
          // Only show error if we don't have fallback data
          const errorMessage = err.message || 'Failed to load profile. Please try again.';
          setError(errorMessage);
        }
      } finally {
        setIsFetching(false);
      }
    };

    fetchProfile();
  }, []); // Only fetch once on mount

  // Update editedProfile when hospitalProfile changes
  useEffect(() => {
    if (hospitalProfile && hospitalProfile.email) {
      setEditedProfile({
        name: hospitalProfile.name || '',
        email: hospitalProfile.email || '',
        phone: hospitalProfile.phone || '',
        address: hospitalProfile.address || '',
        license: hospitalProfile.license || ''
      });
    }
  }, [hospitalProfile]);

  const handleEditClick = () => {
    setIsEditMode(true);
    setError('');
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setError('');
    // Reset to original values
    setEditedProfile({
      name: hospitalProfile.name || '',
      email: hospitalProfile.email || '',
      phone: hospitalProfile.phone || '',
      address: hospitalProfile.address || '',
      license: hospitalProfile.license || ''
    });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/hospitals/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: editedProfile.name,
          phone: editedProfile.phone,
          address: editedProfile.address,
          license: editedProfile.license
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile.');
      }

      const updatedProfile = await response.json();
      setHospitalProfile(updatedProfile);
      setIsEditMode(false);
      handleShowSuccessPopup('Profile updated successfully!');

    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 sm:p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl sm:rounded-2xl shadow-lg">
            <User size={24} className="sm:w-7 sm:h-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Hospital Profile</h1>
        </div>
        {!isEditMode && (
          <button
            onClick={handleEditClick}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl"
          >
            <Edit2 size={18} />
            <span className="hidden sm:inline">Edit Profile</span>
            <span className="sm:hidden">Edit</span>
          </button>
        )}
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 max-w-3xl">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}

        {!isEditMode ? (
          // View Mode - Display current profile
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-xl p-4 sm:p-5 border border-red-200">
                <div className="flex items-center gap-3 mb-2">
                  <Building size={20} className="text-red-600" />
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Hospital Name
                  </label>
                </div>
                <p className="text-base sm:text-lg font-medium text-gray-900 mt-2">
                  {hospitalProfile.name || 'Not provided'}
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 sm:p-5 border border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <Mail size={20} className="text-blue-600" />
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Email
                  </label>
                </div>
                <p className="text-base sm:text-lg font-medium text-gray-900 mt-2 break-words">
                  {hospitalProfile.email || 'Not provided'}
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 sm:p-5 border border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  <Phone size={20} className="text-green-600" />
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Phone Number
                  </label>
                </div>
                <p className="text-base sm:text-lg font-medium text-gray-900 mt-2">
                  {hospitalProfile.phone || 'Not provided'}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 sm:p-5 border border-purple-200">
                <div className="flex items-center gap-3 mb-2">
                  <FileText size={20} className="text-purple-600" />
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    License Number
                  </label>
                </div>
                <p className="text-base sm:text-lg font-medium text-gray-900 mt-2">
                  {hospitalProfile.license || 'Not provided'}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-4 sm:p-5 border border-orange-200">
              <div className="flex items-center gap-3 mb-2">
                <MapPin size={20} className="text-orange-600" />
                <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Address
                </label>
              </div>
              <p className="text-base sm:text-lg font-medium text-gray-900 mt-2 whitespace-pre-wrap">
                {hospitalProfile.address || 'Not provided'}
              </p>
            </div>
          </div>
        ) : (
          // Edit Mode - Form inputs
          <form onSubmit={handleProfileUpdate}>
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Building size={14} className="sm:w-4 sm:h-4 text-red-600" />
                  Hospital Name
                </label>
                <input
                  type="text"
                  value={editedProfile.name}
                  onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Mail size={14} className="sm:w-4 sm:h-4 text-red-600" />
                  Email
                </label>
                <input
                  type="email"
                  value={editedProfile.email}
                  disabled
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Phone size={14} className="sm:w-4 sm:h-4 text-red-600" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editedProfile.phone}
                  onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin size={14} className="sm:w-4 sm:h-4 text-red-600" />
                  Address
                </label>
                <textarea
                  value={editedProfile.address}
                  onChange={(e) => setEditedProfile({ ...editedProfile, address: e.target.value })}
                  rows="3"
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FileText size={14} className="sm:w-4 sm:h-4 text-red-600" />
                  License Number
                </label>
                <input
                  type="text"
                  value={editedProfile.license}
                  onChange={(e) => setEditedProfile({ ...editedProfile, license: e.target.value })}
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X size={18} />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium py-3 px-4 rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={18} />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;