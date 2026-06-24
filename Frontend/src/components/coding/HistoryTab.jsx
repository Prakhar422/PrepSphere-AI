import React from "react";
import {
  Search,
  Star,
  Bookmark,
  Calendar,
  Clock,
  Code2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  HelpCircle,
  Loader2
} from "lucide-react";

const HistoryTab = ({
  questions,
  totalPages,
  currentPage,
  totalResults,
  loading,
  onPageChange,
  onViewDetails,
  onToggleBookmark,

  search,
  setSearch,
  company,
  setCompany,
  topic,
  setTopic,
  difficulty,
  setDifficulty,
  status,
  setStatus,
  language,
  setLanguage,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  bookmarkedOnly,
  setBookmarkedOnly,
  onClearFilters
}) => {
  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Not Solved";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <div className="space-y-6 text-left">
      {/* Filters Row */}
      <div className="bg-slate-950/40 border border-white/10 rounded-3xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search bar */}
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, description, company..."
              className="w-full bg-slate-950/50 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500/40 placeholder-slate-600"
            />
          </div>

          {/* Company Filter */}
          <div>
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-indigo-500/40"
            >
              <option value="all">All Companies</option>
              {["Google", "Microsoft", "Amazon", "Adobe", "Atlassian", "TCS", "Infosys"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Topic Filter */}
          <div>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-indigo-500/40"
            >
              <option value="all">All Topics</option>
              {["Arrays", "Strings", "Linked Lists", "Trees", "Graphs", "Dynamic Programming", "Binary Search", "Sliding Window", "Heap", "Greedy"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-indigo-500/40"
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          {/* Status Filter */}
          <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-indigo-500/40"
            >
              <option value="all">All Statuses</option>
              <option value="generated">Generated</option>
              <option value="attempted">Attempted</option>
              <option value="solved">Solved</option>
            </select>
          </div>

          {/* Language Filter */}
          <div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-indigo-500/40"
            >
              <option value="all">All Languages</option>
              <option value="C++">C++</option>
              <option value="Java">Java</option>
              <option value="Python">Python</option>
              <option value="JavaScript">JavaScript</option>
            </select>
          </div>

          {/* Date Picker Range */}
          <div className="flex items-center gap-2 col-span-1 lg:col-span-2">
            <div className="flex-1 flex items-center bg-slate-950/50 border border-white/5 rounded-xl px-3 py-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500 mr-2" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-xs sm:text-sm text-slate-300 focus:outline-none w-full"
                placeholder="Start Date"
              />
            </div>
            <span className="text-slate-600 text-xs">to</span>
            <div className="flex-1 flex items-center bg-slate-950/50 border border-white/5 rounded-xl px-3 py-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500 mr-2" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-xs sm:text-sm text-slate-300 focus:outline-none w-full"
                placeholder="End Date"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-white/5">
          {/* Bookmarked toggle */}
          <button
            onClick={() => setBookmarkedOnly(!bookmarkedOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-xs font-bold cursor-pointer ${
              bookmarkedOnly
                ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            <Star className={`w-4 h-4 ${bookmarkedOnly ? "fill-yellow-400" : ""}`} />
            <span>Bookmarked Only</span>
          </button>

          <button
            onClick={onClearFilters}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-bold transition-all cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Questions list container */}
      {loading ? (
        <div className="h-[200px] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm text-slate-400 font-mono">Filtering questions...</p>
        </div>
      ) : questions.length === 0 ? (
        /* Empty states */
        <div className="bg-slate-950/40 border border-white/10 rounded-3xl p-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
            <Bookmark className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">
              {bookmarkedOnly ? "No bookmarked questions." : "No questions found."}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
              {bookmarkedOnly
                ? "Bookmark questions in practice or history cards to view them here."
                : "Try relaxing your search terms or filter constraints."}
            </p>
          </div>
        </div>
      ) : (
        /* Cards Grid */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {questions.map((q) => (
              <div
                key={q._id}
                className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 text-left relative overflow-hidden group hover:border-indigo-500/25 transition-all flex flex-col justify-between"
              >
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent" />

                {/* Card Title & Bookmark */}
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-sm sm:text-base font-extrabold text-white leading-snug group-hover:text-indigo-400 transition-colors truncate w-4/5">
                      {q.title}
                    </h4>
                    <button
                      onClick={() => onToggleBookmark(q._id)}
                      className="text-slate-500 hover:text-yellow-400 transition-colors p-1"
                    >
                      <Star className={`w-4 h-4 ${q.isBookmarked ? "text-yellow-400 fill-yellow-400" : ""}`} />
                    </button>
                  </div>

                  {/* Company & Role */}
                  <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                    <span className="text-slate-300 font-semibold">{q.company || "N/A"}</span>
                    <span>&bull;</span>
                    <span className="font-light">{q.role || "N/A"}</span>
                  </div>

                  {/* Badges row */}
                  <div className="flex flex-wrap gap-1.5 text-[9px] font-bold">
                    <span
                      className={`px-2 py-0.5 rounded border uppercase tracking-wider ${
                        q.difficulty === "Easy"
                          ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                          : q.difficulty === "Medium"
                            ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                            : "text-red-400 bg-red-500/10 border-red-500/20"
                      }`}
                    >
                      {q.difficulty}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                      {q.topic}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 font-mono">
                      {q.language}
                    </span>
                  </div>
                </div>

                {/* Stats & Details CTA */}
                <div className="mt-5 pt-4 border-t border-white/5 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1 text-left">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">Attempts</span>
                      <span className="font-mono text-slate-300 font-extrabold">{q.attemptCount || 0}</span>
                    </div>
                    <div className="space-y-1 text-left">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">Best Score</span>
                      <span className="font-mono text-slate-300 font-extrabold">{q.bestScore !== undefined && q.bestScore !== null ? `${q.bestScore}%` : "N/A"}</span>
                    </div>
                    <div className="space-y-1 text-left">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">Last Attempt</span>
                      <span className="text-slate-300 font-medium">{formatDate(q.latestSubmissionDate)}</span>
                    </div>
                    <div className="space-y-1 text-left">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">Last Solved</span>
                      <span className="text-slate-300 font-medium">{formatDate(q.lastSolvedAt)}</span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => onViewDetails(q._id)}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-bold transition-all cursor-pointer"
                    >
                      <span>View Details & Timeline</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-white/5">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer text-slate-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs text-slate-400 font-mono font-bold">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer text-slate-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryTab;
