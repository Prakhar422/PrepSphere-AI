import React from "react";
import {useNavigate} from "react-router-dom";

import { 
  Sparkles, 
  ArrowRight, 
  FileText, 
  TrendingUp, 
  Award, 
  Calendar, 
  UserCheck, 
  Briefcase, 
  Play, 
  CheckCircle2,
  Terminal,
  Cpu
} from "lucide-react";

function Hero() {
    const navigate = useNavigate();
  return (
    <>
      {/* Dynamic styles for grid background, animations, and typography */}
      <style>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.035) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        .bg-grid-mask {
          mask-image: radial-gradient(circle at center, black 60%, transparent 100%);
          -webkit-mask-image: radial-gradient(circle at center, black 60%, transparent 100%);
        }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(0.5deg); }
        }

        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(-0.5deg); }
        }

        @keyframes float-fast {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-8px) scale(1.02); }
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(1.05); }
        }

        .animate-float-slow {
          animation: float-slow 7s ease-in-out infinite;
        }

        .animate-float-medium {
          animation: float-medium 5s ease-in-out infinite;
        }

        .animate-float-fast {
          animation: float-fast 4s ease-in-out infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 8s ease-in-out infinite;
        }
      `}</style>

      <section className="relative min-height-[90vh] bg-[#050B1F] overflow-hidden flex items-center py-20 lg:py-28 font-inter">
        {/* Futuristic Background Gradients and Effects */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid-mask opacity-80 pointer-events-none" />
        
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/10 w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[130px] animate-pulse-glow pointer-events-none" />
        <div className="absolute bottom-1/5 right-1/10 w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[140px] animate-pulse-glow pointer-events-none" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-blue-500/5 blur-[160px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Content */}
            <div className="lg:col-span-6 flex flex-col space-y-6 md:space-y-8 text-left max-w-2xl mx-auto lg:mx-0">
              
              {/* Top Pill Badge */}
              <div className="inline-flex self-start items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.15)] relative overflow-hidden group">
                {/* Glow border line overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <Sparkles className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition-transform duration-300" />
                <span className="text-xs sm:text-sm font-medium text-indigo-200 tracking-wide">
                  AI-Powered Career Launchpad
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
                Crack Your Dream <br className="hidden sm:inline" />
                Placement with{" "}
                <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.35)]">
                  AI
                </span>
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-slate-400 leading-relaxed font-light">
                Prepare smarter with AI-powered mock interviews, aptitude practice, coding challenges, resume analysis, and real interview experiences—all in one platform.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                {/* Primary Button */}
                <button
                onClick={() => navigate("/signup")} 
                className="relative group inline-flex items-center justify-center p-[1px] rounded-full overflow-hidden text-sm sm:text-base font-semibold text-white cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] focus:outline-none">
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 rounded-full" />
                  <span className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full blur opacity-45 group-hover:opacity-85 transition duration-500 group-hover:duration-200" />
                  
                  <span className="relative w-full px-8 py-3.5 bg-[#050B1F] rounded-full transition-all duration-300 group-hover:bg-transparent flex items-center justify-center gap-2">
                    Start Preparing
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
                  </span>
                </button>

                {/* Secondary Button */}
                <button onClick={() => navigate("/resume-analyzer")}
                 className="relative group inline-flex items-center justify-center p-[1px] rounded-full overflow-hidden text-sm sm:text-base font-medium text-slate-200 cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] focus:outline-none">
                  <span className="absolute inset-0 bg-white/10 rounded-full group-hover:bg-white/20 transition-all duration-300" />
                  <span className="relative px-8 py-3.5 bg-[#050B1F]/60 rounded-full backdrop-blur-md border border-white/5 transition-all duration-300 flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400 group-hover:text-white transition-colors duration-300" />
                    Analyze Resume
                  </span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 sm:pt-8 border-t border-white/5">
                <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-4">
                  Trusted by ambitious candidates globally
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                    <UserCheck className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-semibold text-white">50K+</span>
                    <span className="text-xs text-slate-400">Students</span>
                  </div>
                  <div className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                    <Award className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm font-semibold text-white">95%</span>
                    <span className="text-xs text-slate-400">Success Rate</span>
                  </div>
                  <div className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                    <Briefcase className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-semibold text-white">10K+</span>
                    <span className="text-xs text-slate-400">Experiences</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: AI Dashboard Mockup */}
            <div className="lg:col-span-6 relative mt-12 lg:mt-0 flex justify-center items-center">
              
              {/* Dashboard Glow Base */}
              <div className="absolute w-[80%] h-[80%] rounded-full bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 blur-[80px] pointer-events-none z-0" />
              
              {/* Outer Dashboard frame wrapper */}
              <div className="relative w-full max-w-[540px] aspect-[4/3] rounded-3xl border border-white/10 bg-slate-950/45 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-5 overflow-hidden z-10">
                {/* Header of mock application */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5 text-xs text-slate-500">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                    <span className="pl-2 font-mono text-[10px] tracking-wide text-slate-400">prepsphere-console-v2.0</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/5 px-2 py-0.5 rounded border border-white/5 font-mono text-[9px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    AI ENGINE ACTIVE
                  </div>
                </div>

                {/* Grid layout inside mockup */}
                <div className="grid grid-cols-12 gap-3 h-[calc(100%-35px)]">
                  
                  {/* Left panel: Readiness Score Card */}
                  <div className="col-span-5 bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-indigo-500/30 transition-colors duration-300">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Metrics</span>
                      <h4 className="text-xs font-semibold text-white mt-1">Readiness Score</h4>
                    </div>
                    
                    {/* Circle Progress Indicator */}
                    <div className="my-3 flex justify-center items-center relative">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="36"
                          className="text-slate-800"
                          strokeWidth="6"
                          stroke="currentColor"
                          fill="transparent"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="36"
                          className="text-transparent"
                          strokeWidth="6"
                          strokeDasharray={226}
                          strokeDashoffset={226 - (226 * 87) / 100}
                          strokeLinecap="round"
                          stroke="url(#gradient-cyan-indigo)"
                          fill="transparent"
                        />
                        <defs>
                          <linearGradient id="gradient-cyan-indigo" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#06b6d4" />
                            <stop offset="100%" stopColor="#6366f1" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute text-center">
                        <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">87%</span>
                        <span className="block text-[8px] text-cyan-400 font-bold uppercase tracking-wider">Tier-1 SDE</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-1 rounded-lg self-start">
                      <TrendingUp className="w-3 h-3" />
                      <span>+4.2% this week</span>
                    </div>
                  </div>

                  {/* Right panel stack */}
                  <div className="col-span-7 flex flex-col gap-3">
                    
                    {/* AI Insights Card */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 shadow-lg flex-1 relative overflow-hidden group hover:border-purple-500/30 transition-colors duration-300">
                      <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
                      <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider text-purple-400">
                        <Terminal className="w-3 h-3 text-purple-400" />
                        <span>AI Assistant Insights</span>
                      </div>
                      
                      <div className="mt-2 text-left space-y-2">
                        <p className="text-[11px] text-slate-300 font-light leading-relaxed">
                          Resume matched <strong className="text-purple-300">94%</strong> with <strong className="text-white">SDE-1 roles</strong>.
                        </p>
                        <div className="flex flex-wrap gap-1">
                          <span className="text-[8px] bg-slate-900 border border-white/5 text-slate-300 px-1.5 py-0.5 rounded">System Design</span>
                          <span className="text-[8px] bg-slate-900 border border-white/5 text-slate-300 px-1.5 py-0.5 rounded">React/NextJS</span>
                        </div>
                        <p className="text-[10px] text-amber-400 bg-amber-500/5 border border-amber-500/10 p-1.5 rounded-lg">
                          💡 Focus on: Graphs &amp; DP Mock practices.
                        </p>
                      </div>
                    </div>

                    {/* Progress Analytics Graph (SVG representation) */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3.5 shadow-lg flex-1 flex flex-col justify-between hover:border-indigo-500/20 transition-colors duration-300">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Interview History</span>
                        <span className="text-[9px] text-indigo-400 font-bold">Avg. 8.4/10</span>
                      </div>

                      {/* Small inline graph representation */}
                      <div className="h-16 w-full relative">
                        <svg className="w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          {/* Fill */}
                          <path
                            d="M 0 60 L 0 40 Q 25 25 50 35 T 100 15 T 150 22 T 200 8 L 200 60 Z"
                            fill="url(#chart-glow)"
                          />
                          {/* Line */}
                          <path
                            d="M 0 40 Q 25 25 50 35 T 100 15 T 150 22 T 200 8"
                            fill="none"
                            stroke="#818cf8"
                            strokeWidth="2.5"
                          />
                          {/* Dot indicator */}
                          <circle cx="200" cy="8" r="4.5" fill="#a78bfa" className="animate-ping" />
                          <circle cx="200" cy="8" r="3" fill="#ffffff" />
                        </svg>
                      </div>
                    </div>

                  </div>

                </div>

              </div>

              {/* Decorative Layered/Floating elements overlapping the frame for depth */}
              
              {/* Floating element 1: Offer Unlocked (Top Right) */}
              <div className="absolute -top-6 -right-4 bg-slate-950/80 border border-emerald-500/20 backdrop-blur-md rounded-2xl p-3 flex items-center space-x-3 shadow-xl z-20 animate-float-slow hover:border-emerald-500/50 transition-colors duration-300">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                  <Award className="w-4 h-4" />
                </div>
                
              </div>

              {/* Floating element 2: Interview Scheduled (Bottom Left) */}
              <div className="absolute -bottom-6 -left-4 bg-slate-950/80 border border-indigo-500/20 backdrop-blur-md rounded-2xl p-3 flex items-center space-x-3 shadow-xl z-20 animate-float-medium hover:border-indigo-500/50 transition-colors duration-300">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                  <Calendar className="w-4 h-4" />
                </div>
                
              </div>

              
              

            </div>

          </div>
        </div>
      </section>
    </>
  );
}

export default Hero;
