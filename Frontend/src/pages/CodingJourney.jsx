import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  FileSearch,
  MessageSquareCode,
  Code2,
  BookOpen,
  LineChart,
  Sparkles,
  Flame,
  Award,
  ChevronRight,
  Play,
  Calendar,
  Clock,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  BookOpenCheck,
  Zap,
  Activity,
  Trophy,
  Target,
  Bookmark,
  Star,
  Plus,
  Minus,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Info,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart as ReChartsLineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Sidebar from "../components/layout/Sidebar";
import TopNavbar from "../components/layout/TopNavbar";

// Count-up animation component for numbers
const AnimatedNumber = ({ value, duration = 1200 }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value, 10) || 0;
    if (end === 0) {
      setCurrent(0);
      return;
    }
    const totalSteps = 60;
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

// Mock Problems Dataset
const INITIAL_PROBLEMS = [
  {
    id: "prob-1",
    name: "Two Sum",
    difficulty: "Easy",
    topic: "Arrays",
    platform: "LeetCode",
    companyTags: ["Google", "Amazon", "Microsoft", "Meta"],
    status: "Solved",
    url: "https://leetcode.com/problems/two-sum/",
    lastSolved: "2026-06-18T10:00:00Z",
    revisionCount: 2,
    notes:
      "Utilize a Hash Map to find the complement of each element in O(1) time. O(N) space complexity.",
    bookmarked: true,
    favorite: true,
  },
  {
    id: "prob-2",
    name: "Reverse Linked List",
    difficulty: "Easy",
    topic: "Linked List",
    platform: "LeetCode",
    companyTags: ["Microsoft", "Adobe", "Amazon"],
    status: "Solved",
    url: "https://leetcode.com/problems/reverse-linked-list/",
    lastSolved: "2026-06-19T09:15:00Z",
    revisionCount: 3,
    notes:
      "Iterative approach with prev, curr, and next pointers. Recursion is also possible.",
    bookmarked: false,
    favorite: true,
  },
  {
    id: "prob-3",
    name: "3Sum",
    difficulty: "Medium",
    topic: "Arrays",
    platform: "LeetCode",
    companyTags: ["Google", "Meta", "Amazon", "Apple"],
    status: "Attempted",
    url: "https://leetcode.com/problems/3sum/",
    lastSolved: "2026-06-17T15:30:00Z",
    revisionCount: 1,
    notes:
      "Sort first, then use a two-pointer approach. Remember to skip duplicate values to avoid duplicate triplets.",
    bookmarked: true,
    favorite: false,
  },
  {
    id: "prob-4",
    name: "Validate Binary Search Tree",
    difficulty: "Medium",
    topic: "Trees",
    platform: "LeetCode",
    companyTags: ["Amazon", "Microsoft", "Bloomberg"],
    status: "Solved",
    url: "https://leetcode.com/problems/validate-binary-search-tree/",
    lastSolved: "2026-06-15T11:45:00Z",
    revisionCount: 2,
    notes:
      "Recursively pass down low and high constraints. Left child range: (low, parent.val), Right child: (parent.val, high).",
    bookmarked: false,
    favorite: false,
  },
  {
    id: "prob-5",
    name: "Edit Distance",
    difficulty: "Hard",
    topic: "DP",
    platform: "LeetCode",
    companyTags: ["Google", "Microsoft", "Uber", "Atlassian"],
    status: "Unsolved",
    url: "https://leetcode.com/problems/edit-distance/",
    lastSolved: null,
    revisionCount: 0,
    notes:
      "Classical 2D Dynamic Programming problem. DP[i][j] represents edits required for word1[0...i] to word2[0...j].",
    bookmarked: true,
    favorite: true,
  },
  {
    id: "prob-6",
    name: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    topic: "Sliding Window",
    platform: "LeetCode",
    companyTags: ["Meta", "Amazon", "Google", "Uber"],
    status: "Solved",
    url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    lastSolved: "2026-06-16T14:20:00Z",
    revisionCount: 2,
    notes:
      "Use sliding window with a map tracking characters and their indices. Move left pointer dynamically.",
    bookmarked: false,
    favorite: false,
  },
  {
    id: "prob-7",
    name: "Find Median from Data Stream",
    difficulty: "Hard",
    topic: "Heap",
    platform: "LeetCode",
    companyTags: ["Google", "Microsoft", "Meta", "Apple"],
    status: "Solved",
    url: "https://leetcode.com/problems/find-median-from-data-stream/",
    lastSolved: "2026-06-14T08:30:00Z",
    revisionCount: 4,
    notes:
      "Two Heaps strategy: a max-heap for lower half of numbers, and min-heap for the upper half. Keep size balanced.",
    bookmarked: true,
    favorite: true,
  },
  {
    id: "prob-8",
    name: "Binary Tree Level Order Traversal",
    difficulty: "Easy",
    topic: "Trees",
    platform: "LeetCode",
    companyTags: ["Microsoft", "LinkedIn", "Amazon"],
    status: "Solved",
    url: "https://leetcode.com/problems/binary-tree-level-order-traversal/",
    lastSolved: "2026-06-19T14:10:00Z",
    revisionCount: 1,
    notes:
      "Use standard Queue (BFS). Group nodes by tracking the queue size at the start of each level loop.",
    bookmarked: false,
    favorite: false,
  },
  {
    id: "prob-9",
    name: "Number of Islands",
    difficulty: "Medium",
    topic: "Graphs",
    platform: "GeeksforGeeks",
    companyTags: ["Google", "Amazon", "Microsoft", "Flipkart"],
    status: "Solved",
    url: "https://practice.geeksforgeeks.org/problems/number-of-islands/1",
    lastSolved: "2026-06-18T16:00:00Z",
    revisionCount: 2,
    notes:
      "BFS/DFS search traversal. Traverse recursively when matching a land cell ('1'), flip visited cells to water ('0').",
    bookmarked: false,
    favorite: false,
  },
  {
    id: "prob-10",
    name: "Search in Rotated Sorted Array",
    difficulty: "Medium",
    topic: "Binary Search",
    platform: "LeetCode",
    companyTags: ["Google", "Microsoft", "Meta", "Oracle"],
    status: "Solved",
    url: "https://leetcode.com/problems/search-in-rotated-sorted-array/",
    lastSolved: "2026-06-13T17:40:00Z",
    revisionCount: 3,
    notes:
      "Binary search tweak. Check which half of subarray is sorted, then check if target falls inside that range.",
    bookmarked: true,
    favorite: false,
  },
  {
    id: "prob-11",
    name: "LRU Cache",
    difficulty: "Medium",
    topic: "Hashing",
    platform: "LeetCode",
    companyTags: ["Amazon", "Google", "Microsoft", "Flipkart", "Atlassian"],
    status: "Solved",
    url: "https://leetcode.com/problems/lru-cache/",
    lastSolved: "2026-06-19T11:00:00Z",
    revisionCount: 5,
    notes:
      "Doubly Linked List paired with a Hash Map. DLL maintains access recency order. Map keeps O(1) lookup.",
    bookmarked: true,
    favorite: true,
  },
  {
    id: "prob-12",
    name: "Minimum Window Substring",
    difficulty: "Hard",
    topic: "Sliding Window",
    platform: "LeetCode",
    companyTags: ["Google", "Uber", "Amazon", "Meta"],
    status: "Attempted",
    url: "https://leetcode.com/problems/minimum-window-substring/",
    lastSolved: "2026-06-10T19:00:00Z",
    revisionCount: 1,
    notes:
      "Two-pointer sliding window with map tracking character frequencies of target string.",
    bookmarked: true,
    favorite: false,
  },
  {
    id: "prob-13",
    name: "Graph Coloring",
    difficulty: "Hard",
    topic: "Backtracking",
    platform: "GeeksforGeeks",
    companyTags: ["Flipkart", "Microsoft"],
    status: "Unsolved",
    url: "https://practice.geeksforgeeks.org/problems/m-coloring-problem-1587115620/1",
    lastSolved: null,
    revisionCount: 0,
    notes:
      "Assign colors recursively to nodes and check constraints. Backtrack if colors conflict with neighbors.",
    bookmarked: false,
    favorite: false,
  },
  {
    id: "prob-14",
    name: "Next Permutation",
    difficulty: "Medium",
    topic: "Sorting",
    platform: "LeetCode",
    companyTags: ["Google", "Microsoft", "Meta"],
    status: "Solved",
    url: "https://leetcode.com/problems/next-permutation/",
    lastSolved: "2026-06-12T13:00:00Z",
    revisionCount: 2,
    notes:
      "Find pivot index going backward. Swap with smallest larger element on right, then reverse the right side.",
    bookmarked: false,
    favorite: false,
  },
  {
    id: "prob-15",
    name: "Merge Intervals",
    difficulty: "Medium",
    topic: "Sorting",
    platform: "LeetCode",
    companyTags: ["Google", "Amazon", "Microsoft", "Adobe"],
    status: "Solved",
    url: "https://leetcode.com/problems/merge-intervals/",
    lastSolved: "2026-06-19T13:45:00Z",
    revisionCount: 2,
    notes:
      "Sort intervals by start values first. Loop and merge intervals if interval[i].start <= previous.end.",
    bookmarked: true,
    favorite: false,
  },
];

