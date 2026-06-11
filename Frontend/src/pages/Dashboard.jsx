import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
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
} from "lucide-react";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [resumeSummary, setResumeSummary] = useState({ hasResume: false, loading: true });

  useEffect(() => {
    const fetchResumeSummary = async () => {
      try {
        const response = await api.get("/dashboard/resume-summary");
        if (response.data && response.data.success) {
          setResumeSummary({
            hasResume: response.data.hasResume,
            atsScore: response.data.atsScore,
            atsLabel: response.data.atsLabel,
            strengths: response.data.strengths || [],
            missingKeywords: response.data.missingKeywords || [],
            loading: false
          });
        }
      } catch (err) {
        console.error("Error fetching dashboard resume summary:", err);
        setResumeSummary({ hasResume: false, loading: false });
      }
    };
    fetchResumeSummary();
  }, []);

  // States for interactive UI toggles
  const [reminders, setReminders] = useState({
    leetcode: false,
    codeforces: false,
    codechef: false,
  });

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleReminder = (contestKey) => {
    setReminders((prev) => ({
      ...prev,
      [contestKey]: !prev[contestKey],
    }));
  };

  // Recharts BarChart Mock Data (Weekly Aptitude)
  const aptitudeData = [
    { name: "Mon", score: 650 },
    { name: "Tue", score: 720 },
    { name: "Wed", score: 850 },
    { name: "Thu", score: 780 },
    { name: "Fri", score: 900 },
    { name: "Sat", score: 950 },
    { name: "Sun", score: 850 },
  ];

  // Sidebar navigation items
  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, active: true, path: "/dashboard" },
    { name: "Aptitude Practice", icon: Brain, active: false, path: "/aptitude-practice" },
    { name: "Resume Analyzer", icon: FileSearch, active: false, path: "/resume-analyzer" },
    { name: "Mock Interview", icon: MessageSquareCode, active: false, path: "/mock-interview" },
    { name: "Coding Tracker", icon: Code2, active: false, path: "/coding-tracker" },
    { name: "Interview Experiences", icon: BookOpen, active: false, path: "/interview-experiences" },
    { name: "Career Analytics", icon: LineChart, active: false, path: "/career-analytics" },
    { name: "Settings", icon: SettingsIcon, active: false, path: "/settings" },
  ];

  // Contest Mock Data
  const contests = [
    {
      key: "leetcode",
      name: "LeetCode Weekly Contest",
      date: "June 14, 2026",
      time: "08:00 AM",
    },
    {
      key: "codeforces",
      name: "Codeforces Round #1024",
      date: "June 16, 2026",
      time: "07:35 PM",
    },
    {
      key: "codechef",
      name: "CodeChef Starters #150",
      date: "June 17, 2026",
      time: "08:00 PM",
    },
  ];

  // Company experiences data
  const experiences = [
    {
      company: "Google",
      role: "Software Engineer Intern",
      difficulty: "Hard",
      rounds: 4,
      color: "from-blue-500 to-green-500",
    },
    {
      company: "Amazon",
      role: "Systems Engineer Graduate",
      difficulty: "Medium",
      rounds: 3,
      color: "from-yellow-500 to-orange-500",
    },
    {
      company: "Microsoft",
      role: "Associate Software Engineer",
      difficulty: "Medium-Hard",
      rounds: 4,
      color: "from-blue-600 to-cyan-500",
    },
    {
      company: "Goldman Sachs",
      role: "Analyst (Tech Division)",
      difficulty: "Hard",
      rounds: 3,
      color: "from-yellow-600 to-yellow-400",
    },
  ];

  // Activities log data
  const activities = [
    {
      desc: "Resume Uploaded & ATS Scanned",
      time: "2 hours ago",
      icon: FileSearch,
      color: "text-blue-400 bg-blue-500/10",
    },
    {
      desc: "Mock Technical Interview Completed",
      time: "1 day ago",
      icon: MessageSquareCode,
      color: "text-purple-400 bg-purple-500/10",
    },
    {
      desc: "LeetCode Weekly Contest Reminder Set",
      time: "2 days ago",
      icon: Calendar,
      color: "text-emerald-400 bg-emerald-500/10",
    },
    {
      desc: "Aptitude Practice Set 4 Completed",
      time: "3 days ago",
      icon: Brain,
      color: "text-pink-400 bg-pink-500/10",
    },
    {
      desc: "Global Coding Rank Improved to #1240",
      time: "4 days ago",
      icon: Award,
      color: "text-cyan-400 bg-cyan-500/10",
    },
  ];

  // Motion framer variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
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
              <svg
                className="w-4 h-4 text-indigo-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                  fill="currentColor"
                  className="text-indigo-500 animate-pulse"
                />
                <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41M19.07 19.07l-1.41-1.41M6.34 6.34l-1.41-1.41" />
              </svg>
            </div>
            <span className="text-base font-extrabold tracking-tight text-white font-inter">
              PrepSphere{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                AI
              </span>
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
                <item.icon
                  className={`w-4 h-4 ${item.active ? "text-indigo-400" : "text-slate-500"}`}
                />
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
                        <svg
                          className="w-3.5 h-3.5 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="3" fill="currentColor" />
                          <path d="M12 2v2M12 20v2M4 12H2M22 12h-2" />
                        </svg>
                      </div>
                      <span className="text-base font-bold text-white">
                        PrepSphere AI
                      </span>
                    </div>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                    >
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
            {/* Search and Mobile Menu toggle */}
            <div className="flex items-center space-x-4 flex-1 max-w-lg">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 lg:hidden focus:outline-none shrink-0"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Search Box */}
              <div className="relative w-full group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search resources, contests, experiences..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-300 placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Profile Avatar / Info */}
            <div className="flex items-center space-x-6 shrink-0 pl-4">
              <button className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500" />
              </button>

              {/* User Avatar details */}
              <div className="flex items-center space-x-3 border-l border-white/5 pl-6">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-white">
                    Welcome Back, {user?.name?.split(" ")[0] || "User"}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 max-w-[150px] truncate">
                    {user?.college || "PrepSphere College"}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-[1px] shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                  <div className="w-full h-full rounded-xl bg-[#080E24] flex items-center justify-center text-indigo-400 text-sm font-bold">
                    {user?.name ? (
                      user.name.charAt(0).toUpperCase()
                    ) : (
                      <UserIcon className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* MAIN PAGE BODY */}
          <main className="flex-1 p-6 space-y-8 max-w-7xl mx-auto w-full">
            {/* HERO HERO SECTION */}
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative rounded-3xl border border-white/10 bg-slate-950/20 backdrop-blur-xl p-6 sm:p-8 overflow-hidden group text-left"
            >
              {/* Top border glowing highlight */}
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />

              <div className="relative z-10 max-w-2xl space-y-4">
                <div className="inline-flex items-center space-x-1.5 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-xs text-indigo-400 font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  <span>PrepSphere Personal Analytics Console</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Kickstart Your Placement Journey,{" "}
                  {user?.name || "PrepSphere User"}
                </h1>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Success is where preparation meets opportunity. Master your
                  coding velocity, analyze resumes, and prepare for interviews
                  using tailored AI modules.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white text-sm font-medium cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                    <Play className="w-3.5 h-3.5" />
                    Start Daily Quiz
                  </button>
                  <button 
                    onClick={() => navigate("/resume-analyzer")}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] hover:border-white/15 text-white text-sm font-medium cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <FileSearch className="w-3.5 h-3.5 text-indigo-400" />
                    Analyze Resume
                  </button>
                </div>
              </div>
            </motion.section>

            {/* PERFORMANCE OVERVIEW STATS CARDS */}
            <motion.section
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {/* Card 1: Aptitude Score */}
              <motion.div
                variants={itemVariants}
                className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 text-left relative overflow-hidden group hover:border-indigo-500/25 transition-all duration-300"
              >
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                <div className="flex justify-between items-start">
                  <span className="text-lg font-semibold text-slate-300">
                    Aptitude Score
                  </span>
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <Brain className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline space-x-1.5">
                  <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                    850
                  </span>
                  <span className="text-sm text-slate-400">/ 1000</span>
                </div>
                <div className="mt-2 text-sm text-emerald-400 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>+12% vs last week</span>
                </div>
              </motion.div>

              {/* Card 2: Resume ATS Score */}
              <motion.div
                variants={itemVariants}
                className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 text-left relative overflow-hidden group hover:border-purple-500/25 transition-all duration-300"
              >
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
                <div className="flex justify-between items-start">
                  <span className="text-lg font-semibold text-slate-300">
                    Resume ATS Score
                  </span>
                  <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                    <FileSearch className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline space-x-1.5">
                  <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                    {resumeSummary.loading ? "..." : (resumeSummary.hasResume ? `${resumeSummary.atsScore}%` : "--")}
                  </span>
                </div>
                <div className="mt-2 text-sm text-slate-400 font-medium flex items-center gap-1">
                  <span>
                    {resumeSummary.loading 
                      ? "Loading details..." 
                      : (resumeSummary.hasResume 
                          ? `Target: 85% Match (${resumeSummary.atsLabel})` 
                          : "No Resume Analysis Yet")}
                  </span>
                </div>
              </motion.div>

              {/* Card 3: Global Coding Rank */}
              <motion.div
                variants={itemVariants}
                className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 text-left relative overflow-hidden group hover:border-cyan-500/25 transition-all duration-300"
              >
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                <div className="flex justify-between items-start">
                  <span className="text-lg font-semibold text-slate-300">
                    Global Coding Rank
                  </span>
                  <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                    <Code2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline space-x-1.5">
                  <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
                    #1240
                  </span>
                </div>
                <div className="mt-2 text-sm text-indigo-400 font-semibold flex items-center gap-1">
                  <span>Worldwide leaderboard</span>
                </div>
              </motion.div>

              {/* Card 4: Daily Streak */}
              <motion.div
                variants={itemVariants}
                className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 text-left relative overflow-hidden group hover:border-pink-500/25 transition-all duration-300"
              >
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
                <div className="flex justify-between items-start">
                  <span className="text-lg font-semibold text-slate-300">
                    Daily Streak
                  </span>
                  <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400">
                    <Flame className="w-4 h-4 animate-pulse" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline space-x-1.5">
                  <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    12 Days
                  </span>
                </div>
                <div className="mt-2 text-sm text-slate-400 font-medium flex items-center gap-1">
                  <span>Record: 24 days max</span>
                </div>
              </motion.div>
            </motion.section>

            {/* ANALYTICS CONTAINER ROW */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Chart 1: Weekly Aptitude Performance (7 columns) */}
              <div className="lg:col-span-7 bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left flex flex-col justify-between h-[380px] shadow-lg">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Performance Analysis
                    </span>
                    <h3 className="text-lg font-semibold text-white">
                      Weekly Aptitude Performance
                    </h3>
                  </div>
                  <span className="text-xs text-indigo-400 font-bold bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-lg">
                    APTITUDE SCORES
                  </span>
                </div>

                <div className="flex-1 w-full relative">
                  <ResponsiveContainer width="100%" height="95%">
                    <BarChart
                      data={aptitudeData}
                      margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                    >
                      <XAxis
                        dataKey="name"
                        stroke="#64748b"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#64748b"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          fontSize: "13px",
                          background: "#080E24",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "12px",
                        }}
                        labelStyle={{
                          color: "#ffffff",
                        }}
                        itemStyle={{
                          color: "#ffffff",
                        }}
                        cursor={{ fill: "rgba(255, 255, 255, 0.015)" }}
                      />
                      <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                        {aptitudeData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              index === 4 || index === 5
                                ? "url(#active-bar)"
                                : "url(#default-bar)"
                            }
                          />
                        ))}
                      </Bar>
                      <defs>
                        <linearGradient
                          id="default-bar"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#4f46e5"
                            stopOpacity="0.8"
                          />
                          <stop
                            offset="100%"
                            stopColor="#6366f1"
                            stopOpacity="0.2"
                          />
                        </linearGradient>
                        <linearGradient
                          id="active-bar"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#a855f7"
                            stopOpacity="0.9"
                          />
                          <stop
                            offset="100%"
                            stopColor="#ec4899"
                            stopOpacity="0.3"
                          />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Placement Readiness Circular Gauge (5 columns) */}
              <div className="lg:col-span-5 bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left flex flex-col justify-between h-[380px] shadow-lg">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

                <div className="mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Sync Readiness Dial
                  </span>
                  <h3 className="text-lg font-semibold text-white">
                    Placement Readiness
                  </h3>
                </div>

                <div className="flex items-center justify-around gap-4 py-2">
                  {/* Gauge circle SVG */}
                  <div className="relative flex justify-center items-center w-28 h-28 shrink-0">
                    <svg className="w-28 h-28 transform -rotate-90">
                      <circle
                        cx="56"
                        cy="56"
                        r="46"
                        className="text-slate-800"
                        strokeWidth="6"
                        stroke="currentColor"
                        fill="transparent"
                      />
                      <circle
                        cx="56"
                        cy="56"
                        r="46"
                        className="text-transparent"
                        strokeWidth="6"
                        strokeDasharray={289}
                        strokeDashoffset={289 - (289 * 78) / 100}
                        strokeLinecap="round"
                        stroke="url(#readiness-gradient)"
                        fill="transparent"
                      />
                      <defs>
                        <linearGradient
                          id="readiness-gradient"
                          x1="0"
                          y1="0"
                          x2="100%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="50%" stopColor="#a855f7" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-2xl font-black text-white">
                        78%
                      </span>
                      <span className="block text-[10px] text-indigo-400 font-bold uppercase tracking-wider mt-0.5">
                        READY
                      </span>
                    </div>
                  </div>

                  {/* Readiness scores list */}
                  <div className="space-y-2.5 flex-1 max-w-[200px] text-sm">
                    <div>
                      <div className="flex justify-between text-slate-400 text-sm mb-1">
                        <span>Aptitude</span>
                        <span className="font-bold text-slate-300">80%</span>
                      </div>
                      <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[80%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 text-sm mb-1">
                        <span>DSA &amp; Logic</span>
                        <span className="font-bold text-slate-300">75%</span>
                      </div>
                      <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 w-[75%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 text-sm mb-1">
                        <span>Communication</span>
                        <span className="font-bold text-slate-300">85%</span>
                      </div>
                      <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 w-[85%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 text-sm mb-1">
                        <span>Resume Scan</span>
                        <span className="font-bold text-slate-300">72%</span>
                      </div>
                      <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-pink-500 w-[72%]" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-slate-400 font-light border-t border-white/5 pt-3">
                  Score matches top company placement benchmarks.
                </div>
              </div>
            </section>

            {/* RESUME ANALYSIS & CODING CONTESTS GRID */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Card 1: AI Resume Analysis */}
              <div className="lg:col-span-6 bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left flex flex-col justify-between shadow-lg">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <FileSearch className="w-4 h-4 text-indigo-400" />
                      AI Resume Analysis
                    </h3>
                    <span className="text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-md font-bold">
                      {resumeSummary.loading ? "..." : (resumeSummary.hasResume ? `${resumeSummary.atsScore}% ATS` : "No Analysis")}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {/* Strengths */}
                    <div>
                      <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                        Resume Strengths
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {resumeSummary.loading ? (
                          <span className="text-xs text-slate-500 italic">Loading...</span>
                        ) : resumeSummary.hasResume && resumeSummary.strengths?.length > 0 ? (
                          resumeSummary.strengths.slice(0, 3).map((strength, idx) => (
                            <span key={idx} className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold">
                              {strength}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500 italic">No strengths identified yet.</span>
                        )}
                      </div>
                    </div>

                    {/* Missing Keywords */}
                    <div>
                      <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                        Missing Keywords
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {resumeSummary.loading ? (
                          <span className="text-xs text-slate-500 italic">Loading...</span>
                        ) : resumeSummary.hasResume && resumeSummary.missingKeywords?.length > 0 ? (
                          resumeSummary.missingKeywords.slice(0, 3).map((keyword, idx) => (
                            <span key={idx} className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 px-2.5 py-0.5 rounded-full font-bold">
                              {keyword}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500 italic">No missing keywords found.</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 mt-4">
                  <button 
                    onClick={() => navigate("/resume-analyzer")}
                    className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] hover:border-white/15 text-sm font-medium text-slate-200 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-indigo-400" />
                    Upload New Resume
                  </button>
                </div>
              </div>

              {/* Card 2: Upcoming Coding Contests */}
              <div className="lg:col-span-6 bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left flex flex-col justify-between shadow-lg">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

                <div>
                  <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-cyan-400" />
                      Upcoming Coding Contests
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {contests.map((contest, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-3 rounded-xl bg-slate-950/30 border border-white/5 hover:border-white/10 transition-colors"
                      >
                        <div>
                          <h4 className="text-sm font-semibold text-white">
                            {contest.name}
                          </h4>
                          <span className="text-sm text-slate-400 font-light flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-cyan-400/75" />
                            {contest.date} | {contest.time}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleReminder(contest.key)}
                          className={`text-sm font-medium px-3 py-1.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                            reminders[contest.key]
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                              : "bg-white/[0.02] border-white/10 text-slate-400 hover:text-white hover:border-white/25"
                          }`}
                        >
                          {reminders[contest.key]
                            ? "✓ REMIND SET"
                            : "SET REMINDER"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* DAILY CHALLENGES SECTION */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Daily Challenge 1: Aptitude */}
              <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left flex flex-col justify-between shadow-lg">
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent pointer-events-none" />

                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2.5 border-b border-white/5">
                    <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      Aptitude QOTD
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Difficulty: Medium
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold text-white">
                      Question of the Day
                    </h4>
                    <p className="text-sm text-slate-300 font-light leading-relaxed">
                      A train traveling at 60 km/hr crosses a platform of length
                      250 meters in 24 seconds. Find the absolute length of the
                      train in meters.
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 mt-4">
                  <button className="w-full flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-600/10 border border-indigo-500/20 hover:border-indigo-500/40 hover:bg-indigo-500/20 text-sm font-medium text-indigo-300 rounded-xl transition-all duration-200 cursor-pointer">
                    Solve Now
                  </button>
                </div>
              </div>

              {/* Daily Challenge 2: DSA */}
              <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left flex flex-col justify-between shadow-lg">
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent pointer-events-none" />

                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2.5 border-b border-white/5">
                    <span className="text-xs font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      DSA Problem of the Day
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Difficulty: Hard
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold text-white">
                      Reverse Nodes in k-Group
                    </h4>
                    <span className="block text-xs text-slate-400 uppercase tracking-widest font-mono font-medium">
                      Linked Lists | Pointer manipulation
                    </span>
                    <p className="text-sm text-slate-300 font-light leading-relaxed">
                      Given the head of a linked list, reverse the nodes of the
                      list k at a time, and return its modified head.
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 mt-4">
                  <button className="w-full flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 border border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-500/20 text-sm font-medium text-purple-300 rounded-xl transition-all duration-200 cursor-pointer">
                    Start Coding
                  </button>
                </div>
              </div>
            </section>

            {/* MOCK INTERVIEW SECTION & WORKSPACE PREPARATION PROGRESS */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* AI Interview Coach */}
              <div className="lg:col-span-7 bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left flex flex-col justify-between shadow-lg">
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-indigo-500/5 blur-[70px] pointer-events-none" />

                <div className="space-y-5">
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <MessageSquareCode className="w-4 h-4 text-indigo-400" />
                      AI Interview Coach
                    </h3>
                    <span className="text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md font-bold">
                      Ready
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      "HR Focus",
                      "Technical",
                      "System Design",
                      "Behavioral",
                    ].map((type, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-950/30 border border-white/5 rounded-xl text-center group hover:border-indigo-500/20 transition-all duration-200 hover:scale-[1.01]"
                      >
                        <span className="block text-sm font-semibold text-slate-300 group-hover:text-white">
                          {type}
                        </span>
                        <span className="block text-sm text-slate-400 mt-1">
                          AI Guided
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.01] border border-white/5">
                    <div>
                      <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">
                        Recommended Session
                      </span>
                      <span className="text-sm text-white font-semibold">
                        Technical Interview: System Design Concepts
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">
                        Success Score
                      </span>
                      <span className="text-sm text-emerald-400 font-bold">
                        95% score target
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 mt-4">
                  <button className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white text-sm font-medium transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer">
                    <Play className="w-3.5 h-3.5" />
                    Start Mock Interview
                  </button>
                </div>
              </div>

              {/* Prep Progress & Motivational widget */}
              <div className="lg:col-span-5 bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left flex flex-col justify-between shadow-lg">
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-pink-500/30 to-transparent pointer-events-none" />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-pink-400" />
                    Preparation Progress
                  </h3>

                  <div className="space-y-3">
                    {/* Goal 1 */}
                    <div>
                      <div className="flex justify-between text-sm text-slate-400 mb-1">
                        <span>Today's Goal Completion</span>
                        <span className="font-bold text-slate-300">80%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-[80%]" />
                      </div>
                    </div>

                    {/* Goal 2 */}
                    <div>
                      <div className="flex justify-between text-sm text-slate-400 mb-1">
                        <span>Weekly Target Progress</span>
                        <span className="font-bold text-slate-300">65%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 w-[65%]" />
                      </div>
                    </div>

                    {/* Goal 3 */}
                    <div>
                      <div className="flex justify-between text-sm text-slate-400 mb-1">
                        <span>Monthly Target Progress</span>
                        <span className="font-bold text-slate-300">88%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-pink-500 to-orange-400 w-[88%]" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 p-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-center">
                  <p className="text-sm text-indigo-300 italic">
                    "Small daily improvements lead to remarkable results."
                  </p>
                </div>
              </div>
            </section>

            {/* INTERVIEW EXPERIENCES & RECENT TIMELINE */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Company Experiences */}
              <div className="lg:col-span-8 bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left flex flex-col justify-between shadow-lg">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

                <div>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                    <Briefcase className="w-4 h-4 text-indigo-400" />
                    Recent Company Experiences
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {experiences.map((exp, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-slate-950/40 border border-white/5 hover:border-white/15 rounded-2xl transition-all duration-200 flex flex-col justify-between h-[130px] relative group overflow-hidden"
                      >
                        {/* Glow left overlay */}
                        <div
                          className={`absolute top-0 bottom-0 left-0 w-[3px] bg-gradient-to-b ${exp.color}`}
                        />
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="text-sm font-semibold text-white pl-2.5">
                              {exp.company}
                            </h4>
                            <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider">
                              {exp.difficulty}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400 mt-1.5 pl-2.5">
                            {exp.role}
                          </p>
                          <span className="block text-sm text-slate-400 mt-0.5 pl-2.5">
                            {exp.rounds} technical rounds
                          </span>
                        </div>
                        <button className="flex items-center gap-0.5 text-sm font-medium text-indigo-400 group-hover:text-indigo-300 transition-colors w-fit pl-2.5 mt-2 cursor-pointer focus:outline-none">
                          Read Experience
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activity Logs */}
              <div className="lg:col-span-4 bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left flex flex-col justify-between shadow-lg">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />

                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                    <Clock className="w-4 h-4 text-pink-400" />
                    Recent Activity
                  </h3>

                  <div className="space-y-4">
                    {activities.map((act, idx) => (
                      <div
                        key={idx}
                        className="flex items-start space-x-3 text-[14px]"
                      >
                        <div
                          className={`p-1.5 rounded-lg shrink-0 ${act.color}`}
                        >
                          <act.icon className="w-4.5 h-4.5" />
                        </div>
                        <div className="space-y-0.5">
                          <p className=" text-slate-300 font-medium leading-snug">
                            {act.desc}
                          </p>
                          <span className="block text-[12px] text-slate-400 font-light">
                            {act.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* QUICK ACTIONS GRID */}
            <section className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left shadow-lg">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                Quick Actions
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {[
                  {
                    name: "Analyze Resume",
                    icon: FileSearch,
                    color: "hover:border-blue-500/30",
                  },
                  {
                    name: "Start Interview",
                    icon: MessageSquareCode,
                    color: "hover:border-purple-500/30",
                  },
                  {
                    name: "Practice Aptitude",
                    icon: Brain,
                    color: "hover:border-pink-500/30",
                  },
                  {
                    name: "Solve DSA Problem",
                    icon: Code2,
                    color: "hover:border-cyan-500/30",
                  },
                  {
                    name: "Track Coding Progress",
                    icon: LineChart,
                    color: "hover:border-emerald-500/30",
                  },
                ].map((act, idx) => (
                  <button
                    key={idx}
                    className={`p-4 bg-slate-950/30 border border-white/5 rounded-2xl flex flex-col items-center text-center space-y-3 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${act.color}`}
                  >
                    <div className="p-2.5 rounded-xl bg-white/5 text-indigo-400">
                      <act.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[13px] font-bold text-slate-300">
                      {act.name}
                    </span>
                  </button>
                ))}
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
                    <h3 className="text-lg font-bold text-white">
                      Confirm Sign Out
                    </h3>
                    <p className="text-sm text-slate-400 font-light mt-1.5 leading-relaxed">
                      Are you sure you want to log out of PrepSphere AI? You
                      will need to sign in again to access your preparation
                      dashboard.
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6 justify-end">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] text-slate-300 hover:text-white text-xs font-semibold transition-all duration-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all duration-200 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.25)] hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
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

export default Dashboard;
