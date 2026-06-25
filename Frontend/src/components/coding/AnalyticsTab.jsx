import React, { useState, useEffect, useMemo } from "react";
import {
  Code2,
  Target,
  Flame,
  Award,
  Calendar,
  Activity,
  Layers,
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

// Custom Axis Tick for rendering multi-word labels vertically
const CustomXAxisTick = ({ x, y, payload }) => {
  if (!payload || !payload.value) return null;
  const words = payload.value.split(" ");
  return (
    <text x={x} y={y + 10} textAnchor="middle" fill="#64748b" fontSize={9} className="font-sans font-medium">
      {words.map((word, index) => (
        <tspan key={index} x={x} dy={index === 0 ? 0 : "1.2em"}>
          {word}
        </tspan>
      ))}
    </text>
  );
};

// Custom Marker Dot for Area Chart that hides dots for zero values
const CustomDot = (props) => {
  const { cx, cy, value } = props;
  if (!value || value === 0) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      stroke="#a855f7"
      strokeWidth={2}
      fill="#080e24"
    />
  );
};

const ALL_CATEGORIES = [
  "Arrays", "Strings", "Linked Lists", "Stack", "Queue", "Trees", "Graphs", 
  "Greedy", "Dynamic Programming", "Recursion", "Binary Search", "Hashing", 
  "Heap", "Backtracking", "Bit Manipulation", "Math", "Sliding Window", "Two Pointer"
];

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