// Mock achievements
const ACHIEVEMENTS = [
  {
    id: "ach-1",
    title: "First Problem",
    desc: "Solved your first coding problem",
    progress: "100%",
    earned: true,
    icon: "CheckCircle2",
    color: "from-blue-500/20 to-indigo-500/20 border-blue-500/40 text-blue-400",
  },
  {
    id: "ach-2",
    title: "10 Day Streak",
    desc: "Maintained active practice for 10 straight days",
    progress: "100%",
    earned: true,
    icon: "Flame",
    color:
      "from-orange-500/20 to-red-500/20 border-orange-500/40 text-orange-400",
  },
  {
    id: "ach-3",
    title: "100 Problems",
    desc: "Solve 100 coding problems in total",
    progress: "100%",
    earned: true,
    icon: "Trophy",
    color:
      "from-amber-500/20 to-yellow-500/20 border-yellow-500/40 text-yellow-400",
  },
  {
    id: "ach-4",
    title: "Array Master",
    desc: "Complete 15 Array problems",
    progress: "92%",
    earned: false,
    icon: "Zap",
    color:
      "from-indigo-500/10 to-purple-500/10 border-white/10 text-indigo-400",
  },
  {
    id: "ach-5",
    title: "Graph Explorer",
    desc: "Traverse 8 complex Graph questions",
    progress: "60%",
    earned: false,
    icon: "Compass",
    color: "from-cyan-500/10 to-blue-500/10 border-white/10 text-cyan-400",
  },
  {
    id: "ach-6",
    title: "DP Beginner",
    desc: "Unlock 5 Dynamic Programming solutions",
    progress: "20%",
    earned: false,
    icon: "Brain",
    color: "from-pink-500/10 to-rose-500/10 border-white/10 text-pink-400",
  },
];

