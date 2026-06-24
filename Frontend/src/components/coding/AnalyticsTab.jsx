import React, { useState, useEffect } from "react";
import {
  Brain,
  Code2,
  Bookmark,
  Star,
  Target,
  Flame,
  Clock,
  Activity,
  Award,
  TrendingUp,
  Briefcase,
  Layers,
  Sparkles,
  Info,
  Calendar,
  Loader2
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";

// Count-up animation helper
const AnimatedNumber = ({ value, duration = 1200 }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value, 10) || 0;
    if (end === 0) {
      setCurrent(0);
      return;
    }
    const totalSteps = 40;
    const increment = end / totalSteps;
    const stepTime = duration / totalSteps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      start += increment;
      if (step >= totalSteps) {
        clearInterval(timer);
        setCurrent(end);
      } else {
        setCurrent(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <>{current.toLocaleString()}</>;
};

const AnalyticsTab = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm text-slate-400 font-mono">Loading practice analytics...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-slate-950/40 border border-white/10 rounded-3xl p-16 text-center space-y-4 max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
          <Activity className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-white">No analytics details recorded.</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-light">
            Start practicing problems to track metrics like streaks, category masteries, and score improvement trends.
          </p>
        </div>
      </div>
    );
  }

  // Color schemes
  const COLORS_DIFFICULTY = {
    Easy: "#10b981",
    Medium: "#f59e0b",
    Hard: "#ef4444"
  };

  const COLORS_GENERIC = [
    "#6366f1",
    "#a855f7",
    "#ec4899",
    "#06b6d4",
    "#10b981",
    "#f59e0b",
    "#3b82f6",
    "#14b8a6",
    "#8b5cf6"
  ];

  // Prep Difficulty Distribution for Pie Chart
  const pieDifficultyData = (data.difficultyDistribution || []).map(item => ({
    name: item.name,
    value: item.count,
    color: COLORS_DIFFICULTY[item.name] || "#6366f1"
  }));

  // Prep Language Distribution for Pie Chart
  const pieLanguageData = (data.languageDistribution || []).map((item, idx) => ({
    name: item.name,
    value: item.count,
    color: COLORS_GENERIC[idx % COLORS_GENERIC.length]
  }));

  // Prep Category Distribution for Horizontal Bar Chart
  const barCategoryData = (data.categoryDistribution || []).map((item, idx) => ({
    name: item.name,
    count: item.count,
    fill: COLORS_GENERIC[idx % COLORS_GENERIC.length]
  }));

  return (
    <div className="space-y-8 text-left">
      {/* GRID WIDGETS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Streak widgets */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:border-indigo-500/25 transition-all">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Streaks</span>
            <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
              <Flame className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">
              <AnimatedNumber value={data.currentStreak} />
            </span>
            <span className="text-xs text-slate-400 font-mono">Current /</span>
            <span className="text-sm font-bold text-orange-400 font-mono">{data.longestStreak} max</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            <span>Consecutive unique practice days</span>
          </div>
        </div>

        {/* Problems Attempted vs Solved */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/25 transition-all">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Solved Problems</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400">
              <AnimatedNumber value={data.totalQuestionsSolved} />
            </span>
            <span className="text-xs text-slate-400 font-mono">/ <AnimatedNumber value={data.totalQuestionsAttempted} /> attempted</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            <span>Overall solved vs attempted questions</span>
          </div>
        </div>

        {/* Acceptance & Score */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:border-cyan-500/25 transition-all">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Acceptance &amp; Score</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">
              <AnimatedNumber value={data.acceptanceRate} />%
            </span>
            <span className="text-xs text-slate-400 font-mono">Avg Score:</span>
            <span className="text-sm font-bold text-indigo-400 font-mono">{data.averageScore}</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex justify-between">
            <span>High Score: {data.highestScore}</span>
            <span>Total: {data.totalSubmissions} attempts</span>
          </div>
        </div>

        {/* Bookmarks & Generated today */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:border-pink-500/25 transition-all">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bookmarked &amp; Daily</span>
            <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">
              <AnimatedNumber value={data.questionsBookmarked} />
            </span>
            <span className="text-xs text-slate-400 font-mono">saved /</span>
            <span className="text-sm font-bold text-white font-mono">{data.questionsGeneratedToday} today</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            <span>Total Generated: {data.totalQuestionsGenerated}</span>
          </div>
        </div>
      </div>

      {/* Favorites & Consistency Info Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Favorites Card */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 relative overflow-hidden text-left shadow-md">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Practice Favorites
          </h4>
          <div className="space-y-3.5 text-xs text-slate-300">
            <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-white/5">
              <span className="text-slate-500 font-semibold">Topic</span>
              <span className="font-bold text-white text-right">{data.favoriteTopic}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-white/5">
              <span className="text-slate-500 font-semibold">Company</span>
              <span className="font-bold text-white text-right">{data.favoriteCompany}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-white/5">
              <span className="text-slate-500 font-semibold">Language</span>
              <span className="font-bold text-indigo-400 text-right">{data.favoriteLanguage}</span>
            </div>
          </div>
        </div>

        {/* Efficiency Card */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 relative overflow-hidden text-left shadow-md">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Consistency Metrics
          </h4>
          <div className="space-y-3.5 text-xs text-slate-300">
            <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-white/5">
              <span className="text-slate-500 font-semibold">Most Active Day</span>
              <span className="font-bold text-white text-right">{data.mostActiveDay}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-white/5">
              <span className="text-slate-500 font-semibold">Least Active Day</span>
              <span className="font-bold text-white text-right">{data.leastActiveDay}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-white/5">
              <span className="text-slate-500 font-semibold">Submissions / Day</span>
              <span className="font-bold text-indigo-400 text-right font-mono">{data.averageSubmissionsPerDay}</span>
            </div>
          </div>
        </div>

        {/* Milestones / Slogan */}
        <div className="bg-indigo-950/10 border border-indigo-500/20 rounded-2xl p-5 relative overflow-hidden text-left flex flex-col justify-between shadow-md">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full" />
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Practice Insights
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-light font-sans pt-1">
              "Consistency is the secret to mastering programming interfaces. Solve at least one DSA challenge every day to expand your algorithmic toolkit."
            </p>
          </div>
          <div className="pt-2 text-[10px] text-indigo-300/60 font-semibold font-mono uppercase tracking-wider">
            PrepSphere AI algorithms Team
          </div>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Consistency Area Chart */}
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left shadow-lg">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            Weekly Practice Consistency
          </h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.weeklyPractice} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWeekly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "#080e24",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px"
                  }}
                  itemStyle={{ color: "#fff" }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Submissions"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorWeekly)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Progress Line Chart */}
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left shadow-lg">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-400" />
            Monthly Progress (Submissions / Day)
          </h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyPractice} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "#080e24",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px"
                  }}
                  itemStyle={{ color: "#fff" }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Submissions"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score Improvement Trend Line Chart */}
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left shadow-lg">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Score Improvement Trend (Highest Score)
          </h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.scoreImprovementTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    background: "#080e24",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px"
                  }}
                  itemStyle={{ color: "#fff" }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Max Score"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Problem Categories Horizontal Bar Chart */}
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left shadow-lg">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Solved by Topic Categories
          </h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={barCategoryData} margin={{ top: 10, right: 10, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} width={100} />
                <Tooltip
                  contentStyle={{
                    background: "#080e24",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px"
                  }}
                  itemStyle={{ color: "#fff" }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={8}>
                  {barCategoryData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Solved by Difficulty Pie Chart */}
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left shadow-lg">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            Solved by Difficulty
          </h3>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="h-[150px] w-[150px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      background: "#080e24",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px"
                    }}
                  />
                  <Pie
                    data={pieDifficultyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieDifficultyData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2 text-xs text-slate-300 w-full">
              {pieDifficultyData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-medium text-slate-300">{item.name}</span>
                  </div>
                  <span className="font-mono font-bold text-white">{item.value} submissions</span>
                </div>
              ))}
              {pieDifficultyData.length === 0 && (
                <div className="text-slate-500 italic">No difficulty stats.</div>
              )}
            </div>
          </div>
        </div>

        {/* Language Usage Pie Chart */}
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left shadow-lg">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-indigo-400" />
            Programming Languages Usage
          </h3>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="h-[150px] w-[150px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      background: "#080e24",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px"
                    }}
                  />
                  <Pie
                    data={pieLanguageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieLanguageData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2 text-xs text-slate-300 w-full">
              {pieLanguageData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-medium text-slate-300">{item.name}</span>
                  </div>
                  <span className="font-mono font-bold text-white">{item.value} submissions</span>
                </div>
              ))}
              {pieLanguageData.length === 0 && (
                <div className="text-slate-500 italic">No language stats.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVITY TIMELINE */}
      <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left shadow-lg">
        <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-indigo-400" />
          Coding Journey Activities Feed
        </h3>

        <div className="relative border-l border-white/5 ml-3 pl-5 space-y-6">
          {(!data.recentActivities || data.recentActivities.length === 0) ? (
            <p className="text-xs text-slate-500 italic py-4">No recent activities logs.</p>
          ) : (
            data.recentActivities.map((act, idx) => (
              <div key={idx} className="relative text-left text-xs sm:text-sm">
                <div
                  className={`absolute -left-[26px] top-1 w-2.5 h-2.5 rounded-full border border-[#050B1F] ${act.color || "bg-indigo-500"}`}
                />
                <div className="space-y-0.5">
                  <p className="font-bold text-white leading-relaxed">
                    {act.text}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-400 font-mono">
                    {act.time}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;
