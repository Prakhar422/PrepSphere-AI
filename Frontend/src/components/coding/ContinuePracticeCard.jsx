import React from "react";
import { ArrowRight, BookOpen, Clock, Tag, Building2 } from "lucide-react";

const ContinuePracticeCard = ({ question, onContinue }) => {
  if (!question) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-slate-950/40 border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-lg text-left flex flex-col justify-between h-full min-h-[220px]">
      {/* Glow elements */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-indigo-500/5 blur-xl pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent pointer-events-none" />

      <div className="space-y-4">
        <div className="inline-flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
          <Clock className="w-3 h-3" />
          <span>Resume Practice</span>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-black text-white leading-snug truncate">
            {question.title}
          </h3>
          
          <div className="grid grid-cols-1 gap-2.5 pt-1.5 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
              <span>Company: <strong className="text-slate-300 font-semibold">{question.company || "N/A"}</strong></span>
            </div>
            
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-slate-500 shrink-0" />
              <span>Topic: <strong className="text-slate-300 font-semibold">{question.topic || "N/A"}</strong></span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500 shrink-0" />
              <span>Last Solved/Attempted: <strong className="text-slate-300 font-semibold">{formatDate(question.lastSolvedAt || question.updatedAt || question.createdAt)}</strong></span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-5">
        <button
          onClick={() => onContinue(question)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 border border-indigo-400/20 text-white text-xs sm:text-sm font-bold transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
        >
          <span>Continue Practice</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ContinuePracticeCard;
