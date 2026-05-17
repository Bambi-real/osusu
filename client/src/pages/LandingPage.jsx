import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/layout/Footer';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.title = 'OsusuApp — Rotating Savings for The Gambia';
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      <style>{`html { scroll-behavior: smooth; }`}</style>

      {/* Navbar */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center text-white font-black text-lg">
                  O
                </div>
                <span className="font-extrabold text-2xl tracking-tighter text-gray-900">OsusuApp</span>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollTo('how-it-works')} className="text-sm font-semibold text-gray-600 hover:text-green-600 transition-colors">
                How It Works
              </button>
              <button onClick={() => scrollTo('features')} className="text-sm font-semibold text-gray-600 hover:text-green-600 transition-colors">
                Features
              </button>
              <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-green-600 transition-colors">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-green-600 hover:bg-green-700 text-white rounded-full px-5 py-2 text-sm font-semibold transition-all shadow-sm hover:shadow-md"
              >
                Get Started →
              </Link>
            </div>

            <div className="md:hidden flex items-center space-x-4">
              <Link to="/login" className="text-sm font-semibold text-gray-600">Login</Link>
              <Link to="/register" className="bg-green-600 text-white rounded-full px-4 py-2 text-sm font-semibold">
                Get Started →
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 relative bg-[radial-gradient(ellipse_at_top,_#dcfce7_0%,_transparent_60%)]">
        <div className="max-w-3xl mx-auto text-center pt-20">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-8">
            🇬🇲 Built for The Gambia
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight">
            Your osusu group,<br />
            <span className="text-green-600">organised.</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-xl mx-auto mt-4 leading-relaxed">
            Track contributions, automate payout schedules, and keep every member accountable — right from your phone. No more notebooks.
          </p>
          <div className="mt-8 flex gap-4 justify-center flex-wrap">
            <Link
              to="/register"
              className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8 py-4 font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Get Started — It's Free
            </Link>
            <button
              onClick={() => scrollTo('how-it-works')}
              className="border-2 border-gray-300 hover:border-green-500 rounded-full px-8 py-4 font-semibold text-gray-700 transition-all"
            >
              See How It Works
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-6">
            Free to use · No app download needed · Works on any phone
          </p>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="bg-gray-50 border-y border-gray-100 py-6">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-2xl mb-1">💰</div>
            <div className="font-semibold text-gray-900 text-sm">Savings Tracked</div>
            <div className="text-sm text-gray-400">Growing daily</div>
          </div>
          <div>
            <div className="text-2xl mb-1">👥</div>
            <div className="font-semibold text-gray-900 text-sm">Made for Communities</div>
            <div className="text-sm text-gray-400">Groups of 2–50</div>
          </div>
          <div>
            <div className="text-2xl mb-1">📱</div>
            <div className="font-semibold text-gray-900 text-sm">Works on Any Device</div>
            <div className="text-sm text-gray-400">No app needed</div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold tracking-widest text-green-600 uppercase mb-4">How It Works</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">From signup to your first payout in minutes</h2>
            <p className="text-lg text-gray-500 mt-4 max-w-2xl mx-auto">OsusuApp handles the admin so your group can focus on saving.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-0.5 border-t-2 border-dashed border-green-200" />

            <div className="text-center relative">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 shadow-sm">
                <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <span className="text-green-600 font-bold text-sm">Step 1</span>
              <h3 className="text-xl font-bold text-gray-900 mt-2 mb-3">Create Your Group</h3>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
                Set your contribution amount, frequency (daily, weekly, or monthly), and how many members you want. Share the invite code with your group.
              </p>
            </div>

            <div className="text-center relative">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6 shadow-sm">
                <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <span className="text-blue-600 font-bold text-sm">Step 2</span>
              <h3 className="text-xl font-bold text-gray-900 mt-2 mb-3">Members Join</h3>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
                Every member joins using the invite code. Once everyone is in, start the group — payout positions are randomly and fairly assigned.
              </p>
            </div>

            <div className="text-center relative">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6 shadow-sm">
                <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <span className="text-amber-600 font-bold text-sm">Step 3</span>
              <h3 className="text-xl font-bold text-gray-900 mt-2 mb-3">Track & Pay Out</h3>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
                The organiser records each contribution. The app tracks who has paid, who hasn't, and who receives the pot each cycle. Everyone stays accountable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-4 bg-green-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold tracking-widest text-green-600 uppercase mb-4">Features</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">Everything your osusu group needs</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 hover:shadow-md transition-all">
              <div className="text-2xl mb-4">📊</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Contribution Tracking</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Mark each member as paid per cycle. See at a glance who's up to date and who needs a reminder.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 hover:shadow-md transition-all">
              <div className="text-2xl mb-4">📅</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Auto Payout Schedule</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Start the group and the schedule is generated automatically — daily, weekly, or monthly cycles.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 hover:shadow-md transition-all">
              <div className="text-2xl mb-4">🎲</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Fair Random Draw</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Payout positions are randomly assigned when the group starts. No arguments, no favouritism.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 hover:shadow-md transition-all">
              <div className="text-2xl mb-4">🔗</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Invite Code Joining</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Share a simple code with your group. Members join in seconds — no registration form needed to join.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 hover:shadow-md transition-all">
              <div className="text-2xl mb-4">📱</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Works on Any Phone</h3>
              <p className="text-gray-500 text-sm leading-relaxed">No app download required. Open it in any browser on any phone, tablet, or computer.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 hover:shadow-md transition-all">
              <div className="text-2xl mb-4">🔒</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Secure & Private</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Your group's data is private. Only members can see contribution history and schedules.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Osusu */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold tracking-widest text-green-600 uppercase mb-4">Our Mission</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">Technology for a tradition that works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                The osusu is one of the oldest and most trusted savings systems in West Africa.
                In The Gambia, millions of people — from market traders to civil servants, from
                students to community women's groups — rely on osusu to save money, manage cash
                flow, and support each other.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                But managing an osusu group by hand creates real problems: lost notebooks,
                disputed records, missed contributions, and an unfair burden on the organiser.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                OsusuApp doesn't replace the osusu — it protects it. We give your group the
                tools to run smoothly, fairly, and transparently, so the trust that makes osusu
                work stays strong.
              </p>
            </div>
            <div className="bg-green-600 text-white rounded-2xl p-8 relative">
              <div className="text-green-400 text-8xl font-serif leading-none absolute top-4 left-6 opacity-60">"</div>
              <p className="italic text-lg leading-relaxed relative z-10 pt-8">
                The strength of the osusu is the trust between members.
                OsusuApp makes that trust easier to keep.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-green-600 py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to organise your osusu group?</h2>
          <p className="text-green-100 text-lg mb-8">Join for free. No credit card. No app store.</p>
          <Link
            to="/register"
            className="inline-block bg-white text-green-600 font-bold rounded-full px-8 py-4 hover:bg-green-50 transition-all shadow-lg"
          >
            Get Started Now →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
