import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Star,
  Loader2,
  Clock,
  Code2,
  Sparkles,
  HelpCircle,
  TrendingUp,
  Info
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart as ReChartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

const DetailedReportDrawer = ({
  isOpen,
  onClose,
  details,
  loading,
  onToggleBookmark,
  activeTab,
  setActiveTab
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Sliding Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "tween", duration: 0.3 }}
        className="w-full max-w-2xl bg-[#080e24] border-l border-white/10 h-full overflow-y-auto z-10 relative flex flex-col shadow-2xl text-left"
      >
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm text-slate-400 font-mono">Loading report details...</p>
          </div>
        ) : !details ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <p className="text-sm text-slate-400">Failed to load details.</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-xs font-bold"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Drawer Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-start gap-4">
              <div className="space-y-1.5 flex-1">
                <h2 className="text-lg font-black text-white leading-tight">
                  {details.question?.title}
                </h2>
                <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                  <span
                    className={`px-2 py-0.5 rounded border uppercase tracking-wider ${
                      details.question?.difficulty === "Easy"
                        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                        : details.question?.difficulty === "Medium"
                          ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                          : "text-red-400 bg-red-500/10 border-red-500/20"
                    }`}
                  >
                    {details.question?.difficulty}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 font-mono">
                    {details.question?.topic}
                  </span>
                  {details.question?.company && (
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                      {details.question?.company}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggleBookmark(details.question?._id)}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
                  title="Bookmark Question"
                >
                  <Star
                    className={`w-4 h-4 ${
                      details.question?.isBookmarked
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-slate-400"
                    }`}
                  />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Inner Subtabs Nav */}
            <div className="px-6 border-b border-white/10 flex gap-4 overflow-x-auto">
              {[
                { id: "question", label: "Question" },
                { id: "latest", label: "Latest Submission" },
                { id: "history", label: "Submission History" },
                { id: "score", label: "Score Trend" },
                { id: "feedback", label: "Feedback Timeline" },
                { id: "best", label: "Best Solution" }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`pb-3 pt-4 text-xs font-bold transition-all relative shrink-0 cursor-pointer focus:outline-none ${
                    activeTab === t.id
                      ? "text-indigo-400 font-extrabold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {t.label}
                  {activeTab === t.id && (
                    <motion.div
                      layoutId="drawerTabBorder"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Drawer Body content */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {activeTab === "question" && (
                <div className="space-y-6">
                  {/* Description */}
                  <div className="bg-slate-950/40 border border-white/5 p-5 rounded-2xl space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Problem Description
                    </h4>
                    <p className="whitespace-pre-wrap text-sm text-slate-300 leading-relaxed font-sans">
                      {details.question?.description}
                    </p>
                  </div>

                  {/* Examples */}
                  {details.question?.examples && details.question.examples.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
                        Examples
                      </h4>
                      {details.question.examples.map((ex, i) => (
                        <div
                          key={i}
                          className="bg-slate-950/60 border border-white/5 p-4 rounded-xl font-mono text-xs text-slate-300 space-y-1.5"
                        >
                          <p className="font-semibold text-indigo-400">Example {i + 1}:</p>
                          <p><span className="text-slate-500 font-bold">Input:</span> {ex.input}</p>
                          <p><span className="text-slate-500 font-bold">Output:</span> {ex.output}</p>
                          {ex.explanation && (
                            <p><span className="text-slate-500 font-bold">Explanation:</span> {ex.explanation}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Constraints */}
                  {details.question?.constraints && details.question.constraints.length > 0 && (
                    <div className="bg-slate-950/40 border border-white/5 p-5 rounded-2xl space-y-2">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Constraints
                      </h4>
                      <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300 font-mono">
                        {details.question.constraints.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "latest" && (
                <div className="space-y-6">
                  {details.latestSubmission ? (
                    <>
                      {/* Stats Scorecard */}
                      <div className="grid grid-cols-4 gap-4">
                        <div className="bg-slate-950/40 border border-white/5 p-3 rounded-xl text-center">
                          <span className="text-[10px] text-slate-500 font-bold block uppercase">Score</span>
                          <span className="text-sm font-black text-white">{details.latestSubmission.score}/100</span>
                        </div>
                        <div className="bg-slate-950/40 border border-white/5 p-3 rounded-xl text-center">
                          <span className="text-[10px] text-slate-500 font-bold block uppercase">Status</span>
                          <span
                            className={`text-[10px] font-bold block uppercase mt-0.5 ${
                              details.latestSubmission.status === "passed"
                                ? "text-emerald-400"
                                : details.latestSubmission.status === "partial"
                                  ? "text-amber-400"
                                  : "text-red-400"
                            }`}
                          >
                            {details.latestSubmission.status === "passed"
                              ? "Accepted"
                              : details.latestSubmission.status === "partial"
                                ? "Partial"
                                : "Failed"}
                          </span>
                        </div>
                        <div className="bg-slate-950/40 border border-white/5 p-3 rounded-xl text-center">
                          <span className="text-[10px] text-slate-500 font-bold block uppercase">Confidence</span>
                          <span className="text-sm font-black text-indigo-400">{details.latestSubmission.confidence}%</span>
                        </div>
                        <div className="bg-slate-950/40 border border-white/5 p-3 rounded-xl text-center">
                          <span className="text-[10px] text-slate-500 font-bold block uppercase">Test Cases</span>
                          <span className="text-sm font-black text-cyan-400">
                            {details.latestSubmission.testCasesPassed}/{details.latestSubmission.totalTestCases || 15}
                          </span>
                        </div>
                      </div>

                      {/* AI Disclaimer Banner */}
                      <div className="flex items-start gap-2.5 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-left text-xs text-amber-300">
                        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <span className="font-bold text-white block">AI Estimated Evaluation</span>
                          <span>This review was generated using AI analysis.</span>
                        </div>
                      </div>

                      {/* Code block */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Submitted Code ({details.latestSubmission.language})
                        </h4>
                        <pre className="p-4 bg-slate-950 rounded-xl text-slate-300 font-mono text-xs overflow-x-auto select-text whitespace-pre-wrap border border-white/5">
                          {details.latestSubmission.code}
                        </pre>
                      </div>

                      {/* Feedback */}
                      <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl space-y-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          AI Feedback
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                          {details.latestSubmission.feedback}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-slate-500 italic text-sm">
                      No submissions recorded yet for this question.
                    </div>
                  )}
                </div>
              )}

              {activeTab === "history" && (
                <div className="space-y-6">
                  {details.submissions && details.submissions.length > 0 ? (
                    <div className="relative border-l border-white/10 ml-4 pl-6 space-y-6">
                      {details.submissions.map((sub, idx) => (
                        <div key={sub._id} className="relative text-left">
                          <div
                            className={`absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-[#080e24] ${
                              sub.status === "passed"
                                ? "bg-emerald-500"
                                : sub.status === "partial"
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                            }`}
                          />
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-white">
                              Attempt #{details.submissions.length - idx} &bull;{" "}
                              {new Date(sub.submittedAt || sub.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </p>
                            <div className="text-[10px] text-slate-400 flex items-center gap-2">
                              <span>Score: {sub.score}/100</span>
                              <span>&bull;</span>
                              <span>Language: {sub.language}</span>
                              <span>&bull;</span>
                              <span
                                className={
                                  sub.status === "passed"
                                    ? "text-emerald-400"
                                    : sub.status === "partial"
                                      ? "text-amber-400"
                                      : "text-red-400"
                                }
                              >
                                {sub.status === "passed"
                                  ? "Accepted"
                                  : sub.status === "partial"
                                    ? "Partial"
                                    : "Failed"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500 italic text-sm">
                      No attempts recorded.
                    </div>
                  )}
                </div>
              )}

              {activeTab === "score" && (
                <div className="space-y-4">
                  {details.scoreTrend && details.scoreTrend.length > 0 ? (
                    <>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
                        Score Improvement over attempts
                      </h4>
                      <div className="h-[240px] w-full bg-slate-950/30 border border-white/5 p-4 rounded-2xl">
                        <ResponsiveContainer width="100%" height="100%">
                          <ReChartsLineChart data={details.scoreTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis 
                              dataKey="attempt" 
                              stroke="#64748b" 
                              fontSize={10} 
                              tickLine={false} 
                              tickFormatter={(tick) => `Attempt ${tick}`}
                            />
                            <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[0, 100]} />
                            <Tooltip
                              contentStyle={{
                                background: "#0b1329",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "8px"
                              }}
                              labelFormatter={(label) => `Attempt ${label}`}
                            />
                            <Line
                              type="monotone"
                              dataKey="score"
                              stroke="#6366f1"
                              strokeWidth={3}
                              dot={{ r: 4, stroke: "#6366f1", strokeWidth: 2, fill: "#080e24" }}
                              activeDot={{ r: 6 }}
                            />
                          </ReChartsLineChart>
                        </ResponsiveContainer>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-slate-500 italic text-sm">
                      Omit score trend graph since no scores are recorded.
                    </div>
                  )}
                </div>
              )}

              {activeTab === "feedback" && (
                <div className="space-y-4">
                  {details.feedbackTimeline && details.feedbackTimeline.length > 0 ? (
                    <div className="space-y-4">
                      {details.feedbackTimeline.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-white/[0.02] border border-white/5 p-4 rounded-xl text-left space-y-2"
                        >
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-white">
                              Attempt #{idx + 1} &bull; {item.date}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                item.status === "passed"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : item.status === "partial"
                                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                              }`}
                            >
                              Score: {item.score}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed font-sans">
                            {item.feedback || "No feedback logged."}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500 italic text-sm">
                      No feedback logs available.
                    </div>
                  )}
                </div>
              )}

              {activeTab === "best" && (
                <div className="space-y-4">
                  {details.bestSubmission ? (
                    <>
                      <div className="flex justify-between items-center bg-slate-900 px-4 py-2 border border-white/5 rounded-xl text-xs">
                        <span className="text-slate-400">
                          Highest Score Achieved:{" "}
                          <strong className="text-white">
                            {details.bestSubmission.score}/100
                          </strong>
                        </span>
                        <span className="text-slate-400 font-mono text-[10px] uppercase">
                          Language: {details.bestSubmission.language}
                        </span>
                      </div>
                      <pre className="p-4 bg-slate-950 rounded-xl text-slate-300 font-mono text-xs overflow-x-auto select-text whitespace-pre-wrap border border-white/5">
                        {details.bestSubmission.code}
                      </pre>
                    </>
                  ) : (
                    <div className="text-center py-12 text-slate-500 italic text-sm">
                      No submissions recorded.
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default DetailedReportDrawer;
