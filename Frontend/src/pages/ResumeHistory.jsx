import React, { useState, useEffect } from "react";
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
  Trash2,
  Download,
  FileText,
  Clock,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  AlertCircle,
  ExternalLink,
  Loader2
} from "lucide-react";

const ResumeHistory = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // States
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search, Filters & Sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Deletion Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/resume/history");
      if (response.data && response.data.success) {
        setHistoryList(response.data.history || []);
      } else {
        throw new Error(response.data?.message || "Failed to load history list.");
      }
    } catch (err) {
      console.error("Error loading resume history list:", err);
      setError(err.response?.data?.message || err.message || "An error occurred while loading history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // View Report Click Handler (GET /api/resume/:id)
  const handleViewReport = async (id) => {
    try {
      const response = await api.get(`/resume/${id}`);
      if (response.data && response.data.success) {
        // Navigate back to analyzer, passing the complete loaded resume and analysis in state
        navigate("/resume-analyzer", {
          state: {
            historyItem: response.data.analysis,
            resume: response.data.resume
          }
        });
      } else {
        throw new Error(response.data?.message || "Failed to fetch report details");
      }
    } catch (err) {
      console.error("Error loading report detail:", err);
      alert(err.response?.data?.message || err.message || "Unable to load the selected report.");
    }
  };

  // Open Resume Click Handler (Cloudinary secure_url)
  const handleOpenResume = (resumeUrl) => {
    if (!resumeUrl) {
      alert("Resume URL not found.");
      return;
    }
    let isValid = false;
    try {
      new URL(resumeUrl);
      isValid = true;
    } catch (e) {
      isValid = false;
    }
    if (!isValid) {
      alert("Resume URL is invalid.");
      return;
    }
    window.open(resumeUrl, "_blank", "noopener,noreferrer");
  };

  // Download Resume Click Handler (Cloudinary URL)
  const handleDownloadResume = (resumeUrl, resumeName) => {
    if (!resumeUrl) {
      alert("Unable to download the resume.");
      return;
    }
    let isValid = false;
    try {
      new URL(resumeUrl);
      isValid = true;
    } catch (e) {
      isValid = false;
    }
    if (!isValid) {
      alert("Resume URL is invalid.");
      return;
    }

    try {
      const link = document.createElement("a");
      link.href = resumeUrl;
      link.download = resumeName || "resume.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Unable to download the resume.");
    }
  };

  // Download PDF Report Click Handler (Dynamic compilation)
  const handleDownloadPDFReport = async (id) => {
    try {
      const response = await api.get(`/resume/${id}`);
      if (!response.data || !response.data.success) {
        throw new Error("Failed to fetch report details");
      }
      
      const { resume, analysis } = response.data;
      
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Pop-up blocker is enabled. Please allow pop-ups to download the PDF report.");
        return;
      }
      
      const formattedDate = new Date(resume.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      });
      
      const atsScore = analysis.atsAnalysis?.score || analysis.atsScore || 0;
      const atsLabel = analysis.atsAnalysis?.label || analysis.atsScoreLabel || 'N/A';
      
      const sectionsHtml = (analysis.sectionAnalysis || []).map(sec => `
        <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e2e8f0;">
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; color: #1e293b;">
            <span>${sec.section}</span>
            <span style="color: #6366f1;">${sec.score}% (${sec.status})</span>
          </div>
          <p style="margin: 5px 0 0 0; font-size: 12px; color: #64748b; line-height: 1.5;">${sec.suggestions}</p>
        </div>
      `).join("");
      
      const suggestionsHtml = (analysis.improvementSuggestions || []).map(sug => `
        <div style="margin-bottom: 12px; padding: 10px; border-left: 3px solid #f59e0b; background-color: #fef3c7;">
          <div style="font-weight: bold; font-size: 13px; color: #92400e;">
            ${sug.title} <span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: #fef08a; margin-left: 8px;">${sug.priority}</span>
          </div>
          <p style="margin: 4px 0 0 0; font-size: 11px; color: #78350f; line-height: 1.4;">${sug.description}</p>
        </div>
      `).join("");
      
      const missingKeywordsHtml = (analysis.missingKeywords || []).map(kw => `
        <span style="display: inline-block; padding: 4px 10px; background: #f1f5f9; border-radius: 20px; font-size: 11px; font-weight: 500; color: #475569; margin: 3px;">
          ${kw}
        </span>
      `).join("");

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${resume.resumeName} - PrepSphere AI Report</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; background: white; }
              .no-print { display: none; }
            }
            body {
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              color: #1e293b;
              line-height: 1.5;
            }
            .header {
              border-bottom: 2px solid #6366f1;
              padding-bottom: 20px;
              margin-bottom: 30px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .title { font-size: 28px; font-weight: 800; color: #1e293b; margin: 0; }
            .subtitle { font-size: 14px; color: #64748b; margin-top: 5px; }
            .score-badge {
              background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
              color: white;
              padding: 15px 25px;
              border-radius: 16px;
              text-align: center;
            }
            .score-val { font-size: 32px; font-weight: 800; line-height: 1; }
            .score-lbl { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-top: 5px; }
            .section-title { font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 30px; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
            .grid-2 { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; }
            .card { background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 15px; }
            .card-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 6px; letter-spacing: 0.5px; }
            .card-text { font-size: 13px; color: #334155; line-height: 1.5; }
            .footer { border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; }
            .btn-print {
              position: fixed;
              bottom: 20px;
              right: 20px;
              padding: 10px 20px;
              background: #6366f1;
              color: white;
              border: none;
              border-radius: 8px;
              font-weight: bold;
              cursor: pointer;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
          </style>
        </head>
        <body>
          <button class="btn-print no-print" onclick="window.print()">Print Report</button>
          
          <div class="header">
            <div>
              <h1 class="title">PrepSphere <span style="color: #6366f1;">AI</span></h1>
              <p class="subtitle">Official Resume Analysis Report</p>
            </div>
            <div class="score-badge">
              <div class="score-val">${atsScore}%</div>
              <div class="score-lbl">ATS SCORE: ${atsLabel}</div>
            </div>
          </div>

          <div style="font-size: 13px; color: #64748b; margin-bottom: 30px;">
            <strong>Resume Name:</strong> ${resume.resumeName}<br/>
            <strong>Generated On:</strong> ${formattedDate}
          </div>

          <div class="section-title">Diagnostics &amp; Insights</div>
          <div class="grid-2">
            <div class="card">
              <div class="card-title">Diagnostics Overview</div>
              <div class="card-text">${analysis.diagnostics?.description || 'No diagnostic review summary.'}</div>
            </div>
            <div class="card" style="display: flex; flex-direction: column; justify-content: space-around;">
              <div>
                <strong style="font-size: 13px;">Skills Match Score:</strong>
                <span style="font-size: 13px; font-weight: bold; color: #6366f1; margin-left: 10px;">${analysis.diagnostics?.skillsMatch || 0}%</span>
              </div>
              <div style="margin-top: 10px;">
                <strong style="font-size: 13px;">Formatting Score:</strong>
                <span style="font-size: 13px; font-weight: bold; color: #a855f7; margin-left: 10px;">${analysis.diagnostics?.formatting || 0}%</span>
              </div>
              <div style="margin-top: 10px;">
                <strong style="font-size: 13px;">Placement Readiness:</strong>
                <span style="font-size: 13px; font-weight: bold; color: #10b981; margin-left: 10px;">${analysis.placementReadinessStr || 'Advanced'}</span>
              </div>
            </div>
          </div>

          <div class="section-title">Recruiter Perspective Report</div>
          <div class="card" style="margin-bottom: 15px;">
            <div class="card-title">Recruiter View</div>
            <div class="card-text">${analysis.overallFeedback?.recruiterPerspective || analysis.overallReport?.recruiterPerspective || 'No feedback.'}</div>
          </div>
          <div class="grid-2">
            <div class="card">
              <div class="card-title">Key Strengths</div>
              <div class="card-text">${analysis.overallFeedback?.strengths || analysis.overallReport?.strengths || 'No strengths identified.'}</div>
            </div>
            <div class="card">
              <div class="card-title">Key Weaknesses</div>
              <div class="card-text">${analysis.overallFeedback?.weaknesses || analysis.overallReport?.weaknesses || 'No weaknesses identified.'}</div>
            </div>
          </div>

          <div class="section-title">Missing Keywords</div>
          <div style="margin-bottom: 25px;">
            ${missingKeywordsHtml || '<span style="font-size: 12px; color: #94a3b8;">No missing keywords. Your resume matches typical industry terms perfectly!</span>'}
          </div>

          <div class="section-title">Improvement Suggestions</div>
          <div>
            ${suggestionsHtml || '<p style="font-size: 12px; color: #94a3b8;">No immediate improvements suggested.</p>'}
          </div>

          <div class="section-title">Section-by-Section Diagnostic Scores</div>
          <div>
            ${sectionsHtml}
          </div>

          <div class="footer">
            Generated by PrepSphere AI • Official Placement Preparation Diagnostics
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    } catch (error) {
      console.error("Failed to generate PDF report:", error);
      alert("Unable to generate PDF report.");
    }
  };

  // Delete Action Click Handler
  const handleDeleteResume = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const response = await api.delete(`/resume/${deleteTarget}`);
      if (response.data && response.data.success) {
        setHistoryList(prev => prev.filter(item => item.id !== deleteTarget));
        setDeleteTarget(null);
      } else {
        throw new Error(response.data?.message || "Failed to delete analysis record.");
      }
    } catch (err) {
      console.error("Error deleting resume analysis:", err);
      alert(err.response?.data?.message || err.message || "An error occurred while deleting the record.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Search filter
  const filteredHistory = historyList.filter(item => {
    const nameMatch = item.resumeName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedStatus === "All") return nameMatch;
    return nameMatch && item.analysisStatus?.toLowerCase() === selectedStatus.toLowerCase();
  });

  // Sorting logic
  const sortedHistory = [...filteredHistory].sort((a, b) => {
    if (sortBy === "Newest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (sortBy === "Oldest") {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    if (sortBy === "Highest ATS") {
      return b.atsScore - a.atsScore;
    }
    if (sortBy === "Lowest ATS") {
      return a.atsScore - b.atsScore;
    }
    return 0;
  });

  // Pagination bounds
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedHistory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedHistory.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
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

        {/* Glow Effects */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-[130px] pointer-events-none" />

        {/* SIDEBAR - DESKTOP */}
        <aside className="fixed left-0 top-0 h-screen w-[280px] hidden lg:flex flex-col bg-slate-950/40 border-r border-white/5 backdrop-blur-xl z-20 overflow-hidden">
          {/* Logo */}
          <div className="p-6 flex items-center space-x-3 border-b border-white/5">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-slate-950/80 border border-white/10 overflow-hidden shadow-[0_0_15px_rgba(99, 102, 241, 0.25)]">
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
            <div className="flex items-center space-x-4 flex-1 max-w-lg">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 lg:hidden focus:outline-none shrink-0"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div className="relative w-full group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search historical analyses..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-950/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-300 placeholder:text-slate-600"
                />
              </div>
            </div>

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
            {/* PAGE HEADER */}
            <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6 text-left">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
                  <Clock className="w-8 h-8 text-indigo-400" />
                  Resume Analysis History
                </h1>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Access and manage all your previous AI resume analyses.
                </p>
              </div>

              <button
                onClick={() => navigate("/resume-analyzer")}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-sm font-medium text-slate-300 hover:text-white transition-all cursor-pointer select-none"
              >
                Back to Analyzer
              </button>
            </section>

            {/* FILTER & SORT CONTROLS */}
            <section className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              {/* Filter Badges */}
              <div className="flex flex-wrap gap-2 justify-start w-full sm:w-auto">
                {["All", "Completed", "Pending", "Failed"].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setSelectedStatus(status);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer focus:outline-none ${
                      selectedStatus === status
                        ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                        : "bg-white/[0.02] border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <span className="text-xs text-slate-500 font-medium">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-slate-950/80 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500/60 font-semibold cursor-pointer"
                >
                  <option value="Newest">Newest First</option>
                  <option value="Oldest">Oldest First</option>
                  <option value="Highest ATS">Highest ATS</option>
                  <option value="Lowest ATS">Lowest ATS</option>
                </select>
              </div>
            </section>

            {/* LOADING SKELETON STATE */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 relative overflow-hidden animate-pulse h-[200px] flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="h-4 bg-white/5 rounded w-3/4" />
                      <div className="h-3 bg-white/5 rounded w-1/2" />
                    </div>
                    <div className="flex justify-between items-center mt-6">
                      <div className="h-6 bg-white/5 rounded w-16" />
                      <div className="h-6 bg-white/5 rounded w-24" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ERROR RETRY STATE */}
            {!loading && error && (
              <div className="flex flex-col items-center justify-center p-12 bg-white/[0.02] border border-white/10 rounded-3xl backdrop-blur-xl max-w-md mx-auto space-y-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <h3 className="text-lg font-bold text-white">Failed to Load History</h3>
                <p className="text-sm text-slate-400 text-center leading-relaxed font-light">{error}</p>
                <button
                  onClick={fetchHistory}
                  className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-all cursor-pointer shadow-lg shadow-indigo-500/25"
                >
                  Retry Load
                </button>
              </div>
            )}

            {/* EMPTY STATE */}
            {!loading && !error && sortedHistory.length === 0 && (
              <div className="flex flex-col items-center justify-center p-16 bg-white/[0.02] border border-white/10 rounded-3xl backdrop-blur-xl text-center max-w-lg mx-auto space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <FileText className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-semibold text-white">No Resume Analyses Yet</h3>
                  <p className="text-sm text-slate-400 leading-relaxed font-light max-w-xs mx-auto">
                    Upload your first resume to trigger structural checks, missing keyword scans, and career reports.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/resume-analyzer")}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white text-sm font-semibold transition-all cursor-pointer shadow-lg shadow-indigo-500/25"
                >
                  Analyze First Resume
                </button>
              </div>
            )}

            {/* LISTING CARDS SECTION */}
            {!loading && !error && sortedHistory.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 flex flex-col justify-between shadow-lg text-left relative overflow-hidden group hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_25px_rgba(99,102,241,0.05)]"
                    >
                      {/* Ambient Glow */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/0 via-indigo-500/0 to-indigo-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                      <div className="space-y-3 relative z-10">
                        {/* Title and Date */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <FileText className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-white truncate max-w-[180px] sm:max-w-[200px]" title={item.resumeName}>
                                {item.resumeName}
                              </h4>
                              <span className="text-[11px] text-slate-500 font-light font-mono block mt-0.5">
                                {new Date(item.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric"
                                })}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${
                              item.atsScore >= 80
                                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                                : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                            }`}
                          >
                            {item.atsScore >= 80 ? "Analyzed" : "Improve"}
                          </span>
                        </div>

                        {/* Scores */}
                        <div className="flex gap-4 pt-2">
                          <div>
                            <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">ATS Score</span>
                            <span className="text-base font-extrabold text-white font-mono">{item.atsScore}%</span>
                          </div>
                          <div className="border-l border-white/5 pl-4">
                            <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">Overall Rating</span>
                            <span className="text-base font-extrabold text-indigo-400 font-mono">
                              {typeof item.overallRating === "number" ? `${item.overallRating.toFixed(1)}/5` : item.overallRating}
                            </span>
                          </div>
                          <div className="border-l border-white/5 pl-4">
                            <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">Size</span>
                            <span className="text-xs font-semibold text-slate-400 block mt-1">
                              {item.fileSize ? `${(item.fileSize / 1024).toFixed(1)} KB` : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="flex flex-col gap-2 pt-4 border-t border-white/5 mt-4 relative z-10">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewReport(item.id)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-indigo-500/15"
                          >
                            View Report
                          </button>
                          <button
                            onClick={() => handleOpenResume(item.resumeUrl)}
                            className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all cursor-pointer"
                            title="Open Resume"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <button
                            onClick={() => handleDownloadResume(item.resumeUrl, item.resumeName)}
                            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white font-semibold transition-colors cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5 text-indigo-400" />
                            Download Original
                          </button>
                          <button
                            onClick={() => handleDownloadPDFReport(item.id)}
                            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold transition-colors cursor-pointer"
                          >
                            PDF Report
                          </button>
                          <button
                            onClick={() => setDeleteTarget(item.id)}
                            className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer focus:outline-none"
                            title="Delete Analysis"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* PAGINATION CONTROLS */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-8">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] disabled:opacity-40 disabled:hover:bg-white/[0.02] text-slate-300 hover:text-white transition-all cursor-pointer focus:outline-none"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-slate-400 font-medium">
                      Page <strong className="text-white font-semibold">{currentPage}</strong> of <strong className="text-white font-semibold">{totalPages}</strong>
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] disabled:opacity-40 disabled:hover:bg-white/[0.02] text-slate-300 hover:text-white transition-all cursor-pointer focus:outline-none"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>

        {/* DELETE CONFIRMATION MODAL */}
        <AnimatePresence>
          {deleteTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDeleteTarget(null)}
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
              />

              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className="relative w-full max-w-md bg-[#080E24]/90 border border-white/10 rounded-2xl p-6 shadow-[0_0_50px_rgba(99,102,241,0.15)] backdrop-blur-xl overflow-hidden text-left"
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent pointer-events-none" />
                
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 shrink-0">
                    <Trash2 className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Delete Resume Analysis?</h3>
                    <p className="text-sm text-slate-400 font-light mt-1.5 leading-relaxed">
                      Are you sure you want to permanently delete this resume analysis? This action will remove the database record and delete the resume file from storage. This cannot be undone.
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6 justify-end">
                  <button
                    disabled={isDeleting}
                    onClick={() => setDeleteTarget(null)}
                    className="px-5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] text-slate-300 hover:text-white text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isDeleting}
                    onClick={handleDeleteResume}
                    className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-all duration-200 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.25)] hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center gap-1.5"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* LOGOUT CONFIRMATION MODAL */}
        <AnimatePresence>
          {showLogoutModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowLogoutModal(false)}
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
              />

              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className="relative w-full max-w-md bg-[#080E24]/90 border border-white/10 rounded-2xl p-6 shadow-[0_0_50px_rgba(99,102,241,0.15)] backdrop-blur-xl overflow-hidden text-left"
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent pointer-events-none" />

                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 shrink-0">
                    <LogOut className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Confirm Sign Out</h3>
                    <p className="text-sm text-slate-400 font-light mt-1.5 leading-relaxed">
                      Are you sure you want to log out of PrepSphere AI? You will need to sign in again to access your dashboard.
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

export default ResumeHistory;
