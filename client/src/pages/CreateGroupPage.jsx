import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import api from '../api/axios';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

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

  const [inviteCode, setInviteCode] = useState(null);
  const [groupId, setGroupId] = useState(null);
  const [copied, setCopied] = useState(false);

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
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create group.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inviteCode) {
    return (
      <div className="fixed inset-0 z-50 bg-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white shadow-2xl rounded-2xl p-10 text-center animate-fade-in-up">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-indigo-100 mb-8 border-4 border-white shadow-sm">
            <svg className="h-12 w-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Group Created!</h2>
          <p className="text-xl text-gray-600 mb-10">Share this invite code with your members so they can join.</p>
          
          <div className="flex flex-col items-center justify-center mb-10 bg-gray-50 p-6 rounded-xl border border-gray-100">
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Invite Code</div>
            <div className="flex items-center space-x-4">
              <code className="px-6 py-3 bg-white text-indigo-600 rounded-lg text-3xl font-bold border border-indigo-200 shadow-sm font-mono tracking-wider">
                {inviteCode}
              </code>
              <button 
                onClick={copyToClipboard}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-3 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {copied ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                )}
              </button>
            </div>
            {copied && <p className="text-indigo-600 mt-2 text-sm font-medium">Copied to clipboard!</p>}
          </div>
          
          <Button variant="primary" onClick={() => navigate(`/groups/${groupId}`)} className="w-full py-4 text-lg rounded-xl shadow-lg bg-indigo-600 hover:bg-indigo-700 border-none">
            Go to Group Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const steps = ['Basics', 'Rules', 'Schedule'];

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto pt-6 pb-12">
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
                      ${isActive ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' : 
                        isCompleted ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}
                  >
                    {isCompleted ? <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> : stepNumber}
                  </div>
                  <span className={`mt-3 text-xs font-semibold uppercase tracking-wider ${isActive ? 'text-indigo-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="relative mt-[-2.5rem] mb-[2.5rem] px-10">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 transform -translate-y-1/2 rounded-full"></div>
            <div 
              className="absolute top-1/2 left-0 h-1 bg-indigo-500 -z-10 transform -translate-y-1/2 transition-all duration-300 rounded-full" 
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <div className="p-8 sm:p-10">
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
                  />
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                    <textarea 
                      name="description" 
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="What is the purpose of this osusu?"
                      className="px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 transition-shadow min-h-[100px] resize-y"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-6 mt-6 border-t border-gray-100">
                  <Button type="submit" variant="primary" className="px-8 py-3 rounded-lg font-medium">Next Step</Button>
                </div>
              </form>
            )}

            {currentStep === 2 && (
              <form onSubmit={handleNext} className="space-y-6 animate-fade-in">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Rules & Contributions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                  />
                  
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">Frequency</label>
                    <select 
                      name="frequency" 
                      value={formData.frequency}
                      onChange={handleChange}
                      className="px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 transition-shadow"
                      required
                    >
                      <option value="WEEKLY">Weekly</option>
                      <option value="MONTHLY">Monthly</option>
                    </select>
                  </div>

                  <Input 
                    label="Max Members" 
                    name="maxMembers" 
                    value={formData.maxMembers}
                    onChange={handleChange}
                    type="number" 
                    min="2" 
                    max="50" 
                    required 
                    placeholder="10"
                  />
                </div>
                <div className="flex justify-between pt-6 mt-6 border-t border-gray-100">
                  <Button type="button" variant="ghost" onClick={handlePrev} className="px-6 py-3 rounded-lg text-gray-600 hover:bg-gray-100">Back</Button>
                  <Button type="submit" variant="primary" className="px-8 py-3 rounded-lg font-medium">Next Step</Button>
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
                  <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                    <div>
                      <span className="block text-xs text-gray-500">Name</span>
                      <span className="font-semibold text-gray-900">{formData.name}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500">Frequency</span>
                      <span className="font-semibold text-gray-900">{formData.frequency}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500">Contribution</span>
                      <span className="font-semibold text-indigo-600 text-lg">D{formData.contributionAmount}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500">Max Members</span>
                      <span className="font-semibold text-gray-900">{formData.maxMembers}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-xs text-gray-500">Start Date</span>
                      <span className="font-semibold text-gray-900">{formData.startDate ? new Date(formData.startDate).toLocaleDateString() : 'Not set'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-xs text-gray-500">Total Payout Per Turn</span>
                      <span className="font-bold text-indigo-700 text-xl">D{(Number(formData.contributionAmount) * Number(formData.maxMembers)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                {error && <div className="text-red-500 text-sm font-medium p-3 bg-red-50 rounded-lg border border-red-200">{error}</div>}
                
                <div className="flex justify-between pt-6 mt-6 border-t border-gray-100">
                  <Button type="button" variant="ghost" onClick={handlePrev} disabled={loading} className="px-6 py-3 rounded-lg text-gray-600 hover:bg-gray-100">Back</Button>
                  <Button type="submit" variant="primary" loading={loading} className="px-8 py-3 rounded-lg font-medium shadow-md">Create Group</Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
