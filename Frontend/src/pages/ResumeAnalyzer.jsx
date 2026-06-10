import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Brain,
  FileSearch,
  MessageSquareCode,
  Code2,
  BookOpen,
  LineChart,
  Settings as SettingsIcon,
  LogOut,
  Search,
  Bell,
  User as UserIcon,
  Sparkles,
  TrendingUp,
  Award,
  Flame,
  ChevronRight,
  Play,
  CheckCircle2,
  Calendar,
  Menu,
  X,
  Clock,
  Briefcase,
  Upload,
  FileText,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  AlertTriangle,
  FileCheck,
  Check,
  RefreshCw
} from "lucide-react";

// Placeholder JSON data representing ATS and Recruiter feedback schema


const initialHistory = [];

const ResumeAnalyzer = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // File Upload State variables
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Analysis State variables
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [historyList, setHistoryList] = useState(initialHistory);

  // Navigation Links
  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, active: false, path: "/dashboard" },
    { name: "Aptitude Practice", icon: Brain, active: false, path: "/aptitude-practice" },
    { name: "Resume Analyzer", icon: FileSearch, active: true, path: "/resume-analyzer" },
    { name: "Mock Interview", icon: MessageSquareCode, active: false, path: "/mock-interview" },
    { name: "Coding Tracker", icon: Code2, active: false, path: "/coding-tracker" },
    { name: "Interview Experiences", icon: BookOpen, active: false, path: "/interview-experiences" },
    { name: "Career Analytics", icon: LineChart, active: false, path: "/career-analytics" },
    { name: "Settings", icon: SettingsIcon, active: false, path: "/settings" },
  ];

  // Drag and Drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    const validExtensions = ["pdf", "docx"];
    const fileExtension = file.name.split(".").pop().toLowerCase();
    const fileSizeInMB = file.size / (1024 * 1024);

    if (!validExtensions.includes(fileExtension)) {
      alert("Unsupported file format! Please upload a PDF or DOCX file.");
      return;
    }
    if (fileSizeInMB > 5) {
      alert("File size exceeds 5 MB limit. Please optimize your file size.");
      return;
    }
    setSelectedFile({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + " KB",
      rawFile: file
    });
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setAnalysisResult(null);
  };

  // Upload resume and trigger analysis
  const startAnalysis = async () => {
    if (!selectedFile || !selectedFile.rawFile) return;
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisStep("Uploading resume and initializing AI analyzer core...");

    const formData = new FormData();
    formData.append("resume", selectedFile.rawFile);

    try {
      // Start the actual upload request via Axios
      const uploadPromise = api.post("/resume/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Run the simulated steps animation in parallel
      const steps = [
        { progress: 15, text: "Parsing file layout and structure..." },
        { progress: 35, text: "Extracting work credentials and skill logs..." },
        { progress: 55, text: "Comparing profile nodes with database keywords..." },
        { progress: 75, text: "Evaluating ATS rules guidelines..." },
        { progress: 90, text: "Running recruiter perspective heuristics..." },
        { progress: 100, text: "Calibrating final placement metrics..." }
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 350));
        setAnalysisProgress(step.progress);
        setAnalysisStep(step.text);
      }

      // Await backend response
      const response = await uploadPromise;

      if (response.data && response.data.success) {
        const backendResume = response.data.resume;
        
        await new Promise(resolve => setTimeout(resolve, 600));
        setIsAnalyzing(false);
        
        // Display real Gemini analysis returned by the backend
        setAnalysisResult(response.data.analysis);

        // Add to history list using backend resume and analysis values
        const newHistoryItem = {
          id: backendResume.id,
          name: backendResume.resumeName,
          date: new Date(backendResume.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          score: response.data.analysis.atsAnalysis?.score || response.data.analysis.atsScore || 0,
          status: (response.data.analysis.atsAnalysis?.score || response.data.analysis.atsScore || 0) >= 80 ? "Analyzed" : "Needs Optimization",
          data: response.data.analysis
        };

        setHistoryList(prev => [newHistoryItem, ...prev]);
      } else {
        throw new Error(response.data?.message || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading resume:", error);
      setIsAnalyzing(false);
      alert(error.response?.data?.message || error.message || "An error occurred during resume upload.");
    }
  };

  const loadHistoryItem = (item) => {
    setSelectedFile({
      name: item.name,
      size: "Verified Archive",
      rawFile: null
    });
    setAnalysisResult(item.data);
  };

  const deleteHistoryItem = (id, e) => {
    e.stopPropagation();
    setHistoryList(prev => prev.filter(item => item.id !== id));
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <style>{`
        .dash-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.012) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.012) 1px, transparent 1px);
          background-size: 50px 50px;
        }
        
        /* Custom scrollbar styling */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.01);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.2);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.4);
        }
      `}</style>

      <div className="h-screen bg-[#050B1F] text-slate-100 font-inter flex overflow-hidden relative">
        {/* Ambient Grid Pattern */}
        <div className="absolute inset-0 dash-grid-pattern opacity-60 pointer-events-none" />

        {/* Purple and Indigo Glowing Lights */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-[130px] pointer-events-none" />

        {/* SIDEBAR - DESKTOP */}
        <aside className="fixed left-0 top-0 h-screen w-[280px] hidden lg:flex flex-col bg-slate-950/40 border-r border-white/5 backdrop-blur-xl z-20 overflow-hidden">
          {/* Logo */}
          <div className="p-6 flex items-center space-x-3 border-b border-white/5">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-slate-950/80 border border-white/10 overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.25)]">
              <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" fill="currentColor" className="text-indigo-500 animate-pulse" />
                <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41M19.07 19.07l-1.41-1.41M6.34 6.34l-1.41-1.41" />
              </svg>
            </div>
            <span className="text-base font-extrabold tracking-tight text-white font-inter">
              PrepSphere <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">AI</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            {navItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl text-left text-base font-medium transition-all duration-200 cursor-pointer ${
                  item.active
                    ? "bg-gradient-to-r from-indigo-500/15 to-purple-500/10 text-indigo-300 border border-indigo-500/25 shadow-[0_4px_20px_rgba(99,102,241,0.08)]"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.03] border border-transparent"
                }`}
              >
                <item.icon className={`w-4 h-4 ${item.active ? "text-indigo-400" : "text-slate-500"}`} />
                <span>{item.name}</span>
              </button>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-white/5">
            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-left text-base font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 cursor-pointer focus:outline-none"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* MOBILE DRAWER SIDEBAR */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              />

              {/* Sidebar Drawer Container */}
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 z-50 w-[280px] bg-[#050B1F]/95 border-r border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col justify-between lg:hidden"
              >
                <div>
                  <div className="p-5 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="3" fill="currentColor" />
                          <path d="M12 2v2M12 20v2M4 12H2M22 12h-2" />
                        </svg>
                      </div>
                      <span className="text-base font-bold text-white">PrepSphere AI</span>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <nav className="px-3 py-5 space-y-1">
                    {navItems.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSidebarOpen(false);
                          navigate(item.path);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left text-base font-medium transition-all duration-200 ${
                          item.active
                            ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-300 border-l-[3px] border-indigo-500 pl-3.5"
                            : "text-slate-400 hover:text-white hover:bg-white/5 pl-4"
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="p-4 border-t border-white/5">
                  <button
                    onClick={() => {
                      setSidebarOpen(false);
                      setShowLogoutModal(true);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-left text-base font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* MAIN DISPLAY CONTAINER */}
        <div className="lg:ml-[280px] flex-1 flex flex-col h-screen overflow-y-auto z-10 relative">
          
          {/* TOP NAVBAR */}
          <header className="sticky top-0 z-30 bg-[#050B1F]/70 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
            {/* Mobile Menu trigger */}
            <div className="flex items-center space-x-4 flex-1 max-w-lg">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 lg:hidden focus:outline-none shrink-0"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              {/* Search Box placeholder for layout compliance */}
              <div className="relative w-full group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search scanned records, key features..."
                  className="w-full bg-slate-950/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-300 placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Profile Avatar / Info */}
            <div className="flex items-center space-x-6 shrink-0 pl-4">
              <button className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500" />
              </button>
              
              <div className="flex items-center space-x-3 border-l border-white/5 pl-6">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-white">Welcome Back, {user?.name?.split(" ")[0] || "User"}</p>
                  <p className="text-xs text-slate-400 mt-0.5 max-w-[150px] truncate">{user?.college || "PrepSphere College"}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-[1px] shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                  <div className="w-full h-full rounded-xl bg-[#080E24] flex items-center justify-center text-indigo-400 text-sm font-bold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* MAIN PAGE BODY */}
          <main className="flex-1 p-6 space-y-8 max-w-7xl mx-auto w-full">
            
            {/* MODULE HEADER SECTION */}
            <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6 text-left">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
                  <FileSearch className="w-8 h-8 text-indigo-400" />
                  AI Resume Analyzer
                </h1>
                <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                  Upload your resume and receive an AI-powered ATS analysis, recruiter insights, missing keywords, and personalized improvement suggestions.
                </p>
              </div>

              {/* Header Action Button */}
              {selectedFile && (
                <button
                  onClick={handleRemoveFile}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-sm font-medium text-slate-300 hover:text-white transition-all cursor-pointer select-none"
                >
                  <RefreshCw className="w-4 h-4 text-indigo-400" />
                  Reset Scan
                </button>
              )}
            </section>

            {/* SIMULATED SCANNING SCREEN */}
            {isAnalyzing && (
              <div className="min-h-[400px] flex items-center justify-center bg-slate-950/20 border border-white/10 rounded-3xl backdrop-blur-xl relative overflow-hidden p-8 shadow-2xl">
                <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent animate-pulse" />
                <div className="text-center space-y-6 max-w-md w-full relative z-10">
                  {/* Rotating visual node */}
                  <div className="relative flex items-center justify-center w-24 h-24 mx-auto">
                    <div className="absolute inset-0 rounded-full border-2 border-indigo-500/10 border-t-2 border-t-indigo-500 animate-spin" />
                    <div className="absolute inset-2 rounded-full border border-dashed border-purple-500/30 animate-spin [animation-direction:reverse]" />
                    <FileSearch className="w-8 h-8 text-indigo-400 animate-pulse" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">Analyzing Resume Stack...</h3>
                    <p className="text-sm text-slate-400 font-mono tracking-wide min-h-[20px]">{analysisStep}</p>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${analysisProgress}%` }}
                      transition={{ duration: 0.2 }}
                      className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"
                    />
                  </div>

                  <span className="block text-sm font-bold text-indigo-400 font-mono">{analysisProgress}% COMPLETE</span>
                </div>
              </div>
            )}

            {/* RESULTS DASHBOARD OR INITIAL FILE UPLOAD SECTION */}
            {!isAnalyzing && (
              <AnimatePresence mode="wait">
                {analysisResult ? (
                  /* RESULTS SECTION */
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="space-y-8"
                  >
                    {/* TOP SUMMARY ROW: ATS SCORE, MATCH METRICS & PREVIEW */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      
                      {/* Left Block (7 columns): ATS Score Circle & Gauge details */}
                      <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-lg text-left">
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                        
                        {/* Circle Score block */}
                        <div className="flex flex-col items-center justify-center text-center p-4 border-b sm:border-b-0 sm:border-r border-white/5">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">ATS Analysis Score</span>
                          
                          {/* Radial indicator */}
                          <div className="relative flex items-center justify-center w-36 h-36">
                            <svg className="w-36 h-36 transform -rotate-90">
                              <circle cx="72" cy="72" r="62" className="text-slate-800" strokeWidth="8" stroke="currentColor" fill="transparent" />
                              <circle cx="72" cy="72" r="62" className="text-transparent" strokeWidth="8" strokeDasharray={390} strokeDashoffset={390 - (390 * (analysisResult.atsAnalysis?.score || 0)) / 100} strokeLinecap="round" stroke="url(#result-gradient)" fill="transparent" />
                              <defs>
                                <linearGradient id="result-gradient" x1="0" y1="0" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#6366f1" />
                                  <stop offset="50%" stopColor="#a855f7" />
                                  <stop offset="100%" stopColor="#ec4899" />
                                </linearGradient>
                              </defs>
                            </svg>
                            <div className="absolute text-center">
                              <span className="text-4xl font-extrabold text-white">{analysisResult.atsAnalysis?.score || 0}%</span>
                              <span className="block text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">ATS MATCH</span>
                            </div>
                          </div>

                          <div className="mt-4">
                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                              {analysisResult.atsAnalysis?.label || ''}
                            </span>
                          </div>
                        </div>

                        {/* Match Progress breakdown */}
                        <div className="flex flex-col justify-between p-2 space-y-4">
                          <div>
                            <h3 className="text-lg font-semibold text-white">Diagnostics Rating</h3>
                            <p className="text-sm text-slate-300 font-light mt-1.5 leading-relaxed">
                              {analysisResult.diagnostics?.description || ''}
                            </p>
                          </div>

                          <div className="space-y-3 pt-2">
                            {/* Skills Match */}
                            <div>
                              <div className="flex justify-between text-sm text-slate-400 mb-1.5">
                                <span>Skills Match</span>
                                <span className="font-semibold text-indigo-400">{analysisResult.diagnostics?.skillsMatch || 0}%</span>
                              </div>
                              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: `${analysisResult.diagnostics?.skillsMatch || 0}%` }} />
                              </div>
                            </div>

                            {/* Formatting Score */}
                            <div>
                              <div className="flex justify-between text-sm text-slate-400 mb-1.5">
                                <span>Formatting &amp; Layout</span>
                                <span className="font-semibold text-purple-400">{analysisResult.diagnostics?.formatting || 0}%</span>
                              </div>
                              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${analysisResult.diagnostics?.formatting || 0}%` }} />
                              </div>
                              <span className="block text-xs text-slate-500 mt-1">
                                {(analysisResult.diagnostics?.formatting || 0) >= 90 ? 'Professional Layout' : 'Standard Layout'}
                              </span>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Right Block (5 columns): Resume Preview / Status */}
                      <div className="lg:col-span-5 bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-lg text-left h-[340px] lg:h-auto">
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
                        
                        <div className="flex justify-between items-center pb-3 border-b border-white/5">
                          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <FileCheck className="w-5 h-5 text-purple-400" />
                            Document Source
                          </h3>
                          <span className="text-xs text-slate-400 truncate max-w-[180px] font-mono">{selectedFile.name}</span>
                        </div>

                        {/* Visual Mock PDF display */}
                        <div className="flex-1 flex flex-col items-center justify-center p-4 bg-slate-950/30 border border-white/5 rounded-2xl my-4 relative group overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3.5 z-10">
                            <button className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:border-white/25 transition-all cursor-pointer">
                              <ZoomIn className="w-4 h-4" />
                            </button>
                            <button className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:border-white/25 transition-all cursor-pointer">
                              <ZoomOut className="w-4 h-4" />
                            </button>
                            <button className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:border-white/25 transition-all cursor-pointer">
                              <Maximize2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <FileText className="w-12 h-12 text-slate-500 mb-2" />
                          <span className="text-sm font-semibold text-white">Resume Preview Mock</span>
                          <span className="text-xs text-slate-400 mt-1 font-mono">PDF rendering active | {selectedFile.size}</span>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-light">Securely stored in active session</span>
                          <button className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-bold transition-all cursor-pointer focus:outline-none">
                            <Download className="w-4.5 h-4.5" />
                            Download Original
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* PLACEMENT READINESS TIMELINE */}
                    <section className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left shadow-lg">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                      
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                        <TrendingUp className="w-5 h-5 text-indigo-400" />
                        Career Placement Readiness Track
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative">
                        {/* Connecting Line */}
                        <div className="absolute top-8 left-[12%] right-[12%] h-[1.5px] bg-white/5 hidden sm:block z-0" />

                        {[
                          { label: "Foundation Scope", desc: "Covers personal metadata details, basic skills categorization, and GPA indicators." },
                          { label: "Intermediate Matrix", desc: "Includes basic internships log entries and primary technical project specifications." },
                          { label: "Advanced ATS Align", desc: "Demonstrates optimization matching high-priority industry tags and system structures." },
                          { label: "Placement Ready", desc: "Demonstrates concrete metrics impact and system design keywords fit for premium companies." }
                        ].map((stage, idx) => {
                          const currentStageIndex = (analysisResult.placementReadiness?.currentStage || 1) - 1;
                          const isActive = idx <= currentStageIndex;
                          const isCurrent = idx === currentStageIndex;

                          return (
                            <div key={idx} className="flex flex-col items-center sm:items-start text-center sm:text-left relative z-10">
                              <div className="flex items-center justify-center w-12 h-12 rounded-2xl mb-3 border transition-all duration-300 shadow-md"
                                style={{
                                  background: isCurrent ? "rgba(99, 102, 241, 0.15)" : isActive ? "rgba(16, 185, 129, 0.1)" : "rgba(255,255,255,0.02)",
                                  borderColor: isCurrent ? "#6366f1" : isActive ? "#10b981" : "rgba(255,255,255,0.1)",
                                  color: isCurrent ? "#818cf8" : isActive ? "#34d399" : "#64748b"
                                }}
                              >
                                {isActive && !isCurrent ? (
                                  <Check className="w-5 h-5" />
                                ) : (
                                  <span className="text-sm font-bold">{idx + 1}</span>
                                )}
                              </div>
                              <span className="text-sm font-semibold text-white">{stage.label}</span>
                              <span className="text-xs text-slate-400 font-light mt-1.5 leading-relaxed max-w-[200px]">{stage.desc}</span>
                              {isCurrent && (
                                <span className="mt-2 text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                  Current Stage
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </section>

                    {/* INTERACTIVE RECOMMENDATIONS & KEYWORDS GRIDS */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      
                      {/* AI Suggestions (7 columns) */}
                      <div className="lg:col-span-7 bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left shadow-lg">
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                        
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                          <Sparkles className="w-5 h-5 text-indigo-400" />
                          AI Improvement Suggestions
                        </h3>

                        <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
                          {(analysisResult.improvementSuggestions || []).map((sug, idx) => (
                            <div key={idx} className="p-4 bg-slate-950/30 border border-white/5 rounded-2xl flex flex-col space-y-2 hover:border-white/10 transition-colors">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-white">{sug.title}</h4>
                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border uppercase tracking-wider ${
                                  sug.priority?.toUpperCase() === 'HIGH'
                                    ? 'text-red-400 bg-red-500/10 border-red-500/20'
                                    : sug.priority?.toUpperCase() === 'LOW'
                                    ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
                                    : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                                }`}>
                                  {sug.priority} Priority
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 font-light leading-relaxed">{sug.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Missing Keywords (5 columns) */}
                      <div className="lg:col-span-5 bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left flex flex-col justify-between shadow-lg">
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
                        
                        <div>
                          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-5 h-5 text-amber-400" />
                            Missing ATS Keywords
                          </h3>
                          <p className="text-xs text-slate-400 font-light leading-relaxed mb-4">
                            These keywords are missing or underrepresented based on top placement criteria. Add them to improve matching.
                          </p>
                          
                          {/* Keywords chip tags */}
                          <div className="flex flex-wrap gap-2.5">
                            {(analysisResult.missingKeywords || []).map((kw, idx) => (
                              <div
                                key={idx}
                                className="px-3.5 py-1.5 bg-[#080E24] hover:bg-slate-900 border border-indigo-500/20 hover:border-indigo-500/40 rounded-full text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer select-none"
                              >
                                + {kw}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="text-xs text-slate-500 font-light pt-4 border-t border-white/5 mt-4">
                          Clicking a keyword shows matching course study notes.
                        </div>
                      </div>

                    </div>

                    {/* SECTION BY SECTION ANALYZER GRIDS */}
                    <section className="space-y-4">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2 text-left">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        Resume Section Diagnostic Scores
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(analysisResult.sectionAnalysis || []).map((sec, idx) => (
                          <div
                            key={idx}
                            className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 text-left relative overflow-hidden group hover:border-white/20 transition-all duration-300"
                          >
                            {/* Visual glowing separator */}
                            <div
                              className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r"
                              style={{
                                backgroundImage:
                                  sec.score >= 90
                                    ? "linear-gradient(to right, transparent, rgba(16, 185, 129, 0.3), transparent)"
                                    : "linear-gradient(to right, transparent, rgba(245, 158, 11, 0.3), transparent)"
                              }}
                            />
                            
                            <div className="flex justify-between items-center pb-3 border-b border-white/5">
                              <span className="text-sm font-bold text-white capitalize">{sec.section} Analysis</span>
                              <span
                                className="text-xs font-semibold px-2 py-0.5 rounded-md border"
                                style={{
                                  background: sec.score >= 90 ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
                                  borderColor: sec.score >= 90 ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)",
                                  color: sec.score >= 90 ? "#34d399" : "#fbbf24"
                                }}
                              >
                                {sec.score}%
                              </span>
                            </div>

                            <div className="space-y-2.5 mt-3 text-xs">
                              <div>
                                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Parsed Status</span>
                                <span className="text-xs text-slate-300 font-semibold">{sec.status}</span>
                              </div>
                              <div>
                                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">AI Suggestions</span>
                                <p className="text-xs text-slate-400 leading-relaxed font-light mt-0.5">{sec.suggestions}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* OVERALL FEEDBACK CARD */}
                    <section className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left shadow-lg">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
                      
                      <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-6">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                          <Award className="w-5 h-5 text-purple-400" />
                          Overall AI Recruiter Evaluation Report
                        </h3>
                        <span className="text-sm text-purple-400 font-bold bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-xl">
                          RATING: {analysisResult.overallReport?.rating.toString().includes('/') ? analysisResult.overallReport.rating : `${analysisResult.overallReport?.rating || 0} / 5.0`}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
                        
                        {/* Strengths / Weaknesses */}
                        <div className="space-y-4">
                          <div>
                            <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Key Strengths</span>
                            <p className="text-sm text-slate-300 leading-relaxed font-light">{analysisResult.overallReport?.strengths}</p>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Identified Weaknesses</span>
                            <p className="text-sm text-slate-300 leading-relaxed font-light">{analysisResult.overallReport?.weaknesses}</p>
                          </div>
                        </div>

                        {/* Recruiter view / Actions */}
                        <div className="space-y-4">
                          <div>
                            <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Recruiter Perspective</span>
                            <p className="text-sm text-slate-300 leading-relaxed font-light">{analysisResult.overallReport?.recruiterPerspective}</p>
                          </div>
                          <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                            <span className="block text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-1">Final Actionable Advice</span>
                            <p className="text-xs text-indigo-300 leading-relaxed font-light italic">{analysisResult.overallReport?.finalAdvice}</p>
                          </div>
                        </div>

                      </div>
                    </section>

                  </motion.div>
                ) : (
                  /* INITIAL UPLOAD DISPLAY STATE */
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="space-y-8"
                  >
                    {/* Drag-and-drop Card */}
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`min-h-[360px] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center p-8 backdrop-blur-md transition-all duration-300 text-center relative overflow-hidden select-none ${
                        dragActive
                          ? "border-indigo-500 bg-indigo-500/5 shadow-[0_0_30px_rgba(99,102,241,0.15)]"
                          : "border-white/10 hover:border-white/20 bg-white/[0.01]"
                      }`}
                    >
                      <div className="absolute top-[-30%] right-[-10%] w-[300px] h-[300px] rounded-full bg-indigo-500/5 blur-[80px] pointer-events-none" />
                      
                      {selectedFile ? (
                        /* Selected file view details */
                        <div className="space-y-6 max-w-md w-full relative z-10">
                          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 mx-auto shadow-md">
                            <FileText className="w-8 h-8" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-sm font-semibold text-white max-w-sm truncate mx-auto">{selectedFile.name}</h4>
                            <span className="block text-xs text-slate-500 font-mono font-medium">{selectedFile.size}</span>
                          </div>

                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={handleRemoveFile}
                              className="px-4.5 py-2 rounded-xl bg-slate-900 border border-white/10 hover:border-red-500/30 text-slate-400 hover:text-red-400 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Remove
                            </button>
                            <button
                              onClick={startAnalysis}
                              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white text-sm font-semibold transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/20 cursor-pointer"
                            >
                              Analyze Resume
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Empty Drop Area view */
                        <div className="space-y-6 max-w-sm relative z-10">
                          <div className="relative w-16 h-16 mx-auto flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl text-indigo-400 shadow-md">
                            <Upload className="w-6 h-6 animate-pulse" />
                          </div>

                          <div className="space-y-1">
                            <h3 className="text-sm font-semibold text-white">Drag &amp; Drop Resume</h3>
                            <p className="text-xs text-slate-400 font-light">or drop your file inside this area boundary</p>
                          </div>

                          <div>
                            <label className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white text-sm font-medium transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/25 cursor-pointer block w-fit mx-auto">
                              Browse Files
                              <input
                                type="file"
                                accept=".pdf,.docx"
                                className="hidden"
                                onChange={handleFileChange}
                              />
                            </label>
                          </div>

                          <div className="text-[11px] text-slate-500 font-light space-y-1 pt-2">
                            <span>Supported Formats: PDF, DOCX (Max 5 MB)</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Features breakdown banner */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {[
                        { title: "ATS Friendly Analysis", desc: "Aligns formatting, structure, and text details matching top hiring filters.", icon: FileCheck, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
                        { title: "AI Powered by Gemini", desc: "Combines localized data vectors and large language models for precise scores.", icon: Sparkles, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
                        { title: "Secure File Upload", desc: "Documents are processed locally in compliance with strict privacy parameters.", icon: Clock, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" }
                      ].map((item, idx) => (
                        <div key={idx} className="p-4 bg-white/[0.02] border border-white/10 rounded-2xl flex items-start space-x-3 text-left">
                          <div className={`p-2 rounded-xl border shrink-0 ${item.color}`}>
                            <item.icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-white">{item.title}</h4>
                            <p className="text-xs text-slate-500 font-light leading-relaxed mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* SCAN HISTORY SECTION */}
            <section className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left shadow-lg">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
              
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-indigo-400" />
                Resume Analysis History
              </h3>

              <div className="overflow-x-auto w-full">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Resume Name</th>
                      <th className="py-3 px-4">Upload Date</th>
                      <th className="py-3 px-4 text-center">ATS Score</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyList.map((hist) => (
                      <tr
                        key={hist.id}
                        onClick={() => loadHistoryItem(hist)}
                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                          <FileText className="w-4 h-4 text-indigo-400" />
                          {hist.name}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">{hist.date}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-indigo-400">{hist.score}%</td>
                        <td className="py-3.5 px-4">
                          <span
                            className="px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider"
                            style={{
                              background: hist.score >= 80 ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
                              borderColor: hist.score >= 80 ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)",
                              color: hist.score >= 80 ? "#34d399" : "#fbbf24"
                            }}
                          >
                            {hist.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-3.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                loadHistoryItem(hist);
                              }}
                              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 focus:outline-none transition-colors"
                            >
                              View
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                alert("Downloading full AI analysis report for " + hist.name);
                              }}
                              className="text-xs font-semibold text-slate-400 hover:text-white focus:outline-none transition-colors"
                            >
                              Report
                            </button>
                            <button
                              onClick={(e) => deleteHistoryItem(hist.id, e)}
                              className="text-slate-500 hover:text-red-400 focus:outline-none transition-colors"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {historyList.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500 italic">
                          No scan history found. Select a file above to begin diagnostics.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

          </main>
        </div>

        {/* Logout Confirmation Modal */}
        <AnimatePresence>
          {showLogoutModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowLogoutModal(false)}
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
              />

              {/* Modal Card */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className="relative w-full max-w-md bg-[#080E24]/90 border border-white/10 rounded-2xl p-6 shadow-[0_0_50px_rgba(99,102,241,0.15)] backdrop-blur-xl overflow-hidden text-left"
              >
                {/* Decorative Glow */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent pointer-events-none" />
                <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-red-500/10 blur-[40px] pointer-events-none" />

                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 shrink-0">
                    <LogOut className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Confirm Sign Out</h3>
                    <p className="text-sm text-slate-400 font-light mt-1.5 leading-relaxed">
                      Are you sure you want to log out of PrepSphere AI? You will need to sign in again to access your preparation dashboard.
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6 justify-end">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] text-slate-300 hover:text-white text-sm font-medium transition-all duration-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-all duration-200 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.25)] hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                  >
                    Sign Out
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </>
  );
};

export default ResumeAnalyzer;
