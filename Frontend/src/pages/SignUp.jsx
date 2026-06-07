import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
  Github, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  User, 
  GraduationCap, 
  Trophy, 
  CheckCircle2, 
  Clock, 
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Code,
  Target,
  FileText,
  TrendingUp
} from "lucide-react";

const SignUp = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Controlled fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [college, setCollege] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  
  // Visibility toggles & form state
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [emailError, setEmailError] = useState(false);

  // Email validation helper
  const isEmailValid = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  // Form validity check
  const isFormValid = 
    name.trim() !== "" &&
    isEmailValid(email) &&
    college.trim() !== "" &&
    password.length >= 6 &&
    password === confirmPassword &&
    agreed;

  // Password Strength Evaluation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: "", score: 0, color: "bg-slate-700", textClass: "text-slate-500" };
    
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    
    switch (score) {
      case 1:
        return { label: "Weak", score: 25, color: "bg-red-500", textClass: "text-red-400" };
      case 2:
        return { label: "Medium", score: 50, color: "bg-amber-500", textClass: "text-amber-400" };
      case 3:
        return { label: "Strong", score: 75, color: "bg-emerald-400", textClass: "text-emerald-400" };
      case 4:
      default:
        return { label: "Secure", score: 100, color: "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]", textClass: "text-cyan-400" };
    }
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setErrorMessage("");
    setSuccessMessage("");
    setEmailError(false);
    setIsSubmitting(true);
    
    try {
      const data = await register(name, email, password, college);
      setSuccessMessage(data.message || "Account created successfully! Redirecting to login...");
      setTimeout(() => {
        setIsSubmitting(false);
        navigate("/login");
      }, 1500);
    } catch (err) {
      setIsSubmitting(false);
      const errMsg = err.message || "";
      const isDuplicate = errMsg.toLowerCase().includes("exist") || errMsg.toLowerCase().includes("already");
      if (isDuplicate) {
        setErrorMessage("An account with this email already exists. Please login instead.");
        setEmailError(true);
      } else {
        setErrorMessage(errMsg || "Registration failed");
      }
    }
  };

  return (
    <>
      <style>{`
        .signup-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.007) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.007) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        @keyframes float-badge-1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(0.5deg); }
        }

        @keyframes float-badge-2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-7px) rotate(-0.5deg); }
        }

        @keyframes float-badge-3 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(0.6deg); }
        }

        .signup-float-1 {
          animation: float-badge-1 6s ease-in-out infinite;
        }

        .signup-float-2 {
          animation: float-badge-2 5s ease-in-out infinite 1s;
        }

        .signup-float-3 {
          animation: float-badge-3 7s ease-in-out infinite 2s;
        }
      `}</style>

      <div className="relative min-h-screen bg-[#050B1F] flex items-stretch font-inter overflow-hidden animate-fade-in">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 signup-grid-pattern opacity-60 pointer-events-none" />

        {/* Global Glow Lights */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[130px] pointer-events-none" />

        {/* LEFT SIDE: Product Showcase (Desktop Only) */}
        <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center items-center p-8 overflow-hidden border-r border-white/5 bg-slate-950/20 z-10 min-h-screen">
          
          {/* Logo redirect top left (Absolute position to align graphics centered vertically) */}
          <div onClick={() => navigate("/")} className="absolute top-8 left-8 flex items-center group/logo cursor-pointer z-20">
            <div className="relative mr-2.5 flex items-center justify-center w-8 h-8 rounded-full bg-slate-950/80 border border-white/10 overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" fill="currentColor" className="text-indigo-500 animate-pulse" />
                <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41M19.07 19.07l-1.41-1.41M6.34 6.34l-1.41-1.41" />
              </svg>
            </div>
            <span className="text-base font-bold tracking-tight text-white font-inter">
              PrepSphere <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">AI</span>
            </span>
          </div>

          {/* Centered AI Graphics Showcase - Repositioned upward slightly with vertical centering */}
          <div className="w-full flex flex-col justify-center items-center py-4 relative select-none mt-2">
            
            {/* Spotlight behind graphic - Increased intensity */}
            <div className="absolute w-[95%] h-[80%] rounded-full bg-indigo-500/15 blur-[100px] pointer-events-none" />
            <div className="absolute w-[70%] h-[60%] rounded-full bg-purple-500/10 blur-[90px] pointer-events-none" />

            {/* Large Futuristic Dashboard Mockup (occupies 90% width for layout balance) */}
            <div className="w-[90%] aspect-[1.35] rounded-3xl border border-white/15 bg-slate-950/75 backdrop-blur-xl p-5 shadow-[0_25px_60px_rgba(0,0,0,0.65)] overflow-hidden relative mb-5 z-10 group/dash hover:border-white/20 transition-all duration-300">
              
              {/* Top border glowing highlight */}
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent pointer-events-none" />
              
              {/* Mock Browser Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5 text-[9px] text-slate-500 font-mono">
                <div className="flex items-center space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500/60" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
                  <div className="w-2 h-2 rounded-full bg-green-500/60" />
                  <span className="pl-1 text-slate-400">prepsphere_console.app</span>
                </div>
                <div className="flex items-center space-x-1 bg-white/5 px-1.5 py-0.5 rounded text-[8px] border border-white/5 text-indigo-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  <span>AI LIVE EVAL</span>
                </div>
              </div>
              
              {/* Dashboard Content Grid */}
              <div className="grid grid-cols-12 gap-3 h-[calc(100%-28px)]">
                
                {/* Left side column: Performance Chart + Score widgets */}
                <div className="col-span-7 flex flex-col justify-between gap-3">
                  
                  {/* 1. Performance Analytics Chart */}
                  <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 flex flex-col justify-between flex-1 shadow-md">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Performance Graph</span>
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" />
                        +18.2%
                      </span>
                    </div>
                    
                    <div className="h-24 w-full relative my-1">
                      <svg className="w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
                        <path
                          d="M 0 60 L 0 50 Q 30 35 60 45 T 120 20 T 180 25 T 200 10 L 200 60 Z"
                          fill="rgba(99, 102, 241, 0.2)"
                        />
                        <path
                          d="M 0 50 Q 30 35 60 45 T 120 20 T 180 25 T 200 10"
                          fill="none"
                          stroke="#818cf8"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                        <circle cx="200" cy="10" r="4" fill="#a78bfa" className="animate-ping" />
                        <circle cx="200" cy="10" r="2.5" fill="#ffffff" />
                      </svg>
                    </div>
                    
                    <div className="flex justify-between text-[7px] font-mono text-slate-500">
                      <span>APTITUDE</span>
                      <span>RESUME</span>
                      <span>INTERVIEW</span>
                    </div>
                  </div>

                  {/* Bottom metrics row */}
                  <div className="grid grid-cols-2 gap-3">
                    
                    {/* 5. Aptitude Score Widget */}
                    <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-3 text-left shadow-md">
                      <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Aptitude</span>
                      <div className="flex items-baseline space-x-0.5 font-semibold text-white">
                        <span className="text-sm font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">782</span>
                        <span className="text-[8px] text-slate-500">/800</span>
                      </div>
                      <span className="block text-[8px] text-emerald-400 font-semibold mt-1">★ Top 5%</span>
                    </div>

                    {/* 4. Coding Tracker Progress */}
                    <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-3 text-left flex flex-col justify-between shadow-md">
                      <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Coding Tracker</span>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-300">
                          <span>Progress</span>
                          <span className="font-bold">85%</span>
                        </div>
                        <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 w-[85%]" />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Right side column: Resume details + Interview Readiness */}
                <div className="col-span-5 flex flex-col justify-between gap-3">
                  
                  {/* 3. Interview Readiness Score */}
                  <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center flex-1 shadow-md">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-2">Readiness Dial</span>
                    
                    <div className="relative flex justify-center items-center w-20 h-20">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle cx="40" cy="40" r="32" className="text-slate-800" strokeWidth="4.5" stroke="currentColor" fill="transparent" />
                        <circle cx="40" cy="40" r="32" className="text-transparent" strokeWidth="4.5" strokeDasharray={201} strokeDashoffset={201 - (201 * 95) / 100} strokeLinecap="round" stroke="url(#dash-purple-grad)" fill="transparent" />
                        <defs>
                          <linearGradient id="dash-purple-grad" x1="0" y1="0" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#a78bfa" />
                            <stop offset="100%" stopColor="#f472b6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute text-center">
                        <span className="text-base font-extrabold text-white">95%</span>
                      </div>
                    </div>
                    
                    <span className="block text-[8px] text-purple-400 font-bold uppercase tracking-wider mt-2">Ready</span>
                  </div>

                  {/* 2. AI Resume Analyzer Card */}
                  <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-3 text-left shadow-md">
                    <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Resume Analyzer</span>
                    <div className="flex items-center space-x-2">
                      <div className="p-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="block text-[11px] font-bold text-white">Resume Match: 92%</span>
                        <span className="block text-[8px] text-slate-500 font-light">ATS Optimized</span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>

            {/* BELOW ILLUSTRATION: Horizontal stats section containing 3 cards (Adjusted width to 90% for layout balance) */}
            <div className="grid grid-cols-3 gap-3 w-[90%] max-w-[520px] z-10">
              
              {/* Card 1: Aptitude Arena */}
              <div className="bg-slate-950/60 border border-white/10 backdrop-blur-md rounded-xl p-3 shadow-lg text-left hover:border-indigo-500/30 transition-all duration-300 relative group/card">
                <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-blue-500 to-indigo-500 scale-x-0 group-hover/card:scale-x-100 transition-transform duration-300" />
                <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Aptitude Arena</span>
                <div className="flex items-baseline space-x-0.5 font-semibold text-white">
                  <span className="text-sm font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">782</span>
                  <span className="text-[8px] text-slate-500">/800</span>
                </div>
                <span className="block text-[8px] text-emerald-400 font-semibold mt-1">★ Top 5%</span>
              </div>

              {/* Card 2: Resume Engine */}
              <div className="bg-slate-950/60 border border-white/10 backdrop-blur-md rounded-xl p-3 shadow-lg text-left hover:border-purple-500/30 transition-all duration-300 relative group/card">
                <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500 scale-x-0 group-hover/card:scale-x-100 transition-transform duration-300" />
                <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Resume Engine</span>
                <span className="block text-[11px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 leading-tight">Resume Match</span>
                <span className="block text-[8px] text-indigo-400 font-semibold mt-1">92% Match</span>
              </div>

              {/* Card 3: Interview Readiness */}
              <div className="bg-slate-950/60 border border-white/10 backdrop-blur-md rounded-xl p-3 shadow-lg text-left hover:border-pink-500/30 transition-all duration-300 relative group/card">
                <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-purple-500 to-pink-500 scale-x-0 group-hover/card:scale-x-100 transition-transform duration-300" />
                <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Readiness</span>
                <span className="block text-sm font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">95%</span>
                <span className="block text-[8px] text-purple-400 font-semibold mt-1">Excellent</span>
              </div>

            </div>

            {/* FLOATING BADGES (Desktop Overlapping elements) */}
            
            {/* Floating Badge 1: Mock Interviews */}
            <div className="absolute top-[28%] left-[2%] z-20 signup-float-2 bg-slate-950/80 border border-indigo-500/25 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center space-x-2 text-[10px] font-semibold text-white shadow-lg pointer-events-none hover:border-indigo-500/40 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span>Mock Interviews</span>
            </div>

            {/* Floating Badge 2: AI Resume Analyzer */}
            <div className="absolute top-[22%] right-[2%] z-20 signup-float-1 bg-slate-950/80 border border-blue-500/25 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center space-x-2 text-[10px] font-semibold text-white shadow-lg pointer-events-none hover:border-blue-500/40 transition-colors">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>AI Resume Analyzer</span>
            </div>

            {/* Floating Badge 3: Coding Tracker */}
            <div className="absolute bottom-[40%] right-[2%] z-20 signup-float-3 bg-slate-950/80 border border-emerald-500/25 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center space-x-2 text-[10px] font-semibold text-white shadow-lg pointer-events-none hover:border-emerald-500/40 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Coding Tracker</span>
            </div>

          </div>

          {/* Footer Text (Absolute Position to align centered visual correctly) */}
          <div className="absolute bottom-8 left-10 text-left text-[10px] text-slate-500 z-10">
            <p>© 2026 PrepSphere AI. Empowering elite careers.</p>
          </div>

        </div>

        {/* RIGHT SIDE: Signup Form (Py-8 for vertical laptop safety, relative padding optimized) */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-4 sm:p-6 lg:py-8 relative overflow-y-auto">
          
          {/* Logo redirect top left for mobile */}
          <div className="absolute top-6 left-6 lg:hidden">
            <div onClick={() => navigate("/")} className="flex items-center cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center mr-2">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" fill="currentColor" />
                  <path d="M12 2v2M12 20v2M4 12H2M22 12h-2" />
                </svg>
              </div>
              <span className="text-base font-bold text-white font-inter">PrepSphere</span>
            </div>
          </div>

          {/* Signup Glassmorphic Card (Optimized padding and heights to fit laptop viewports) */}
          <div className="w-full max-w-md bg-white/[0.02] border border-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
            
            {/* Top border glowing highlight */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent pointer-events-none" />
            
            {/* Ambient orb inside card */}
            <div className="absolute -bottom-24 -left-24 w-60 h-60 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />

            {/* Desktop Logo Header (Reduced margin) */}
            <div onClick={() => navigate("/")} className="hidden lg:flex items-center group/logo cursor-pointer mb-4 self-start w-fit">
              <div className="relative mr-2.5 flex items-center justify-center w-8 h-8 rounded-full bg-slate-950/80 border border-white/10 overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" fill="currentColor" className="text-indigo-500 animate-pulse" />
                  <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41M19.07 19.07l-1.41-1.41M6.34 6.34l-1.41-1.41" />
                </svg>
              </div>
              <span className="text-base font-bold tracking-tight text-white font-inter">
                PrepSphere <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">AI</span>
              </span>
            </div>

            {/* Header Title (Reduced margin) */}
            <div className="text-left space-y-1 mb-4">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Create Your Account 🚀</h1>
              <p className="text-xs text-slate-400 font-light">Start your AI-powered placement journey.</p>
            </div>

            {/* Error message */}
            {errorMessage && (
              <div className="flex items-center space-x-2 p-3 mb-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success message */}
            {successMessage && (
              <div className="flex items-center space-x-2 p-3 mb-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 text-left">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Form (Optimized field spacing: space-y-3) */}
            <form onSubmit={handleSubmit} className="space-y-3 text-left">
              
              {/* Full Name */}
              <div className="space-y-0.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-indigo-400 transition-colors">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Mercer"
                    className="w-full bg-[#050B1F]/60 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-350 placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-0.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-indigo-400 transition-colors">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError(false);
                    }}
                    placeholder="name@college.edu"
                    className={`w-full bg-[#050B1F]/60 border ${
                      emailError ? 'border-red-500/80 ring-1 ring-red-500/30' : 'border-white/10'
                    } rounded-xl pl-9 pr-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-350 placeholder:text-slate-600`}
                  />
                </div>
                {email && !isEmailValid(email) && (
                  <span className="block text-[9px] text-red-400 font-medium">✗ Please enter a valid email format</span>
                )}
              </div>

              {/* College Name */}
              <div className="space-y-0.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">College / University</label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-indigo-400 transition-colors">
                    <GraduationCap className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="Stanford University"
                    className="w-full bg-[#050B1F]/60 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-350 placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Password</label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-indigo-400 transition-colors">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#050B1F]/60 border border-white/10 rounded-xl pl-9 pr-9 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-350 placeholder:text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-500 hover:text-white focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {password && password.length < 6 && (
                  <span className="block text-[9px] text-red-400 font-medium">✗ Password must be at least 6 characters long</span>
                )}

                {/* Password Strength Indicator */}
                {password && password.length >= 6 && (
                  <div className="space-y-0.5">
                    <div className="flex justify-between items-center text-[8px] font-bold">
                      <span className="text-slate-500">PASSWORD SECURITY</span>
                      <span className={strength.textClass}>{strength.label.toUpperCase()}</span>
                    </div>
                    {/* Security Bar tracks */}
                    <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${strength.color}`} 
                        style={{ width: `${strength.score}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-0.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Confirm Password</label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-indigo-400 transition-colors">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#050B1F]/60 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-350 placeholder:text-slate-600"
                  />
                </div>
                {/* Live confirm password match feedback */}
                {confirmPassword && (
                  <div className="mt-1 flex items-center space-x-1 text-[10px]">
                    {password === confirmPassword ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-pulse" />
                        <span className="text-emerald-400 font-bold">✓ Passwords Match</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span className="text-red-400 font-bold">✗ Passwords Do Not Match</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* T&C Checkbox */}
              <div className="flex items-center pt-0.5">
                <input
                  id="agree-checkbox"
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-3.5 h-3.5 rounded bg-[#050B1F] border-white/10 text-indigo-600 focus:ring-0 cursor-pointer accent-indigo-500"
                />
                <label htmlFor="agree-checkbox" className="ml-2 text-xs text-slate-400 cursor-pointer select-none font-light">
                  I agree to the <a href="#" className="text-indigo-400 hover:underline font-medium">Terms &amp; Conditions</a>
                </label>
              </div>

              {/* Submit Action Button - Reworked into a pill to match Landing Page "Get Started" */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className="relative group w-full inline-flex items-center justify-center p-[1.5px] rounded-full overflow-hidden text-sm font-semibold text-white cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] focus:outline-none disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed"
                >
                  {/* Gradient Background Border */}
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 rounded-full" />
                  {/* Glow Shadow Layer (Increased shadow glow and hover transition duration) */}
                  <span className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full blur-md opacity-45 group-hover:opacity-95 transition duration-500 group-hover:duration-200" />
                  
                  {/* Button text inner content */}
                  <span className="relative w-full py-2.5 bg-[#050B1F] rounded-full transition-all duration-350 group-hover:bg-transparent flex items-center justify-center gap-2">
                    {isSubmitting ? "Creating workspace..." : "Create Account"}
                    {!isSubmitting && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-250" />}
                  </span>
                </button>
              </div>

            </form>

            {/* Social Authentication divider (reduced vertical margins) */}
            <div className="relative my-4 text-center">
              <div className="absolute inset-y-1/2 left-0 right-0 h-[1px] bg-white/5" />
              <span className="relative px-3 bg-[#080E24] text-[8px] text-slate-500 uppercase tracking-widest font-mono">
                or continue with
              </span>
            </div>

            {/* Social Logins (Fully visible, spacing adjusted, glassmorphism hover) */}
            <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => {
                  window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`;
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] hover:border-white/15 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] text-xs font-semibold text-slate-200 transition-all duration-300 cursor-pointer focus:outline-none"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                Google
              </button>

              <button 
                type="button"
                onClick={() => {
                  window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/github`;
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] hover:border-white/15 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] text-xs font-semibold text-slate-200 transition-all duration-300 cursor-pointer focus:outline-none"
              >
                <Github className="w-3.5 h-3.5 shrink-0" />
                GitHub
              </button>
            </div>

            {/* Redirect block */}
            <div className="text-center mt-5 text-xs text-slate-400">
              <span>Already have an account? </span>
              <button
                onClick={() => navigate("/login")}
                className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline cursor-pointer focus:outline-none"
              >
                Login
              </button>
            </div>

          </div>

          {/* Bottom Legal Links (Aligned to adapt to small viewports) */}
          <div className="flex space-x-6 text-[10px] text-slate-500 font-medium tracking-wide mt-5">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
          </div>

        </div>

      </div>
    </>
  );
};

export default SignUp;
