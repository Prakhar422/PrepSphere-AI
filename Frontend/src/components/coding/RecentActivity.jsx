import React from "react";
import { Play, HelpCircle } from "lucide-react";

const RecentActivity = ({ activities = [], onContinueSolving }) => {
  // Clean question name from log prefix
  const cleanTitle = (text = "") => {
    return text.replace("Submitted solution for ", "").replace("Improved score on ", "");
  };

  const getStatusColor = (verdict = "") => {
    const v = verdict.toLowerCase();
    if (v.includes("accept") || v === "passed") return "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
    if (v.includes("partial")) return "text-amber-400 border-amber-500/20 bg-amber-500/5";
    return "text-red-400 border-red-500/20 bg-red-500/5";
  };

  const getDifficultyColor = (difficulty = "Medium") => {
    switch (difficulty) {
      case "Easy":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "Medium":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "Hard":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      default:
        return "text-slate-400 bg-white/5 border-white/10";
    }
  };

  const displayList = activities.slice(0, 5);

  return (
    <div className="bg-slate-950/40 border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-lg space-y-5 text-left">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent pointer-events-none" />
      
      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
        Recent Activity
      </h3>

      {displayList.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-xs italic">
          No recent coding activity found. Start practicing to see logs!
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {displayList.map((act, i) => {
            const title = cleanTitle(act.text);
            const questionId = act.questionId || (act.question?._id || act.question);

            return (
              <div
                key={i}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0 group transition-all"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-400 transition-colors truncate max-w-[240px]">
                      {title}
                    </h4>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${getDifficultyColor(act.difficulty)}`}>
                      {act.difficulty || "Medium"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-slate-400 font-semibold font-mono">
                    <span>Score: {act.score !== undefined ? `${act.score}/100` : "N/A"}</span>
                    <span>&bull;</span>
                    <span>{act.time}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusColor(act.verdict)}`}>
                    {act.verdict || "Submitted"}
                  </span>
                  
                  {questionId && (
                    <button
                      onClick={() => onContinueSolving(questionId)}
                      className="p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-bold transition-all cursor-pointer"
                      title="Continue Solving"
                    >
                      <Play className="w-3.5 h-3.5 fill-indigo-400" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
