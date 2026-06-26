import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

import api from "../services/api";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/layout/Sidebar";
import TopNavbar from "../components/layout/TopNavbar";
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
  Bell,
  User as UserIcon,
  ChevronLeft,
  Menu,
  X,
  AlertCircle,
  Play,
  Trophy,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Timer,
} from "lucide-react";

const QuizReport = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // States
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedExplanations, setExpandedExplanations] = useState({});

  const fetchReportDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/aptitude/history/${attemptId}`);
      if (response.data && response.data.success) {
        setReportData(response.data.data);
      } else {
        throw new Error(
          response.data?.message || "Failed to load quiz report details.",
        );
      }
    } catch (err) {
      console.error("Error loading quiz report:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "An error occurred while loading quiz report.",
      );
    } finally {
      setLoading(false);
    }
  }, [attemptId]);

  useEffect(() => {
    if (attemptId) {
      fetchReportDetails();
    }
  }, [attemptId, fetchReportDetails]);

  const toggleExplanation = (idx) => {
    setExpandedExplanations((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const summary = reportData?.summary;
  const questions = reportData?.questions || [];

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

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* MAIN DISPLAY CONTAINER */}
        <div className="lg:ml-[280px] flex-1 flex flex-col h-screen overflow-y-auto z-10 relative">
          <TopNavbar onMenuClick={() => setSidebarOpen(true)}></TopNavbar>

          <div className="flex justify-end mb-0.5 mt-5 ">
            <button
              onClick={() => navigate("/aptitude/history")}
              className="flex items-center gap-2 px-6 py-1.5 rounded-2xl mr-35
               bg-white/5 border border-white/10
               hover:bg-white/10 hover:border-white/20
               text-slate-300 hover:text-white
               text-sm font-semibold transition-all duration-300"
            >
              Back to History
            </button>
          </div>
          {/* MAIN PAGE BODY */}
          <main className="flex-1 p-6 space-y-8 max-w-4xl mx-auto w-full">
            {/* SKELETON LOADER */}
            {loading && (
              <div className="space-y-6 animate-pulse text-left">
                <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 h-[180px] flex flex-col justify-between" />
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 h-[140px]"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ERROR VIEW */}
            {!loading && error && (
              <div className="flex flex-col items-center justify-center p-12 bg-white/[0.02] border border-white/10 rounded-3xl backdrop-blur-xl max-w-md mx-auto space-y-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <h3 className="text-lg font-bold text-white">
                  Report Not Found
                </h3>
                <p className="text-sm text-slate-400 text-center leading-relaxed font-light">
                  {error}
                </p>
                <button
                  onClick={fetchReportDetails}
                  className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-all cursor-pointer shadow-lg shadow-indigo-500/25"
                >
                  Retry Load
                </button>
              </div>
            )}

            {/* REPORT VIEW SUMMARY AND REVIEW */}
            {!loading && !error && reportData && (
              <div className="space-y-8 text-left">
                {/* SUMMARY HEADER CARD */}
                <div className="relative rounded-3xl border border-white/10 bg-slate-950/20 backdrop-blur-xl p-6 sm:p-8 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent pointer-events-none" />

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/25 text-xs text-indigo-300 font-bold uppercase tracking-wider">
                          {summary.category}
                        </span>
                        <span className="px-2.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/25 text-xs text-purple-300 font-bold uppercase tracking-wider">
                          {summary.difficulty}
                        </span>
                      </div>

                      <h2 className="text-2xl font-black text-white">
                        Assessment Report Summary
                      </h2>

                      <p className="text-xs text-slate-400 font-light font-mono">
                        Submitted On{" "}
                        {new Date(summary.submittedDate).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 bg-white/[0.01] border border-white/5 rounded-2xl p-4 shrink-0 font-mono">
                      <div className="text-center px-2">
                        <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                          Score
                        </span>
                        <span className="text-2xl font-black text-indigo-400">
                          {summary.score} / 10
                        </span>
                      </div>
                      <div className="h-8 w-[1px] bg-white/10" />
                      <div className="text-center px-2">
                        <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                          Accuracy
                        </span>
                        <span className="text-2xl font-black text-emerald-400">
                          {summary.accuracy}%
                        </span>
                      </div>
                      <div className="h-8 w-[1px] bg-white/10" />
                      <div className="text-center px-2">
                        <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                          Duration
                        </span>
                        <span className="text-sm font-bold text-slate-300">
                          {Math.floor(summary.timeTaken / 60)}m{" "}
                          {summary.timeTaken % 60}s
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stat Metrics Row */}
                  <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-white/5 text-center text-xs text-slate-400 font-mono">
                    <div>
                      <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                        Correct
                      </span>
                      <span className="text-sm font-bold text-emerald-400">
                        {summary.correctAnswers} / 10
                      </span>
                    </div>
                    <div className="border-l border-white/5">
                      <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                        Incorrect
                      </span>
                      <span className="text-sm font-bold text-red-400">
                        {summary.wrongAnswers} / 10
                      </span>
                    </div>
                    <div className="border-l border-white/5">
                      <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                        Skipped
                      </span>
                      <span className="text-sm font-bold text-amber-400">
                        {summary.skippedQuestions} / 10
                      </span>
                    </div>
                  </div>
                </div>

                {/* QUESTION REVIEW LIST */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    Question Review &amp; Analytics
                  </h3>

                  <div className="space-y-5">
                    {questions.map((q, idx) => {
                      const isCorrect = q.isCorrect;
                      const isSkipped =
                        q.userSelectedOption === null ||
                        q.userSelectedOption === "";
                      const isExpanded = !!expandedExplanations[idx];

                      return (
                        <div
                          key={idx}
                          className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 relative overflow-hidden transition-all duration-300 flex flex-col justify-between"
                        >
                          {/* Left boundary accent lines */}
                          <div
                            className={`absolute left-0 top-0 bottom-0 w-[4px] ${
                              isSkipped
                                ? "bg-amber-500/50"
                                : isCorrect
                                  ? "bg-emerald-500/50"
                                  : "bg-red-500/50"
                            }`}
                          />

                          <div className="space-y-4 pl-2">
                            {/* Question Header */}
                            <div className="flex justify-between items-center gap-2">
                              <span className="text-xs font-bold text-indigo-400 font-mono uppercase tracking-wider">
                                Question {idx + 1}
                              </span>

                              <span
                                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                  isSkipped
                                    ? "text-amber-400 bg-amber-500/10 border border-amber-500/25"
                                    : isCorrect
                                      ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/25"
                                      : "text-red-400 bg-red-500/10 border border-red-500/25"
                                }`}
                              >
                                {isSkipped
                                  ? "Skipped"
                                  : isCorrect
                                    ? "Correct"
                                    : "Incorrect"}
                              </span>
                            </div>

                            {/* Question Text */}
                            <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed whitespace-pre-line">
                              {q.question}
                            </p>

                            {/* Options Grid */}
                            <div className="grid grid-cols-1 gap-3 pt-2">
                              {(q.options || []).map((opt) => {
                                const isCorrectOption =
                                  opt.key === q.correctOption;
                                const isUserSelected =
                                  opt.key === q.userSelectedOption;

                                let optionStyle =
                                  "bg-slate-950/20 border-white/5 text-slate-300";
                                let badgeStyle = "bg-white/5 text-slate-400";

                                if (isUserSelected && isCorrectOption) {
                                  // User selected correct answer
                                  optionStyle =
                                    "bg-blue-500/10 border-blue-500/50 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.1)]";
                                  badgeStyle = "bg-blue-500 text-white";
                                } else if (isCorrectOption) {
                                  // Correct answer (not selected or selected by user - handled above if selected)
                                  optionStyle =
                                    "bg-emerald-500/10 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.1)]";
                                  badgeStyle = "bg-emerald-500 text-white";
                                } else if (isUserSelected) {
                                  // Wrong answer selected by user
                                  optionStyle =
                                    "bg-red-500/10 border-red-500/50 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.1)]";
                                  badgeStyle = "bg-red-500 text-white";
                                }

                                return (
                                  <div
                                    key={opt.key}
                                    className={`w-full p-3.5 rounded-xl border text-xs sm:text-sm font-semibold flex items-center gap-4 transition-all duration-200 select-none ${optionStyle}`}
                                  >
                                    <span
                                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${badgeStyle}`}
                                    >
                                      {opt.key}
                                    </span>
                                    <span>{opt.text}</span>
                                    {isUserSelected && (
                                      <span className="text-[10px] uppercase font-bold ml-auto shrink-0 tracking-wider">
                                        Your Choice
                                      </span>
                                    )}
                                    {isCorrectOption && !isUserSelected && (
                                      <span className="text-[10px] uppercase font-bold ml-auto shrink-0 tracking-wider text-emerald-400">
                                        Correct Answer
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* COLLAPSIBLE EXPLANATION SECTION */}
                            <div className="pt-2 border-t border-white/5 mt-4">
                              <button
                                onClick={() => toggleExplanation(idx)}
                                className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-all font-semibold focus:outline-none cursor-pointer"
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronUp className="w-4 h-4" />
                                    <span>Hide Explanation</span>
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="w-4 h-4" />
                                    <span>Show Detailed Explanation</span>
                                  </>
                                )}
                              </button>

                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden mt-3"
                                  >
                                    <div className="p-4 bg-slate-950/40 border border-white/5 rounded-xl text-xs text-slate-300 leading-relaxed font-light">
                                      <p className="font-semibold text-slate-200 mb-1.5">
                                        Solution Approach &amp; Concept Details:
                                      </p>
                                      <p className="font-mono whitespace-pre-line text-indigo-200">
                                        {q.explanation ||
                                          "No explanation details compiled."}
                                      </p>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* BOTTOM NAVIGATION ACTIONS */}
                <div className="pt-6 border-t border-white/5 flex flex-wrap gap-4 items-center justify-between">
                  <button
                    onClick={() => navigate("/aptitude/history")}
                    className="px-6 py-3 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer select-none"
                  >
                    Back to Quiz History
                  </button>

                  <button
                    onClick={() => navigate("/aptitude-practice")}
                    className="flex items-center justify-center gap-1.5 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white text-xs font-black shadow-lg shadow-indigo-500/25 transition-all cursor-pointer hover:scale-[1.01]"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    Start New Quiz
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default QuizReport;
