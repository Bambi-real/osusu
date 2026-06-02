import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/layout/Footer';

function HeroMockup() {
  return (
    <div className="relative">
      <div className="absolute inset-0 translate-x-4 translate-y-4 bg-green-200 rounded-2xl" />
      <div className="relative bg-white rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.15)] p-6 w-80 border-t-4 border-t-green-500">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs bg-green-100 text-green-700 rounded-full px-3 py-1 font-medium">
            Active
          </span>
          <span className="text-xs bg-blue-100 text-blue-700 rounded-full px-3 py-1 font-medium">
            Monthly
          </span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-1">
          Family Savings
        </h3>
        <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5 mb-3">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
          Organiser
        </span>

        <div className="border-t border-gray-100 pt-4 flex justify-between items-end">
          <div>
            <p className="text-lg font-bold text-green-700">
              D 500.00
            </p>
            <p className="text-xs text-gray-400">
              per monthly cycle
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">
              Draw #2
            </p>
            <p className="text-xs text-gray-400">of 6</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Cycle progress</span>
            <span>4 / 6 paid</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full">
            <div className="h-full w-2/3 bg-green-500 rounded-full" />
          </div>
        </div>
      </div>

      <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg px-3 py-2 border border-gray-100 flex items-center gap-2">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        <span className="text-xs font-medium text-gray-700">
          Karamo paid ✓
        </span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.title = 'Osusu — Rotating Savings for The Gambia';
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const featureColors = [
    'bg-green-100 text-green-600',
    'bg-blue-100 text-blue-600',
    'bg-purple-100 text-purple-600',
    'bg-amber-100 text-amber-600',
    'bg-rose-100 text-rose-600',
    'bg-teal-100 text-teal-600',
  ];

  const features = [
    {
      title: 'Contribution Tracking',
      description: 'Mark each member as paid per cycle. See at a glance who\'s up to date and who needs a reminder.',
      path: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    },
    {
      title: 'Auto Payout Schedule',
      description: 'Start the group and the schedule is generated automatically — daily, weekly, or monthly cycles.',
      path: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    },
    {
      title: 'Fair Random Draw',
      description: 'Payout positions are randomly assigned when the group starts. No arguments, no favouritism.',
      path: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    },
    {
      title: 'Invite Code Joining',
      description: 'Share a simple code with your group. Members join in seconds — no registration form needed to join.',
      path: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
    },
    {
      title: 'Works on Any Phone',
      description: 'No app download required. Open it in any browser on any phone, tablet, or computer.',
      path: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
    },
    {
      title: 'Secure & Private',
      description: 'Your group\'s data is private. Only members can see contribution history and schedules.',
      path: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    },
  ];

  return (
    <div className="min-h-screen bg-white page-enter">
      {/* Navbar */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-white">
                  <svg aria-hidden="true" viewBox="0 0 40 40" fill="none" className="w-7 h-7">
                    <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="2.5"/>
                    <circle cx="20" cy="6" r="3.5" fill="currentColor"/>
                    <circle cx="34" cy="20" r="3.5" fill="currentColor"/>
                    <circle cx="20" cy="34" r="3.5" fill="currentColor"/>
                    <circle cx="6" cy="20" r="3.5" fill="currentColor"/>
                    <path d="M20 6 A14 14 0 0 1 34 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="font-extrabold text-2xl tracking-tighter text-gray-900">Osusu</span>
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
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-green-50 rounded-bl-[80px]" />
          <div className="absolute top-20 right-20 w-64 h-64 bg-green-100 rounded-full opacity-50 blur-3xl" />
          <div className="absolute bottom-20 left-20 w-48 h-48 bg-green-200 rounded-full opacity-30 blur-2xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <span>🇬🇲</span>
              <span>Built for The Gambia</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Your osusu group,{' '}
              <span className="text-green-600">organised.</span>
            </h1>

            <p className="text-xl text-gray-500 leading-relaxed mb-8 max-w-lg">
              Track contributions, automate payout schedules, and keep every member accountable — right from your phone. No more notebooks.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <a href="/register"
                 className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 rounded-full shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-200 transition-all duration-200 text-base">
                Get Started — It's Free
              </a>
              <a href="#how-it-works"
                 className="border-2 border-gray-200 hover:border-green-400 text-gray-700 font-semibold px-8 py-4 rounded-full transition-all duration-200 text-base">
                See How It Works
              </a>
            </div>

            <p className="text-sm text-gray-400">
              Free to use · No app download needed · Works on any phone
            </p>
          </div>

          <div className="hidden lg:flex items-center justify-center">
            <HeroMockup />
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <div className="border-y border-gray-100 bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { value: '2–50', label: 'Members per group', sub: 'Flexible group sizes' },
              { value: 'Daily', label: 'Fastest cycle', sub: 'Weekly & monthly too' },
              { value: '100%', label: 'Free to use', sub: 'No hidden fees' },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-2xl font-bold text-green-700">
                  {stat.value}
                </p>
                <p className="text-sm font-semibold text-gray-700 mt-0.5">
                  {stat.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {stat.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-green-600 uppercase tracking-[0.15em] mb-3">How It Works</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">From signup to your first payout in minutes</h2>
            <p className="text-lg text-gray-500 mt-4 max-w-2xl mx-auto">Osusu handles the admin so your group can focus on saving.</p>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-0.5 border-t-2 border-dashed border-green-200 z-0" />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-white border-2 border-green-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <svg aria-hidden="true" className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">Step 1</p>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Create Your Group</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Set your contribution amount, frequency (daily, weekly, or monthly), and how many members you want. Share the invite code with your group.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white border-2 border-green-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <svg aria-hidden="true" className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">Step 2</p>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Members Join</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Every member joins using the invite code. Once everyone is in, start the group — payout positions are randomly and fairly assigned.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white border-2 border-green-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <svg aria-hidden="true" className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">Step 3</p>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Track & Pay Out</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  The organiser records each contribution. The app tracks who has paid, who hasn't, and who receives the pot each cycle. Everyone stays accountable.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-4 bg-green-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-green-600 uppercase tracking-[0.15em] mb-3">Features</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">Everything your osusu group needs</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 hover:shadow-md transition-all">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${featureColors[i]}`}>
                  <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={feature.path} />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Osusu */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-green-600 uppercase tracking-[0.15em] mb-3">Our Mission</p>
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
                Osusu doesn't replace the osusu — it protects it. We give your group the
                tools to run smoothly, fairly, and transparently, so the trust that makes osusu
                work stays strong.
              </p>
            </div>
            <div className="bg-green-600 text-white rounded-2xl p-8 relative">
              <div className="text-green-400 text-8xl font-serif leading-none absolute top-4 left-6 opacity-60">"</div>
              <p className="italic text-lg leading-relaxed relative z-10 pt-8">
                The strength of the osusu is the trust between members.
                Osusu makes that trust easier to keep.
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
