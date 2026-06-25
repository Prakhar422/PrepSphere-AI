import React from "react";
import { CheckCircle2, Code2, Award, Flame } from "lucide-react";

const StatsCards = ({ solvedCount = 0, totalSubmissions = 0, successRate = 0, streak = 0 }) => {
  const cards = [
    {
      title: "Problems Solved",
      value: solvedCount,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bgGradient: "from-emerald-500/10 to-transparent",
      borderColor: "border-emerald-500/20",
    },
    {
      title: "Total Submissions",
      value: totalSubmissions,
      icon: Code2,
      color: "text-blue-400",
      bgGradient: "from-blue-500/10 to-transparent",
      borderColor: "border-blue-500/20",
    },
    {
      title: "Success Rate",
      value: `${successRate}%`,
      icon: Award,
      color: "text-purple-400",
      bgGradient: "from-purple-500/10 to-transparent",
      borderColor: "border-purple-500/20",
    },
    {
      title: "Current Streak",
      value: `${streak} Day${streak === 1 ? "" : "s"}`,
      icon: Flame,
      color: "text-amber-500",
      bgGradient: "from-amber-500/10 to-transparent",
      borderColor: "border-amber-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className={`relative bg-gradient-to-br ${card.bgGradient} bg-slate-950/40 border ${card.borderColor} rounded-2xl p-5 overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] group`}
          >
            {/* Background spotlight */}
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/[0.01] blur-md pointer-events-none group-hover:bg-white/[0.02] transition-all" />

            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block">
                  {card.title}
                </span>
                <span className="text-2xl sm:text-3xl font-black text-white leading-none block font-mono">
                  {card.value}
                </span>
              </div>
              <div className={`p-2.5 rounded-xl bg-white/[0.02] border border-white/5 ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
