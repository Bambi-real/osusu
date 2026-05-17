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
import { formatCurrency, formatDate } from '../utils/helpers';
import { deleteGroup, cancelGroup } from '../api/groups';
import ScheduleTab from '../components/groups/ScheduleTab';
import ContributionsTab from '../components/groups/ContributionsTab';

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

  const copyToClipboard = () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(data.group.invite_code);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = data.group.invite_code;
        document.body.appendChild(textArea);
        textArea.select();
        try { document.execCommand('copy'); } catch (err) {}
        document.body.removeChild(textArea);
      }
      alert('Invite code copied!');
    } catch (err) {
      alert(`Invite code is: ${data.group.invite_code}`);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <LoadingSpinner fullPage />
      </PageWrapper>
    );
  }

  if (error || !data) {
    return (
      <PageWrapper>
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">{error}</div>
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </PageWrapper>
    );
  }

  const { group, members, organiser, currentCycle } = data;
  const isOrganiser = user?.id === organiser.id;

  return (
    <PageWrapper>
      <div className="bg-white shadow rounded-lg mb-8 mt-6">
        <div className="px-4 py-6 sm:px-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{group.name}</h1>
              <Badge status={group.status} />
            </div>
            {isOrganiser && group.status === 'FORMING' && (
              <div className="inline-flex items-center bg-gray-100 rounded-full px-4 py-1.5 border border-gray-200">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-2">Invite Code</span>
                <span className="text-sm font-mono font-bold text-gray-900">{group.invite_code}</span>
                <button onClick={copyToClipboard} className="ml-2 text-gray-400 hover:text-green-600 focus:outline-none transition-colors" title="Copy code">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </button>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-y-2 text-sm text-gray-600">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              group.frequency === 'DAILY' ? 'bg-purple-100 text-purple-700' :
              group.frequency === 'WEEKLY' ? 'bg-blue-100 text-blue-700' :
              'bg-green-100 text-green-700'
            }`}>
              {group.frequency === 'DAILY' ? 'Daily' : group.frequency === 'WEEKLY' ? 'Weekly' : 'Monthly'}
            </span>
            <span className="mx-2 text-gray-300">|</span>
            <span className="font-medium text-gray-900">{formatCurrency(group.contribution_amount)}</span>
            <span className="mx-2 text-gray-300">|</span>
            <span>{members.length} of {group.max_members} members</span>
            <span className="mx-2 text-gray-300">|</span>
            <span>Started {formatDate(group.start_date)}</span>
            <span className="mx-2 text-gray-300">|</span>
            <span>
              Organiser: <span className="font-medium text-gray-900">{isOrganiser ? `${user.fullName} (You)` : organiser.full_name}</span>
            </span>
          </div>
          <div className="mt-4 text-sm">
            {group.description ? (
              <p className="text-gray-700">{group.description}</p>
            ) : (
              <p className="text-gray-400 italic">No description provided.</p>
            )}
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-t border-gray-200 px-4 sm:px-6 flex space-x-8 text-sm font-medium">
          <button 
            className={`py-4 border-b-2 outline-none focus:outline-none ${activeTab === 'overview' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-green-700'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          
          {(group.status === 'ACTIVE' || group.status === 'COMPLETED') && (
            <button 
              className={`py-4 border-b-2 outline-none focus:outline-none ${activeTab === 'contributions' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-green-700'}`}
              onClick={() => setActiveTab('contributions')}
            >
              Contributions
            </button>
          )}

          {group.status !== 'FORMING' && (
            <button 
              className={`py-4 border-b-2 outline-none focus:outline-none ${activeTab === 'schedule' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-green-700'}`}
              onClick={() => setActiveTab('schedule')}
            >
              Schedule
            </button>
          )}
        </div>
      </div>

      {group.status === 'CANCELLED' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <span className="text-red-500 text-lg mt-0.5">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-red-700">
              This group has been cancelled
            </p>
            <p className="text-sm text-red-600 mt-0.5">
              No new contributions can be recorded. All existing records are preserved
              below for your reference. Please contact the organiser if you have
              outstanding amounts.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'overview' && (
        <>
          {group.status === 'FORMING' && isOrganiser && (
            <div className="mb-8">
              <div className="bg-green-50 rounded-xl p-6 border border-green-100 flex flex-col sm:flex-row items-center justify-between">
                <div className="mb-4 sm:mb-0">
                  <h3 className="text-lg font-bold text-green-900 mb-1">Ready to start the group?</h3>
                  <p className="text-sm text-green-700">You have {members.length} of {group.max_members} members. Starting locks the list and creates the schedule.</p>
                  
                  <div className="mt-3 flex items-center">
                    <div className="w-48 bg-green-200 rounded-full h-2.5 mr-3">
                      <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${(members.length / group.max_members) * 100}%` }}></div>
                    </div>
                    <span className="text-xs font-semibold text-green-800">{members.length}/{group.max_members} joined</span>
                  </div>
                </div>
                
                <Button 
                  variant="primary" 
                  onClick={handleStartGroup} 
                  loading={startLoading}
                  disabled={members.length < 2}
                  className="w-full sm:w-auto px-8 py-3 text-base shadow-sm"
                >
                  Start Group
                </Button>
              </div>
            </div>
          )}

          <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Members & Payout Order</h3>
              <span className="text-sm text-gray-500">{members.length} member(s)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Draw Position</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {members.map((member) => {
                    const isCurrentRecipient = currentCycle?.payout_user_id === member.user.id;
                    const initials = member.user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                    
                    return (
                      <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">
                              {initials}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 flex items-center">
                                {member.user.fullName}
                                {member.user.id === user.id && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">You</span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">{member.user.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className={`inline-flex items-center gap-1.5 ${isCurrentRecipient ? 'bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1 rounded-full' : 'bg-gray-100 text-gray-500 border border-gray-200 h-8 w-8 rounded-full justify-center'}`}>
                            {isCurrentRecipient ? (
                              <><span className="text-sm">🏆</span><span className="text-sm font-bold">Cycle {member.payout_order}</span></>
                            ) : (
                              <span className="text-sm font-bold">{member.payout_order}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                          {formatDate(member.joined_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {isOrganiser && group.status !== 'CANCELLED' && (
            <div className="mt-10 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Group Management
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                {group.status === 'FORMING' && (
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 
                               text-red-600 text-sm font-medium hover:bg-red-50 transition-all"
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
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-200 
                               text-amber-700 text-sm font-medium hover:bg-amber-50 transition-all"
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
        </>
      )}

      {activeTab === 'schedule' && <ScheduleTab groupId={id} />}
      
      {activeTab === 'contributions' && (
         <ContributionsTab 
           groupId={id} 
           group={group} 
           members={members} 
           isOrganiser={isOrganiser} 
           currentCycle={currentCycle} 
         />
      )}

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
              <p className="text-sm font-semibold text-red-700">
                This action cannot be undone.
              </p>
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
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700
                         text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteGroup}
              disabled={actionLoading}
              className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white text-sm
                         font-semibold hover:bg-red-700 disabled:opacity-50 transition-all
                         flex items-center justify-center gap-2"
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
              <p className="text-sm font-semibold text-amber-700">
                This will stop all group activity.
              </p>
              <p className="text-sm text-amber-600 mt-1">
                Archiving <strong>{group.name}</strong> will prevent any new contributions
                from being recorded. All existing contribution history will be preserved
                and members can still view their records.
              </p>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              What happens next
            </p>
            <ul className="space-y-1">
              <li className="text-sm text-gray-600 flex items-center gap-2">
                <span className="text-green-500">✓</span>
                All contribution history is kept permanently
              </li>
              <li className="text-sm text-gray-600 flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Members can still view the group and their records
              </li>
              <li className="text-sm text-gray-600 flex items-center gap-2">
                <span className="text-red-400">✗</span>
                No new contributions can be recorded
              </li>
              <li className="text-sm text-gray-600 flex items-center gap-2">
                <span className="text-red-400">✗</span>
                This cannot be reversed
              </li>
            </ul>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowCancelModal(false)}
              disabled={actionLoading}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700
                         text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-all"
            >
              Keep Group Active
            </button>
            <button
              onClick={handleCancelGroup}
              disabled={actionLoading}
              className="flex-1 px-4 py-2 rounded-lg bg-amber-500 text-white text-sm
                         font-semibold hover:bg-amber-600 disabled:opacity-50 transition-all
                         flex items-center justify-center gap-2"
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
