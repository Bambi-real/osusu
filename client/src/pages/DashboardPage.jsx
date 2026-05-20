import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import PageWrapper from '../components/layout/PageWrapper';
import api from '../api/axios';
import GroupCard from '../components/groups/GroupCard';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency, formatRelativeDate } from '../utils/helpers';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    document.title = 'Dashboard — Osusu';

    const loadData = async () => {
      try {
        const [groupsRes, contribsRes] = await Promise.all([
          api.get('/groups/my'),
          api.get('/contributions/my'),
        ]);
        if (!cancelled) {
          setGroups(groupsRes.data.data);
          setContributions(contribsRes.data.data || []);
        }
      } catch {
        if (!cancelled) setError('Failed to load data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();
    return () => { cancelled = true; };
  }, []);

  const fetchData = async () => {
    try {
      const [groupsRes, contribsRes] = await Promise.all([
        api.get('/groups/my'),
        api.get('/contributions/my'),
      ]);
      setGroups(groupsRes.data.data);
      setContributions(contribsRes.data.data || []);
    } catch {
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    setJoinLoading(true);
    setJoinError(null);
    try {
      const res = await api.post('/groups/join', { inviteCode: inviteCode.trim() });
      const groupId = res.data.data.groupId;
      toast.success(`You've joined ${res.data.data.name || 'the group'}!`);
      setIsJoinModalOpen(false);
      setInviteCode('');
      setTimeout(() => navigate(`/groups/${groupId}`), 800);
    } catch (err) {
      const status = err.response?.status;
      const msg    = err.response?.data?.error?.message;
      if (status === 404) {
        setJoinError('Invite code not found. Check the code and try again.');
      } else if (status === 409) {
        setJoinError('You are already a member of this group.');
      } else if (status === 400) {
        setJoinError(msg || 'This group is not accepting new members.');
      } else {
        setJoinError(msg || 'Something went wrong. Please try again.');
      }
    } finally {
      setJoinLoading(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-gray-400">Loading...</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <span className="text-4xl mb-4">⚠️</span>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-sm text-gray-400 mb-6 max-w-sm">{error}</p>
          <Button variant="secondary" onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </PageWrapper>
    );
  }

  const firstName = user?.fullName?.split(' ')[0] || user?.fullName || 'there';
  const activeGroups = groups.filter(g => g.status !== 'CANCELLED');
  const statsActiveGroups = groups.filter(g => g.status === 'ACTIVE');
  const archivedGroups = groups.filter(g => g.status === 'CANCELLED');
  const totalSaved = contributions.reduce((sum, c) => sum + Number(c.amount || 0), 0);

  const nextPayoutGroup = [...activeGroups]
    .filter(g => g.status === 'ACTIVE')
    .sort((a, b) => (a.payout_order || 999) - (b.payout_order || 999))[0] || null;
  const nextPayoutDueDate = nextPayoutGroup?.next_due_date || null;

  const subtext = activeGroups.length === 0
    ? "You haven't joined any groups yet. Create one or join with an invite code."
    : activeGroups.length === 1
    ? 'You have 1 active group. Keep the contributions going!'
    : `You are part of ${activeGroups.length} groups. Keep growing your savings together!`;

  return (
    <PageWrapper>
      <div className="page-enter space-y-8">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-green-600 via-green-600 to-green-700 rounded-[32px] p-8 sm:p-12 shadow-green-600/20 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-black/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-white/10">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                Welcome Back
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Hello, {firstName}
              </h1>
              <p className="text-green-100 text-base max-w-xl leading-relaxed">
                {subtext}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <Button
                variant="secondary"
                onClick={() => setIsJoinModalOpen(true)}
                className="!bg-white/10 !border-white/30 !text-white hover:!bg-white/20 w-full sm:w-auto"
              >
                Join
              </Button>
              <Link to="/groups/new">
                <Button variant="secondary" className="bg-white text-green-700 font-semibold hover:bg-green-50 px-5 py-2.5 rounded-full border border-white/30 w-full sm:w-auto">
                  + New Group
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm h-full">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600 mb-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-gray-900">{activeGroups.length}</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mt-0.5">Total Groups</p>
            <p className="text-xs text-gray-400 mt-0.5">{groups.length} total</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm h-full">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 mb-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-gray-900">{statsActiveGroups.length}</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mt-0.5">Active Groups</p>
            <p className="text-xs text-gray-400 mt-0.5">{statsActiveGroups.length > 0 ? `${statsActiveGroups.length} collecting` : 'None active'}</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm h-full">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 mb-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 truncate" title={nextPayoutGroup?.name}>
                {nextPayoutGroup?.name ?? '—'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {nextPayoutDueDate
                  ? formatRelativeDate(nextPayoutDueDate)
                  : 'No upcoming payout'}
              </p>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mt-0.5">Next Payout</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {nextPayoutGroup ? `Draw #${nextPayoutGroup.payout_order}` : 'No upcoming'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm h-full">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 mb-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08-.402-2.599-1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-gray-900 whitespace-nowrap">
              {formatCurrency(totalSaved)}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mt-0.5">Total Saved</p>
            <p className="text-xs text-gray-400 mt-0.5">Gambian Dalasi saved</p>
          </div>
        </div>

        {/* Your Groups Section */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Your Groups</h2>

          {activeGroups.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">🤝</span>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">No groups yet</h3>
              <p className="text-sm text-gray-400 max-w-xs mb-6">
                Create a new osusu group or join one using an invite code.
              </p>
              <div className="flex gap-3">
                <Button variant="primary" onClick={() => setIsJoinModalOpen(true)}>
                  Join with Code
                </Button>
                <Link to="/groups/new">
                  <Button variant="primary" className="bg-green-600 hover:bg-green-700 text-white">
                    Create Group
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className={`grid gap-5 ${activeGroups.length === 1 ? 'grid-cols-1 max-w-sm' : activeGroups.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
              {activeGroups.map(group => (
                <GroupCard
                  key={group.id}
                  group={group}
                  isOrganiser={group.organiser_id === user?.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Archived Groups */}
        {archivedGroups.length > 0 && (
          <div className="pt-4">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className={`w-4 h-4 transition-transform ${showArchived ? 'rotate-90' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              Archived Groups ({archivedGroups.length})
            </button>

            {showArchived && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {archivedGroups.map(group => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    isOrganiser={group.organiser_id === user?.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Join Modal */}
        {isJoinModalOpen && (
          <Modal
            isOpen={isJoinModalOpen}
            onClose={() => setIsJoinModalOpen(false)}
            title="Join a Group"
          >
            <form onSubmit={handleJoinGroup} className="space-y-6">
              <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex gap-4">
                <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <p className="text-sm text-green-800 font-medium leading-relaxed">
                  Enter the secret invite code provided by the group organiser to securely join their rotating savings cycle.
                </p>
              </div>

              <Input
                name="inviteCode"
                label="Invite Code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.trim())}
                placeholder="e.g. 123e4567-e89b..."
                required
              />
              {joinError && <div className="text-rose-500 text-sm font-bold">{joinError}</div>}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button variant="ghost" onClick={() => setIsJoinModalOpen(false)} type="button">
                  Cancel
                </Button>
                <Button variant="primary" type="submit" loading={joinLoading}>
                  Join Group
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </PageWrapper>
  );
}
