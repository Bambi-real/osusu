import { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import BackButton from '../components/common/BackButton';
import Breadcrumb from '../components/common/Breadcrumb';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);
  const [saveState, setSaveState] = useState('idle');

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState(null);

  useEffect(() => {
    document.title = 'Account Settings — Osusu';
  }, []);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone ? user.phone.replace(/^\+220/, '') : '');
    }
  }, [user]);

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

      await api.put('/auth/profile', {
        fullName,
        phone: phoneValue,
      });
      await refreshUser();
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

  const memberSince = user?.created_at || user?.createdAt;
  const formattedMemberSince = memberSince
    ? new Date(memberSince).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  return (
    <PageWrapper>
      <div className="page-enter max-w-4xl mx-auto space-y-8">
        <BackButton fallback="/dashboard" />
        <Breadcrumb items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Account Settings' }
        ]} />
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>

        {/* Profile header card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="w-20 h-20 bg-green-600 rounded-2xl flex items-center justify-center text-2xl font-black text-white flex-shrink-0">
              {user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-xl font-bold text-gray-900">
                {user?.fullName}
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {user?.email}
              </p>
              <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${user?.role === 'ORGANISER' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {user?.role === 'ORGANISER' ? 'Organiser' : 'Member'}
                </span>
                <span className="text-xs text-gray-400">
                  Member since {formattedMemberSince}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8">
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
        <div className="mt-8 p-5 border border-gray-200 rounded-xl">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Danger Zone
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">
                Delete Account
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Contact support to delete your account.
              </p>
            </div>
            <button
              disabled
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-400 text-sm cursor-not-allowed"
            >
              Unavailable
            </button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
