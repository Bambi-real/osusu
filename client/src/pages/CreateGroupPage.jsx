import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import api from '../api/axios';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import BackButton from '../components/common/BackButton';
import { formatCurrency, formatDate } from '../utils/helpers';

const frequencyLabel = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
};

export default function CreateGroupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contributionAmount: '',
    frequency: 'WEEKLY',
    maxMembers: '',
    startDate: '',
  });

  const [inviteCode, setInviteCode] = useState(() => sessionStorage.getItem('createGroup_inviteCode') || null);
  const [groupId, setGroupId] = useState(() => sessionStorage.getItem('createGroup_groupId') || null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = 'Create Group — Osusu';
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    setError(null);
    setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      name: formData.name,
      description: formData.description,
      contributionAmount: Number(formData.contributionAmount),
      frequency: formData.frequency,
      maxMembers: Number(formData.maxMembers),
      startDate: formData.startDate,
    };

    try {
      const res = await api.post('/groups', payload);
      setInviteCode(res.data.data.invite_code);
      setGroupId(res.data.data.id);
      sessionStorage.setItem('createGroup_inviteCode', res.data.data.invite_code);
      sessionStorage.setItem('createGroup_groupId', res.data.data.id);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create group.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
    } catch {
      const el = document.createElement('textarea');
      el.value = inviteCode;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.focus();
      el.select();
      try {
        document.execCommand('copy');
      } catch (execErr) {
        console.error('[INFO] Copy fallback failed:', execErr);
      }
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inviteCode) {
    return (
      <div className="fixed inset-0 z-50 bg-green-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white shadow-2xl rounded-2xl p-5 sm:p-10 text-center animate-fade-in-up">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-8 border-4 border-white shadow-sm">
            <svg aria-hidden="true" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Group Created!</h2>
          <p className="text-xl text-gray-600 mb-10">Share this invite code with your members so they can join.</p>
          
          <div className="flex flex-col items-center justify-center mb-10 bg-gray-50 p-6 rounded-xl border border-gray-100">
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Invite Code</div>
            <div className="flex items-center space-x-4">
              <code className="px-4 py-2 sm:px-6 sm:py-3 bg-white text-green-600 rounded-lg text-xl sm:text-3xl font-bold border border-green-200 shadow-sm font-mono tracking-wider">
                {inviteCode}
              </code>
              <button 
                onClick={copyToClipboard}
                aria-label="Copy invite code"
                className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-3 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                {copied ? (
                  <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                ) : (
                  <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                )}
              </button>
            </div>
            {copied && <p className="text-green-600 mt-2 text-sm font-medium">Copied to clipboard!</p>}
          </div>
          
          <Button variant="primary" onClick={() => navigate(`/groups/${groupId}`)} className="w-full py-4 text-lg rounded-xl shadow-lg bg-green-600 hover:bg-green-700 border-none">
            Go to Group Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const steps = ['Basics', 'Rules', 'Review'];

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto pt-6 pb-12 page-enter">
        <BackButton to="/dashboard" label="Back to Dashboard" />
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Create a New Group</h1>
          <p className="text-gray-500 mt-2">Set up your osusu parameters in 3 simple steps.</p>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isActive = currentStep === stepNumber;
              const isCompleted = currentStep > stepNumber;
              
              return (
                <div key={step} className="flex flex-col items-center relative z-10 w-full">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-200 shadow-sm
                      ${isActive ? 'bg-green-600 text-white ring-4 ring-green-100' : 
                        isCompleted ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}
                  >
                    {isCompleted ? <svg aria-hidden="true" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> : stepNumber}
                  </div>
                  <span className={`mt-3 text-xs font-semibold uppercase tracking-wider ${isActive ? 'text-green-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="relative mt-[-2.5rem] mb-[2.5rem] px-10">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 transform -translate-y-1/2 rounded-full"></div>
            <div 
              className="absolute top-1/2 left-0 h-1 bg-green-500 -z-10 transform -translate-y-1/2 transition-all duration-300 rounded-full" 
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-start">

          <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6">
            {currentStep === 1 && (
              <form onSubmit={handleNext} className="space-y-6 animate-fade-in">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Group Basics</h3>
                <div className="space-y-5">
                  <Input 
                    label="Group Name" 
                    name="name" 
                    value={formData.name}
                    onChange={handleChange}
                    required 
                    minLength={3} 
                    maxLength={60} 
                    placeholder="e.g. Family Savings, Office Osusu" 
                    className="text-lg"
                    autoComplete="off"
                  />
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                    <textarea 
                      name="description" 
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="What is the purpose of this osusu?"
                      className="px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 transition-shadow min-h-[100px] resize-y"
                    />
                  </div>
                </div>
                <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 mt-6 pt-6 border-t border-gray-100">
                  <div />
                  <Button type="submit" variant="primary" className="w-full sm:w-auto sm:ml-auto">Next Step</Button>
                </div>
              </form>
            )}

            {currentStep === 2 && (
              <form onSubmit={handleNext} className="space-y-6 animate-fade-in">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Rules & Contributions</h3>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input 
                      label="Contribution Amount (GMD)" 
                      name="contributionAmount" 
                      value={formData.contributionAmount}
                      onChange={handleChange}
                      type="number" 
                      min="50"
                      step="50"
                      required 
                      placeholder="1000"
                      className="w-full"
                    />
                    
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">Frequency *</label>
                      <select 
                        name="frequency" 
                        value={formData.frequency}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 transition-shadow"
                        required
                        autoComplete="off"
                      >
                        <option value="DAILY">Daily</option>
                        <option value="WEEKLY">Weekly</option>
                        <option value="MONTHLY">Monthly</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Input 
                      label="Max Members *" 
                      name="maxMembers" 
                      value={formData.maxMembers}
                      onChange={handleChange}
                      type="number" 
                      min="2" 
                      max="50" 
                      required 
                      placeholder="10"
                      className="w-full"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Including yourself. Min 2, max 50.
                    </p>
                  </div>

                  {formData.frequency === 'DAILY' && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 flex items-start gap-2">
                      <span className="flex-shrink-0">ℹ️</span>
                      <span>Daily groups move fast. A group of {formData.maxMembers || 'N'} members completes in {formData.maxMembers || 'N'} days.</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 mt-6 pt-6 border-t border-gray-100">
                  <Button type="button" variant="ghost" onClick={handlePrev} className="w-full sm:w-auto">Back</Button>
                  <Button type="submit" variant="primary" className="w-full sm:w-auto">Next Step</Button>
                </div>
              </form>
            )}

            {currentStep === 3 && (
              <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Schedule & Summary</h3>
                
                <div className="mb-8">
                  <Input 
                    label="When will the first contribution start?" 
                    name="startDate" 
                    value={formData.startDate}
                    onChange={handleChange}
                    type="date" 
                    min={today}
                    required 
                    className="w-full sm:w-1/2"
                  />
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Group Summary</h4>
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <div>
                      <dt className="text-xs text-gray-400 uppercase tracking-wide">Group Name</dt>
                      <dd className="text-sm font-semibold text-gray-900 mt-0.5">{formData.name}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-400 uppercase tracking-wide">Frequency</dt>
                      <dd className="text-sm font-semibold text-gray-900 mt-0.5">
                        {frequencyLabel[formData.frequency] || formData.frequency}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-400 uppercase tracking-wide">Contribution</dt>
                      <dd className="text-sm font-semibold text-green-600 mt-0.5 whitespace-nowrap">{formatCurrency(formData.contributionAmount)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-400 uppercase tracking-wide">Max Members</dt>
                      <dd className="text-sm font-semibold text-gray-900 mt-0.5">{formData.maxMembers} members</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-xs text-gray-400 uppercase tracking-wide">Start Date</dt>
                      <dd className="text-sm font-semibold text-gray-900 mt-0.5">{formData.startDate ? formatDate(formData.startDate) : 'Not set'}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-xs text-gray-400 uppercase tracking-wide">Total Payout Per Turn</dt>
                      <dd className="text-sm font-bold text-green-700 mt-0.5 whitespace-nowrap">{formatCurrency(Number(formData.contributionAmount) * Number(formData.maxMembers))}</dd>
                    </div>
                  </dl>
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                    <span className="text-lg flex-shrink-0">🎲</span>
                    <div>
                      <p className="text-sm font-semibold text-green-800">Fair Random Draw</p>
                      <p className="text-sm text-green-700 mt-0.5">
                        When you start the group, each member will be randomly assigned a payout position. The draw is automatic and unbiased.
                      </p>
                    </div>
                  </div>
                </div>
                
                {error && <div className="text-red-500 text-sm font-medium p-3 bg-red-50 rounded-lg border border-red-200" role="alert">{error}</div>}
                
                <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 mt-6 pt-6 border-t border-gray-100">
                  <Button type="button" variant="ghost" onClick={handlePrev} disabled={loading} className="w-full sm:w-auto">Back</Button>
                  <Button type="submit" variant="primary" loading={loading} className="w-full sm:w-auto">Create Group</Button>
                </div>
              </form>
            )}
          </div>
          </div>
          
          <div className="hidden lg:block lg:col-span-2">
            <div className="bg-green-50 rounded-2xl p-5 border border-green-100">
              <h3 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
                <span>💡</span> Tips for a great osusu
              </h3>
              <ul className="space-y-3">
                {[
                  { icon: '👥', tip: 'Start with 4–10 members for the best experience' },
                  { icon: '📅', tip: 'Weekly groups are popular — easy to remember and track' },
                  { icon: '🎲', tip: 'Payout positions are assigned randomly when you start — fair for everyone' },
                  { icon: '🔗', tip: 'Share the invite code via WhatsApp after creating' },
                ].map(({ icon, tip }, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-base mt-0.5 flex-shrink-0">
                      {icon}
                    </span>
                    <p className="text-xs text-green-700 leading-relaxed">
                      {tip}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            
            {currentStep === 2 && (
              <div className="mt-4 bg-white rounded-2xl p-5 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Contribution amounts in The Gambia
                </h3>
                <div className="space-y-2">
                  {[
                    { range: 'D 100–500', label: 'Students & small groups' },
                    { range: 'D 500–2,000', label: 'Community groups' },
                    { range: 'D 2,000–5,000', label: 'Office & professional' },
                  ].map(({ range, label }) => (
                    <div key={range}
                         className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{label}</span>
                      <span className="text-xs font-semibold text-gray-900">{range}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </PageWrapper>
  );
}
