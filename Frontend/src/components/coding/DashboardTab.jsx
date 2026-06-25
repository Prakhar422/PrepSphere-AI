import React, { useMemo } from "react";
import { Play, LineChart, Sparkles, Loader2 } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";
import StatsCards from "./StatsCards";
import RecentActivity from "./RecentActivity";
import ContinuePracticeCard from "./ContinuePracticeCard";

const DashboardTab = ({
  analyticsData,
  dashboardData,
  loading = false,
  onStartPracticing,
  onViewHistory,
  onViewAnalytics,
  onContinuePractice
}) => {
  // Safe extraction of metrics
  const stats = useMemo(() => {
    if (analyticsData) {
      return {
        solvedCount: analyticsData.totalQuestionsSolved || 0,
        totalSubmissions: analyticsData.totalSubmissions || 0,
        successRate: analyticsData.acceptanceRate || 0,
        streak: analyticsData.currentStreak || 0
      };
    }
    if (dashboardData && dashboardData.stats) {
      return {
        solvedCount: dashboardData.stats.solvedCount || 0,
        totalSubmissions: dashboardData.stats.totalSubmissions || 0,
        successRate: dashboardData.stats.likelyAcceptanceRate || 0,
        streak: dashboardData.stats.streak || 0
      };
    }
    return { solvedCount: 0, totalSubmissions: 0, successRate: 0, streak: 0 };
  }, [analyticsData, dashboardData]);

  // Find the last attempted question q
  const lastAttemptedQuestion = useMemo(() => {
    if (!dashboardData || !dashboardData.questions || dashboardData.questions.length === 0) return null;
    const attemptedOrSolved = dashboardData.questions.filter(
      q => q.status === "attempted" || q.status === "solved"
    );
    if (attemptedOrSolved.length === 0) return null;
    return [...attemptedOrSolved].sort((a, b) => {
      const dateA = new Date(a.lastSolvedAt || a.updatedAt || a.createdAt);
      const dateB = new Date(b.lastSolvedAt || b.updatedAt || b.createdAt);
      return dateB - dateA;
    })[0];
  }, [dashboardData]);

  // Group Difficulty Distribution
  const difficultyChartData = useMemo(() => {
    const rawDist = analyticsData?.difficultyDistribution || dashboardData?.problemDifficultyChartData || [];
    const counts = { Easy: 0, Medium: 0, Hard: 0 };
    rawDist.forEach(item => {
      if (counts[item.name] !== undefined) {
        counts[item.name] = item.count || item.value || 0;
      }
    });
    return [
      { name: "Easy", value: counts.Easy, color: "#10B981" },
      { name: "Medium", value: counts.Medium, color: "#F59E0B" },
      { name: "Hard", value: counts.Hard, color: "#EF4444" }
    ];
  }, [analyticsData, dashboardData]);

  // Group Topic Distribution: filter out zero counts and sort descending
  const topicChartData = useMemo(() => {
    const rawDist = analyticsData?.categoryDistribution || dashboardData?.problemCategoriesChartData || [];
    const list = rawDist
      .map(item => ({
        name: item.name,
        count: item.count || item.value || 0
      }))
      .filter(item => item.count > 0);
    
    list.sort((a, b) => b.count - a.count);
    return list;
  }, [analyticsData, dashboardData]);

  // Compute maxValue for the XAxis ticks sizing
  const maxTopicValue = useMemo(() => {
    if (topicChartData.length === 0) return 0;
    return Math.max(...topicChartData.map(d => d.count), 0);
  }, [topicChartData]);

  const recentSubmissions = dashboardData?.recentActivity || [];

  if (loading) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm text-slate-400 font-mono">Loading dashboard summary...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      {/* HERO SECTION */}
      <section className="relative rounded-3xl border border-white/10 bg-slate-950/20 backdrop-blur-xl p-6 sm:p-8 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-1.5 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-xs text-indigo-400 font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>PrepSphere Coding Companion</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Coding Journey
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
            Track your coding progress, master data structures and algorithms, and prepare for top-tier technical interviews.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={onStartPracticing}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white text-sm font-bold cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              Start Practicing
            </button>
            <button
              onClick={onViewHistory}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] hover:border-white/15 text-white text-sm font-semibold cursor-pointer transition-all"
            >
              <LineChart className="w-4 h-4 text-indigo-400" />
              View History
            </button>
            <button
              onClick={onViewAnalytics}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] hover:border-white/15 text-white text-sm font-semibold cursor-pointer transition-all"
            >
              <LineChart className="w-4 h-4 text-purple-400" />
              View Analytics
            </button>
          </div>
        </div>
      </section>

      {/* METRIC SCORECARDS */}
      <StatsCards
        solvedCount={stats.solvedCount}
        totalSubmissions={stats.totalSubmissions}
        successRate={stats.successRate}
        streak={stats.streak}
      />

      {/* TWO-COLUMN CONTENT GRID */}
      <div className="space-y-8">
        {/* Charts Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Difficulty Chart */}
          <div className="bg-slate-950/40 border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-lg space-y-4">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent pointer-events-none" />
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Difficulty Breakdown
            </h3>
            
            {difficultyChartData.some(d => d.value > 0) ? (
              <>
                <div className="h-[180px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={difficultyChartData.filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {difficultyChartData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "#080e24",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "8px"
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Chart Legend */}
                <div className="flex justify-center gap-4 text-xs font-bold">
                  {difficultyChartData.map((d, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-slate-400">{d.name}:</span>
                      <span className="text-white font-mono">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[210px] flex flex-col items-center justify-center text-center p-4">
                <span className="text-slate-500 text-xs italic">No difficulty metrics. Solve a question to generate breakdown.</span>
              </div>
            )}
          </div>

          {/* Topic Chart */}
          <div className="bg-slate-950/40 border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-lg space-y-4">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent pointer-events-none" />
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Topic Breakdown
            </h3>

            {topicChartData.length > 0 ? (
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topicChartData} layout="vertical" margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis
                      type="number"
                      stroke="#64748b"
                      fontSize={9}
                      tickLine={false}
                      allowDecimals={false}
                      tickCount={Math.max(maxTopicValue + 1, 5)}
                      domain={[0, 'dataMax']}
                    />
                    <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={9} tickLine={false} width={85} />
                    <Tooltip
                      contentStyle={{
                        background: "#080e24",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px"
                      }}
                    />
                    <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[180px] flex flex-col items-center justify-center text-center p-4">
                <span className="text-slate-500 text-xs italic">No topic metrics. Solve a question to generate breakdown.</span>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity and Continue Practice Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className={lastAttemptedQuestion ? "lg:col-span-8 flex flex-col animate-none" : "lg:col-span-12 flex flex-col animate-none"}>
            <RecentActivity activities={recentSubmissions} onContinueSolving={onContinuePractice} />
          </div>
          {lastAttemptedQuestion && (
            <div className="lg:col-span-4 flex flex-col animate-none">
              <ContinuePracticeCard question={lastAttemptedQuestion} onContinue={onContinuePractice} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
