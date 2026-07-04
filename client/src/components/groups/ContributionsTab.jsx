import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Modal from '../common/Modal';
import EmptyState from "../common/EmptyState";
import Spinner from "../common/Spinner";
import { useAuth } from '../../context/AuthContext';

function CircularProgress({ value, max }) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <svg width="100" height="100" className="-rotate-90">
      <circle
        cx="50" cy="50" r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="8"
      />
      <circle
        cx="50" cy="50" r={radius}
        fill="none"
        stroke="#16a34a"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        className="transition-all duration-500"
      />
    </svg>
  );
}

export default function ContributionsTab({ groupId, group, members, isOrganiser }) {
  const { user } = useAuth();
  const [cycles, setCycles] = useState([]);
  const [selectedCycleId, setSelectedCycleId] = useState('');
  const [cycleData, setCycleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const fetchCycles = useCallback(async () => {
    try {
      const res = await api.get(`/cycles/group/${groupId}`);
      setCycles(res.data.data);
      if (res.data.data.length > 0) {
        const active = res.data.data.find(c => c.status === 'COLLECTING') || res.data.data[0];
        setSelectedCycleId(active.id);
      }
    } catch {
      setError('Failed to load cycles for dropdown.');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchCycles();
  }, [fetchCycles]);
useEffect(() => {
  if (selectedCycleId) {
    fetchCycleDetail(selectedCycleId);
  }
}, [selectedCycleId]);
  const fetchCycleDetail = async (cycleId) => {
    try {
      const res = await api.get(`/cycles/${cycleId}`);
      setCycleData(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkPaid = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.post('/contributions', {
        groupId,
        cycleId: selectedCycleId,
        userId: selectedMember.id,
        amount: group.contribution_amount,
        note: e.target.elements.note?.value || ''
      });
      setIsModalOpen(false);
      setSelectedMember(null);
      await fetchCycleDetail(selectedCycleId);
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to record payment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteCycle = async () => {
    if (!window.confirm('Are you sure you want to mark this cycle as complete? The payout will be finalised.')) {
      return;
    }
    setActionLoading(true);
    try {
      await api.put(`/cycles/${selectedCycleId}/complete`);
      toast.success('Cycle completed!');
      const res = await api.get(`/cycles/group/${groupId}`);
      const updatedCycles = res.data.data;
      setCycles(updatedCycles);
      const nextCollecting = updatedCycles.find(c => c.status === 'COLLECTING');
      if (nextCollecting) {
        setSelectedCycleId(nextCollecting.id);
      }
    } catch {
      toast.error('Failed to complete cycle.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteContribution = async (contributionId) => {
    if (!window.confirm('Are you sure you want to delete this contribution?')) return;
    try {
      await api.delete(`/contributions/${contributionId}`);
      await fetchCycleDetail(selectedCycleId);
    } catch(err) {
      alert(err.response?.data?.error?.message || 'Failed to delete contribution');
    }
  };
  const handlePayNow = async (memberId) => {
  const fee = (group.contribution_amount * 0.02).toFixed(2);
  const total = (group.contribution_amount * 1.02).toFixed(2);
  const confirmed = window.confirm(
    `Payment Summary:\n\nContribution: GMD ${group.contribution_amount}\nProcessing fee (2%): GMD ${fee}\nTotal charged: GMD ${total}\n\nProceed with payment?`
  );
  if (!confirmed) return;
  setActionLoading(true);
  try {
    const res = await api.post('/contributions/pay-via-hexai', {
      groupId,
      cycleId: selectedCycleId,
      userId: memberId,
      amount: group.contribution_amount
    });
    window.location.href = res.data.payment_link;
  } catch (err) {
    toast.error(err.response?.data?.error?.message || 'Failed to start payment');
    setActionLoading(false);
  }
};

  if (loading) return <Spinner />;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (cycles.length === 0) return <EmptyState title="No active cycles" description="There are currently no active cycles for this group." />;

  const isCycleComplete = cycleData?.status === 'PAID_OUT';

  return (
    <div className="space-y-5">
      {/* Cycle selector + recipient info — full width row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {cycles.length <= 8 ? (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide flex-shrink-0">
            {cycles.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCycleId(c.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${selectedCycleId === c.id ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Cycle {c.cycle_number}
                {c.status === 'COLLECTING' && (
                  <span className="ml-1.5 w-1.5 h-1.5 bg-amber-400 rounded-full inline-block" />
                )}
              </button>
            ))}
          </div>
        ) : (
          <select
            className="block w-full md:w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md shadow-sm border"
            value={selectedCycleId}
            onChange={(e) => setSelectedCycleId(e.target.value)}
          >
            {cycles.map(c => (
              <option key={c.id} value={c.id}>
                Cycle {c.cycle_number} — Due {formatDate(c.due_date)} {c.status === 'PAID_OUT' ? '(Completed)' : ''}
              </option>
            ))}
          </select>
        )}
        {cycleData && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex-shrink-0">
            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
              {cycleData.payoutUser?.full_name?.charAt(0) || '?'}
            </div>
            <div>
              <p className="text-xs text-gray-400">Recipient</p>
              <p className="text-sm font-semibold text-gray-900">{cycleData.payoutUser?.full_name}</p>
            </div>
          </div>
        )}
      </div>

      {cycleData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1 bg-gray-50 rounded-xl p-5 flex flex-col items-center justify-center">
            <CircularProgress
              value={cycleData.contributions?.length || 0}
              max={members.length}
            />
            <p className="text-sm font-semibold text-gray-900 mt-3">
              {cycleData.contributions?.length || 0} of {members.length} paid
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {formatCurrency(cycleData.total_collected)} / {formatCurrency(cycleData.total_expected)}
            </p>
            {isOrganiser && !isCycleComplete && cycleData.status === 'COLLECTING' && (cycleData.contributions?.length || 0) === members.length && (
              <Button variant="primary" onClick={handleCompleteCycle} loading={actionLoading} className="mt-4 w-full">
                Finalise & Payout
              </Button>
            )}
          </div>

          <div className="lg:col-span-2 space-y-2">
            {members.map(member => {
              const contribution = cycleData.contributions?.find(c => c.user_id === member.user.id);
              const hasPaid = !!contribution;

              return (
                <div key={member.id} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${hasPaid ? 'bg-emerald-50' : 'bg-white hover:bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                    {hasPaid ? (
                      <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <div className="h-6 w-6 rounded-full border-2 border-gray-300"></div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{member.user.fullName}</div>
                      <div className="text-xs text-gray-500">{hasPaid ? `Paid ${formatDate(contribution.paid_at)}` : 'Unpaid'}</div>
                    </div>
                  </div>

                  {isOrganiser && !isCycleComplete && (
                    <div>
                      {!hasPaid ? (
  <Button
    variant="secondary"
    size="sm"
    onClick={() => {
      setSelectedMember(member.user);
      setIsModalOpen(true);
    }}
  >
    Mark Paid
  </Button>
) : contribution.note === 'Paid via Wave (HexAI)' ? (
  <span className="text-xs text-emerald-600 font-medium px-2 py-1 bg-emerald-50 rounded-full">Wave ✓</span>
) : (
  <Button
    variant="ghost"
    size="sm"
    className="text-red-600 hover:bg-red-50 hover:text-red-700"
    onClick={() => handleDeleteContribution(contribution.id)}
  >
    Undo
  </Button>
)}
                    </div>
                  )}
                  {!isOrganiser && hasPaid && <Badge status="PAID" />}
{!isOrganiser && !hasPaid && member.user.id === user?.id && (
  <Button
    variant="primary"
    size="sm"
    onClick={() => handlePayNow(member.user.id)}
    loading={actionLoading}
  >
    Pay Now
  </Button>
)}
{!isOrganiser && !hasPaid && member.user.id !== user?.id && <Badge status="UNPAID" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mark Paid Modal */}
      {isModalOpen && selectedMember && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Record Payment"
        >
          <form onSubmit={handleMarkPaid} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input 
                type="number" 
                readOnly 
                value={group.contribution_amount} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed text-gray-500"
              />
            </div>
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <p className="text-sm text-gray-500">Member</p>
              <p className="font-medium text-gray-900">{selectedMember.fullName}</p>
              <div className="mt-2 flex justify-between">
                <span className="text-sm text-gray-500">Amount Due</span>
                <span className="font-bold text-gray-900">{formatCurrency(group.contribution_amount)}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note (Optional)</label>
              <input 
                name="note"
                type="text"
                placeholder="e.g. Cash, Bank Transfer..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div className="mt-5 sm:mt-6 flex justify-end space-x-3">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)} type="button">
                Cancel
              </Button>
              <Button variant="primary" type="submit" loading={actionLoading}>
                Confirm Payment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
