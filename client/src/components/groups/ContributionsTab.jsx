import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Modal from '../common/Modal';
import EmptyState from "../common/EmptyState";
import Spinner from "../common/Spinner";

function CircularProgress({ value, max }) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <svg aria-hidden="true" width="100" height="100" className="-rotate-90">
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
  const [cycles, setCycles] = useState([]);
  const [selectedCycleId, setSelectedCycleId] = useState('');
  const [cycleData, setCycleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false);

  const fetchCycles = useCallback(async () => {
    try {
      const res = await api.get(`/cycles/group/${groupId}`);
      setCycles(res.data.data);
      if (res.data.data.length > 0) {
        const active = res.data.data.find(c => c.status === 'COLLECTING') || res.data.data[0];
        setSelectedCycleId(active.id);
      }
    } catch (err) {
      setError(err?.response?.data?.error?.message || 'Failed to load cycles for dropdown.');
      if (import.meta.env.DEV) console.warn('[ContributionsTab] fetchCycles error:', err?.message);
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
      if (import.meta.env.DEV) console.warn('[ContributionsTab] fetchCycleDetail error:', err?.message);
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
      toast.error(err.response?.data?.error?.message || 'Failed to record payment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmComplete = () => {
    setConfirmCompleteOpen(true);
  };

  const handleCompleteCycle = async () => {
    setActionLoading(true);
    setConfirmCompleteOpen(false);
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
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || 'Failed to complete cycle.');
      if (import.meta.env.DEV) console.warn('[ContributionsTab] completeCycle error:', err?.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <div className="p-8 text-center text-red-500" role="alert">{error}</div>;
  if (cycles.length === 0) return <EmptyState title="No active cycles" description="There are currently no active cycles for this group." />;

  const isCycleComplete = cycleData?.status === 'PAID_OUT';

  return (
    <div className="space-y-5">
      <div className="overflow-x-auto scrollbar-hide
                      -mx-4 px-4 sm:mx-0 sm:px-0 mb-4">
        <div className="flex gap-2 pb-2 min-w-max sm:min-w-0
                        sm:flex-wrap">
          {cycles.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCycleId(c.id)}
              className={`
                flex-shrink-0 flex items-center gap-1.5
                px-3 py-1.5 rounded-full text-sm
                font-medium transition-all whitespace-nowrap
                ${selectedCycleId === c.id
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }
              `}>
              Cycle {c.cycle_number}
              {c.status === 'COLLECTING' && (
                <span className="w-1.5 h-1.5 bg-amber-400
                                 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {cycleData && (
        <div className="flex flex-col lg:flex-row gap-5">

          <div className="lg:w-48 bg-gray-50 rounded-xl p-5
                          flex flex-col items-center
                          justify-center">
            <CircularProgress
              value={cycleData.contributions?.length || 0}
              max={members.length}
            />
            <p className="text-sm font-semibold text-gray-900 mt-3">
              {cycleData.contributions?.length || 0} of {members.length} paid
            </p>
            <p className="text-xs text-gray-400 mt-1 text-center">
              <span className="whitespace-nowrap">
                {formatCurrency(cycleData.total_collected)}
              </span>
              {' / '}
              <span className="whitespace-nowrap">
                {formatCurrency(cycleData.total_expected)}
              </span>
            </p>
            {isOrganiser && !isCycleComplete && cycleData.status === 'COLLECTING' && (cycleData.contributions?.length || 0) === members.length && (
              <Button variant="primary" onClick={handleConfirmComplete} loading={actionLoading} className="mt-4 w-full">
                Finalise & Payout
              </Button>
            )}
          </div>

          <div className="flex-1 space-y-2">
            {members.map(member => {
              const contribution = cycleData.contributions?.find(c => c.user_id === member.user.id);
              const hasPaid = !!contribution;

              return (
                <div key={member.id} className={`
                  flex items-center gap-3 p-3 rounded-xl border transition-colors min-w-0
                  ${hasPaid ? 'bg-green-50 border-green-100' : 'bg-white border-gray-200 hover:bg-gray-50'}
                `}>
                  <div className="flex-shrink-0">
                    {hasPaid ? (
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg aria-hidden="true" className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-5 h-5 bg-gray-200 rounded-full flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {member.user.fullName}
                    </p>
                    {hasPaid ? (
                      <p className="text-xs text-green-600">Paid {formatDate(contribution.paid_at)}</p>
                    ) : (
                      <p className="text-xs text-gray-400">Not paid yet</p>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    {hasPaid ? (
                      <span className="text-sm font-semibold text-green-700 whitespace-nowrap">
                        {formatCurrency(contribution.amount)}
                      </span>
                    ) : isOrganiser ? (
                      <button
                        onClick={() => {
                          setSelectedMember(member.user);
                          setIsModalOpen(true);
                        }}
                        className="text-xs font-semibold text-green-600
                                   bg-green-50 hover:bg-green-100
                                   px-3 py-1.5 rounded-lg
                                   transition-colors whitespace-nowrap
                                   min-h-0 h-auto">
                        Mark Paid
                      </button>
                    ) : (
                      <Badge status="UNPAID" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
                className="w-full px-3 py-3 text-base border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed text-gray-500"
              />
            </div>
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <p className="text-sm text-gray-500">Member</p>
              <p className="font-medium text-gray-900">{selectedMember.fullName}</p>
              <div className="mt-2 flex justify-between">
                <span className="text-sm text-gray-500">Amount Due</span>
                <span className="font-bold text-gray-900 whitespace-nowrap">{formatCurrency(group.contribution_amount)}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note (Optional)</label>
              <input
                name="note"
                type="text"
                placeholder="e.g. Cash, Bank Transfer..."
                className="w-full px-3 py-3 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
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

      <Modal
        isOpen={confirmCompleteOpen}
        onClose={() => setConfirmCompleteOpen(false)}
        title="Finalise Cycle"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <span className="text-amber-500 text-xl">📦</span>
            <div>
              <p className="text-sm font-semibold text-amber-700">This will finalise the payout.</p>
              <p className="text-sm text-amber-600 mt-1">
                Once confirmed, this cycle will be marked as paid out and the next cycle will begin.
              </p>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setConfirmCompleteOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCompleteCycle} loading={actionLoading} className="flex-1">
              Yes, Finalise
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
