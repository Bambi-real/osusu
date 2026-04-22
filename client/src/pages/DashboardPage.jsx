import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageWrapper from '../components/layout/PageWrapper';
import api from '../api/axios';
import GroupCard from '../components/groups/GroupCard';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { formatCurrency } from '../utils/helpers';

export default function DashboardPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await api.get('/groups/my');
      setGroups(res.data.data);
    } catch (err) {
      setError('Failed to load groups.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    setJoinLoading(true);
    setJoinError(null);
    try {
      await api.post('/groups/join', { inviteCode });
      setIsJoinModalOpen(false);
      setInviteCode('');
      setLoading(true);
      fetchGroups();
    } catch (err) {
      setJoinError(err.response?.data?.error?.message || 'Failed to join group.');
    } finally {
      setJoinLoading(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
           <div className="relative w-16 h-16">
             <div className="absolute inset-0 border-4 border-indigo-100 rounded-full animate-ping opacity-75"></div>
             <div className="absolute inset-2 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
           </div>
           <p className="text-indigo-600 font-bold tracking-widest uppercase text-xs animate-pulse">Loading Groups...</p>
        </div>
      </PageWrapper>
    );
  }

  const totalContributions = groups.reduce((acc, g) => acc + (g.contribution_amount || 0), 0);
  const activeGroups = groups.filter(g => g.status === 'active').length;

  const organisedGroups = groups.filter(g => g.organiser_id === user?.id);
  const joinedGroups = groups.filter(g => g.organiser_id !== user?.id);

  return (
    <PageWrapper>
      <div className="mb-10 ">
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 rounded-[32px] p-8 sm:p-12 shadow-indigo-500/20 shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-black/10 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-white/10">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                Welcome Back
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">{user?.fullName?.split(' ')[0]}</span> 👋
              </h1>
              <p className="text-indigo-100 text-lg max-w-xl leading-relaxed font-medium">
                Here’s what’s happening with your osusu groups today. Keep growing your savings together!
              </p>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
               <Button variant="secondary" onClick={() => setIsJoinModalOpen(true)} className="!bg-white/10 !border-white/20 !text-white hover:!bg-white/20 backdrop-blur-md">
                 <svg className="w-5 h-5 mr-2 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                 Join
               </Button>
               <Link to="/groups/new">
                 <Button className="bg-white text-gray-900 hover:bg-gray-100 shadow-xl border-none">
                   <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                   New Group
                 </Button>
               </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 " style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
         <div className="bg-white p-6 rounded-[24px] border border-slate-100 border-l-4 border-l-blue-500 shadow-sm flex items-center justify-between hover:shadow-xl transition-all">
           <div className="flex items-center gap-5">
             <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
               <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
             </div>
             <div>
               <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Total Groups</p>
               <p className="text-3xl font-black text-slate-800 tracking-tight">{groups.length}</p>
             </div>
           </div>
           <div className="text-sm font-medium text-blue-500 bg-blue-50 px-2 py-1 rounded">
             +1 this month
           </div>
         </div>
         <div className="bg-white p-6 rounded-[24px] border border-slate-100 border-l-4 border-l-indigo-500 shadow-sm flex items-center justify-between hover:shadow-xl transition-all">
           <div className="flex items-center gap-5">
             <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
               <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </div>
             <div>
               <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Active Cycles</p>
               <p className="text-3xl font-black text-slate-800 tracking-tight">{activeGroups}</p>
             </div>
           </div>
           <div className="text-sm font-medium text-indigo-500 bg-indigo-50 px-2 py-1 rounded">
             On track
           </div>
         </div>
         <div className="bg-white p-6 rounded-[24px] border border-slate-100 border-l-4 border-l-amber-500 shadow-sm flex items-center justify-between hover:shadow-xl transition-all">
           <div className="flex items-center gap-5">
             <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
               <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08-.402-2.599-1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </div>
             <div>
               <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Contributions</p>
               <p className="text-3xl font-black text-slate-800 tracking-tight">{formatCurrency(totalContributions)}</p>
             </div>
           </div>
           <div className="text-sm font-medium text-amber-500 bg-amber-50 px-2 py-1 rounded">
             +5.2%
           </div>
         </div>
      </div>

      {error && <div className="mb-6 p-4 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl font-medium ">{error}</div>}

      {groups.length === 0 && !error ? (
        <EmptyState 
          title="No groups found"
          description="Welcome to Osusu! Get started by creating a new group or joining an existing one using an invite code."
          action={
            <div className="mt-4 flex space-x-3">
               <Button variant="secondary" onClick={() => setIsJoinModalOpen(true)}>Join a Group</Button>
               <Link to="/groups/new">
                 <Button variant="primary">Create New Group</Button>
               </Link>
            </div>
          }
        />
      ) : (
        <div className="space-y-12" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
          
          {organisedGroups.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Groups You Organise</h2>
                <div className="h-px bg-slate-200 flex-1 ml-6"></div>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {organisedGroups.map(group => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            </div>
          )}

          {joinedGroups.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Groups You Joined</h2>
                <div className="h-px bg-slate-200 flex-1 ml-6"></div>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {joinedGroups.map(group => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {isJoinModalOpen && (
        <Modal 
          isOpen={isJoinModalOpen} 
          onClose={() => setIsJoinModalOpen(false)}
          title="Join a Group"
        >
          <form onSubmit={handleJoinGroup} className="space-y-6">
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex gap-4">
              <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              </div>
              <p className="text-sm text-indigo-800 font-medium leading-relaxed">
                Enter the secret invite code provided by the group organiser to securely join their rotating savings cycle.
              </p>
            </div>
            
            <Input 
              name="inviteCode"
              label="Invite Code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="e.g. 123e4567-e89b..."
              required
            />
            {joinError && <div className="text-rose-500 text-sm font-bold animate-pulse">{joinError}</div>}
            
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsJoinModalOpen(false)} type="button" className="text-slate-500">
                Cancel
              </Button>
              <Button variant="primary" type="submit" loading={joinLoading}>
                Join Group
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </PageWrapper>
  );
}
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    setJoinLoading(true);
    setJoinError(null);
    try {
      await api.post('/groups/join', { inviteCode });
      setIsJoinModalOpen(false);
      setInviteCode('');
      setLoading(true);
      fetchGroups();
    } catch (err) {
      setJoinError(err.response?.data?.error?.message || 'Failed to join group.');
    } finally {
      setJoinLoading(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
           <div className="relative w-16 h-16">
             <div className="absolute inset-0 border-4 border-indigo-100 rounded-full animate-ping opacity-75"></div>
             <div className="absolute inset-2 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
           </div>
           <p className="text-indigo-600 font-bold tracking-widest uppercase text-xs animate-pulse">Loading Groups...</p>
        </div>
      </PageWrapper>
    );
  }

  // Calculate some mock stats for the vibrant dashboard
  const totalContributions = groups.reduce((acc, g) => acc + (g.contribution_amount || 0), 0);
  const activeGroups = groups.filter(g => g.status === 'active').length;

  return (
    <PageWrapper>
      <div className="mb-10 ">
        {/* Vibrant Welcome Banner */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 rounded-[32px] p-8 sm:p-12 shadow-indigo-500/20 shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-black/10 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-white/10">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                Welcome Back
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">{user?.fullName?.split(' ')[0]}</span> 👋
              </h1>
              <p className="text-indigo-100 text-lg max-w-xl leading-relaxed font-medium">
                Here’s what’s happening with your osusu groups today. Keep growing your savings together!
              </p>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
               <Button variant="secondary" onClick={() => setIsJoinModalOpen(true)} className="!bg-white/10 !border-white/20 !text-white hover:!bg-white/20 backdrop-blur-md">
                 <svg className="w-5 h-5 mr-2 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                 Join
               </Button>
               <Link to="/groups/new">
                 <Button className="bg-white text-gray-900 hover:bg-gray-100 shadow-xl border-none">
                   <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                   New Group
                 </Button>
               </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Vibrant Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 " style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
         <div className="bg-white p-6 rounded-[24px] border border-slate-100 border-l-4 border-l-blue-500 shadow-sm flex items-center justify-between hover:shadow-xl transition-all">
           <div className="flex items-center gap-5">
             <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
               <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
             </div>
             <div>
               <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Total Groups</p>
               <p className="text-3xl font-black text-slate-800 tracking-tight">{groups.length}</p>
             </div>
           </div>
           <div className="text-sm font-medium text-blue-500 bg-blue-50 px-2 py-1 rounded">
             +1 this month
           </div>
         </div>
         <div className="bg-white p-6 rounded-[24px] border border-slate-100 border-l-4 border-l-indigo-500 shadow-sm flex items-center justify-between hover:shadow-xl transition-all">
           <div className="flex items-center gap-5">
             <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
               <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </div>
             <div>
               <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Active Cycles</p>
               <p className="text-3xl font-black text-slate-800 tracking-tight">{activeGroups}</p>
             </div>
           </div>
           <div className="text-sm font-medium text-indigo-500 bg-indigo-50 px-2 py-1 rounded">
             On track
           </div>
         </div>
         <div className="bg-white p-6 rounded-[24px] border border-slate-100 border-l-4 border-l-amber-500 shadow-sm flex items-center justify-between hover:shadow-xl transition-all">
           <div className="flex items-center gap-5">
             <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
               <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </div>
             <div>
               <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Contributions</p>
               <p className="text-3xl font-black text-slate-800 tracking-tight">{formatCurrency(totalContributions)}</p>
             </div>
           </div>
           <div className="text-sm font-medium text-amber-500 bg-amber-50 px-2 py-1 rounded">
             +5.2%
           </div>
         </div>
      </div>

      {error && <div className="mb-6 p-4 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl font-medium ">{error}</div>}

      {groups.length === 0 && !error ? (
        <EmptyState 
          title="No groups found"
          description="Welcome to Osusu! Get started by creating a new group or joining an existing one using an invite code."
          action={
            <div className="mt-4 flex space-x-3">
               <Button variant="secondary" onClick={() => setIsJoinModalOpen(true)}>Join a Group</Button>
               <Link to="/groups/new">
                 <Button variant="primary">Create New Group</Button>
               </Link>
            </div>
          }
        />
      ) : (
        <div className="space-y-12" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
          
          {organisedGroups.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Groups You Organise</h2>
                <div className="h-px bg-slate-200 flex-1 ml-6"></div>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {organisedGroups.map(group => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            </div>
          )}

          {joinedGroups.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Groups You Joined</h2>
                <div className="h-px bg-slate-200 flex-1 ml-6"></div>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {joinedGroups.map(group => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {isJoinModalOpen && (
        <Modal 
          isOpen={isJoinModalOpen} 
          onClose={() => setIsJoinModalOpen(false)}
          title="Join a Group"
        >
          <form onSubmit={handleJoinGroup} className="space-y-6">
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex gap-4">
              <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              </div>
              <p className="text-sm text-indigo-800 font-medium leading-relaxed">
                Enter the secret invite code provided by the group organiser to securely join their rotating savings cycle.
              </p>
            </div>
            
            <Input 
              name="inviteCode"
              label="Invite Code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="e.g. 123e4567-e89b..."
              required
            />
            {joinError && <div className="text-rose-500 text-sm font-bold animate-pulse">{joinError}</div>}
            
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsJoinModalOpen(false)} type="button" className="text-slate-500">
                Cancel
              </Button>
              <Button variant="primary" type="submit" loading={joinLoading}>
                Join Group
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </PageWrapper>
  );
}