const AnalyticsTab = ({ data, dashboardData, loading }) => {
  if (loading) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm text-slate-400 font-mono">Loading coding analytics...</p>
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

  // 1. Stats Cards data
  const statsCards = [
    {
      title: "Total Problems Solved",
      value: data.totalQuestionsSolved || 0,
      suffix: "",
      subtitle: "Lifetime problems solved",
      icon: Target,
      accentColor: "blue",
      textGradient: "from-blue-400 to-indigo-400",
      subtitleColorClass: "text-blue-400",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-400"
    },
    {
      title: "Total Submissions",
      value: data.totalSubmissions || 0,
      suffix: "",
      subtitle: "Evaluation runs submitted",
      icon: Code2,
      accentColor: "purple",
      textGradient: "from-indigo-400 to-purple-400",
      subtitleColorClass: "text-purple-400",
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-400"
    },
    {
      title: "Acceptance Rate",
      value: data.acceptanceRate || 0,
      suffix: "%",
      subtitle: "Average success percentage",
      icon: Award,
      accentColor: "cyan",
      textGradient: "from-cyan-400 to-blue-400",
      subtitleColorClass: "text-cyan-400",
      iconBg: "bg-cyan-500/10",
      iconColor: "text-cyan-400"
    },
    {
      title: "Current Streak",
      value: data.currentStreak || 0,
      suffix: (data.currentStreak || 0) === 1 ? " Day" : " Days",
      subtitle: "Consecutive practice days",
      icon: Flame,
      accentColor: "pink",
      textGradient: "from-purple-400 to-pink-400",
      subtitleColorClass: "text-pink-400",
      iconBg: "bg-pink-500/10",
      iconColor: "text-pink-400"
    }
  ];

  // 2. Prep Difficulty Distribution for Pie Chart
  const pieDifficultyData = useMemo(() => {
    const rawDist = data.difficultyDistribution || [];
    const counts = { Easy: 0, Medium: 0, Hard: 0 };
    rawDist.forEach(item => {
      if (counts[item.name] !== undefined) {
        counts[item.name] = item.count || item.value || 0;
      }
    });
    return [
      { name: "Easy", value: counts.Easy, color: COLORS_DIFFICULTY.Easy },
      { name: "Medium", value: counts.Medium, color: COLORS_DIFFICULTY.Medium },
      { name: "Hard", value: counts.Hard, color: COLORS_DIFFICULTY.Hard }
    ];
  }, [data.difficultyDistribution]);

  const totalSolvedDifficulty = useMemo(() => {
    return pieDifficultyData.reduce((acc, curr) => acc + curr.value, 0);
  }, [pieDifficultyData]);

  // Prep Category Distribution for exactly 10 target categories
  const barCategoryData = useMemo(() => {
    const rawDist = data.categoryDistribution || [];
    const categoriesOrder = [
      "Arrays",
      "Strings",
      "Linked Lists",
      "Trees",
      "Graphs",
      "Dynamic Programming",
      "Binary Search",
      "Sliding Window",
      "Heap",
      "Greedy"
    ];

    const counts = {
      "Arrays": 0,
      "Strings": 0,
      "Linked Lists": 0,
      "Trees": 0,
      "Graphs": 0,
      "Dynamic Programming": 0,
      "Binary Search": 0,
      "Sliding Window": 0,
      "Heap": 0,
      "Greedy": 0
    };

    rawDist.forEach(item => {
      let name = item.name;
      if (name === "Linked List") name = "Linked Lists";
      const val = item.count || item.value || 0;

      if (counts[name] !== undefined) {
        counts[name] += val;
      }
    });

    return categoriesOrder.map((name, idx) => ({
      name,
      count: counts[name],
      fill: COLORS_GENERIC[idx % COLORS_GENERIC.length]
    }));
  }, [data.categoryDistribution]);

  const maxCategoryValue = useMemo(() => {
    if (barCategoryData.length === 0) return 0;
    return Math.max(...barCategoryData.map(d => d.count), 0);
  }, [barCategoryData]);

  // 3. Weekly Practice Sorted Chronologically (Mon - Sun)
  const weeklyPracticeSorted = useMemo(() => {
    const rawWeekly = data.weeklyPractice || [];
    const daysOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const countsMap = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    
    rawWeekly.forEach(item => {
      const dayName = item.name || item.day;
      if (dayName && countsMap[dayName] !== undefined) {
        countsMap[dayName] = item.count || item.solved || 0;
      }
    });
    
    return daysOrder.map(day => ({
      name: day,
      count: countsMap[day]
    }));
  }, [data.weeklyPractice]);

  const weeklyTotal = useMemo(() => {
    return weeklyPracticeSorted.reduce((acc, curr) => acc + curr.count, 0);
  }, [weeklyPracticeSorted]);

  // 4. Monthly Progress - Solved Questions aggregated from database questions list
  const monthlyChartData = useMemo(() => {
    const questions = dashboardData?.questions || [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyCounts = {};
    
    const now = new Date();
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mName = months[d.getMonth()];
      const year = d.getFullYear().toString().substring(2);
      const label = `${mName} '${year}`;
      last6Months.push(label);
      monthlyCounts[label] = 0;
    }
    
    questions.forEach(q => {
      if (q.status === "solved" && q.lastSolvedAt) {
        const d = new Date(q.lastSolvedAt);
        const mName = months[d.getMonth()];
        const year = d.getFullYear().toString().substring(2);
        const label = `${mName} '${year}`;
        if (monthlyCounts[label] !== undefined) {
          monthlyCounts[label]++;
        }
      }
    });
    
    return last6Months.map(label => ({
      name: label,
      count: monthlyCounts[label]
    }));
  }, [dashboardData?.questions]);

  // 5. Recent Activity List
  const recentActivityList = dashboardData?.recentActivity || [];

  return (
    <div className="space-y-8 text-left">
      {/* 1. STATISTIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className={`relative bg-white/[0.02] border border-white/10 rounded-3xl p-5 text-left overflow-hidden backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(99,102,241,0.15)] group ${
                card.accentColor === "blue" ? "hover:border-blue-500/25" :
                card.accentColor === "purple" ? "hover:border-purple-500/25" :
                card.accentColor === "cyan" ? "hover:border-cyan-500/25" :
                "hover:border-pink-500/25"
              }`}
            >
              {/* Top border glow accent */}
              <div className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent to-transparent ${
                card.accentColor === "blue" ? "via-blue-500/20" :
                card.accentColor === "purple" ? "via-purple-500/20" :
                card.accentColor === "cyan" ? "via-cyan-500/20" :
                "via-pink-500/20"
              }`} />

              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`p-1.5 rounded-lg ${card.iconBg} ${card.iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-4 flex items-baseline space-x-1">
                <span className={`text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r ${card.textGradient}`}>
                  <AnimatedNumber value={card.value} />
                </span>
                {card.suffix && (
                  <span className="text-xs text-slate-400 font-semibold">
                    {card.suffix}
                  </span>
                )}
              </div>

              <div className={`mt-2 text-xs font-semibold ${card.subtitleColorClass}`}>
                {card.subtitle}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Chart: Solved by Difficulty */}
        <div className="bg-slate-950/40 border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-lg space-y-4 flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent pointer-events-none" />
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Problems Solved by Difficulty
          </h3>

          {totalSolvedDifficulty > 0 ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-4">
              <div className="h-[150px] w-[150px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      contentStyle={{
                        background: "#080e24",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "12px"
                      }}
                    />
                    <Pie
                      data={pieDifficultyData.filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
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
                {pieDifficultyData.map((item, idx) => {
                  const pct = totalSolvedDifficulty > 0 ? Math.round((item.value / totalSolvedDifficulty) * 100) : 0;
                  return (
                    <div key={idx} className="flex items-center justify-between border-b border-white/5 pb-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="font-semibold text-slate-300">{item.name}</span>
                      </div>
                      <span className="font-mono font-bold text-white">
                        {item.value} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-500 text-xs italic text-center w-full">
              No problems solved yet.
            </div>
          )}
        </div>

        {/* Right Chart: Solved by Category */}
        <div className="bg-slate-950/40 border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-lg space-y-4">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent pointer-events-none" />
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Problems Solved by Category
          </h3>
          
          <div className="w-full overflow-x-auto pb-2 scrollbar-thin">
            <div style={{ minWidth: `${Math.max(barCategoryData.length * 70, 560)}px`, height: "250px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barCategoryData}
                  margin={{ top: 10, right: 10, left: -25, bottom: 20 }}
                  barCategoryGap="10%"
                  barGap={2}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={<CustomXAxisTick />}
                    interval={0}
                    stroke="#64748b"
                    tickLine={false}
                    height={50}
                    tickMargin={12}
                  />
                  <YAxis
                    type="number"
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    allowDecimals={false}
                    tickCount={Math.max(maxCategoryValue + 1, 5)}
                    domain={[0, 'dataMax']}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#080e24",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "12px"
                    }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Bar
                    dataKey="count"
                    radius={[8, 8, 0, 0]}
                    barSize={40}
                    maxBarSize={50}
                  >
                    {barCategoryData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* 3. WEEKLY PRACTICE & 4. MONTHLY PROGRESS GRAPHS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Practice Section */}
        <div className="bg-slate-950/40 border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left shadow-lg space-y-4">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent pointer-events-none" />
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              Weekly Practice
            </h3>
            <span className="text-[10px] sm:text-xs font-extrabold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              Total Solved This Week: {weeklyTotal}
            </span>
          </div>
          
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyPracticeSorted} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  allowDecimals={false}
                  tickCount={Math.max(Math.max(...weeklyPracticeSorted.map(d => d.count), 0) + 1, 5)}
                  domain={[0, 'dataMax']}
                />
                <Tooltip
                  contentStyle={{
                    background: "#080e24",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px"
                  }}
                  itemStyle={{ color: "#fff" }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Progress Section */}
        <div className="bg-slate-950/40 border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left shadow-lg space-y-4">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent pointer-events-none" />
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Monthly Progress
          </h3>
          
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorSolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  allowDecimals={false}
                  tickCount={Math.max(Math.max(...monthlyChartData.map(d => d.count), 0) + 1, 5)}
                  domain={[0, 'dataMax']}
                />
                <Tooltip
                  contentStyle={{
                    background: "#080e24",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px"
                  }}
                  itemStyle={{ color: "#fff" }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Solved"
                  stroke="#a855f7"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorSolved)"
                  dot={<CustomDot />}
                  activeDot={{ r: 6 }}
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 5. RECENT ACTIVITY TABLE */}
      <div className="bg-slate-950/40 border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-lg space-y-4">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent pointer-events-none" />
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Recent Activity
        </h3>

        {(!recentActivityList || recentActivityList.length === 0) ? (
          <div className="text-center py-8 text-slate-500 text-xs italic">
            No recent activity available.
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pl-2">Problem Name</th>
                  <th className="pb-3">Difficulty</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Score</th>
                  <th className="pb-3">Submission Result</th>
                  <th className="pb-3 pr-2">Submitted Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300 font-medium">
                {recentActivityList.map((act, idx) => {
                  const problemName = act.text.replace("Submitted solution for ", "").replace("Improved score on ", "");
                  const questionObj = (dashboardData?.questions || []).find(q => q.title === problemName);
                  const category = questionObj ? questionObj.topic : "Arrays";
                  
                  return (
                    <tr key={idx} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="py-3.5 pl-2 text-white font-bold group-hover:text-indigo-400 transition-colors">
                        {problemName}
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                          act.difficulty === "Easy"
                            ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                            : act.difficulty === "Medium"
                              ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                              : "text-red-400 bg-red-500/10 border-red-500/20"
                        }`}>
                          {act.difficulty}
                        </span>
                      </td>
                      <td className="py-3.5 font-mono text-xs text-slate-400">
                        {category}
                      </td>
                      <td className="py-3.5 font-mono font-bold text-white">
                        {act.score !== undefined ? `${act.score}/100` : "N/A"}
                      </td>
                      <td className="py-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                          act.verdict === "Likely Accepted" || act.verdict === "Accepted" || act.verdict === "passed"
                            ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
                            : act.verdict === "Partially Correct" || act.verdict === "partial"
                              ? "text-amber-400 border-amber-500/20 bg-amber-500/5"
                              : "text-red-400 border-red-500/20 bg-red-500/5"
                        }`}>
                          {act.verdict === "Likely Accepted" || act.verdict === "passed" ? "Accepted" :
                           act.verdict === "Partially Correct" || act.verdict === "partial" ? "Partial" : "Wrong Answer"}
                        </span>
                      </td>
                      <td className="py-3.5 pr-2 font-mono text-xs text-slate-400">
                        {act.time}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsTab;
