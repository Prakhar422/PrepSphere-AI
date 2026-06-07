import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Mail, 
  GraduationCap, 
  LogOut, 
  Home, 
  Sparkles, 
  TrendingUp, 
  MessageSquare, 
  Code,
  Shield,
  Calendar,
  ArrowLeft
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Format creation date if available
  const joinDate = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'June 2026';

  return (
    <>
      <style>{`
        .dash-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.01) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.01) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>

      <div className="relative min-h-screen bg-[#050B1F] text-white font-inter overflow-x-hidden">
        {/* Ambient Grid Pattern */}
        <div className="absolute inset-0 dash-grid-pattern opacity-60 pointer-events-none" />

        {/* Dynamic Glow Circles */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[130px] pointer-events-none" />

        {/* Dashboard Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
          
          {/* Header Navigation */}
          <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/10">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-slate-950/80 border border-white/10 overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" fill="currentColor" className="text-indigo-500 animate-pulse" />
                  <path d="M12 2v2M12 20v2M4 12H2M22 12h-2" />
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight">
                PrepSphere <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">AI</span>
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] hover:border-white/15 text-xs font-semibold text-slate-200 transition-all duration-200 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                Home
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-xs font-semibold text-red-400 transition-all duration-200 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          </div>

          {/* Welcome Intro */}
          <div className="text-left mb-8 space-y-2">
            <div className="inline-flex items-center space-x-1.5 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span>AI Console Workspace Live</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">{user?.name || 'PrepSphere User'}</span> 👋
            </h1>
            <p className="text-sm text-slate-400 font-light">Monitor your evaluation metrics, review resume stats, and prepare smarter.</p>
          </div>

          {/* Dashboard Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT PROFILE CARD (4 columns on desktop) */}
            <div className="lg:col-span-4 bg-white/[0.02] border border-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-indigo-500/5 blur-[60px]" />

              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest text-left mb-6">User Secure Profile</h3>

              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[1.5px] shadow-[0_0_20px_rgba(129,140,248,0.25)]">
                  <div className="w-full h-full rounded-2xl bg-[#080E24] flex items-center justify-center text-indigo-400">
                    <User className="w-10 h-10" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-bold text-indigo-400 uppercase tracking-wider">
                    {user?.role || 'STUDENT'}
                  </span>
                </div>
              </div>

              {/* Profile Details List */}
              <div className="mt-8 space-y-4 text-left text-sm border-t border-white/5 pt-6">
                
                {/* Email detail */}
                <div className="flex items-center space-x-3 text-slate-300">
                  <div className="p-2 rounded-xl bg-white/5 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Email Address</span>
                    <span className="font-light">{user?.email}</span>
                  </div>
                </div>

                {/* College detail */}
                <div className="flex items-center space-x-3 text-slate-300">
                  <div className="p-2 rounded-xl bg-white/5 text-slate-400">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">College</span>
                    <span className="font-light">{user?.college || 'PrepSphere University'}</span>
                  </div>
                </div>

                {/* Joined Date */}
                <div className="flex items-center space-x-3 text-slate-300">
                  <div className="p-2 rounded-xl bg-white/5 text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Joined Date</span>
                    <span className="font-light">{joinDate}</span>
                  </div>
                </div>

                {/* Secure token validation badge */}
                <div className="flex items-center space-x-3 text-slate-300">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Session Key</span>
                    <span className="text-xs font-mono text-emerald-400 font-semibold">JWT-Verified Secure</span>
                  </div>
                </div>

              </div>

            </div>

            {/* RIGHT METRICS AREA (8 columns on desktop) */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Card 1: Aptitude Score */}
              <div className="bg-white/[0.02] border border-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-md text-left group hover:border-indigo-500/30 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Evaluation Metric</span>
                    <h3 className="text-lg font-bold text-white">Aptitude Score</h3>
                  </div>
                  <div className="p-2 rounded-2xl bg-indigo-500/10 text-indigo-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                
                <div className="flex items-baseline space-x-1 font-semibold text-white my-4">
                  <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">782</span>
                  <span className="text-sm text-slate-500">/ 800</span>
                </div>
                <div className="text-xs text-emerald-400 font-bold flex items-center space-x-1">
                  <span>★</span>
                  <span>Percentile Range: Top 5% Globally</span>
                </div>
              </div>

              {/* Card 2: AI Resume Match */}
              <div className="bg-white/[0.02] border border-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-md text-left group hover:border-purple-500/30 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">ATS Optimization</span>
                    <h3 className="text-lg font-bold text-white">Resume Matching</h3>
                  </div>
                  <div className="p-2 rounded-2xl bg-purple-500/10 text-purple-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>
                
                <div className="flex items-baseline space-x-1 font-semibold text-white my-4">
                  <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">92%</span>
                  <span className="text-sm text-slate-500">Match score</span>
                </div>
                <div className="text-xs text-indigo-400 font-bold flex items-center space-x-1">
                  <span>✔</span>
                  <span>ATS Layout Check: Excellent (System Design Match)</span>
                </div>
              </div>

              {/* Card 3: Interview Readiness */}
              <div className="bg-white/[0.02] border border-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-md text-left group hover:border-pink-500/30 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Live Evaluation</span>
                    <h3 className="text-lg font-bold text-white">Interview Coach</h3>
                  </div>
                  <div className="p-2 rounded-2xl bg-pink-500/10 text-pink-400">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                </div>
                
                <div className="flex items-baseline space-x-1 font-semibold text-white my-4">
                  <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">95%</span>
                  <span className="text-sm text-slate-500">Readiness</span>
                </div>
                <div className="text-xs text-purple-400 font-bold flex items-center space-x-1">
                  <span>✔</span>
                  <span>Communication: Strong | Problem Solving: High</span>
                </div>
              </div>

              {/* Card 4: Coding Progress */}
              <div className="bg-white/[0.02] border border-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-md text-left group hover:border-emerald-500/30 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Workspace Status</span>
                    <h3 className="text-lg font-bold text-white">Coding Arena</h3>
                  </div>
                  <div className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-400">
                    <Code className="w-5 h-5" />
                  </div>
                </div>
                
                <div className="flex items-baseline space-x-1 font-semibold text-white my-4">
                  <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">85%</span>
                  <span className="text-xs text-slate-500">Sync Complete</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mb-1">
                  <div className="h-full bg-emerald-500 w-[85%]" />
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </>
  );
};

export default Dashboard;
