import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import PageWrapper from '../components/layout/PageWrapper';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency, formatDate, formatRelativeDate } from '../utils/helpers';
import { deleteGroup, cancelGroup } from '../api/groups';
import ScheduleTab from '../components/groups/ScheduleTab';
import ContributionsTab from '../components/groups/ContributionsTab';

const frequencyLabel = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
};

export default function GroupDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startLoading, setStartLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (data) {
      document.title = `${data.group.name} — OsusuApp`;
    } else {
      document.title = 'Group — OsusuApp';
    }
  }, [data]);

  const fetchGroupData = async () => {
    try {
      const res = await api.get(`/groups/${id}`);
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load group details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupData();
  }, [id]);

  const handleStartGroup = async () => {
    setStartLoading(true);
    try {
      await api.post(`/groups/${id}/start`);
      await fetchGroupData();
      setActiveTab('schedule');
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to start group.');
    } finally {
      setStartLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    setActionLoading(true);
    try {
      await deleteGroup(group.id);
      toast.success('Group deleted successfully.');
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Failed to delete group.';
      toast.error(message);
      setShowDeleteModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelGroup = async () => {
    setActionLoading(true);
    try {
      const res = await cancelGroup(group.id);
      toast.success('Group archived. All records have been preserved.');
      setData(prev => ({ ...prev, group: res.data }));
      setShowCancelModal(false);
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Failed to archive group.';
      toast.error(message);
      setShowCancelModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(data.group.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert(`Invite code is: ${data.group.invite_code}`);
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

  if (error || !data) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <span className="text-4xl mb-4">⚠️</span>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-sm text-gray-400 mb-6 max-w-sm">{error || 'Group not found.'}</p>
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </PageWrapper>
    );
  }

  const { group, members, organiser, currentCycle } = data;
  const isOrganiser = user?.id === organiser.id;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    ...(group.status === 'ACTIVE' || group.status === 'COMPLETED' ? [{ id: 'contributions', label: 'Contributions' }] : []),
    ...(group.status !== 'FORMING' ? [{ id: 'schedule', label: 'Schedule' }] : []),
  ];

  return (
    <PageWrapper>
      <div className="page-enter space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-green-600 transition-colors"
          >
            Dashboard
          </button>
          <span className="text-gray-300">/</span>
          <span className="text-gray-600 font-medium truncate max-w-[200px]">
            {group.name}
          </span>
        </nav>

        {/* Group Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
              <Badge status={group.status} />
            </div>

            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
              <span>{frequencyLabel[group.frequency]} · {formatCurrency(group.contribution_amount)}</span>
              <span>{members.length} of {group.max_members} members</span>
              <span>Started {formatDate(group.start_date)}</span>
              <span>
                Organiser: <span className="font-medium text-gray-900">{isOrganiser ? `${user.fullName} (You)` : organiser.full_name}</span>
              </span>
            </div>

            <div className="mt-3 text-sm">
              {group.description ? (
                <p className="text-gray-600">{group.description}</p>
              ) : (
                <p className="text-gray-400 italic">No description provided.</p>
              )}
            </div>
          </div>

          {isOrganiser && group.status === 'FORMING' && (
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 flex-shrink-0">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">INVITE CODE</span>
              <code className="text-sm font-mono font-semibold text-gray-800">{group.invite_code}</code>
              <button
                onClick={handleCopyCode}
                className="text-green-600 hover:text-green-700 text-xs font-medium whitespace-nowrap"
              >
                {copied ? 'Copied ✓' : 'Copy'}
              </button>
            </div>
          )}
        </div>

        {/* Cancelled Banner */}
        {group.status === 'CANCELLED' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <span className="text-red-500 text-lg mt-0.5">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-red-700">This group has been cancelled</p>
              <p className="text-sm text-red-600 mt-0.5">
                No new contributions can be recorded. All existing records are preserved for your reference.
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-green-600 text-green-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {group.status === 'FORMING' && isOrganiser && (
              <div className="bg-green-50 rounded-xl p-6 border border-green-100 flex flex-col sm:flex-row items-center justify-between">
                <div className="mb-4 sm:mb-0">
                  <h3 className="text-lg font-bold text-green-900 mb-1">Ready to start the group?</h3>
                  <p className="text-sm text-green-700">
                    You have {members.length} of {group.max_members} members. Starting locks the list and creates the schedule.
                  </p>
                  <div className="mt-3 flex items-center">
                    <div className="w-48 bg-green-200 rounded-full h-2.5 mr-3">
                      <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${(members.length / group.max_members) * 100}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-green-800">{members.length}/{group.max_members} joined</span>
                  </div>
                </div>
                <Button
                  variant="primary"
                  onClick={handleStartGroup}
                  loading={startLoading}
                  disabled={members.length < 2}
                  className="w-full sm:w-auto"
                >
                  Start Group
                </Button>
              </div>
            )}

            {/* Members List */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Members & Payout Order</h2>
              {members.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-gray-200 rounded-xl">
                  <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
                    <span className="text-xl">👥</span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">No members yet</h3>
                  <p className="text-xs text-gray-400">Share the invite code to add members to this group.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {members.map((member) => {
                    const isCurrentRecipient = currentCycle?.payout_user_id === member.user.id;
                    const initials = member.user.fullName ? member.user.fullName.charAt(0).toUpperCase() : '?';
                    const isYou = member.user.id === user?.id;

                    return (
                      <div
                        key={member.id}
                        className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${
                          isCurrentRecipient ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                          isCurrentRecipient ? 'bg-amber-200 text-amber-800' : 'bg-green-100 text-green-700'
                        }`}>
                          {initials}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {member.user.fullName}
                            </p>
                            {isYou && (
                              <span className="text-xs text-green-600 font-medium flex-shrink-0">(You)</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">
                            {isCurrentRecipient ? '🏆 Receiving this cycle' : `Joined ${formatRelativeDate(member.joined_at)}`}
                          </p>
                        </div>

                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                          isCurrentRecipient ? 'bg-amber-500 text-white' : 'bg-white border-2 border-gray-200 text-gray-600'
                        }`}>
                          {member.payout_order}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Group Management */}
            {isOrganiser && (group.status === 'FORMING' || group.status === 'ACTIVE') && (
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Group Management</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  {group.status === 'FORMING' && (
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Group
                    </button>
                  )}
                  {group.status === 'ACTIVE' && (
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-200 text-amber-700 text-sm font-medium hover:bg-amber-50 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                      Archive Group
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'schedule' && <ScheduleTab groupId={id} />}

        {activeTab === 'contributions' && (
          <ContributionsTab
            groupId={id}
            group={group}
            members={members}
            isOrganiser={isOrganiser}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => !actionLoading && setShowDeleteModal(false)}
        title="Delete Group"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
            <span className="text-red-500 text-xl">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-red-700">This action cannot be undone.</p>
              <p className="text-sm text-red-600 mt-1">
                Deleting <strong>{group.name}</strong> will permanently remove the group
                and all {members.length} member(s) will lose access immediately.
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Since this group has not started yet, no financial records will be lost.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowDeleteModal(false)}
              disabled={actionLoading}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteGroup}
              disabled={actionLoading}
              className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {actionLoading ? <LoadingSpinner size="sm" /> : null}
              {actionLoading ? 'Deleting...' : 'Yes, Delete Group'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Archive Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => !actionLoading && setShowCancelModal(false)}
        title="Archive Group"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <span className="text-amber-500 text-xl">📦</span>
            <div>
              <p className="text-sm font-semibold text-amber-700">This will stop all group activity.</p>
              <p className="text-sm text-amber-600 mt-1">
                Archiving <strong>{group.name}</strong> will prevent any new contributions
                from being recorded. All existing contribution history will be preserved.
              </p>
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">What happens next</p>
            <ul className="space-y-1">
              <li className="text-sm text-gray-600 flex items-center gap-2">
                <span className="text-green-500">✓</span> All contribution history is kept permanently
              </li>
              <li className="text-sm text-gray-600 flex items-center gap-2">
                <span className="text-green-500">✓</span> Members can still view the group and their records
              </li>
              <li className="text-sm text-gray-600 flex items-center gap-2">
                <span className="text-red-400">✗</span> No new contributions can be recorded
              </li>
              <li className="text-sm text-gray-600 flex items-center gap-2">
                <span className="text-red-400">✗</span> This cannot be reversed
              </li>
            </ul>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowCancelModal(false)}
              disabled={actionLoading}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-all"
            >
              Keep Group Active
            </button>
            <button
              onClick={handleCancelGroup}
              disabled={actionLoading}
              className="flex-1 px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {actionLoading ? <LoadingSpinner size="sm" /> : null}
              {actionLoading ? 'Archiving...' : 'Archive Group'}
            </button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}
