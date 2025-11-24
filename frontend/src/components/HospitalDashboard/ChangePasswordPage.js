import React, { useState } from 'react';
import { Lock, Shield, AlertCircle } from 'lucide-react';
import API_BASE_URL from '../../config/api';

function ChangePasswordPage({ passwordData, setPasswordData, handleShowSuccessPopup }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords don't match!");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/hospitals/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password.');
      }

      handleShowSuccessPopup('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });

    } catch (err) {
      setError(err.message || 'Failed to change password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="p-2 sm:p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl sm:rounded-2xl shadow-lg">
          <Lock size={24} className="sm:w-7 sm:h-7 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Change Password</h1>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 max-w-3xl">
        <form onSubmit={handlePasswordChange}>
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Lock size={14} className="sm:w-4 sm:h-4 text-red-600" />
                Current Password
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                required
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Shield size={14} className="sm:w-4 sm:h-4 text-red-600" />
                New Password
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                required
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Shield size={14} className="sm:w-4 sm:h-4 text-red-600" />
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                required
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
              />
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 sm:p-5">
              <div className="flex items-start gap-2 sm:gap-3">
                <AlertCircle size={18} className="sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-blue-800 mb-2">Password Requirements:</p>
                  <ul className="text-xs sm:text-sm text-blue-700 space-y-1 sm:space-y-1.5">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0"></span>
                      At least 8 characters long
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0"></span>
                      Contains uppercase and lowercase letters
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0"></span>
                      Contains at least one number
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0"></span>
                      Contains at least one special character
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-medium py-3 sm:py-3.5 px-4 text-sm sm:text-base rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordPage;