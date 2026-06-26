import React from "react";
import { 
  Brain, 
  BarChart3, 
  Calendar, 
  Trophy, 
  TrendingUp, 
  Target, 
  Sparkles, 
  Clock, 
  Zap, 
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Code
} from "lucide-react";

// Mini internal reusable card components for cleaner architecture
const MetricCard = (props) => {
  const { title, value, subtext, icon: Icon, colorClass, gradient } = props;
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300">
      <div className="absolute inset-0 bg-radial-gradient from-white/[0.01] to-transparent pointer-events-none" />
      <div className="space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{title}</span>
        <div className="flex items-baseline space-x-1">
          <h4 className={`text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${gradient} tracking-tight`}>
            {value}
          </h4>
        </div>
        <p className="text-[9px] text-slate-500 font-medium">{subtext}</p>
      </div>
      <div className={`p-2.5 rounded-xl border ${colorClass} transition-transform duration-300 group-hover:scale-110`}>
        <Icon className="w-4 h-4" />
      </div>
    </div>
  );
};

const DashboardPreview = () => {
  const metrics = [
    {
      title: "Readiness Score",
      value: "92%",
      subtext: "Ready for Tier-1 Roles",
      icon: Target,
      colorClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      gradient: "from-emerald-400 to-cyan-400"
    },
    {
      title: "Problems Solved",
      value: "1,247",
      subtext: "Top 5% of platform candidates",
      icon: Code,
      colorClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      gradient: "from-blue-400 to-indigo-400"
    },
    {
      title: "Mock Interviews",
      value: "87",
      subtext: "Avg. technical score: 8.8",
      icon: Trophy,
      colorClass: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      gradient: "from-purple-400 to-pink-400"
    },
    {
      title: "Resume Score",
      value: "94/100",
      subtext: "ATS Optimization: Excellent",
      icon: FileTextDummy,
      colorClass: "bg-pink-500/10 text-pink-400 border-pink-500/20",
      gradient: "from-pink-400 to-rose-400"
    }
  ];

  const skills = [
    { name: "Aptitude & Reasoning", value: 85, color: "bg-blue-500" },
    { name: "Coding & DSA", value: 92, color: "bg-indigo-500" },
    { name: "Communication Skills", value: 78, color: "bg-purple-500" },
    { name: "Interview Delivery", value: 89, color: "bg-pink-500" }
  ];

  const aiInsights = [
    { text: "Resume match optimized by 12% for FinTech roles.", status: "success" },
    { text: "Coding velocity up 18% in graph algorithms.", status: "success" },
    { text: "Interview response consistency rating: Excellent.", status: "info" }
  ];

  const schedule = [
    {
      title: "Mock Interview Prep",
      description: "FAANG SDE-1 Loop with Ex-Google Mentor",
      time: "Today, 5:30 PM",
      status: "Upcoming",
      color: "border-indigo-500/30 text-indigo-400 bg-indigo-500/5",
    },
    {
      title: "Quantitative Aptitude Mock",
      description: "Numerical Ability Sprint #4",
      time: "Tomorrow, 11:00 AM",
      status: "Scheduled",
      color: "border-cyan-500/30 text-cyan-400 bg-cyan-500/5",
    },
    {
      title: "Coding Weekly Arena",
      description: "Dynamic Programming and Trie Rounds",
      time: "June 08, 9:00 PM",
      status: "Register Now",
      color: "border-purple-500/30 text-purple-400 bg-purple-500/5",
    },
    {
      title: "AI Resume Review Loop",
      description: "Automated parsing and keyword sync audit",
      time: "Completed",
      status: "View Report",
      color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/5",
    }
  ];

  return (
    <>
      <style>{`
        .dash-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.015) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        @keyframes float-dash-1 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }

        .animate-float-dash {
          animation: float-dash-1 6s ease-in-out infinite;
        }
      `}</style>

      <section className="relative bg-[#050B1F] py-20 sm:py-28 overflow-hidden border-b border-white/5 font-inter">
        {/* Decorative Grid and Lights */}
        <div className="absolute inset-0 dash-grid-pattern opacity-70 pointer-events-none" />
        
        {/* Soft Radial Ambient Lights */}
        <div className="absolute -top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-1/4 right-1/4 w-[700px] h-[700px] rounded-full bg-purple-500/5 blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Section Header */}
          <div className="max-w-3xl mx-auto mb-16 sm:mb-20 space-y-4">
            
            {/* Header Badge */}
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.15)]">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span className="text-xs font-semibold text-indigo-200 tracking-wider uppercase">
                Platform Intelligence
              </span>
            </div>

            {/* Main Title */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Command Center For{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.3)]">
                Your Career
              </span>
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
              Track your placement journey with AI-powered insights, progress analytics, interview readiness scores, and personalized recommendations.
            </p>
          </div>

          {/* Large Dashboard Mockup Container */}
          <div className="relative rounded-3xl border border-white/10 bg-slate-950/60 backdrop-blur-xl p-4 sm:p-6 lg:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden max-w-6xl mx-auto hover:border-white/15 transition-colors duration-500 group">
            {/* Top glowing ambient gradient overlay */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent pointer-events-none" />
            
            {/* Mock Dashboard Console Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b border-white/5 text-left gap-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase">Student Workspace</span>
                <h3 className="text-xl font-bold text-white tracking-tight mt-0.5">Welcome Back, Alex!</h3>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <div className="flex items-center space-x-2 bg-white/5 border border-white/5 rounded-xl px-3.5 py-1.5 font-mono text-[10px] text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                  <span>PREPARATION STREAK: 14 DAYS</span>
                </div>
                <div className="flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-3.5 py-1.5 font-mono text-[10px] text-indigo-400">
                  <Zap className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  <span>AI ENGINE SYNCED</span>
                </div>
              </div>
            </div>

            {/* Dashboard Mockup Grid Layout */}
            <div className="space-y-6">
              
              {/* Row 1: Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((m, idx) => (
                  <MetricCard key={idx} {...m} />
                ))}
              </div>

              {/* Row 2: Charts and Detailed Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Column 1: Performance Trend Chart (Slick SVG Wave Graph) */}
                <div className="lg:col-span-5 bg-white/[0.02] border border-white/5 rounded-2xl p-5 shadow-lg text-left flex flex-col justify-between hover:border-indigo-500/20 transition-colors duration-300">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Activity &amp; Progress</span>
                      <h4 className="text-sm font-bold text-white mt-0.5">Performance Trend</h4>
                    </div>
                    <div className="flex items-center space-x-2 text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>+14.8% GROWTH</span>
                    </div>
                  </div>

                  {/* SVG Line Graph representation */}
                  <div className="h-40 w-full relative my-2">
                    <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      
                      {/* Grid Guide Lines */}
                      <line x1="0" y1="30" x2="400" y2="30" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                      <line x1="0" y1="60" x2="400" y2="60" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                      <line x1="0" y1="90" x2="400" y2="90" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                      {/* Area Fill */}
                      <path
                        d="M 0 120 L 0 95 Q 50 80 100 88 T 200 45 T 300 55 T 400 15 L 400 120 Z"
                        fill="url(#chart-fill)"
                      />
                      
                      {/* Path Line */}
                      <path
                        d="M 0 95 Q 50 80 100 88 T 200 45 T 300 55 T 400 15"
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />

                      {/* Animated Core Indicators */}
                      <circle cx="200" cy="45" r="4.5" fill="#818cf8" className="animate-ping" />
                      <circle cx="200" cy="45" r="3" fill="#ffffff" />
                      
                      <circle cx="400" cy="15" r="5" fill="#a78bfa" className="animate-pulse" />
                      <circle cx="400" cy="15" r="3.5" fill="#ffffff" />
                    </svg>
                  </div>

                  <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 pt-3 border-t border-white/5">
                    <span>WK 1</span>
                    <span>WK 2</span>
                    <span>WK 3</span>
                    <span>WK 4</span>
                    <span>WK 5 (CURRENT)</span>
                  </div>
                </div>

                {/* Column 2: Skill Analysis Card (Progress bars) */}
                <div className="lg:col-span-4 bg-white/[0.02] border border-white/5 rounded-2xl p-5 shadow-lg text-left flex flex-col justify-between hover:border-purple-500/20 transition-colors duration-300">
                  <div className="mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Evaluation Areas</span>
                    <h4 className="text-sm font-bold text-white mt-0.5">Skill Analysis</h4>
                  </div>

                  <div className="space-y-3.5 my-2">
                    {skills.map((skill, index) => (
                      <div key={index} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300 font-medium">{skill.name}</span>
                          <span className="font-bold text-white">{skill.value}%</span>
                        </div>
                        {/* Progress Bar background track */}
                        <div className="w-full h-1.5 rounded-full bg-slate-900 border border-white/5 overflow-hidden">
                          {/* Active fill */}
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${skill.color}`} 
                            style={{ width: `${skill.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center space-x-1.5 text-[9px] text-slate-500 pt-3 border-t border-white/5">
                    <Brain className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Updated 5 minutes ago by AI Evaluator</span>
                  </div>
                </div>

                {/* Column 3: AI Insights Card */}
                <div className="lg:col-span-3 bg-white/[0.02] border border-white/5 rounded-2xl p-5 shadow-lg text-left flex flex-col justify-between hover:border-pink-500/20 transition-colors duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
                  
                  <div className="mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Optimization Loop</span>
                    <h4 className="text-sm font-bold text-white mt-0.5">AI Insights</h4>
                  </div>

                  <div className="space-y-3 my-2 flex-1 flex flex-col justify-center">
                    {aiInsights.map((insight, idx) => (
                      <div key={idx} className="flex items-start space-x-2.5 p-2 rounded-xl bg-white/[0.01] border border-white/5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                        <p className="text-[11px] text-slate-300 font-light leading-relaxed">
                          {insight.text}
                        </p>
                      </div>
                    ))}
                  </div>

                  <button className="flex items-center justify-between w-full text-[10px] font-bold text-indigo-400 hover:text-indigo-300 pt-3 border-t border-white/5 transition-colors group/btn cursor-pointer">
                    <span>View optimization details</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>

              </div>

              {/* Row 3: Upcoming Schedule Cards */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 shadow-lg text-left hover:border-indigo-500/10 transition-all duration-300">
                <div className="flex justify-between items-center mb-5">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-sm font-bold text-white">Upcoming Target Schedule</h4>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">4 Tasks Pending</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {schedule.map((item, idx) => (
                    <div 
                      key={idx}
                      className="bg-slate-950/40 border border-white/5 rounded-xl p-4 flex flex-col justify-between hover:border-white/10 hover:bg-slate-950/60 transition-all duration-300 relative group/sch"
                    >
                      <div>
                        {/* Status pill inside schedule block */}
                        <span className={`inline-block text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${item.color} mb-3`}>
                          {item.status}
                        </span>
                        <h5 className="text-xs font-bold text-white mb-1 tracking-tight group-hover/sch:text-indigo-300 transition-colors duration-200">
                          {item.title}
                        </h5>
                        <p className="text-[10px] text-slate-400 font-light leading-relaxed mb-4">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[9px] text-slate-500 border-t border-white/5 pt-2.5 mt-auto">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{item.time}</span>
                        </div>
                        <ChevronRight className="w-3 h-3 text-slate-500 group-hover/sch:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>
    </>
  );
};

// Internal stub for Resume score file representation since we didn't export it
const FileTextDummy = (props) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </svg>
);

export default DashboardPreview;