const CodingJourney = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Responsive state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Demo Control Panel States
  const [isEmptyState, setIsEmptyState] = useState(false);

  // Core Data States (Dynamic local simulation)
  const [problems, setProblems] = useState(INITIAL_PROBLEMS);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [selectedCompany, setSelectedCompany] = useState("All");

  // Options lists compiled from dataset
  const topicsList = [
    "Arrays",
    "Strings",
    "Trees",
    "Graphs",
    "DP",
    "Sorting",
    "Searching",
    "Linked List",
    "Stack",
    "Queue",
    "Heap",
    "Trie",
    "Backtracking",
    "Greedy",
    "Bit Manipulation",
    "Sliding Window",
    "Binary Search",
    "Math",
    "Hashing",
    "Recursion",
  ];
  const companiesList = [
    "Google",
    "Microsoft",
    "Amazon",
    "Adobe",
    "Uber",
    "Atlassian",
    "Flipkart",
    "Oracle",
    "Meta",
    "Apple",
  ];

  // Heatmap layout: generate random activity grid for 53 weeks * 7 days
  const heatmapData = useMemo(() => {
    const data = [];
    const seed = [0, 0, 0, 1, 1, 2, 2, 3, 4, 1, 0, 0, 1, 2, 0, 0, 1, 3, 0];
    for (let i = 0; i < 371; i++) {
      const idx = Math.floor(Math.random() * seed.length);
      data.push(seed[idx]);
    }
    return data;
  }, []);

  // Filter logic
  const filteredProblems = useMemo(() => {
    if (isEmptyState) return [];
    return problems.filter((prob) => {
      const matchesSearch = prob.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesDifficulty =
        selectedDifficulty === "All" || prob.difficulty === selectedDifficulty;
      const matchesStatus =
        selectedStatus === "All" || prob.status === selectedStatus;
      const matchesTopic =
        selectedTopic === "All" || prob.topic === selectedTopic;
      const matchesCompany =
        selectedCompany === "All" || prob.companyTags.includes(selectedCompany);
      return (
        matchesSearch &&
        matchesDifficulty &&
        matchesStatus &&
        matchesTopic &&
        matchesCompany
      );
    });
  }, [
    problems,
    searchTerm,
    selectedDifficulty,
    selectedStatus,
    selectedTopic,
    selectedCompany,
    isEmptyState,
  ]);

  // Statistics recalculations based on current state (excluding empty state)
  const computedStats = useMemo(() => {
    if (isEmptyState) {
      return { solvedCount: 0, streak: 0, acceptance: 0, topicsMastered: 0 };
    }
    const solved = problems.filter((p) => p.status === "Solved").length;
    const attempted = problems.filter((p) => p.status === "Attempted").length;
    const total = problems.length;
    const acceptance =
      total > 0 ? Math.round((solved / (solved + attempted || 1)) * 100) : 0;

    // Mastered count: topics where >= 70% problems solved (simplified logic)
    const topicsMastered = 14;
    return {
      solvedCount:
        245 +
        (solved - INITIAL_PROBLEMS.filter((p) => p.status === "Solved").length), // offset base solved
      streak: 12,
      acceptance: Math.max(78, acceptance),
      topicsMastered,
    };
  }, [problems, isEmptyState]);

  // Recharts Problem Categories Distribution
  const problemCategoriesChartData = useMemo(() => {
    if (isEmptyState) return [];

    return [
      { name: "Arrays", count: 42, fill: "#6366F1" },
      { name: "Strings", count: 28, fill: "#A855F7" },
      { name: "Linked Lists", count: 18, fill: "#06B6D4" },
      { name: "Trees", count: 16, fill: "#EC4899" },
      { name: "Graphs", count: 14, fill: "#10B981" },
      { name: "Dynamic Programming", count: 12, fill: "#F59E0B" },
      { name: "Binary Search", count: 10, fill: "#3B82F6" },
      { name: "Sliding Window", count: 8, fill: "#EF4444" },
      { name: "Heap", count: 7, fill: "#14B8A6" },
      { name: "Greedy", count: 5, fill: "#8B5CF6" },
    ];
  }, [isEmptyState]);

  // Weekly Practice line values
  const weeklyPracticeData = [
    { name: "Mon", Problems: isEmptyState ? 0 : 4 },
    { name: "Tue", Problems: isEmptyState ? 0 : 6 },
    { name: "Wed", Problems: isEmptyState ? 0 : 3 },
    { name: "Thu", Problems: isEmptyState ? 0 : 8 },
    { name: "Fri", Problems: isEmptyState ? 0 : 5 },
    { name: "Sat", Problems: isEmptyState ? 0 : 2 },
    { name: "Sun", Problems: isEmptyState ? 0 : 7 },
  ];

  // Problems Solved by Difficulty (Pie Chart)
  const problemDifficultyChartData = [
    {
      name: "Easy",
      value: isEmptyState ? 0 : 82,
      color: "#10B981",
    },
    {
      name: "Medium",
      value: isEmptyState ? 0 : 56,
      color: "#F59E0B",
    },
    {
      name: "Hard",
      value: isEmptyState ? 0 : 22,
      color: "#EF4444",
    },
  ].filter((difficulty) => difficulty.value > 0);

  // Topic Progress array
  const topicsProgress = [
    { name: "Arrays", percent: isEmptyState ? 0 : 92 },
    { name: "Strings", percent: isEmptyState ? 0 : 80 },
    { name: "Trees", percent: isEmptyState ? 0 : 60 },
    { name: "Graphs", percent: isEmptyState ? 0 : 40 },
    { name: "Dynamic Programming", percent: isEmptyState ? 0 : 20 },
  ];

  // Recent activity logs
  const recentActivities = [
    {
      text: "Solved Two Sum",
      time: "2 hours ago",
      platform: "LeetCode",
      difficulty: "Easy",
    },
    {
      text: "Completed Binary Tree Level Order Traversal",
      time: "4 hours ago",
      platform: "LeetCode",
      difficulty: "Easy",
    },
    {
      text: "Bookmarked LRU Cache",
      time: "1 day ago",
      platform: "LeetCode",
      difficulty: "Medium",
    },
    {
      text: "Revised Number of Islands",
      time: "1 day ago",
      platform: "GeeksforGeeks",
      difficulty: "Medium",
    },
  ];

  // Actions scrolling handlers
  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Drawer edit controllers (saves back to local state array)
  const handleProblemChange = (field, val) => {
    if (!selectedProblem) return;
    const updated = { ...selectedProblem, [field]: val };
    setSelectedProblem(updated);
    setProblems((prev) =>
      prev.map((p) => (p.id === selectedProblem.id ? updated : p)),
    );
  };

  const incrementRevision = () => {
    if (!selectedProblem) return;
    handleProblemChange("revisionCount", selectedProblem.revisionCount + 1);
  };

  const decrementRevision = () => {
    if (!selectedProblem) return;
    if (selectedProblem.revisionCount === 0) return;
    handleProblemChange("revisionCount", selectedProblem.revisionCount - 1);
  };

  // Toggle Bookmark state directly from table or drawer
  const toggleBookmark = (id, e) => {
    if (e) e.stopPropagation();
    setProblems((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, bookmarked: !p.bookmarked };
          if (selectedProblem && selectedProblem.id === id) {
            setSelectedProblem(updated);
          }
          return updated;
        }
        return p;
      }),
    );
  };

  // Toggle Favorite state directly from drawer
  const toggleFavorite = (id, e) => {
    if (e) e.stopPropagation();
    setProblems((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, favorite: !p.favorite };
          if (selectedProblem && selectedProblem.id === id) {
            setSelectedProblem(updated);
          }
          return updated;
        }
        return p;
      }),
    );
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedDifficulty("All");
    setSelectedStatus("All");
    setSelectedTopic("All");
    setSelectedCompany("All");
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
          <main className="flex-1 p-6 space-y-8 max-w-7xl mx-auto w-full">
            {/* HERO SECTION */}
            <section className="relative rounded-3xl border border-white/10 bg-slate-950/20 backdrop-blur-xl p-6 sm:p-8 overflow-hidden text-left">
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />

              <div className="relative z-10 max-w-2xl space-y-4">
                <div className="inline-flex items-center space-x-1.5 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-xs text-indigo-400 font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>
                    Module 4 &bull; Algorithms &amp; Platforms Tracker
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                  Coding Journey
                </h1>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
                  Track your coding practice, master DSA, and prepare for
                  technical interviews. Sync details dynamically across multiple
                  platforms.
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => scrollToId("problems-list")}
                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white text-sm font-bold cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    Start Practice
                  </button>
                  <button
                    onClick={() => scrollToId("progress-charts")}
                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] hover:border-white/15 text-white text-sm font-semibold cursor-pointer transition-all"
                  >
                    <LineChart className="w-4 h-4 text-indigo-400" />
                    View Progress
                  </button>
                </div>
              </div>
            </section>

            {isEmptyState ? (
              /* EMPTY STATE VIEW */
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center p-16 bg-white/[0.02] border border-white/10 rounded-3xl backdrop-blur-xl text-center max-w-lg mx-auto space-y-5 shadow-lg"
              >
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Code2 className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">
                    Start Your Coding Journey
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed font-light max-w-xs mx-auto">
                    Solve your first coding problem to unlock analytics, topic
                    masteries, heatmaps, and progress tracking metrics.
                  </p>
                </div>
                <button
                  onClick={() => setIsEmptyState(false)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white text-sm font-bold transition-all cursor-pointer shadow-lg shadow-indigo-500/25 hover:scale-[1.01]"
                >
                  Start Practicing
                </button>
              </motion.div>
            ) : (
              /* POPULATED DASHBOARD VIEW */
              <div className="space-y-8">
                {/* STATISTICS CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Card 1: Problems Solved */}
                  <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 text-left relative overflow-hidden group hover:border-indigo-500/25 transition-all">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Problems Solved
                      </span>
                      <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                        <AnimatedNumber value={computedStats.solvedCount} />
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-indigo-400 font-semibold">
                      <span>Across All Platforms</span>
                    </div>
                  </div>

                  {/* Card 2: Streak */}
                  <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 text-left relative overflow-hidden group hover:border-purple-500/25 transition-all">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Current Streak
                      </span>
                      <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                        <Flame className="w-4 h-4 animate-pulse" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                        <AnimatedNumber value={computedStats.streak} /> Days
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-purple-400 font-semibold">
                      <span>Keep the momentum going</span>
                    </div>
                  </div>

                  {/* Card 3: Acceptance Rate */}
                  <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 text-left relative overflow-hidden group hover:border-cyan-500/25 transition-all">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Acceptance Rate
                      </span>
                      <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                        <Target className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
                        <AnimatedNumber value={computedStats.acceptance} />%
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-cyan-400 font-semibold">
                      <span>Overall Success Rate</span>
                    </div>
                  </div>

                  {/* Card 4: Topics Mastered */}
                  <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 text-left relative overflow-hidden group hover:border-pink-500/25 transition-all">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Topics Mastered
                      </span>
                      <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400">
                        <Brain className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                        <AnimatedNumber value={computedStats.topicsMastered} />
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-pink-400 font-semibold">
                      <span>Out of 20 Topics</span>
                    </div>
                  </div>
                </div>

                {/* Problem solved by categories */}
                <div
                  id="progress-charts"
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 scroll-mt-24"
                >
                  {/* Left Column (7 cols): Solving Difficulty and Weekly Practice */}
                  <div className="lg:col-span-7 space-y-8">
                    {/* Solving Categories (Bar chart) */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left shadow-lg">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                      <h3 className="text-base font-semibold text-white mb-4">
                        Problems Solved by Categories
                      </h3>

                      <div className="h-[220px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={problemCategoriesChartData}
                            margin={{
                              top: 10,
                              right: 10,
                              left: -25,
                              bottom: 0,
                            }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="rgba(255,255,255,0.05)"
                              vertical={false}
                            />
                            <XAxis
                              dataKey="name"
                              stroke="#64748b"
                              fontSize={10}
                              tickLine={false}
                              interval={0}
                              height={60}
                              tick={({ x, y, payload }) => {
                                const words = payload.value.split(" ");

                                return (
                                  <g transform={`translate(${x},${y})`}>
                                    {words.length === 1 ? (
                                      <text
                                        x={0}
                                        y={15}
                                        textAnchor="middle"
                                        fill="#94A3B8"
                                        fontSize={10}
                                      >
                                        {payload.value}
                                      </text>
                                    ) : (
                                      <>
                                        <text
                                          x={0}
                                          y={10}
                                          textAnchor="middle"
                                          fill="#94A3B8"
                                          fontSize={10}
                                        >
                                          {words.slice(0, -1).join(" ")}
                                        </text>

                                        <text
                                          x={0}
                                          y={24}
                                          textAnchor="middle"
                                          fill="#94A3B8"
                                          fontSize={10}
                                        >
                                          {words[words.length - 1]}
                                        </text>
                                      </>
                                    )}
                                  </g>
                                );
                              }}
                            />
                            <YAxis
                              stroke="#64748b"
                              fontSize={11}
                              tickLine={false}
                            />
                            <Tooltip
                              contentStyle={{
                                background: "#080e24",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "12px",
                              }}
                              itemStyle={{ color: "#fff" }}
                              labelClassName="text-slate-400 font-bold"
                            />
                            <Bar
                              dataKey="count"
                              radius={[8, 8, 0, 0]}
                              barSize={40}
                            >
                              {problemCategoriesChartData.map(
                                (entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={entry.fill}
                                  />
                                ),
                              )}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Weekly practice (Line chart) */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left shadow-lg">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
                      <h3 className="text-base font-semibold text-white mb-4">
                        Weekly Practice Consistency
                      </h3>

                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <ReChartsLineChart
                            data={weeklyPracticeData}
                            margin={{
                              top: 10,
                              right: 10,
                              left: -25,
                              bottom: 0,
                            }}
                          >
                            <defs>
                              <linearGradient
                                id="lineGlow"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor="#818cf8"
                                  stopOpacity={0.2}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="#818cf8"
                                  stopOpacity={0}
                                />
                              </linearGradient>
                            </defs>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="rgba(255,255,255,0.05)"
                              vertical={false}
                            />
                            <XAxis
                              dataKey="name"
                              stroke="#64748b"
                              fontSize={11}
                              tickLine={false}
                            />
                            <YAxis
                              stroke="#64748b"
                              fontSize={11}
                              tickLine={false}
                            />
                            <Tooltip
                              contentStyle={{
                                background: "#080e24",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "12px",
                              }}
                              itemStyle={{ color: "#fff" }}
                              labelClassName="text-slate-400 font-bold"
                            />
                            <Line
                              type="monotone"
                              dataKey="Problems"
                              stroke="#818cf8"
                              strokeWidth={3}
                              dot={{
                                r: 4,
                                stroke: "#818cf8",
                                strokeWidth: 2,
                                fill: "#080e24",
                              }}
                              activeDot={{ r: 6, fill: "#818cf8" }}
                            />
                          </ReChartsLineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Right Column (5 cols): Platform Distribution & Topics Progress */}
                  <div className="lg:col-span-5 space-y-8">
                    {/* Problem solved by difficulty (Pie Chart) */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left shadow-lg">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                      <h3 className="text-base font-semibold text-white mb-4">
                        Problem Solved by Difficulty
                      </h3>

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="h-[150px] w-[150px] shrink-0">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Tooltip
                                contentStyle={{
                                  background: "#080e24",
                                  border: "1px solid rgba(255,255,255,0.1)",
                                  borderRadius: "12px",
                                }}
                                itemStyle={{ color: "#fff" }}
                              />
                              <Pie
                                data={problemDifficultyChartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={60}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {problemDifficultyChartData.map(
                                  (entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={entry.color}
                                    />
                                  ),
                                )}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="flex-1 space-y-2 text-xs text-slate-300 w-full">
                          {problemDifficultyChartData.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center space-x-2">
                                <div
                                  className="w-2.5 h-2.5 rounded-full"
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="font-medium text-slate-300">
                                  {item.name}
                                </span>
                              </div>
                              <span className="font-mono font-bold text-white">
                                {item.value} solved
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Topic Progress lists */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left shadow-lg">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
                      <h3 className="text-base font-semibold text-white mb-4">
                        Key Topic Progress
                      </h3>

                      <div className="space-y-4">
                        {topicsProgress.map((topic, index) => (
                          <div key={index} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-300">
                                {topic.name}
                              </span>
                              <span className="text-indigo-400">
                                {topic.percent}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5 relative">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${topic.percent}%` }}
                                transition={{
                                  duration: 1.2,
                                  delay: index * 0.1,
                                }}
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* CODING HEATMAP 
                <section className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left shadow-lg">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                  
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-base font-semibold text-white flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-indigo-400" />
                      Annual Coding Consistency Heatmap
                    </h3>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
                      <span>Less</span>
                      <div className="w-2.5 h-2.5 rounded-sm bg-white/[0.04]" />
                      <div className="w-2.5 h-2.5 rounded-sm bg-emerald-950/40" />
                      <div className="w-2.5 h-2.5 rounded-sm bg-emerald-700/60" />
                      <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
                      <span>More</span>
                    </div>
                  </div>

                  // Heatmap Grid Wrapper 
                  <div className="overflow-x-auto pb-2">
                    <div className="min-w-[760px] p-2 bg-slate-950/20 rounded-2xl border border-white/5 flex gap-4">
                      // Weekday labels 
                      <div className="flex flex-col justify-between py-1 text-[9px] text-slate-500 font-mono h-[86px]">
                        <span>Mon</span>
                        <span>Wed</span>
                        <span>Fri</span>
                        <span>Sun</span>
                      </div>
                      
                      //Grid cells 
                      <div className="flex-1 flex flex-col justify-between">
                        //Month labels header 
                        <div className="flex justify-between text-[9px] text-slate-500 font-mono mb-2 px-1">
                          <span>Jul</span>
                          <span>Aug</span>
                          <span>Sep</span>
                          <span>Oct</span>
                          <span>Nov</span>
                          <span>Dec</span>
                          <span>Jan</span>
                          <span>Feb</span>
                          <span>Mar</span>
                          <span>Apr</span>
                          <span>May</span>
                          <span>Jun</span>
                        </div>

                        //Contribution Board Grid 
                        <div className="heatmap-grid h-[86px] w-full">
                          {heatmapData.map((count, index) => {
                            let bgColor = "bg-white/[0.04]";
                            if (count === 1) bgColor = "bg-emerald-950/40 border border-emerald-900/10";
                            if (count === 2) bgColor = "bg-emerald-800/40 border border-emerald-700/20";
                            if (count === 3) bgColor = "bg-emerald-600/70 shadow-[0_0_5px_rgba(16,185,129,0.15)]";
                            if (count >= 4) bgColor = "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]";

                            return (
                              <div
                                key={index}
                                className={`w-[9px] h-[9px] rounded-[1.5px] transition-colors hover:scale-125 duration-100 ${bgColor}`}
                                title={`Submission count code: ${count}`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </section> */}

                {/* RECENT ACTIVITY & ACHIEVEMENTS GRIDS */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Achievements Grid (7 columns) */}
                  <div className="lg:col-span-7 bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left flex flex-col justify-between shadow-lg">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

                    <div>
                      <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-6">
                        <Award className="w-5 h-5 text-cyan-400" />
                        Practice Achievements &amp; Badges
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {ACHIEVEMENTS.map((ach) => (
                          <div
                            key={ach.id}
                            className={`p-4 rounded-2xl border bg-gradient-to-br flex items-center space-x-3.5 transition-all duration-300 hover:scale-[1.02] ${ach.color}`}
                          >
                            <div className="p-2.5 rounded-xl bg-slate-950/40 shrink-0">
                              {ach.icon === "Flame" && (
                                <Flame className="w-5 h-5 animate-pulse" />
                              )}
                              {ach.icon === "Trophy" && (
                                <Trophy className="w-5 h-5" />
                              )}
                              {ach.icon === "CheckCircle2" && (
                                <CheckCircle2 className="w-5 h-5" />
                              )}
                              {ach.icon === "Zap" && (
                                <Zap className="w-5 h-5" />
                              )}
                              {ach.icon === "Compass" && (
                                <Activity className="w-5 h-5" />
                              )}
                              {ach.icon === "Brain" && (
                                <Brain className="w-5 h-5" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1 text-left space-y-1">
                              <div className="flex justify-between items-center">
                                <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                                  {ach.title}
                                </h4>
                                <span className="text-[10px] font-mono text-slate-400">
                                  {ach.progress}
                                </span>
                              </div>
                              <p className="text-[10px] sm:text-xs text-slate-400 font-light leading-relaxed truncate">
                                {ach.desc}
                              </p>

                              {/* Small progress bar */}
                              <div className="w-full h-1 bg-slate-950/40 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-current rounded-full"
                                  style={{ width: ach.progress }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity Log (5 columns) */}
                  <div className="lg:col-span-5 bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left flex flex-col justify-between shadow-lg">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />

                    <div>
                      <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-6">
                        <Clock className="w-5 h-5 text-pink-400" />
                        Recent Practice Activity Log
                      </h3>

                      <div className="relative border-l border-white/5 ml-3 pl-5 space-y-6">
                        {recentActivities.map((act, index) => (
                          <div
                            key={index}
                            className="relative text-left text-xs sm:text-sm"
                          >
                            {/* Bullet indicator */}
                            <div className="absolute -left-[26px] top-1 w-2.5 h-2.5 rounded-full bg-pink-500 border border-[#050B1F]" />

                            <div className="space-y-1">
                              <p className="font-bold text-white leading-relaxed">
                                {act.text}
                              </p>
                              <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-slate-400 font-mono">
                                <span>{act.time}</span>
                                <span>&bull;</span>
                                <span>{act.platform}</span>
                                <span>&bull;</span>
                                <span
                                  className={
                                    act.difficulty === "Easy"
                                      ? "text-emerald-400"
                                      : "text-amber-400"
                                  }
                                >
                                  {act.difficulty}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* SIDE DETAILS DRAWER */}
        <AnimatePresence>
          {drawerOpen && selectedProblem && (
            <>
              {/* Back backdrop shade */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDrawerOpen(false)}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              />

              {/* Side sliding panel */}
              <motion.aside
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 220 }}
                className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-[#080E24]/95 border-l border-white/10 backdrop-blur-2xl flex flex-col justify-between text-left shadow-2xl overflow-y-auto"
              >
                {/* Drawer Top Header Accent line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent pointer-events-none" />

                {/* Top Section */}
                <div>
                  <div className="p-6 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-xs font-bold text-indigo-400 font-mono uppercase tracking-wider">
                        Problem Details
                      </span>
                    </div>
                    <button
                      onClick={() => setDrawerOpen(false)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Problem Name & External Link */}
                    <div className="space-y-2">
                      <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                        {selectedProblem.name}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded border text-[9px] uppercase font-bold tracking-wider ${
                            selectedProblem.difficulty === "Easy"
                              ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                              : selectedProblem.difficulty === "Medium"
                                ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                                : "text-red-400 bg-red-500/10 border-red-500/20"
                          }`}
                        >
                          {selectedProblem.difficulty}
                        </span>

                        <span className="px-2.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-bold text-slate-300">
                          {selectedProblem.topic}
                        </span>

                        <span className="px-2.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-bold text-slate-400 font-mono">
                          {selectedProblem.platform}
                        </span>

                        <a
                          href={selectedProblem.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[9px] font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer ml-auto"
                        >
                          View Problem Source
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {/* Company Tags Grid */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                        Target Companies
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedProblem.companyTags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-lg px-2.5 py-1 text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stats details section */}
                    <div className="grid grid-cols-2 gap-4 border-t border-b border-white/5 py-4">
                      {/* Revision Counter */}
                      <div className="space-y-2 text-left">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                          Revision Count
                        </label>
                        <div className="flex items-center space-x-3.5">
                          <button
                            onClick={decrementRevision}
                            className="p-1 rounded bg-white/5 border border-white/10 text-slate-400 hover:text-white cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-sm font-bold font-mono text-white">
                            {selectedProblem.revisionCount}
                          </span>
                          <button
                            onClick={incrementRevision}
                            className="p-1 rounded bg-white/5 border border-white/10 text-slate-400 hover:text-white cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Favorite / Star Control */}
                      <div className="space-y-2 text-left">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                          Priority Rating
                        </label>
                        <button
                          onClick={(e) => toggleFavorite(selectedProblem.id, e)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                            selectedProblem.favorite
                              ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/10"
                              : "text-slate-500 border-white/5 hover:text-white"
                          }`}
                        >
                          <Star
                            className={`w-4.5 h-4.5 ${selectedProblem.favorite ? "fill-current" : ""}`}
                          />
                          <span>
                            {selectedProblem.favorite
                              ? "Favorite Marked"
                              : "Add to Favorites"}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Notes Text Area */}
                    <div className="space-y-2 text-left">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                        Review &amp; Approach Notes
                      </label>
                      <textarea
                        value={selectedProblem.notes || ""}
                        onChange={(e) =>
                          handleProblemChange("notes", e.target.value)
                        }
                        placeholder="Type approach, complexity trade-offs, algorithms used..."
                        className="w-full h-32 bg-slate-950/40 border border-white/10 rounded-2xl p-3 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500/60 leading-relaxed font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Drawer Actions */}
                <div className="p-6 border-t border-white/5 bg-slate-950/30 flex justify-between items-center gap-4">
                  {/* Bookmark Button */}
                  <button
                    onClick={(e) => toggleBookmark(selectedProblem.id, e)}
                    className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer select-none ${
                      selectedProblem.bookmarked
                        ? "text-indigo-400 border-indigo-500/30 bg-indigo-500/10"
                        : "text-slate-400 border-white/10 hover:text-white"
                    }`}
                  >
                    <Bookmark
                      className={`w-4 h-4 ${selectedProblem.bookmarked ? "fill-current" : ""}`}
                    />
                    <span>
                      {selectedProblem.bookmarked
                        ? "Bookmarked"
                        : "Bookmark Code"}
                    </span>
                  </button>

                  {/* Mark as Solved Status controller */}
                  <button
                    onClick={() => {
                      const newStatus =
                        selectedProblem.status === "Solved"
                          ? "Attempted"
                          : "Solved";
                      handleProblemChange("status", newStatus);
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-6 py-3 rounded-xl text-white text-xs font-black shadow-lg transition-all cursor-pointer ${
                      selectedProblem.status === "Solved"
                        ? "bg-slate-900 border border-emerald-500/30 text-emerald-400"
                        : "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 shadow-indigo-500/25 hover:scale-[1.01]"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {selectedProblem.status === "Solved"
                        ? "Solved (Click to undo)"
                        : "Mark as Solved"}
                    </span>
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default CodingJourney;
