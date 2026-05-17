import { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

export default function ProfilePage() {
  const { user, setLoggedInUser } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);
  const [saveState, setSaveState] = useState('idle');

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState(null);

  useEffect(() => {
    document.title = 'Profile — OsusuApp';
  }, []);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone ? user.phone.replace(/^\+220/, '') : '');
    }
  }, [user]);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const isDirty = fullName !== (user?.fullName || '') || phone !== (user?.phone || '').replace(/^\+220/, '');

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      let phoneValue = phone;
      if (!phoneValue.startsWith('+220')) {
        phoneValue = '+220' + phoneValue.replace(/^\+220/, '');
      }

      const res = await api.put('/auth/profile', {
        fullName,
        phone: phoneValue,
      });
      setLoggedInUser(res.data.data);
      setSaveState('success');
      setTimeout(() => setSaveState('idle'), 2000);
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

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : 'Unknown';

  return (
    <PageWrapper>
      <div className="page-enter max-w-4xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4 sm:w-1/3 border-b sm:border-b-0 sm:border-r border-gray-100 pb-6 sm:pb-0 sm:pr-8">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-sm">
                {getInitials(user.fullName)}
              </div>
              <div className="text-center">
                <h2 className="text-lg font-bold text-gray-900">{user.fullName}</h2>
                <p className="text-sm text-gray-500">Member since {memberSince}</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                Member
              </span>
              <div className="w-full bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
                <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-1">Email Address</p>
                <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
              </div>
            </div>

            {/* Profile Form */}
            <div className="sm:w-2/3">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
              <form onSubmit={handleProfileUpdate} className="space-y-5">
                <Input
                  label="Full Name"
                  name="fullName"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (profileMsg) setProfileMsg(null);
                  }}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <div className="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500 transition-colors">
                    <span className="inline-flex items-center px-3 bg-gray-50 text-gray-500 text-sm font-medium border-r border-gray-300">
                      +220
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (profileMsg) setProfileMsg(null);
                      }}
                      required
                      placeholder="3XXXXXX"
                      className="flex-1 block w-full px-3 py-2.5 text-sm border-none focus:ring-0 text-gray-900"
                    />
                  </div>
                </div>

                {profileMsg && (
                  <div className={`text-sm font-medium p-3 rounded-lg border ${profileMsg.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {profileMsg.text}
                  </div>
                )}

                <div className="pt-4 flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={profileLoading}
                    disabled={!isDirty || profileLoading}
                  >
                    {saveState === 'success' ? '✓ Saved' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Change Password</h3>
            <p className="text-sm text-gray-500 mb-6">Ensure your account is using a long, random password to stay secure.</p>

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
                <Button type="submit" variant="primary" loading={passwordLoading}>
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border border-red-100 rounded-xl overflow-hidden">
          <div className="p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Danger Zone</h3>
            <p className="text-sm text-red-600 mb-6">Once you delete your account, there is no going back. Please be certain.</p>

            <div className="flex items-center justify-between border-t border-red-200 pt-6">
              <div>
                <h4 className="font-semibold text-gray-900">Delete Account</h4>
                <p className="text-sm text-gray-500 mt-1">Permanently delete your account and all associated data.</p>
              </div>
              <button
                type="button"
                onClick={() => alert('Account deletion is not supported in this demo.')}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
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
