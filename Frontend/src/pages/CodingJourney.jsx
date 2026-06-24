import React, { useState, useEffect, useRef, useMemo } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2,
  LineChart,
  Play,
  CheckCircle2,
  ArrowLeft,
  ChevronDown,
  Info,
  X,
  Loader2,
  Sparkles
} from "lucide-react";
import {
  generateQuestion as generateQuestionService,
  submitCode as submitCodeService,
  getSubmissions as getSubmissionsService,
  getHistory,
  toggleBookmark,
  getAnalytics,
  getQuestionDetails
} from "../services/codingJourneyService";
import CodeEditor from "../components/coding/CodeEditor";
// ReCharts removed from parent page as they are moved to child subcomponents
import Sidebar from "../components/layout/Sidebar";
import TopNavbar from "../components/layout/TopNavbar";
import HistoryTab from "../components/coding/HistoryTab";
import AnalyticsTab from "../components/coding/AnalyticsTab";
import DetailedReportDrawer from "../components/coding/DetailedReportDrawer";




const CodingJourney = () => {
  // Responsive state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Active tab state
  const [activeTab, setActiveTab] = useState("practice"); // "practice" | "history" | "analytics"

  // Question Generator states
  const [companyInput, setCompanyInput] = useState("");
  const [showCompanySuggestions, setShowCompanySuggestions] = useState(false);
  const companyDropdownRef = useRef(null);

  const [roleInput, setRoleInput] = useState("");
  const [showRoleSuggestions, setShowRoleSuggestions] = useState(false);
  const roleDropdownRef = useRef(null);

  const [difficulty, setDifficulty] = useState("Easy");
  const [topic, setTopic] = useState("Arrays");
  const [language, setLanguage] = useState("C++");
  const [ctcInput, setCtcInput] = useState("");
  const [ctcError, setCtcError] = useState("");

  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [generatedQuestion, setGeneratedQuestion] = useState(null);
  const [errorQuestion, setErrorQuestion] = useState(null);
  const [hintsExpanded, setHintsExpanded] = useState(false);
  const [visibleHintsCount, setVisibleHintsCount] = useState(0);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const showToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  // Workspace states
  const [codeValue, setCodeValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [customTestCases, setCustomTestCases] = useState([{ id: "1", input: "" }]);
  const [optimalSolutionExpanded, setOptimalSolutionExpanded] = useState(false);

  // Submissions history states
  const [submissionsHistory, setSubmissionsHistory] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [expandedSubmissionId, setExpandedSubmissionId] = useState(null);

  // History Tab States
  const [historyQuestions, setHistoryQuestions] = useState([]);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyTotalResults, setHistoryTotalResults] = useState(0);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historySearch, setHistorySearch] = useState("");
  const [historyCompany, setHistoryCompany] = useState("all");
  const [historyTopic, setHistoryTopic] = useState("all");
  const [historyDifficulty, setHistoryDifficulty] = useState("all");
  const [historyStatus, setHistoryStatus] = useState("all");
  const [historyLanguage, setHistoryLanguage] = useState("all");
  const [historyStartDate, setHistoryStartDate] = useState("");
  const [historyEndDate, setHistoryEndDate] = useState("");
  const [historyBookmarkedOnly, setHistoryBookmarkedOnly] = useState(false);

  // Drawer States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerQuestionId, setDrawerQuestionId] = useState(null);
  const [drawerDetails, setDrawerDetails] = useState(null);
  const [loadingDrawerDetails, setLoadingDrawerDetails] = useState(false);
  const [drawerActiveTab, setDrawerActiveTab] = useState("question"); // "question", "latest", "history", "score", "feedback", "best"

  // Analytics Tab States
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Fetch history data
  const fetchHistoryData = async (pageToFetch = historyPage) => {
    setLoadingHistory(true);
    try {
      const params = {
        page: pageToFetch,
        limit: 6,
        search: historySearch,
        company: historyCompany === "all" ? "" : historyCompany,
        topic: historyTopic === "all" ? "" : historyTopic,
        difficulty: historyDifficulty === "all" ? "" : historyDifficulty,
        status: historyStatus === "all" ? "" : historyStatus,
        language: historyLanguage === "all" ? "" : historyLanguage,
        startDate: historyStartDate,
        endDate: historyEndDate,
        bookmarked: historyBookmarkedOnly ? "true" : "all"
      };
      const response = await getHistory(params);
      if (response.success) {
        setHistoryQuestions(response.questions || []);
        setHistoryTotalPages(response.totalPages || 1);
        setHistoryTotalResults(response.totalResults || 0);
      }
    } catch (err) {
      console.error("Failed to fetch question history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    setLoadingAnalytics(true);
    try {
      const response = await getAnalytics();
      if (response.success) {
        setAnalyticsData(response);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Toggle bookmark on history question card
  const handleToggleBookmark = async (qId) => {
    try {
      const response = await toggleBookmark(qId);
      if (response.success) {
        showToast(response.message, "success");
        // Update local state if the drawer is active on the same question
        if (drawerQuestionId === qId && drawerDetails) {
          setDrawerDetails(prev => ({
            ...prev,
            question: {
              ...prev.question,
              isBookmarked: response.isBookmarked
            }
          }));
        }
        // Refresh question list
        fetchHistoryData(historyPage);
        // If active question in practice workspace is the bookmarked one, update its bookmark status
        if (generatedQuestion && generatedQuestion._id === qId) {
          setGeneratedQuestion(prev => ({
            ...prev,
            isBookmarked: response.isBookmarked
          }));
        }
      }
    } catch (err) {
      console.error("Failed to toggle bookmark:", err);
      showToast("Error updating bookmark.", "error");
    }
  };

  // Open detailed report drawer
  const handleOpenDrawer = async (qId) => {
    setDrawerQuestionId(qId);
    setIsDrawerOpen(true);
    setDrawerActiveTab("question");
    setLoadingDrawerDetails(true);
    try {
      const response = await getQuestionDetails(qId);
      if (response.success) {
        setDrawerDetails(response);
      }
    } catch (err) {
      console.error("Failed to load question details:", err);
      showToast("Failed to load question details.", "error");
    } finally {
      setLoadingDrawerDetails(false);
    }
  };

  // Fetch history data when tab or page changes
  useEffect(() => {
    if (activeTab === "history") {
      fetchHistoryData(historyPage);
    }
  }, [activeTab, historyPage]);

  // Reset pagination page to 1 when any filter changes
  useEffect(() => {
    if (activeTab !== "history") return;
    if (historyPage !== 1) {
      setHistoryPage(1);
    } else {
      fetchHistoryData(1);
    }
  }, [
    historySearch,
    historyCompany,
    historyTopic,
    historyDifficulty,
    historyStatus,
    historyLanguage,
    historyStartDate,
    historyEndDate,
    historyBookmarkedOnly
  ]);

  useEffect(() => {
    if (activeTab === "analytics") {
      fetchAnalyticsData();
    }
  }, [activeTab]);

  // Fetch previous attempts for the active question
  const fetchSubmissionsHistory = async (questionId) => {
    if (!questionId) return;
    setLoadingSubmissions(true);
    try {
      const response = await getSubmissionsService(questionId);
      if (response.success && response.data) {
        setSubmissionsHistory(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch submissions history:", err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    if (generatedQuestion?._id) {
      fetchSubmissionsHistory(generatedQuestion._id);
      setEvaluationResult(null);
    }
  }, [generatedQuestion]);

  // Custom Test Case handlers
  const handleAddCustomTestCase = () => {
    setCustomTestCases(prev => [...prev, { id: Date.now().toString(), input: "" }]);
  };

  const handleRemoveCustomTestCase = (id) => {
    setCustomTestCases(prev => {
      const filtered = prev.filter(tc => tc.id !== id);
      return filtered.length === 0 ? [{ id: Date.now().toString(), input: "" }] : filtered;
    });
  };

  const handleEditCustomTestCase = (id, value) => {
    setCustomTestCases(prev => prev.map(tc => tc.id === id ? { ...tc, input: value } : tc));
  };

  const handleSelectQuestion = (q) => {
    setGeneratedQuestion(q);
    setCompanyInput(q.company || "");
    setRoleInput(q.role || "");
    setDifficulty(q.difficulty || "Easy");
    setTopic(q.topic || "Arrays");
    setLanguage(q.language || "C++");
    setCtcInput(q.ctc || "");
    setEvaluationResult(null);
    setExpandedSubmissionId(null);
    setActiveTab("practice");
  };

  const handleSubmitCode = async () => {
    if (!generatedQuestion || !generatedQuestion._id) return;
    if (!codeValue || !codeValue.trim()) {
      showToast("Please write some code before submitting.", "error");
      return;
    }

    setIsSubmitting(true);
    setEvaluationResult(null);

    try {
      const payload = {
        questionId: generatedQuestion._id,
        language,
        code: codeValue,
        customTestCases: customTestCases.map(tc => tc.input).filter(input => input.trim() !== "")
      };

      const response = await submitCodeService(payload);
      if (response.success && response.data) {
        setEvaluationResult(response.data);
        showToast("Submission evaluated successfully!", "success");
        // Refresh submissions history
        fetchSubmissionsHistory(generatedQuestion._id);
      } else {
        showToast(response.message || "Failed to evaluate submission.", "error");
      }
    } catch (err) {
      console.error("Submission failed:", err);
      showToast(err.response?.data?.message || err.message || "An error occurred during submission.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };


  // Auto-filtering suggestions
  const filteredCompaniesList = useMemo(() => {
    const query = companyInput.trim().toLowerCase();
    const baseSuggestions = ["Google", "Microsoft", "Amazon", "Adobe", "Atlassian", "TCS", "Infosys"];
    if (!query) return baseSuggestions;
    return baseSuggestions.filter(c => c.toLowerCase().includes(query));
  }, [companyInput]);

  const filteredRolesList = useMemo(() => {
    const query = roleInput.trim().toLowerCase();
    const baseSuggestions = ["Software Engineer", "SDE Intern", "Frontend Developer", "Backend Developer", "Full Stack Developer"];
    if (!query) return baseSuggestions;
    return baseSuggestions.filter(r => r.toLowerCase().includes(query));
  }, [roleInput]);

  // Click outside to close combobox suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target)) {
        setShowCompanySuggestions(false);
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
        setShowRoleSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Format CTC on blur
  const handleCtcBlur = () => {
    let cleaned = ctcInput.trim();
    if (!cleaned) return;
    
    if (cleaned.toLowerCase().endsWith('lpa')) {
      cleaned = cleaned.substring(0, cleaned.length - 3).trim();
    }
    
    const isValid = /^\d+(?:\.\d{1,2})?$/.test(cleaned) && parseFloat(cleaned) > 0;
    if (isValid) {
      setCtcInput(`${parseFloat(cleaned)} LPA`);
      setCtcError("");
    } else {
      setCtcError("Please enter a positive number with max 2 decimal places (e.g. 12, 7.5).");
    }
  };

  // Generate Question handler
  const handleGenerateQuestion = async () => {
    if (!companyInput.trim()) {
      setCtcError("Company name is required.");
      return;
    }
    if (!roleInput.trim()) {
      setCtcError("Role is required.");
      return;
    }
    if (!ctcInput.trim() || ctcError) {
      setCtcError("Valid Target CTC is required.");
      return;
    }

    setLoadingQuestion(true);
    setErrorQuestion(null);
    setHintsExpanded(false);
    setVisibleHintsCount(0);

    try {
      const payload = {
        company: companyInput.trim(),
        role: roleInput.trim(),
        difficulty,
        topic,
        language,
        ctc: ctcInput.trim()
      };

      const response = await generateQuestionService(payload);
      
      if (response.success && response.data) {
        setGeneratedQuestion(response.data);
      } else {
        setErrorQuestion(response.message || "Failed to generate question.");
      }
    } catch (err) {
      console.error("Failed to generate question:", err);
      setErrorQuestion(err.response?.data?.message || err.message || "An error occurred while generating the question.");
    } finally {
      setLoadingQuestion(false);
    }
  };

  // Actions scrolling handlers
  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
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
        
        .heatmap-grid {
          display: grid;
          grid-template-flow: column;
          grid-auto-flow: column;
          grid-template-rows: repeat(7, minmax(0, 1fr));
          gap: 3px;
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

        {/* Ambient Glowing Spotlights */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-[130px] pointer-events-none" />

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* MAIN DISPLAY CONTAINER */}
        <div className="lg:ml-[280px] flex-1 flex flex-col h-screen overflow-y-auto z-10 relative">
          <TopNavbar onMenuClick={() => setSidebarOpen(true)} />

          {/* MAIN DYNAMIC CONTENT */}
          <main className="flex-1 p-6 space-y-8 max-w-7xl mx-auto w-full relative">
            {/* Toast Notification */}
            <AnimatePresence>
              {toastMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`border px-4 py-3 rounded-xl flex items-center justify-between gap-3 text-sm text-left shadow-lg relative overflow-hidden transition-all z-[9999] ${
                    toastType === "error"
                      ? "bg-red-500/10 border-red-500/20 text-red-400"
                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {toastType === "error" ? (
                      <Info className="w-4 h-4 text-red-400" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                    <span>{toastMessage}</span>
                  </div>
                  <button
                    onClick={() => setToastMessage("")}
                    className={`focus:outline-none hover:opacity-80 ${
                      toastType === "error" ? "text-red-400" : "text-emerald-400"
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* HERO SECTION */}
            <section className="relative rounded-3xl border border-white/10 bg-slate-950/20 backdrop-blur-xl p-6 sm:p-8 overflow-hidden text-left">
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />

              <div className="relative z-10 max-w-2xl space-y-4">
                <div className="inline-flex items-center space-x-1.5 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-xs text-indigo-400 font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>
                    Module 4 &bull; Algorithms &amp; Platforms Tracker
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                  Coding Journey
                </h1>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
                  Track your coding practice, master DSA, and prepare for
                  technical interviews. Sync details dynamically across multiple
                  platforms.
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => scrollToId("problems-list")}
                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white text-sm font-bold cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    Start Practice
                  </button>
                  <button
                    onClick={() => scrollToId("progress-charts")}
                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] hover:border-white/15 text-white text-sm font-semibold cursor-pointer transition-all"
                  >
                    <LineChart className="w-4 h-4 text-indigo-400" />
                    View Progress
                  </button>
                </div>
              </div>
            </section>

            {/* Navigation Tabs */}
            <div className="flex border-b border-white/10 gap-6 mb-6 text-left">
              {["practice", "history", "analytics"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm font-bold transition-all relative cursor-pointer focus:outline-none capitalize ${
                    activeTab === tab ? "text-indigo-400 font-extrabold" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTabBorder"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500"
                    />
                  )}
                </button>
              ))}
            </div>

            {activeTab === "history" && (
              <HistoryTab
                questions={historyQuestions}
                totalPages={historyTotalPages}
                currentPage={historyPage}
                totalResults={historyTotalResults}
                loading={loadingHistory}
                onPageChange={setHistoryPage}
                onViewDetails={handleOpenDrawer}
                onToggleBookmark={handleToggleBookmark}
                search={historySearch}
                setSearch={setHistorySearch}
                company={historyCompany}
                setCompany={setHistoryCompany}
                topic={historyTopic}
                setTopic={setHistoryTopic}
                difficulty={historyDifficulty}
                setDifficulty={setHistoryDifficulty}
                status={historyStatus}
                setStatus={setHistoryStatus}
                language={historyLanguage}
                setLanguage={setHistoryLanguage}
                startDate={historyStartDate}
                setStartDate={setHistoryStartDate}
                endDate={historyEndDate}
                setEndDate={setHistoryEndDate}
                bookmarkedOnly={historyBookmarkedOnly}
                setBookmarkedOnly={setHistoryBookmarkedOnly}
                onClearFilters={() => {
                  setHistorySearch("");
                  setHistoryCompany("all");
                  setHistoryTopic("all");
                  setHistoryDifficulty("all");
                  setHistoryStatus("all");
                  setHistoryLanguage("all");
                  setHistoryStartDate("");
                  setHistoryEndDate("");
                  setHistoryBookmarkedOnly(false);
                  setHistoryPage(1);
                }}
              />
            )}

            {activeTab === "analytics" && (
              <AnalyticsTab
                data={analyticsData}
                loading={loadingAnalytics}
              />
            )}

            <DetailedReportDrawer
              isOpen={isDrawerOpen}
              onClose={() => setIsDrawerOpen(false)}
              details={drawerDetails}
              loading={loadingDrawerDetails}
              onToggleBookmark={handleToggleBookmark}
              activeTab={drawerActiveTab}
              setActiveTab={setDrawerActiveTab}
            />

            {activeTab === "practice" && (
              /* AI QUESTION GENERATOR & WORKSPACE VIEW */
              generatedQuestion ? (
                /* ACTIVE QUESTION WORKSPACE (12 Columns) */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
                  {/* Left Side: Problem Statement & Details (6 Columns) */}
                  <div className="lg:col-span-6 space-y-6 max-h-[85vh] overflow-y-auto pr-2">
                    {/* Back Button */}
                    <button
                      onClick={() => {
                        setGeneratedQuestion(null);
                        setEvaluationResult(null);
                      }}
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Question Generator / Dashboard</span>
                    </button>

                    {/* Question Header */}
                    <div className="bg-slate-950/40 border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-lg space-y-4">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                      
                      <div className="space-y-2">
                        <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                          {generatedQuestion.title}
                        </h2>
                        <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                          <span
                            className={`px-2.5 py-0.5 rounded border uppercase tracking-wider ${
                              generatedQuestion.difficulty === "Easy"
                                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                                : generatedQuestion.difficulty === "Medium"
                                  ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                                  : "text-red-400 bg-red-500/10 border-red-500/20"
                            }`}
                          >
                            {generatedQuestion.difficulty}
                          </span>
                          <span className="px-2.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 font-mono">
                            {generatedQuestion.topic}
                          </span>
                          {generatedQuestion.company && (
                            <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                              {generatedQuestion.company}
                            </span>
                          )}
                          {generatedQuestion.role && (
                            <span className="px-2.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300">
                              {generatedQuestion.role}
                            </span>
                          )}
                        </div>
                      </div>

                      {generatedQuestion.tags && generatedQuestion.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {generatedQuestion.tags.map((t, idx) => (
                            <span
                              key={idx}
                              className="bg-indigo-500/5 border border-indigo-500/10 text-indigo-300/60 rounded-lg px-2 py-0.5 text-[9px] font-mono"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Problem Description */}
                    <div className="bg-slate-950/40 border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-lg space-y-3">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Problem Description
                      </h3>
                      <p className="whitespace-pre-wrap font-sans text-slate-300 leading-relaxed text-sm sm:text-base">
                        {generatedQuestion.description}
                      </p>
                    </div>

                    {/* Examples */}
                    {generatedQuestion.examples && generatedQuestion.examples.length > 0 && (
                      <div className="bg-slate-950/40 border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-lg space-y-4">
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Examples
                        </h3>
                        <div className="space-y-3">
                          {generatedQuestion.examples.slice(0, 2).map((ex, idx) => (
                            <div
                              key={idx}
                              className="bg-slate-950/40 border border-white/5 rounded-2xl p-4 font-mono text-xs text-left text-slate-300 space-y-2.5"
                            >
                              <p className="font-semibold text-indigo-400">Example {idx + 1}:</p>
                              <p><span className="text-slate-500 font-bold">Input:</span> {ex.input}</p>
                              <p><span className="text-slate-500 font-bold">Output:</span> {ex.output}</p>
                              {ex.explanation && (
                                <p><span className="text-slate-500 font-bold">Explanation:</span> {ex.explanation}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Constraints */}
                    {generatedQuestion.constraints && generatedQuestion.constraints.length > 0 && (
                      <div className="bg-slate-950/40 border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-lg space-y-3">
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Constraints
                        </h3>
                        <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300 font-mono pl-1">
                          {generatedQuestion.constraints.map((c, idx) => (
                            <li key={idx}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Hints */}
                    {generatedQuestion.hints && generatedQuestion.hints.length > 0 && (
                      <div className="bg-slate-950/40 border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-lg space-y-3">
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                        
                        {!hintsExpanded ? (
                          <button
                            onClick={() => {
                              setHintsExpanded(true);
                              setVisibleHintsCount(1);
                            }}
                            className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 text-xs font-bold cursor-pointer"
                          >
                            <span>💡 Show Hints</span>
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <div className="space-y-3 text-left">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                                💡 Hints
                              </span>
                              <button
                                onClick={() => {
                                  setHintsExpanded(false);
                                  setVisibleHintsCount(0);
                                }}
                                className="text-slate-400 hover:text-white text-xs cursor-pointer"
                              >
                                Hide
                              </button>
                            </div>

                            <div className="space-y-2">
                              {generatedQuestion.hints.slice(0, visibleHintsCount).map((hint, idx) => (
                                <div
                                  key={idx}
                                  className="bg-white/[0.01] border border-white/5 rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed font-sans"
                                >
                                  <p className="font-semibold text-indigo-400 mb-1">Hint {idx + 1}</p>
                                  <p>{hint}</p>
                                </div>
                              ))}
                            </div>

                            {visibleHintsCount < generatedQuestion.hints.length && (
                              <button
                                onClick={() => setVisibleHintsCount(prev => prev + 1)}
                                className="text-indigo-400 hover:text-indigo-300 text-xs font-bold cursor-pointer"
                              >
                                Show Next Hint
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Complexity Guidelines */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/40 border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-lg">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                      <div className="space-y-1 bg-slate-950/20 rounded-xl p-3 border border-white/5 font-mono text-xs text-left">
                        <span className="text-slate-500 block">Expected Time Complexity</span>
                        <span className="font-bold text-white">{generatedQuestion.expectedTimeComplexity}</span>
                      </div>
                      <div className="space-y-1 bg-slate-950/20 rounded-xl p-3 border border-white/5 font-mono text-xs text-left">
                        <span className="text-slate-500 block">Expected Space Complexity</span>
                        <span className="font-bold text-white">{generatedQuestion.expectedSpaceComplexity}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Monaco Code Editor & Actions (6 Columns) */}
                  <div className="lg:col-span-6 space-y-6 max-h-[85vh] overflow-y-auto pl-2">
                    {/* Language Selector Header */}
                    <div className="flex justify-between items-center bg-slate-950/60 border border-white/10 rounded-2xl px-4 py-3 shadow-md">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Programming Language
                      </label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        disabled={isSubmitting}
                        className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500/60 font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {["C++", "Java", "Python", "JavaScript"].map(l => (
                          <option key={l} value={l} className="bg-slate-900">{l}</option>
                        ))}
                      </select>
                    </div>

                    {/* Monaco Editor Component */}
                    <div className="relative">
                      {isSubmitting && (
                        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-2xl">
                          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                          <p className="mt-4 text-sm text-slate-300">
                            AI is reviewing your solution...
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Analyzing logic and hidden test cases...
                          </p>
                        </div>
                      )}
                      
                      <CodeEditor
                        questionId={generatedQuestion._id}
                        language={language}
                        value={codeValue}
                        onChange={setCodeValue}
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Custom Test Cases (Reviewer Notes) */}
                    <div className="bg-slate-950/40 border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-lg space-y-4">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                      
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Custom Test Cases (Notes for AI Reviewer)
                        </h3>
                        <button
                          onClick={handleAddCustomTestCase}
                          disabled={isSubmitting}
                          className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[10px] font-bold transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          + Add Case
                        </button>
                      </div>

                      <p className="text-[10px] text-slate-500 leading-relaxed font-light">
                        Note: Custom test cases act as descriptive scenarios sent to the AI reviewer to assess. No local execution or physical code compilation occurs.
                      </p>

                      <div className="space-y-2.5">
                        {customTestCases.map((tc, index) => (
                          <div key={tc.id} className="flex items-center space-x-2">
                            <span className="text-[10px] font-bold text-slate-500 font-mono w-4">#{index + 1}</span>
                            <input
                              type="text"
                              value={tc.input}
                              onChange={(e) => handleEditCustomTestCase(tc.id, e.target.value)}
                              placeholder="e.g. Input: nums = [1, 1], k = 2"
                              disabled={isSubmitting}
                              className="flex-1 bg-slate-950/50 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/40 placeholder-slate-600 disabled:opacity-50"
                            />
                            <button
                              onClick={() => handleRemoveCustomTestCase(tc.id)}
                              disabled={isSubmitting}
                              className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/5 cursor-pointer disabled:opacity-30"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Submission CTA */}
                    <button
                      onClick={handleSubmitCode}
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Evaluating Code...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Submit Solution</span>
                        </>
                      )}
                    </button>

                    {/* AI EVALUATION CARD */}
                    {evaluationResult && (
                      <div className="bg-slate-950/60 border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-2xl space-y-6">
                        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent pointer-events-none" />

                        {/* AI Disclaimer Banner */}
                        <div className="flex items-start gap-2.5 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-left text-xs text-amber-300">
                          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <span className="font-bold text-white block">AI Estimated Evaluation</span>
                            <span>This review is generated using AI analysis and may differ from an actual online judge.</span>
                          </div>
                        </div>

                        {/* Verdict Header & Stats Overview */}
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4 text-left">
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Verdict</span>
                            <span className={`text-lg font-black tracking-tight ${
                              evaluationResult.status === "passed" ? "text-emerald-400" :
                              evaluationResult.status === "partial" ? "text-amber-400" : "text-red-400"
                            }`}>
                              {evaluationResult.status === "passed" ? "Likely Accepted" :
                               evaluationResult.status === "partial" ? "Partially Correct" : "Likely Wrong Answer"}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-4 sm:gap-6">
                            <div className="text-right">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Score</span>
                              <span className="text-lg font-black text-white">{evaluationResult.score} / 100</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Confidence</span>
                              <span className="text-lg font-black text-indigo-400">{evaluationResult.confidence}%</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Test Cases</span>
                              <span className="text-lg font-black text-cyan-400">
                                {evaluationResult.testCasesPassed} / {evaluationResult.totalTestCases || 15}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Detailed Feedback */}
                        <div className="space-y-2 text-left">
                          <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Review Feedback</span>
                          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                            {evaluationResult.feedback}
                          </p>
                        </div>

                        {/* Strengths & Improvements */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 space-y-2 text-left">
                            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">Key Strengths</span>
                            <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                              {evaluationResult.strengths?.map((str, i) => (
                                <li key={i}>{str}</li>
                              ))}
                              {(!evaluationResult.strengths || evaluationResult.strengths.length === 0) && (
                                <li className="text-slate-500 italic">No specific strengths listed.</li>
                              )}
                            </ul>
                          </div>

                          <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 space-y-2 text-left">
                            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">Improvements Needed</span>
                            <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                              {evaluationResult.improvements?.map((imp, i) => (
                                <li key={i}>{imp}</li>
                              ))}
                              {(!evaluationResult.improvements || evaluationResult.improvements.length === 0) && (
                                <li className="text-slate-500 italic">No specific improvements listed.</li>
                              )}
                            </ul>
                          </div>
                        </div>

                        {/* Edge Cases & Failures */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-4">
                          <div className="space-y-2 text-left">
                            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Edge Cases Covered</span>
                            <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                              {evaluationResult.edgeCasesCovered?.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                              {(!evaluationResult.edgeCasesCovered || evaluationResult.edgeCasesCovered.length === 0) && (
                                <li className="text-slate-500 italic">None logged.</li>
                              )}
                            </ul>
                          </div>

                          <div className="space-y-2 text-left">
                            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Potential Failure Cases</span>
                            <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                              {evaluationResult.potentialFailingCases?.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                              {(!evaluationResult.potentialFailingCases || evaluationResult.potentialFailingCases.length === 0) && (
                                <li className="text-slate-500 italic">None logged.</li>
                              )}
                            </ul>
                          </div>
                        </div>

                        {/* Complexity Comparisons */}
                        <div className="border-t border-white/5 pt-4 space-y-3">
                          <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide text-left">Complexity Analysis</span>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-950/40 rounded-xl p-3 border border-white/5 text-left text-xs font-mono">
                              <span className="text-slate-500 block text-[10px] uppercase">Time Complexity</span>
                              <p className="mt-1"><span className="text-slate-400 font-bold">Your Code:</span> <span className="text-white font-bold">{evaluationResult.timeComplexity}</span></p>
                              <p><span className="text-slate-400 font-bold">Expected:</span> <span className="text-slate-300">{generatedQuestion.expectedTimeComplexity}</span></p>
                            </div>
                            <div className="bg-slate-950/40 rounded-xl p-3 border border-white/5 text-left text-xs font-mono">
                              <span className="text-slate-500 block text-[10px] uppercase">Space Complexity</span>
                              <p className="mt-1"><span className="text-slate-400 font-bold">Your Code:</span> <span className="text-white font-bold">{evaluationResult.spaceComplexity}</span></p>
                              <p><span className="text-slate-400 font-bold">Expected:</span> <span className="text-slate-300">{generatedQuestion.expectedSpaceComplexity}</span></p>
                            </div>
                          </div>
                        </div>

                        {/* Optimal Solution Display */}
                        <div className="border-t border-white/5 pt-4 space-y-2.5 text-left">
                          <button
                            type="button"
                            onClick={() => setOptimalSolutionExpanded(!optimalSolutionExpanded)}
                            className="flex items-center justify-between w-full text-slate-400 hover:text-white transition-all cursor-pointer font-bold text-xs uppercase tracking-wider"
                          >
                            <span>💡 Optimal Solution Suggestion</span>
                            <span className="text-[10px] bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 font-semibold text-slate-300 hover:bg-white/10">
                              {optimalSolutionExpanded ? "Hide Solution" : "Show Solution"}
                            </span>
                          </button>
                          {optimalSolutionExpanded && (
                            <div className="bg-slate-950 border border-white/5 rounded-2xl overflow-hidden font-mono text-xs relative max-h-[300px] overflow-y-auto mt-2">
                              <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-b border-white/5 text-[10px] text-slate-400">
                                <span>OPTIMIZED {language.toUpperCase()} IMPLEMENTATION</span>
                              </div>
                              <pre className="p-4 text-slate-300 overflow-x-auto select-text whitespace-pre-wrap">
                                {evaluationResult.optimalSolution}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* SUBMISSIONS HISTORY */}
                    <div className="bg-slate-950/40 border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-lg space-y-4">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                      
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-left">
                        Submission History
                      </h3>

                      {loadingSubmissions ? (
                        <div className="flex items-center space-x-2 py-4 text-xs text-slate-400 font-mono">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Loading past attempts...</span>
                        </div>
                      ) : submissionsHistory.length === 0 ? (
                        <p className="text-xs text-slate-500 italic py-4 text-left">
                          No submissions yet. Submit your first solution to start building your coding journey.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {submissionsHistory.map((sub) => {
                            const isExpanded = expandedSubmissionId === sub._id;
                            const formattedDate = new Date(sub.submittedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            });
                            const verdict = sub.status === "passed" ? "Likely Accepted" :
                                            sub.status === "partial" ? "Partially Correct" : "Likely Wrong Answer";
                            
                            return (
                              <div
                                key={sub._id}
                                className="border border-white/5 rounded-2xl overflow-hidden bg-slate-950/20 text-left"
                              >
                                {/* Summary Header */}
                                <div
                                  onClick={() => setExpandedSubmissionId(isExpanded ? null : sub._id)}
                                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                                >
                                  <div>
                                    <span className="text-xs font-bold text-white font-mono">{formattedDate}</span>
                                    <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-slate-400 mt-1 font-semibold">
                                      <span>Language: {sub.language}</span>
                                      <span>&bull;</span>
                                      <span>Score: {sub.score}/100</span>
                                      {sub.totalTestCases > 0 && (
                                        <>
                                          <span>&bull;</span>
                                          <span className="text-cyan-400 font-bold">Passed: {sub.testCasesPassed}/{sub.totalTestCases}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-3">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                                      sub.status === "passed" ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" :
                                      sub.status === "partial" ? "text-amber-400 border-amber-500/20 bg-amber-500/5" :
                                      "text-red-400 border-red-500/20 bg-red-500/5"
                                    }`}>
                                      {verdict}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                  </div>
                                </div>

                                {/* Expanded details */}
                                {isExpanded && (
                                  <div className="p-4 border-t border-white/5 bg-slate-950/40 text-xs space-y-4">
                                    <div className="space-y-1.5">
                                      <span className="font-bold text-slate-400 uppercase text-[10px]">Your Submitted Code</span>
                                      <pre className="p-3 bg-slate-950 border border-white/5 rounded-xl font-mono text-[11px] text-slate-300 overflow-x-auto whitespace-pre-wrap select-text max-h-[180px]">
                                        {sub.code}
                                      </pre>
                                    </div>

                                    <div className="space-y-1.5">
                                      <span className="font-bold text-slate-400 uppercase text-[10px]">AI Feedback Notes</span>
                                      <p className="text-slate-300 font-sans leading-relaxed">{sub.feedback}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="bg-emerald-500/5 p-3 border border-emerald-500/10 rounded-xl">
                                        <span className="font-bold text-emerald-400 uppercase text-[10px] block mb-1">Strengths</span>
                                        <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                                          {sub.strengths?.map((item, i) => <li key={i}>{item}</li>)}
                                        </ul>
                                      </div>
                                      <div className="bg-amber-500/5 p-3 border border-amber-500/10 rounded-xl">
                                        <span className="font-bold text-amber-400 uppercase text-[10px] block mb-1">Improvements</span>
                                        <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                                          {sub.improvements?.map((item, i) => <li key={i}>{item}</li>)}
                                        </ul>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <span className="font-bold text-slate-500 uppercase text-[10px] block">Edge Cases Covered</span>
                                        <ul className="list-disc list-inside text-slate-300 text-[11px] mt-1 space-y-1">
                                          {sub.edgeCasesCovered?.map((item, i) => <li key={i}>{item}</li>)}
                                        </ul>
                                      </div>
                                      <div>
                                        <span className="font-bold text-slate-500 uppercase text-[10px] block">Failure Cases</span>
                                        <ul className="list-disc list-inside text-slate-300 text-[11px] mt-1 space-y-1">
                                          {sub.potentialFailingCases?.map((item, i) => <li key={i}>{item}</li>)}
                                        </ul>
                                      </div>
                                    </div>

                                    <div className="bg-slate-950/40 rounded-xl p-3 border border-white/5 font-mono text-[11px] grid grid-cols-3 gap-2">
                                      <div>
                                        <span className="text-slate-500 block text-[9px] uppercase">Time Complexity</span>
                                        <span className="text-white font-bold">{sub.timeComplexity}</span>
                                      </div>
                                      <div>
                                        <span className="text-slate-500 block text-[9px] uppercase">Space Complexity</span>
                                        <span className="text-white font-bold">{sub.spaceComplexity}</span>
                                      </div>
                                      <div>
                                        <span className="text-slate-500 block text-[9px] uppercase">Test Cases Passed</span>
                                        <span className="text-cyan-400 font-bold">{sub.testCasesPassed} / {sub.totalTestCases || 15}</span>
                                      </div>
                                    </div>

                                    <div className="space-y-1.5">
                                      <span className="font-bold text-slate-400 uppercase text-[10px]">Optimal Solution Suggestion</span>
                                      <pre className="p-3 bg-slate-950 border border-white/5 rounded-xl font-mono text-[11px] text-slate-300 overflow-x-auto whitespace-pre-wrap select-text max-h-[180px]">
                                        {sub.optimalSolution}
                                      </pre>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* AI QUESTION GENERATOR FORM & SKELETONS */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
                  {/* Preference Form Panel (4 columns) */}
                  <div className="lg:col-span-4 space-y-6">
                    <div className="bg-slate-950/40 border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-lg space-y-6">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                      
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-400" />
                        Question Details
                      </h3>

                      {/* Company Searchable Combobox */}
                      <div className="relative space-y-1.5" ref={companyDropdownRef}>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                          Company
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={companyInput}
                            onChange={(e) => {
                              setCompanyInput(e.target.value);
                              setShowCompanySuggestions(true);
                            }}
                            onFocus={() => setShowCompanySuggestions(true)}
                            placeholder="e.g. Google, NVIDIA"
                            className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3.5 py-2.5 pr-9 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500/60 placeholder-slate-500"
                          />
                          {companyInput && (
                            <button
                              type="button"
                              onClick={() => {
                                setCompanyInput("");
                                setShowCompanySuggestions(false);
                              }}
                              className="absolute right-2.5 text-slate-400 hover:text-white cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        {showCompanySuggestions && filteredCompaniesList.length > 0 && (
                          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-slate-900 border border-white/10 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                            {filteredCompaniesList.map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => {
                                  setCompanyInput(c);
                                  setShowCompanySuggestions(false);
                                }}
                                className="w-full text-left px-3.5 py-2.5 text-xs sm:text-sm text-slate-300 hover:bg-indigo-500/10 hover:text-white transition-colors cursor-pointer"
                              >
                                {c}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Role Searchable Combobox */}
                      <div className="relative space-y-1.5" ref={roleDropdownRef}>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                          Target Role
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={roleInput}
                            onChange={(e) => {
                              setRoleInput(e.target.value);
                              setShowRoleSuggestions(true);
                            }}
                            onFocus={() => setShowRoleSuggestions(true)}
                            placeholder="e.g. Frontend Developer"
                            className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3.5 py-2.5 pr-9 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500/60 placeholder-slate-500"
                          />
                          {roleInput && (
                            <button
                              type="button"
                              onClick={() => {
                                setRoleInput("");
                                setShowRoleSuggestions(false);
                              }}
                              className="absolute right-2.5 text-slate-400 hover:text-white cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        {showRoleSuggestions && filteredRolesList.length > 0 && (
                          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-slate-900 border border-white/10 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                            {filteredRolesList.map((r) => (
                              <button
                                key={r}
                                type="button"
                                onClick={() => {
                                  setRoleInput(r);
                                  setShowRoleSuggestions(false);
                                }}
                                className="w-full text-left px-3.5 py-2.5 text-xs sm:text-sm text-slate-300 hover:bg-indigo-500/10 hover:text-white transition-colors cursor-pointer"
                              >
                                {r}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Difficulty Dropdown */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                          Difficulty
                        </label>
                        <select
                          value={difficulty}
                          onChange={(e) => setDifficulty(e.target.value)}
                          className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500/60 font-medium"
                        >
                          <option value="Easy" className="bg-slate-900">Easy</option>
                          <option value="Medium" className="bg-slate-900">Medium</option>
                          <option value="Hard" className="bg-slate-900">Hard</option>
                        </select>
                      </div>

                      {/* Topic Dropdown */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                          Topic
                        </label>
                        <select
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500/60 font-medium"
                        >
                          {["Arrays", "Strings", "Linked Lists", "Trees", "Graphs", "Dynamic Programming", "Binary Search", "Sliding Window", "Heap", "Greedy"].map(t => (
                            <option key={t} value={t} className="bg-slate-900">{t}</option>
                          ))}
                        </select>
                      </div>

                      {/* Programming Language Dropdown */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                          Programming Language
                        </label>
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500/60 font-medium"
                        >
                          {["C++", "Java", "Python", "JavaScript"].map(l => (
                            <option key={l} value={l} className="bg-slate-900">{l}</option>
                          ))}
                        </select>
                      </div>

                      {/* Target CTC Input */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                          Target CTC
                        </label>
                        <input
                          type="text"
                          value={ctcInput}
                          onChange={(e) => setCtcInput(e.target.value)}
                          onBlur={handleCtcBlur}
                          placeholder="e.g. 12 or 7.5 LPA"
                          className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500/60 placeholder-slate-500"
                        />
                        {ctcError && (
                          <p className="text-[10px] text-red-400 font-semibold mt-1">{ctcError}</p>
                        )}
                      </div>

                      {/* Action button */}
                      <button
                        type="button"
                        disabled={loadingQuestion}
                        onClick={handleGenerateQuestion}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white text-sm font-bold transition-all cursor-pointer shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01]"
                      >
                        {loadingQuestion ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Generating Question...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>Generate Question</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Generated Question Display Panel (8 columns) */}
                  <div className="lg:col-span-8 space-y-6">
                    {loadingQuestion ? (
                      /* SKELETON LOADER */
                      <div className="bg-slate-950/40 border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-lg animate-pulse space-y-6">
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                        <div className="flex justify-between items-center">
                          <div className="h-6 w-1/3 bg-white/10 rounded-lg" />
                          <div className="h-5 w-16 bg-white/10 rounded-full" />
                        </div>
                        <div className="flex gap-2">
                          <div className="h-4 w-12 bg-white/10 rounded-full" />
                          <div className="h-4 w-16 bg-white/10 rounded-full" />
                        </div>
                        <div className="space-y-2.5 mt-4">
                          <div className="h-4 w-full bg-white/10 rounded-lg" />
                          <div className="h-4 w-full bg-white/10 rounded-lg" />
                          <div className="h-4 w-4/5 bg-white/10 rounded-lg" />
                        </div>
                        <div className="space-y-4 pt-4">
                          <div className="h-20 w-full bg-white/5 rounded-xl border border-white/5" />
                          <div className="h-20 w-full bg-white/5 rounded-xl border border-white/5" />
                        </div>
                      </div>
                    ) : errorQuestion ? (
                      /* ERROR CARD */
                      <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-8 relative overflow-hidden text-center space-y-4">
                        <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 mx-auto">
                          <Info className="w-6 h-6" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-base font-bold text-white">Generation Failed</h4>
                          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                            {errorQuestion}
                          </p>
                        </div>
                        <button
                          onClick={handleGenerateQuestion}
                          className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer"
                        >
                          Try Again
                        </button>
                      </div>
                    ) : (
                      /* EMPTY STATE PLACEHOLDER */
                      <div className="bg-slate-950/40 border border-white/10 rounded-3xl p-16 text-center space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
                          <Code2 className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-bold text-white">Generate your first AI coding challenge.</h3>
                          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
                            Select your preferences and click <strong>Generate Question</strong>.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </main>
        </div>


      </div>
    </>
  );
};

export default CodingJourney;
