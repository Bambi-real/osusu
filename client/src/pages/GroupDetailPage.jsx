import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../utils/helpers';
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

  const copyToClipboard = () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(data.group.invite_code);
      } else {
        // Fallback for insecure contexts (like HTTP local network testing)
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
            <span className="capitalize font-medium">{group.frequency.toLowerCase()}</span>
            <span className="mx-2 text-gray-300">|</span>
            <span className="font-medium text-gray-900">{formatCurrency(group.contribution_amount)}</span>
            <span className="mx-2 text-gray-300">|</span>
            <span>{members.length} of {group.max_members} members</span>
            <span className="mx-2 text-gray-300">|</span>
            <span>Started {formatDate(group.start_date)}</span>
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
            className={`py-4 border-b-2 outline-none focus:outline-none ${activeTab === 'overview' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          
          {group.status !== 'FORMING' && (
            <button 
              className={`py-4 border-b-2 outline-none focus:outline-none ${activeTab === 'contributions' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('contributions')}
            >
              Contributions
            </button>
          )}

          {group.status !== 'FORMING' && (
            <button 
              className={`py-4 border-b-2 outline-none focus:outline-none ${activeTab === 'schedule' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('schedule')}
            >
              Schedule
            </button>
          )}
        </div>
      </div>

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
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Payout Position</th>
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
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                              {initials}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 flex items-center">
                                {member.user.fullName}
                                {member.user.id === user.id && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">You</span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">{member.user.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className={`inline-flex h-8 w-8 rounded-full items-center justify-center text-sm font-bold ${isCurrentRecipient ? 'bg-green-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                            {member.payout_order}
                          </div>
                          {isCurrentRecipient && <div className="text-xs text-green-600 mt-1 font-medium">Current</div>}
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

    </PageWrapper>
  );
}