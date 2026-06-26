import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  Info,
  X,
  CheckCircle2,
  Code2,
  History,
  Plus,
  TrendingUp,
  Sparkles,
  Play,
  Clock
} from "lucide-react";
import {
  generateQuestion as generateQuestionService,
  submitCode as submitCodeService,
  getSubmissions as getSubmissionsService,
  getHistory,
  toggleBookmark,
  getAnalytics,
  getQuestionDetails,
  getCodingDashboard
} from "../services/codingJourneyService";
import Sidebar from "../components/layout/Sidebar";
import TopNavbar from "../components/layout/TopNavbar";
import PracticeTab from "../components/coding/PracticeTab";
import HistoryTab from "../components/coding/HistoryTab";
import AnalyticsTab from "../components/coding/AnalyticsTab";
import DetailedReportDrawer from "../components/coding/DetailedReportDrawer";




const CodingJourney = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Responsive state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Active tab state
  const [activeTab, setActiveTab] = useState("analytics"); // "analytics" | "practice" | "history"
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  // Sync activeTab with pathname
  useEffect(() => {
    if (location.pathname === "/coding-journey/practice") {
      setActiveTab("practice");
    } else if (location.pathname === "/coding-journey/history") {
      setActiveTab("history");
    } else {
      setActiveTab("analytics");
    }
  }, [location.pathname]);

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
  const fetchHistoryData = useCallback(async (pageToFetch = historyPage) => {
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
  }, [
    historyPage,
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

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoadingDashboard(true);
    try {
      const response = await getCodingDashboard();
      if (response.success) {
        setDashboardData(response);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard summary:", err);
    } finally {
      setLoadingDashboard(false);
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
        fetchDashboardData();
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



  // Fetch dashboard stats and analytics when on the main analytics tab
  useEffect(() => {
    if (activeTab === "analytics") {
      fetchDashboardData();
      fetchAnalyticsData();
    }
  }, [activeTab]);

  // Fetch history data when tab or page changes
  useEffect(() => {
    if (activeTab === "history") {
      fetchHistoryData(historyPage);
    }
  }, [activeTab, historyPage, fetchHistoryData]);

  // Reset pagination page to 1 when any filter changes
  useEffect(() => {
    if (activeTab !== "history") return;
    if (historyPage !== 1) {
      setHistoryPage(1);
    } else {
      fetchHistoryData(1);
    }
  }, [
    activeTab,
    historyPage,
    fetchHistoryData,
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
        fetchDashboardData();
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

            {/* Hero Section */}
            {activeTab === "analytics" && (
              <div className="relative rounded-3xl border border-white/10 bg-slate-950/20 backdrop-blur-xl p-6 sm:p-8 overflow-hidden text-left">
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />

                <div className="relative z-10 max-w-2xl space-y-4">
                  <div className="inline-flex items-center space-x-1.5 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-xs text-indigo-400 font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>CODING ANALYTICS & PRACTICE</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    Level Up Your Coding Journey
                  </h1>
                  <p className="text-sm text-slate-300 leading-relaxed font-light font-sans">
                    Track your coding progress, analyze your performance, and prepare for coding interviews with AI-generated practice problems.
                  </p>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={() => navigate("/coding-journey/practice")}
                      className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white text-sm font-bold cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all border-0"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      Start Practicing
                    </button>
                    <button
                      onClick={() => navigate("/coding-journey/history")}
                      className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] hover:border-white/15 text-white text-sm font-semibold cursor-pointer transition-all"
                    >
                      <Clock className="w-4 h-4 text-indigo-400" />
                      View History
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "analytics" && (
              <AnalyticsTab
                data={analyticsData}
                dashboardData={dashboardData}
                loading={loadingAnalytics || loadingDashboard}
              />
            )}

            {activeTab === "practice" && (
              <PracticeTab
                companyInput={companyInput}
                setCompanyInput={setCompanyInput}
                showCompanySuggestions={showCompanySuggestions}
                setShowCompanySuggestions={setShowCompanySuggestions}
                companyDropdownRef={companyDropdownRef}
                roleInput={roleInput}
                setRoleInput={setRoleInput}
                showRoleSuggestions={showRoleSuggestions}
                setShowRoleSuggestions={setShowRoleSuggestions}
                roleDropdownRef={roleDropdownRef}
                difficulty={difficulty}
                setDifficulty={setDifficulty}
                topic={topic}
                setTopic={setTopic}
                language={language}
                setLanguage={setLanguage}
                ctcInput={ctcInput}
                setCtcInput={setCtcInput}
                ctcError={ctcError}
                loadingQuestion={loadingQuestion}
                generatedQuestion={generatedQuestion}
                setGeneratedQuestion={setGeneratedQuestion}
                errorQuestion={errorQuestion}
                hintsExpanded={hintsExpanded}
                setHintsExpanded={setHintsExpanded}
                visibleHintsCount={visibleHintsCount}
                setVisibleHintsCount={setVisibleHintsCount}
                codeValue={codeValue}
                setCodeValue={setCodeValue}
                isSubmitting={isSubmitting}
                evaluationResult={evaluationResult}
                setEvaluationResult={setEvaluationResult}
                customTestCases={customTestCases}
                optimalSolutionExpanded={optimalSolutionExpanded}
                setOptimalSolutionExpanded={setOptimalSolutionExpanded}
                submissionsHistory={submissionsHistory}
                loadingSubmissions={loadingSubmissions}
                expandedSubmissionId={expandedSubmissionId}
                setExpandedSubmissionId={setExpandedSubmissionId}
                filteredCompaniesList={filteredCompaniesList}
                filteredRolesList={filteredRolesList}
                handleCtcBlur={handleCtcBlur}
                handleGenerateQuestion={handleGenerateQuestion}
                handleAddCustomTestCase={handleAddCustomTestCase}
                handleRemoveCustomTestCase={handleRemoveCustomTestCase}
                handleEditCustomTestCase={handleEditCustomTestCase}
                handleSubmitCode={handleSubmitCode}
              />
            )}

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

            <DetailedReportDrawer
              isOpen={isDrawerOpen}
              onClose={() => setIsDrawerOpen(false)}
              details={drawerDetails}
              loading={loadingDrawerDetails}
              onToggleBookmark={handleToggleBookmark}
              activeTab={drawerActiveTab}
              setActiveTab={setDrawerActiveTab}
            />
          </main>
        </div>


      </div>
    </>
  );
};

export default CodingJourney;
