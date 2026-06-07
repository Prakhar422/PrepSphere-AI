import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
  Github, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  MessageSquare, 
  Code,
  Globe,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setErrorMessage(errorParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);
    
    try {
      await login(email, password, rememberMe);
      setIsSubmitting(false);
      navigate("/dashboard");
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage(err.message || "Invalid email or password");
    }
  };

  return (
    <>
      <style>{`
        .login-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.015) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        @keyframes float-tag-1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(0.5deg); }
        }

        @keyframes float-tag-2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(-1deg); }
        }

        @keyframes float-tag-3 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(0.8deg); }
        }

        .login-float-1 {
          animation: float-tag-1 6s ease-in-out infinite;
        }

        .login-float-2 {
          animation: float-tag-2 5s ease-in-out infinite 1s;
        }

        .login-float-3 {
          animation: float-tag-3 7s ease-in-out infinite 2s;
        }
      `}</style>

      <div className="relative min-h-screen bg-[#050B1F] flex items-stretch font-inter overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 login-grid-pattern opacity-60 pointer-events-none" />

        {/* Global Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[130px] pointer-events-none" />

        {/* LEFT PANEL: Dashboard mockup (Desktop Only) */}
        <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center items-center p-12 overflow-hidden border-r border-white/5 bg-slate-950/20">
          
          {/* Logo redirect top left */}
          <div onClick={() => navigate("/")} className="absolute top-8 left-8 flex items-center group/logo cursor-pointer w-fit z-20">
            <div className="relative mr-3 flex items-center justify-center w-8 h-8 rounded-full bg-slate-950/80 border border-white/10 overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" fill="currentColor" className="text-indigo-500 animate-pulse" />
                <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41M19.07 19.07l-1.41-1.41M6.34 6.34l-1.41-1.41" />
              </svg>
            </div>
            <span className="text-base font-bold tracking-tight text-white font-inter">
              PrepSphere <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">AI</span>
            </span>
          </div>

          {/* Spotlight glowing behind mockup */}
          <div className="absolute w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 blur-[90px] pointer-events-none" />

          {/* Browser Container */}
          <div className="relative w-full max-w-[500px] aspect-[4/3] rounded-2xl border border-white/10 bg-slate-950/60 backdrop-blur-xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
            {/* Top glowing ambient gradient overlay */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent pointer-events-none" />

            {/* Simulated Browser window header */}
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/5 text-xs text-slate-500">
              <div className="flex items-center space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                <span className="pl-2 font-mono text-[9px] tracking-wide text-slate-400">prepsphere-dashboard.app</span>
              </div>
            </div>

            {/* Performance graph */}
            <div className="h-full flex flex-col justify-between pb-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Workspace Analytics</span>
                  <h4 className="text-sm font-bold text-white tracking-tight mt-0.5">Mock Evaluation Trend</h4>
                </div>
                <div className="flex items-center space-x-1.5 text-[9px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-lg">
                  <TrendingUp className="w-3 h-3" />
                  <span>+18.4% VELOCITY</span>
                </div>
              </div>

              {/* SVG Graphic represent mock trend */}
              <div className="h-28 w-full relative">
                <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="glow-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="0" y1="30" x2="400" y2="30" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  <line x1="0" y1="60" x2="400" y2="60" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  <line x1="0" y1="90" x2="400" y2="90" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                  <path
                    d="M 0 120 L 0 100 Q 60 70 120 85 T 240 40 T 360 48 T 400 25 L 400 120 Z"
                    fill="url(#glow-grad)"
                  />
                  <path
                    d="M 0 100 Q 60 70 120 85 T 240 40 T 360 48 T 400 25"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  
                  <circle cx="240" cy="40" r="4.5" fill="#a78bfa" className="animate-ping" />
                  <circle cx="240" cy="40" r="3" fill="#ffffff" />
                  
                  <circle cx="400" cy="25" r="4" fill="#a78bfa" className="animate-pulse" />
                  <circle cx="400" cy="25" r="2.5" fill="#ffffff" />
                </svg>
              </div>

              {/* Progress markers */}
              <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 pt-3 border-t border-white/5">
                <span>STAGE 1: EVAL</span>
                <span>STAGE 2: ANALYSIS</span>
                <span>STAGE 3: SYNC COMPLETE</span>
              </div>
            </div>

          </div>

          {/* Floating AI tags overlapping */}
          
          {/* Tag 1: AI Resume Analyzer */}
          <div className="absolute top-[20%] right-[12%] bg-slate-950/80 border border-blue-500/20 backdrop-blur-md rounded-2xl p-3 flex items-center space-x-3 shadow-xl z-20 login-float-1 hover:border-blue-500/40 transition-colors duration-300">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 text-blue-400">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div className="text-left">
              <span className="block text-[8px] uppercase tracking-wider text-blue-400 font-bold">Active Module</span>
              <span className="text-[11px] font-bold text-white">AI Resume Analyzer</span>
            </div>
          </div>

          {/* Tag 2: Mock Interviews */}
          <div className="absolute bottom-[42%] left-[10%] bg-slate-950/80 border border-purple-500/20 backdrop-blur-md rounded-2xl p-3 flex items-center space-x-3 shadow-xl z-20 login-float-2 hover:border-purple-500/40 transition-colors duration-300">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/10 text-purple-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="block text-[8px] uppercase tracking-wider text-purple-400 font-bold">Completed</span>
              <span className="text-[11px] font-bold text-white">Mock Interviews</span>
            </div>
          </div>

          {/* Tag 3: Coding Tracker */}
          <div className="absolute bottom-[14%] right-[15%] bg-slate-950/80 border border-emerald-500/20 backdrop-blur-md rounded-2xl p-3 flex items-center space-x-3 shadow-xl z-20 login-float-3 hover:border-emerald-500/40 transition-colors duration-300">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400">
              <Code className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="block text-[8px] uppercase tracking-wider text-emerald-400 font-bold">Progress Sync</span>
              <span className="text-[11px] font-bold text-white">Coding Tracker</span>
            </div>
          </div>

        </div>

        {/* RIGHT PANEL: Authentication Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative">
          
          {/* Subtle logo redirect top left for mobile layout consistency */}
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

          {/* Login Card */}
          <div className="w-full max-w-md bg-white/[0.02] border border-white/10 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
            
            {/* Top border ambient highlight */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent pointer-events-none" />
            
            {/* Card inner glow spotlight */}
            <div className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />

            {/* Logo Section */}
            <div onClick={() => navigate("/")} className="hidden lg:flex items-center group/logo cursor-pointer mb-6 self-start w-fit">
              <div className="relative mr-3 flex items-center justify-center w-8 h-8 rounded-full bg-slate-950/80 border border-white/10 overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" fill="currentColor" className="text-indigo-500 animate-pulse" />
                  <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41M19.07 19.07l-1.41-1.41M6.34 6.34l-1.41-1.41" />
                </svg>
              </div>
              <span className="text-base font-bold tracking-tight text-white font-inter">
                PrepSphere <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">AI</span>
              </span>
            </div>

            {/* Header Text */}
            <div className="text-left space-y-1 mb-8">
              <h1 className="text-2xl font-bold text-white tracking-tight">Welcome Back 👋</h1>
              <p className="text-xs text-slate-400 font-light">Continue your placement preparation journey</p>
            </div>

            {/* Error message */}
            {errorMessage && (
              <div className="flex items-center space-x-2 p-3 mb-5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5 text-left">
              
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-indigo-400 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-[#050B1F]/60 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-300 placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Password</label>
                  <a href="#" className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium">Forgot Password?</a>
                </div>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-indigo-400 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#050B1F]/60 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-300 placeholder:text-slate-600"
                  />
                  {/* Eye Toggle button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#050B1F] border-white/10 text-indigo-600 focus:ring-0 cursor-pointer accent-indigo-500"
                />
                <label htmlFor="remember-me" className="ml-2 text-xs text-slate-400 cursor-pointer select-none font-light">
                  Remember my device
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="relative group w-full inline-flex items-center justify-center p-[1px] rounded-xl overflow-hidden text-sm font-semibold text-white cursor-pointer transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] focus:outline-none disabled:opacity-50"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 rounded-xl" />
                <span className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-xl blur opacity-35 group-hover:opacity-75 transition duration-300" />
                
                <span className="relative w-full py-3.5 bg-[#050B1F] rounded-xl transition-all duration-200 group-hover:bg-transparent flex items-center justify-center gap-2">
                  {isSubmitting ? "Syncing Workspace..." : "Sign In"}
                  {!isSubmitting && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </span>
              </button>

            </form>

            {/* Social Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-y-1/2 left-0 right-0 h-[1px] bg-white/5" />
              <span className="relative px-3 bg-[#080E24] text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                or continue with
              </span>
            </div>

            {/* Social Logins */}
            <div className="flex gap-4">
              
              {/* Google login Button */}
              <button 
                type="button"
                onClick={() => {
                  window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`;
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 text-xs font-semibold text-slate-200 transition-all duration-200 cursor-pointer focus:outline-none"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                Google
              </button>

              {/* GitHub Login Button */}
              <button 
                type="button"
                onClick={() => {
                  window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/github`;
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 text-xs font-semibold text-slate-200 transition-all duration-200 cursor-pointer focus:outline-none"
              >
                <Github className="w-4 h-4 shrink-0" />
                GitHub
              </button>

            </div>

            {/* Footer Navigation link */}
            <div className="text-center mt-8 text-xs text-slate-400">
              <span>Don't have an account? </span>
              <button
                onClick={() => navigate("/register")}
                className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline cursor-pointer focus:outline-none"
              >
                Sign Up
              </button>
            </div>

          </div>

          {/* Bottom Legal Links */}
          <div className="absolute bottom-6 flex space-x-6 text-[10px] text-slate-500 font-medium tracking-wide">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Support</a>
          </div>

        </div>

      </div>
    </>
  );
};

export default Login;
