import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Modal from '../common/Modal';
import EmptyState from "../common/EmptyState";
import Spinner from "../common/Spinner";

export default function ContributionsTab({ groupId, group, members, isOrganiser, currentCycle: initialCycle }) {
  const [cycles, setCycles] = useState([]);
  const [selectedCycleId, setSelectedCycleId] = useState('');
  const [cycleData, setCycleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    fetchCycles();
  }, [groupId]);

  useEffect(() => {
    if (selectedCycleId) {
      fetchCycleDetail(selectedCycleId);
    }
  }, [selectedCycleId]);

  const fetchCycles = async () => {
    try {
      const res = await api.get(`/cycles/group/${groupId}`);
      setCycles(res.data.data);
      if (res.data.data.length > 0) {
        // Find current collecting cycle, else just pick the first one
        const active = res.data.data.find(c => c.status === 'COLLECTING') || res.data.data[0];
        setSelectedCycleId(active.id);
      }
    } catch (err) {
      setError('Failed to load cycles for dropdown.');
    } finally {
      setLoading(false);
    }
  };

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
      await fetchCycles(); // refresh dropdown statuses
      await fetchCycleDetail(selectedCycleId);
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to complete cycle');
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

  if (loading) return <Spinner />;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (cycles.length === 0) return <EmptyState title="No active cycles" description="There are currently no active cycles for this group." />;

  const isCycleComplete = cycleData?.status === 'PAID_OUT';
  const progressPercent = cycleData ? Math.min(100, Math.round((cycleData.total_collected / cycleData.total_expected) * 100)) : 0;

  return (
    <div className="space-y-6">
      {/* Cycle Selector */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4 md:mb-0">Cycle Contributions</h2>
          {cycleData && (
            <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
               <div className="text-sm text-gray-500">Recipient:</div>
               <div className="flex items-center">
                 <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold mr-2">
                    {cycleData.payoutUser?.full_name?.charAt(0)}
                 </div>
                 <div className="text-sm font-bold text-gray-900">{cycleData.payoutUser?.full_name}</div>
               </div>
            </div>
          )}
        </div>
        
        {cycles.length <= 6 ? (
          <div className="flex flex-wrap gap-2">
            {cycles.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCycleId(c.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCycleId === c.id ? 'bg-green-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Cycle {c.cycle_number}
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
      </div>

      {cycleData && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-8 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="relative w-24 h-24 mr-6">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className="text-green-500"
                    strokeDasharray={`${progressPercent}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <span className="text-xl font-bold text-gray-900">{cycleData.contributions?.length || 0}</span>
                  <span className="text-xs text-gray-500 block">/ {members.length}</span>
                </div>
              </div>
              
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <h3 className="text-xl font-bold text-gray-900">Collection Status</h3>
                  <Badge status={cycleData.status} />
                </div>
                <div className="text-sm text-gray-500">
                  <span className="font-semibold text-green-700">{formatCurrency(cycleData.total_collected)}</span> collected of <span className="font-medium text-gray-900">{formatCurrency(cycleData.total_expected)}</span>
                </div>
              </div>
            </div>

            {isOrganiser && !isCycleComplete && cycleData.status === 'COLLECTING' && progressPercent === 100 && (
               <Button variant="primary" onClick={handleCompleteCycle} loading={actionLoading} className="w-full md:w-auto px-6 py-3">
                 Finalise & Payout
               </Button>
            )}
          </div>
          
          <ul className="divide-y divide-gray-200">
            {members.map(member => {
              // Check if this member has paid in the current cycle
              const contribution = cycleData.contributions?.find(c => c.user_id === member.user.id);
              const hasPaid = !!contribution;

              return (
                <li key={member.id} className={`px-6 py-4 flex items-center justify-between ${hasPaid ? 'bg-green-50' : 'bg-white'}`}>
                  <div className="flex items-center">
                    {hasPaid ? (
                      <svg className="h-6 w-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <div className="h-6 w-6 rounded-full border-2 border-gray-300 mr-3"></div>
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
                  {!isOrganiser && hasPaid && (
                     <Badge status="PAID" />
                  )}
                  {!isOrganiser && !hasPaid && (
                     <Badge status="UNPAID" />
                  )}
                </li>
              );
            })}
          </ul>
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