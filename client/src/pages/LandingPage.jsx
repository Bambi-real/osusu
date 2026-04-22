import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-16 sm:px-6 lg:px-8 items-center text-center relative overflow-hidden">
      
      {/* Background decorations */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-indigo-50 to-transparent pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-200/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 -left-40 w-72 h-72 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl w-full space-y-10 relative z-10 px-4">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-800 text-sm font-semibold shadow-sm mb-4 ring-1 ring-indigo-200">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span>Welcome to the Future of Osusu</span>
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight sm:text-7xl leading-tight">
            Manage your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-400">Osusu groups</span> effortlessly.
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600 leading-relaxed">
            Replace paper ledgers and verbal agreements with a secure, transparent, and mobile-friendly platform for managing rotating savings groups.
          </p>
        </div>
        
        <div className="mt-10 max-w-md mx-auto sm:flex sm:justify-center sm:gap-4 px-4 gap-y-4 flex-col sm:flex-row">
          <Link to="/register" className="block w-full sm:w-auto">
             <Button variant="primary" size="lg" className="w-full text-lg shadow-indigo-500/40 shadow-xl group">
               Get Started Free
               <svg className="ml-2 -mr-1 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
             </Button>
          </Link>
          <Link to="/login" className="block w-full sm:w-auto mt-4 sm:mt-0">
             <Button variant="secondary" size="lg" className="w-full text-lg shadow-sm border-gray-200">
               Log In
             </Button>
          </Link>
        </div>
        
        <div className="mt-20 border-t border-gray-200 pt-10 grid grid-cols-1 gap-8 sm:grid-cols-3 text-left">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:shadow-indigo-500/20 transition-shadow">
             <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4 text-xl">
               🛡️
             </div>
             <h3 className="text-lg font-bold text-gray-900 mb-2">Secure & Transparent</h3>
             <p className="text-gray-600 leading-relaxed">Every transaction is recorded securely, providing full transparency to all group members.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:shadow-indigo-500/20 transition-shadow">
             <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4 text-xl">
               ⚡
             </div>
             <h3 className="text-lg font-bold text-gray-900 mb-2">Automated Payouts</h3>
             <p className="text-gray-600 leading-relaxed">Track who gets paid when with our intelligent payout rotation system.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:shadow-indigo-500/20 transition-shadow">
             <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4 text-xl">
               📱
             </div>
             <h3 className="text-lg font-bold text-gray-900 mb-2">Mobile Friendly</h3>
             <p className="text-gray-600 leading-relaxed">Manage your groups from anywhere with our fully responsive interface.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
