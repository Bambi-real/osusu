import { useState } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

export default function ProfilePage() {
  const { user, setLoggedInUser } = useAuth();
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);
  
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState(null);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const { fullName, phone } = e.target.elements;
      let phoneValue = phone.value;
      if (!phoneValue.startsWith('+220')) {
        phoneValue = '+220' + phoneValue.replace(/^\+220/, '');
      }

      const res = await api.put('/auth/profile', { 
        fullName: fullName.value, 
        phone: phoneValue 
      });
      setLoggedInUser(res.data.data);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.error?.message || 'Failed to update profile.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMsg(null);
    try {
      const { newPassword } = e.target.elements;
      await api.post('/auth/change-password', { newPassword: newPassword.value });
      setPasswordMsg({ type: 'success', text: 'Password updated successfully.' });
      e.target.reset();
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.error?.message || 'Failed to update password.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) return <PageWrapper><div /></PageWrapper>;

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Account Settings</h1>
        
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden mb-8 border border-gray-100">
          <div className="p-8 sm:p-10 flex flex-col md:flex-row gap-10">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4 md:w-1/3 border-b md:border-b-0 md:border-r border-gray-100 pb-8 md:pb-0 md:pr-10">
              <div className="w-32 h-32 bg-green-600 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-md border-4 border-green-50">
                {getInitials(user.fullName)}
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900">{user.fullName}</h2>
                <p className="text-sm text-gray-500 mt-1">Member since {new Date(user.created_at || Date.now()).getFullYear()}</p>
              </div>
              <div className="w-full bg-gray-50 rounded-lg p-3 text-center border border-gray-100 mt-4">
                <span className="text-xs text-gray-400 uppercase font-semibold tracking-wider block mb-1">Email Address</span>
                <span className="text-sm font-medium text-gray-900 truncate block px-2">{user.email}</span>
              </div>
            </div>

            {/* Profile Form */}
            <div className="md:w-2/3">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h3>
              <form onSubmit={handleProfileUpdate} className="space-y-5">
                <Input 
                  label="Full Name" 
                  name="fullName" 
                  defaultValue={user.fullName} 
                  required 
                  className="text-lg"
                />
                
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <div className="flex rounded-md shadow-sm border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500">
                    <span className="inline-flex items-center px-4 bg-gray-50 text-gray-500 text-sm font-medium border-r border-gray-300">
                      +220
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      defaultValue={user.phone ? user.phone.replace(/^\+220/, '') : ''}
                      required
                      placeholder="3XXXXXX"
                      className="flex-1 block w-full px-4 py-3 sm:text-sm border-none focus:ring-0 text-gray-900"
                    />
                  </div>
                </div>
                
                {profileMsg && (
                  <div className={`text-sm font-medium p-3 rounded-lg border ${profileMsg.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {profileMsg.text}
                  </div>
                )}
                
                <div className="pt-4 flex justify-end">
                  <Button type="submit" variant="primary" loading={profileLoading} className="px-6 py-2.5 rounded-lg shadow-sm">
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden mb-8 border border-gray-100">
          <div className="p-8 sm:p-10">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Change Password</h3>
            <p className="text-gray-500 text-sm mb-6">Ensure your account is using a long, random password to stay secure.</p>
            
            <form onSubmit={handlePasswordChange} className="space-y-5 max-w-md">
              <Input 
                label="New Password" 
                name="newPassword" 
                type="password" 
                required 
                minLength={8}
                placeholder="••••••••"
              />
              <p className="text-xs text-gray-500">Password must be at least 8 characters long.</p>
              
              {passwordMsg && (
                <div className={`text-sm font-medium p-3 rounded-lg border ${passwordMsg.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                  {passwordMsg.text}
                </div>
              )}
              
              <div className="pt-2">
                <Button type="submit" variant="primary" loading={passwordLoading} className="px-6 py-2.5 rounded-lg shadow-sm">
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border border-red-100 shadow-sm rounded-2xl overflow-hidden">
          <div className="p-8 sm:p-10">
            <h3 className="text-xl font-bold text-red-800 mb-2">Danger Zone</h3>
            <p className="text-red-600 text-sm mb-6">Once you delete your account, there is no going back. Please be certain.</p>
            
            <div className="flex items-center justify-between border-t border-red-200 pt-6">
              <div>
                <h4 className="font-semibold text-gray-900">Delete Account</h4>
                <p className="text-sm text-gray-500 mt-1">Permanently delete your account and all associated data.</p>
              </div>
              <button 
                type="button" 
                onClick={() => alert('Account deletion is not supported in this demo.')}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-red-50"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
