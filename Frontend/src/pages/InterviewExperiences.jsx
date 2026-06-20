import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
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
  Search,
  Bell,
  User as UserIcon,
  Sparkles,
  Flame,
  Award,
  ChevronRight,
  Play,
  Calendar,
  Clock,
  Menu,
  X,
  CheckCircle2,
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
  ChevronUp,
  Heart,
  Share2,
  MessageSquare,
  DollarSign,
  MapPin,
  Briefcase,
  Users,
  Compass,
  Check,
  Globe,
  TrendingUp
} from "lucide-react";

// Count-up animation component for statistics numbers
const AnimatedStatNumber = ({ value, suffix = "", duration = 1200 }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseFloat(value) || 0;
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
        setCurrent(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  // Format decimals or full integers
  const displayVal = Number.isInteger(parseFloat(value))
    ? current.toFixed(0)
    : current.toFixed(1);

  return (
    <>
      {parseFloat(displayVal).toLocaleString()}
      {suffix}
    </>
  );
};

// Mock Interview Experiences
const INITIAL_EXPERIENCES = [
  {
    id: "exp-1",
    authorName: "Ananya Sharma",
    authorCollege: "BITS Pilani",
    authorAvatar: "A",
    date: "June 18, 2026",
    company: "Google",
    companyLogo: "G",
    role: "Software Engineer Intern",
    package: "42 LPA",
    mode: "On Campus",
    difficulty: "Hard",
    title: "Google SWE Intern Interview Experience (Summer 2026)",
    tags: ["DSA", "Graphs", "Dynamic Programming", "Google"],
    readingTime: "5 min read",
    likes: 142,
    commentsCount: 24,
    bookmarked: false,
    verdict: "Selected",
    summary: "Google's summer intern recruitment process consisted of 1 Online Assessment and 2 Technical Phone Rounds. Both rounds heavily tested dynamic programming and graph traversals.",
    timeline: [
      { roundName: "Online Assessment", date: "April 10, 2026", status: "completed", desc: "2 coding questions (medium/hard) on graphs and arrays. Had to pass all test cases within 60 minutes." },
      { roundName: "Technical Round 1", date: "May 2, 2026", status: "completed", desc: "45-minute coding interview focusing on a complex Dijkstra variant and optimization. Verified complexity bounds." },
      { roundName: "Technical Round 2", date: "May 5, 2026", status: "completed", desc: "Focused on an interval scheduling problem using Dynamic Programming. Emphasized clean modular code writing." },
      { roundName: "Manager Round", date: "May 15, 2026", status: "completed", desc: "Behavioral interview exploring project decisions, conflicts resolution, and alignment with Google values." },
      { roundName: "HR Round", date: "May 22, 2026", status: "completed", desc: "Salary discussions, documentation verification, and internship location selection." }
    ],
    questionsAsked: [
      "Given a weighted directed graph, find the path that minimizes the maximum weight edge while keeping total cost below a threshold.",
      "Explain the differences between DFS and BFS in terms of space complexity for a very wide tree."
    ],
    prepTips: "Master graph algorithms (Dijkstra, BFS, DFS) and dynamic programming. Focus on explaining your thought process out loud rather than jumping straight to code.",
    resources: "LeetCode (Top 150), PrepSphere DSA Tracker, CLRS Graph Algorithms Chapters.",
    candidateAdvice: "Don't panic if you get stuck. Ask clarifying questions. Interviewers are looking for how you collaborate and structure your thinking."
  },
  {
    id: "exp-2",
    authorName: "Rahul Verma",
    authorCollege: "IIT Delhi",
    authorAvatar: "R",
    date: "June 12, 2026",
    company: "Microsoft",
    companyLogo: "M",
    role: "Software Engineer 1 (Full Time)",
    package: "28 LPA",
    mode: "Off Campus",
    difficulty: "Medium",
    title: "Microsoft SE-1 Off-Campus Recruitment Cycle",
    tags: ["DSA", "Linked List", "System Design", "Microsoft"],
    readingTime: "4 min read",
    likes: 98,
    commentsCount: 12,
    bookmarked: true,
    verdict: "Selected",
    summary: "The off-campus process consisted of 1 screening test and 3 rounds of technical interviews. One of the technical rounds had a high emphasis on low-level system design.",
    timeline: [
      { roundName: "Online Assessment", date: "April 15, 2026", status: "completed", desc: "3 coding questions on Codility testing arrays and hash map lookups." },
      { roundName: "Technical Round 1", date: "April 28, 2026", status: "completed", desc: "Deep dive into pointers, reverse a linked list in blocks of K, and structural optimization." },
      { roundName: "Technical Round 2", date: "May 1, 2026", status: "completed", desc: "Design a parking lot system (Low-Level Design). Draw class diagrams, specify entity relationships." },
      { roundName: "Manager Round", date: "May 12, 2026", status: "completed", desc: "Discussion about past internship achievements, deployment architecture, and scalable system structures." },
      { roundName: "HR Round", date: "May 20, 2026", status: "completed", desc: "Location choices, culture fit alignment, compensation breakdown details." }
    ],
    questionsAsked: [
      "Given a binary tree, write a function that serializes it to a string and deserializes it back to its original tree structure.",
      "Design classes and database structures for an online library management system."
    ],
    prepTips: "Practice writing clean Object-Oriented code. Understand design patterns (Singleton, Factory, Observer) and basic data structures (Linked Lists, Binary Trees).",
    resources: "Grokking the System Design Interview, PrepSphere LLD Guides.",
    candidateAdvice: "Keep class layouts modular. Follow SOLID principles and write proper variable names during coding interviews."
  },
  {
    id: "exp-3",
    authorName: "Kriti Sen",
    authorCollege: "DTU",
    authorAvatar: "K",
    date: "June 10, 2026",
    company: "Amazon",
    companyLogo: "A",
    role: "Cloud Support Associate",
    package: "18 LPA",
    mode: "On Campus",
    difficulty: "Medium",
    title: "Amazon On-Campus Hiring Experience - Cloud Support",
    tags: ["OS", "Networking", "Behavioral", "Amazon"],
    readingTime: "6 min read",
    likes: 64,
    commentsCount: 8,
    bookmarked: false,
    verdict: "Selected",
    summary: "Amazon's Cloud Support role hiring consisted of 1 coding/technical online assessment and 2 rounds of virtual interviews emphasizing operating systems, basic networking, and Amazon Leadership Principles.",
    timeline: [
      { roundName: "Online Assessment", date: "May 5, 2026", status: "completed", desc: "Tested basic scripting, Linux commands knowledge, and multiple-choice networking questions." },
      { roundName: "Technical Round 1", date: "May 18, 2026", status: "completed", desc: "Heavy discussion on IP routing protocols, DNS resolution steps, and Operating Systems threading details." },
      { roundName: "Technical Round 2", date: "May 20, 2026", status: "completed", desc: "Deep exploration of Linux kernel architectures, virtualization concepts, and system security setups." },
      { roundName: "Manager Round", date: "May 28, 2026", status: "completed", desc: "Behavioral interview heavily aligned with Customer Obsession and Bias for Action principles." },
      { roundName: "HR Round", date: "June 2, 2026", status: "completed", desc: "Final negotiations, work timing confirmations, and onboarding checklist validations." }
    ],
    questionsAsked: [
      "What happens step-by-step when you type 'google.com' in a web browser address bar and hit enter?",
      "Explain the differences between processes and threads, and how context switching operates."
    ],
    prepTips: "Memorize the TCP/IP stack protocols, DNS resolution, and operating systems memory scheduling rules. Relate your past experience to Amazon Leadership Principles.",
    resources: "Computer Networking by Kurose & Ross, PrepSphere OS Cheat Sheets.",
    candidateAdvice: "Structure your behavioral answers using the STAR method (Situation, Task, Action, Result). Quantify results where possible."
  },
  {
    id: "exp-4",
    authorName: "Vikram Malhotra",
    authorCollege: "NIT Trichy",
    authorAvatar: "V",
    date: "June 05, 2026",
    company: "Adobe",
    companyLogo: "AD",
    role: "Member of Technical Staff 1",
    package: "22 LPA",
    mode: "Off Campus",
    difficulty: "Medium",
    title: "Adobe MTS-1 Pool Hiring Process Experience",
    tags: ["React", "JavaScript", "DSA", "Adobe"],
    readingTime: "4 min read",
    likes: 45,
    commentsCount: 5,
    bookmarked: false,
    verdict: "Selected",
    summary: "The Adobe hiring process was structured around front-end engineering expertise. It consisted of an online coding test, 2 technical rounds (DSA + JavaScript/React core), and a manager/behavioral check.",
    timeline: [
      { roundName: "Online Assessment", date: "April 20, 2026", status: "completed", desc: "2 coding questions (Easy/Medium) and 15 MCQ questions covering core web technologies and programming logic." },
      { roundName: "Technical Round 1", date: "May 8, 2026", status: "completed", desc: "Deep dive into JS closures, event loop, custom hooks in React, and solving a basic stack-based code problem." },
      { roundName: "Technical Round 2", date: "May 10, 2026", status: "completed", desc: "Design a web component with virtualized lists to handle millions of records without lagging." },
      { roundName: "Manager Round", date: "May 22, 2026", status: "completed", desc: "Discussion on past web projects, agile methodologies, and cross-functional team collaboration experiences." },
      { roundName: "HR Round", date: "May 29, 2026", status: "completed", desc: "Salary breakup walkthrough and onboarding locations availability checks." }
    ],
    questionsAsked: [
      "Implement a custom debounce function in vanilla JavaScript that accepts a callback and delay.",
      "Solve the 'Valid Parentheses' problem and discuss space complexity optimization using stack."
    ],
    prepTips: "Deep dive into core web concepts (closures, event loop, hoisting, DOM nodes manipulation) and practice medium-level stack, map, and array problems on LeetCode.",
    resources: "MDN Web Docs, PrepSphere Front-End Interview Guide.",
    candidateAdvice: "Focus heavily on rendering performance optimization when answering React or web framework architecture questions."
  }
];

// Featured Companies list
const FEATURED_COMPANIES = [
  { name: "Google", logoColor: "bg-red-500/10 border-red-500/20 text-red-400", count: "1,240 Experiences", difficulty: "Hard", package: "42 LPA" },
  { name: "Microsoft", logoColor: "bg-blue-500/10 border-blue-500/20 text-blue-400", count: "890 Experiences", difficulty: "Medium", package: "28 LPA" },
  { name: "Amazon", logoColor: "bg-orange-500/10 border-orange-500/20 text-orange-400", count: "980 Experiences", difficulty: "Hard", package: "32 LPA" },
  { name: "Meta", logoColor: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400", count: "412 Experiences", difficulty: "Hard", package: "48 LPA" },
  { name: "Adobe", logoColor: "bg-pink-500/10 border-pink-500/20 text-pink-400", count: "325 Experiences", difficulty: "Medium", package: "22 LPA" }
];

// Top Contributors
const CONTRIBUTORS = [
  { name: "Aarav Mehra", shared: 24, votes: 412, badge: "Gold", avatarBg: "bg-indigo-500/20 text-indigo-300" },
  { name: "Shreya Ghoshal", shared: 18, votes: 295, badge: "Silver", avatarBg: "bg-purple-500/20 text-purple-300" },
  { name: "Divyansh Soni", shared: 14, votes: 188, badge: "Bronze", avatarBg: "bg-cyan-500/20 text-cyan-300" },
  { name: "Neha Roy", shared: 10, votes: 120, badge: "Top Contributor", avatarBg: "bg-pink-500/20 text-pink-300" }
];

// Community statistics
const STATISTICS = [
  { label: "Total Experiences", val: "3240", suffix: "+" },
  { label: "Top Companies", val: "48", suffix: "" },
  { label: "Monthly Posts", val: "145", suffix: "" },
  { label: "Active Contributors", val: "840", suffix: "" },
  { label: "Average Rating", val: "4.8", suffix: "★" }
];

// FAQ list
const FAQ_LIST = [
  { q: "How should I prepare for Google interviews?", a: "To clear Google technical interviews, focus heavily on mastering Data Structures and Algorithms, especially Graphs (DFS, BFS, Dijkstra), Trees (BST, Segment Trees), Dynamic Programming, and Recursion. Practice explaining your solution out loud as Google scores candidates on problem-solving approach and communication." },
  { q: "Which DSA topics are most asked?", a: "Based on community submissions, the most frequently asked DSA topics in interviews are Arrays, Hash Maps, Linked Lists, Trees/Binary Trees, Heap/Priority Queues, Dynamic Programming, Graphs, and Sliding Window algorithms." },
  { q: "How many interview rounds does Amazon usually have?", a: "Typically, Amazon has 4-5 rounds. This includes 1 Online Assessment (coding + behavioral questions) followed by 3-4 virtual technical rounds. At least one round is a Bar Raiser round focusing on Amazon's Leadership Principles." },
  { q: "What is expected in HR interviews?", a: "HR rounds check culture fit, salary expectations, relocation preferences, and career alignment. Be honest, show interest in the company values, and prepare examples of conflict resolution or projects teamwork." }
];

const InterviewExperiences = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Sidebar Open State
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Demo Empty State Toggler
  const [isEmptyState, setIsEmptyState] = useState(false);

  // Share Experience Form Overlay State
  const [shareFormOpen, setShareFormOpen] = useState(false);
  const [newExpTitle, setNewExpTitle] = useState("");
  const [newExpCompany, setNewExpCompany] = useState("");
  const [newExpRole, setNewExpRole] = useState("");
  const [newExpPackage, setNewExpPackage] = useState("");
  const [newExpSummary, setNewExpSummary] = useState("");
  const [newExpQuestions, setNewExpQuestions] = useState("");
  const [newExpTips, setNewExpTips] = useState("");

  // Feed State list (supports dynamic adds in local state)
  const [experiences, setExperiences] = useState(INITIAL_EXPERIENCES);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Interactive like / bookmark tracking
  const [likedList, setLikedList] = useState(new Set());
  const [bookmarkedList, setBookmarkedList] = useState(new Set());

  // Filter values
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCompany, setFilterCompany] = useState("All");
  const [filterRole, setFilterRole] = useState("All");
  const [filterDifficulty, setFilterDifficulty] = useState("All");
  const [filterMode, setFilterMode] = useState("All");
  const [sortBy, setSortBy] = useState("Latest");

  // Accordion faq expanded keys
  const [expandedFaqs, setExpandedFaqs] = useState({});

  // Filter application
  const filteredExperiences = useMemo(() => {
    if (isEmptyState) return [];
    return experiences
      .filter((exp) => {
        const matchesSearch =
          exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exp.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exp.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCompany = filterCompany === "All" || exp.company === filterCompany;
        const matchesRole =
          filterRole === "All" ||
          (filterRole === "Software Engineer" && exp.role.includes("Software")) ||
          (filterRole === "Cloud Support" && exp.role.includes("Cloud"));

        const matchesDifficulty = filterDifficulty === "All" || exp.difficulty === filterDifficulty;
        const matchesMode = filterMode === "All" || exp.mode === filterMode;

        return matchesSearch && matchesCompany && matchesRole && matchesDifficulty && matchesMode;
      })
      .sort((a, b) => {
        if (sortBy === "Most Liked") return b.likes - a.likes;
        // Default to latest
        return new Date(b.date) - new Date(a.date);
      });
  }, [experiences, searchQuery, filterCompany, filterRole, filterDifficulty, filterMode, sortBy, isEmptyState]);



  // Tag categories
  const popularTopics = ["Arrays", "React", "System Design", "OS", "DBMS", "Behavioral", "Low Level Design", "HR Round"];

  // Toggle dynamic like
  const handleLike = (id, e) => {
    e.stopPropagation();
    const updated = new Set(likedList);
    if (updated.has(id)) {
      updated.delete(id);
      setExperiences(prev => prev.map(exp => exp.id === id ? { ...exp, likes: exp.likes - 1 } : exp));
    } else {
      updated.add(id);
      setExperiences(prev => prev.map(exp => exp.id === id ? { ...exp, likes: exp.likes + 1 } : exp));
    }
    setLikedList(updated);
  };

  // Toggle dynamic bookmark
  const handleBookmark = (id, e) => {
    e.stopPropagation();
    const updated = new Set(bookmarkedList);
    if (updated.has(id)) {
      updated.delete(id);
      setExperiences(prev => prev.map(exp => exp.id === id ? { ...exp, bookmarked: false } : exp));
    } else {
      updated.add(id);
      setExperiences(prev => prev.map(exp => exp.id === id ? { ...exp, bookmarked: true } : exp));
    }
    setBookmarkedList(updated);
  };

  // Toggle Accordion Collapse
  const toggleFaq = (idx) => {
    setExpandedFaqs(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setFilterCompany("All");
    setFilterRole("All");
    setFilterDifficulty("All");
    setFilterMode("All");
    setSortBy("Latest");
  };

  const handleScrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Create Experience Post Submission
  const handleShareSubmit = (e) => {
    e.preventDefault();
    if (!newExpTitle || !newExpCompany || !newExpRole || !newExpPackage) {
      alert("Please fill out all required fields.");
      return;
    }
    
    // Create new mock record structure
    const newRecord = {
      id: `exp-${Date.now()}`,
      authorName: user?.name || "PrepSphere User",
      authorCollege: user?.college || "PrepSphere College",
      authorAvatar: user?.name ? user.name.charAt(0).toUpperCase() : "U",
      date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      company: newExpCompany,
      companyLogo: newExpCompany.charAt(0).toUpperCase(),
      role: newExpRole,
      package: newExpPackage,
      mode: "On Campus",
      difficulty: "Medium",
      title: newExpTitle,
      tags: ["DSA", "Behavioral", newExpCompany],
      readingTime: "3 min read",
      likes: 1,
      commentsCount: 0,
      bookmarked: false,
      verdict: "Selected",
      summary: newExpSummary || "No summary provided.",
      timeline: [
        { roundName: "Online Assessment", date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }), status: "completed", desc: "Coding questions on arrays and algorithms." },
        { roundName: "Technical Round 1", date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }), status: "completed", desc: "Core algorithms, debugging, and systems design discussions." }
      ],
      questionsAsked: newExpQuestions ? newExpQuestions.split("\n") : ["What are standard data structures?", "Describe class principles."],
      prepTips: newExpTips || "Understand algorithms complexity bounds.",
      resources: "LeetCode Premium, PrepSphere Tracker.",
      candidateAdvice: "Ask clarifying questions early."
    };

    setExperiences(prev => [newRecord, ...prev]);
    
    // Clear inputs and close overlay
    setNewExpTitle("");
    setNewExpCompany("");
    setNewExpRole("");
    setNewExpPackage("");
    setNewExpSummary("");
    setNewExpQuestions("");
    setNewExpTips("");
    setShareFormOpen(false);

    alert("Your interview experience was shared successfully! (Mock submission)");
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
          
          <TopNavbar
            onMenuClick={() => setSidebarOpen(true)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchPlaceholder="Search by company, role, technology, or keyword..."
          >
            {/* DEMO EMPTY STATE TOGGLE */}
            <div className="flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-xl">
              <span className="text-xs font-semibold text-indigo-300 font-mono">Empty State:</span>
              <button
                onClick={() => setIsEmptyState(!isEmptyState)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer outline-none ${
                  isEmptyState ? "bg-indigo-600" : "bg-slate-800"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    isEmptyState ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </TopNavbar>

          {/* MAIN PAGE CONTAINER */}
          <main className="flex-1 p-6 space-y-8 max-w-7xl mx-auto w-full">
            
            {/* HERO SECTION */}
            <section className="relative rounded-3xl border border-white/10 bg-slate-950/20 backdrop-blur-xl p-6 sm:p-8 overflow-hidden text-left">
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />

              <div className="relative z-10 max-w-2xl space-y-4">
                <div className="inline-flex items-center space-x-1.5 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-xs text-indigo-400 font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Real Placement Feed &amp; Interview Archives</span>
                </div>
                
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-inter">
                  Interview Experiences
                </h1>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
                  Learn from real interview experiences shared by students and professionals from top companies. Master coding strategies and structural processes.
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => setShareFormOpen(true)}
                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white text-sm font-bold cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all border border-indigo-500/20"
                  >
                    Share Experience
                  </button>
                  <button
                    onClick={() => handleScrollToSection("featured-companies")}
                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] hover:border-white/15 text-white text-sm font-semibold cursor-pointer transition-all"
                  >
                    Browse Companies
                  </button>
                </div>
              </div>
            </section>

            {isEmptyState ? (
              /* EMPTY STATE LAYOUT */
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center p-16 bg-white/[0.02] border border-white/10 rounded-3xl backdrop-blur-xl text-center max-w-lg mx-auto space-y-5"
              >
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">No Interview Experiences Found</h3>
                  <p className="text-sm text-slate-400 leading-relaxed font-light max-w-xs mx-auto">
                    Be the first to share your interview experience and help thousands of students prepare better.
                  </p>
                </div>
                <button
                  onClick={() => setShareFormOpen(true)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white text-sm font-bold transition-all cursor-pointer shadow-lg shadow-indigo-500/25 hover:scale-[1.01]"
                >
                  Share Your Experience
                </button>
              </motion.div>
            ) : (
              /* POPULATED LAYOUT */
              <div className="space-y-8">
                
                {/* SEARCH & FILTERS PANEL */}
                <section className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left shadow-lg">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                  
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-base font-semibold text-white flex items-center gap-2">
                      <Search className="w-5 h-5 text-indigo-400" />
                      Search &amp; Filters Options
                    </h3>
                    <button
                      onClick={handleResetFilters}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-bold transition-all cursor-pointer focus:outline-none"
                    >
                      Reset Filters
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {/* Search query input */}
                    <div className="col-span-2 lg:col-span-1">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by role, tag..."
                        className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500/60"
                      />
                    </div>

                    {/* Company Dropdown */}
                    <div>
                      <select
                        value={filterCompany}
                        onChange={(e) => setFilterCompany(e.target.value)}
                        className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 text-slate-300 text-xs sm:text-sm focus:outline-none focus:border-indigo-500/60"
                      >
                        <option value="All">All Companies</option>
                        <option value="Google">Google</option>
                        <option value="Microsoft">Microsoft</option>
                        <option value="Amazon">Amazon</option>
                        <option value="Meta">Meta</option>
                        <option value="Adobe">Adobe</option>
                      </select>
                    </div>

                    {/* Role Dropdown */}
                    <div>
                      <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 text-slate-300 text-xs sm:text-sm focus:outline-none focus:border-indigo-500/60"
                      >
                        <option value="All">All Roles</option>
                        <option value="Software Engineer">Software Engineer</option>
                        <option value="Cloud Support">Cloud Support</option>
                      </select>
                    </div>

                    {/* Difficulty Dropdown */}
                    <div>
                      <select
                        value={filterDifficulty}
                        onChange={(e) => setFilterDifficulty(e.target.value)}
                        className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 text-slate-300 text-xs sm:text-sm focus:outline-none focus:border-indigo-500/60"
                      >
                        <option value="All">All Difficulties</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>

                    {/* Sort By Dropdown */}
                    <div>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 text-slate-300 text-xs sm:text-sm focus:outline-none focus:border-indigo-500/60"
                      >
                        <option value="Latest">Latest</option>
                        <option value="Most Liked">Most Liked</option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* FEATURED COMPANIES CAROUSEL */}
                <section id="featured-companies" className="space-y-4 scroll-mt-24">
                  <h3 className="text-base font-semibold text-white text-left flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                    Featured Companies &bull; Active Recruitment
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 text-left">
                    {FEATURED_COMPANIES.map((company, idx) => (
                      <div
                        key={idx}
                        className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-indigo-500/25 transition-all cursor-pointer relative group h-[130px] shadow-sm hover:scale-[1.02]"
                      >
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent" />
                        <div className="flex justify-between items-center">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${company.logoColor}`}>
                            {company.name.charAt(0)}
                          </div>
                          <span className="text-[9px] font-bold text-slate-500 uppercase font-mono">{company.difficulty}</span>
                        </div>
                        <div className="mt-4">
                          <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{company.name}</h4>
                          <span className="text-[10px] text-slate-400 font-light mt-0.5 block">{company.count}</span>
                        </div>
                        <div className="border-t border-white/5 pt-2 mt-2 flex justify-between text-[9px] font-mono text-slate-400">
                          <span>Avg Package</span>
                          <span className="font-bold text-indigo-400">{company.package}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* MAIN SPLIT GRID (FEED & SIDEBAR) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column (8 cols): Experiences Feed List */}
                  <div className="lg:col-span-8 space-y-6">
                    <h3 className="text-base font-semibold text-white text-left flex items-center gap-2">
                      <Compass className="w-5 h-5 text-purple-400" />
                      Interview Experience Feed ({filteredExperiences.length})
                    </h3>

                    {filteredExperiences.length === 0 ? (
                      <div className="p-12 text-center bg-white/[0.02] border border-white/10 rounded-3xl text-slate-500 font-medium">
                        No interview experiences match the active query.
                      </div>
                    ) : (
                      filteredExperiences.map((exp) => {
                        let diffColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                        if (exp.difficulty === "Medium") diffColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
                        if (exp.difficulty === "Hard") diffColor = "text-red-400 bg-red-500/10 border-red-500/20";

                        const isLiked = likedList.has(exp.id);
                        const isBookmarked = bookmarkedList.has(exp.id);

                        return (
                          <div
                            key={exp.id}
                            className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left shadow-md hover:border-purple-500/20 transition-all flex flex-col justify-between h-auto gap-4"
                          >
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
                            
                            {/* Author Row */}
                            <div className="flex justify-between items-center border-b border-white/5 pb-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-300 flex items-center justify-center font-bold text-sm">
                                  {exp.authorAvatar}
                                </div>
                                <div>
                                  <h4 className="text-xs sm:text-sm font-bold text-white">{exp.authorName}</h4>
                                  <span className="text-[10px] text-slate-400 font-mono">{exp.authorCollege} &bull; {exp.date}</span>
                                </div>
                              </div>

                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                exp.verdict === "Selected" ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/25" : "text-slate-400 bg-slate-800"
                              }`}>
                                {exp.verdict}
                              </span>
                            </div>

                            {/* Title & Metadata details */}
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-400">
                                <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded px-1.5 py-0.5 font-bold uppercase">
                                  {exp.company}
                                </span>
                                <span>&bull;</span>
                                <span>{exp.role}</span>
                                <span>&bull;</span>
                                <span className="text-indigo-400">{exp.package}</span>
                                <span className="ml-auto text-slate-500 font-mono text-[9px]">{exp.readingTime}</span>
                              </div>

                              <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                                {exp.title}
                              </h3>
                              
                              <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed truncate max-w-2xl">
                                {exp.summary}
                              </p>
                            </div>

                            {/* Tags cloud */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {exp.tags.map((tag, idx) => (
                                <span key={idx} className="bg-white/5 border border-white/10 text-slate-300 rounded-lg px-2.5 py-0.5 text-[10px]">
                                  {tag}
                                </span>
                              ))}
                            </div>

                            {/* Bottom action row */}
                            <div className="border-t border-white/5 pt-4 mt-2 flex flex-wrap gap-4 items-center text-xs">
                              {/* Like button */}
                              <button
                                onClick={(e) => handleLike(exp.id, e)}
                                className={`flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer ${
                                  isLiked ? "text-red-400" : "text-slate-400"
                                }`}
                              >
                                <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                                <span>{exp.likes}</span>
                              </button>

                              {/* Comment indicator */}
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <MessageSquare className="w-4 h-4" />
                                <span>{exp.commentsCount}</span>
                              </div>

                              {/* Bookmark Toggle */}
                              <button
                                onClick={(e) => handleBookmark(exp.id, e)}
                                className={`p-1 rounded hover:text-white cursor-pointer ${
                                  isBookmarked ? "text-indigo-400" : "text-slate-400"
                                }`}
                                title="Bookmark Experience"
                              >
                                <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedExperience(exp);
                                  setModalOpen(true);
                                }}
                                className="ml-auto flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-bold transition-colors cursor-pointer focus:outline-none"
                              >
                                Read More
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Right Column (4 cols): Sidebar Widgets */}
                  <div className="lg:col-span-4 space-y-8 text-left">
                    
                    {/* Community Statistics Widget */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-lg">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-indigo-400" />
                        Community Statistics
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {STATISTICS.map((stat, idx) => (
                          <div key={idx} className="p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                            <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                              {stat.label}
                            </span>
                            <span className="text-xl font-black text-white font-mono">
                              <AnimatedStatNumber value={stat.val} suffix={stat.suffix} />
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Preparation Tip Widget */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-lg bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
                      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
                      
                      <div className="flex items-center space-x-2 text-indigo-400 mb-3">
                        <Sparkles className="w-4.5 h-4.5" />
                        <span className="text-xs font-bold uppercase tracking-wider">AI Preparation Tip</span>
                      </div>
                      
                      <p className="text-xs text-slate-300 leading-relaxed font-light mb-4">
                        Most Google and Amazon interview experiences shared this month heavily focused on **Graphs** and **Dynamic Programming** models.
                      </p>
                      
                      <button
                        onClick={() => navigate("/coding-journey")}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-indigo-500/10"
                      >
                        Practice DSA Now
                      </button>
                    </div>

                    {/* Top Contributors Leaderboard Widget */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-lg">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-purple-400" />
                        Top Contributors Leaderboard
                      </h3>
                      
                      <div className="space-y-4">
                        {CONTRIBUTORS.map((c, idx) => (
                          <div key={idx} className="flex items-center justify-between py-1 border-b border-white/5 last:border-0">
                            <div className="flex items-center space-x-2.5">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${c.avatarBg}`}>
                                {c.name.charAt(0)}
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-white">{c.name}</h4>
                                <span className="text-[9px] text-slate-400 font-mono">
                                  {c.shared} posts shared &bull; {c.votes} helpful votes
                                </span>
                              </div>
                            </div>
                            
                            <span className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                              c.badge === "Gold" ? "text-yellow-400 bg-yellow-500/10" :
                              c.badge === "Silver" ? "text-slate-400 bg-slate-500/10" :
                              c.badge === "Bronze" ? "text-amber-500/10 text-amber-500" :
                              "text-pink-400 bg-pink-500/10"
                            }`}>
                              {c.badge}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Popular Topics Cloud Widget */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-lg">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Flame className="w-4 h-4 text-cyan-400" />
                        Popular Topics Tags
                      </h3>
                      
                      <div className="flex flex-wrap gap-2">
                        {popularTopics.map((topic, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSearchQuery(topic)}
                            className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg px-2.5 py-1 text-xs transition-colors cursor-pointer"
                          >
                            #{topic}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

                {/* FAQ ACCORDION SECTION */}
                <section className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left shadow-lg">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                  
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-indigo-400" />
                    Frequently Asked Prep Questions (FAQ)
                  </h3>

                  <div className="space-y-4">
                    {FAQ_LIST.map((faq, idx) => {
                      const isExpanded = !!expandedFaqs[idx];
                      return (
                        <div key={idx} className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
                          <button
                            onClick={() => toggleFaq(idx)}
                            className="w-full flex justify-between items-center text-sm font-bold text-white hover:text-indigo-300 transition-colors focus:outline-none text-left py-2"
                          >
                            <span>{faq.q}</span>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-indigo-400" /> : <ChevronDown className="w-4 h-4 text-indigo-400" />}
                          </button>
                          
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden mt-2"
                              >
                                <p className="text-xs sm:text-sm text-slate-400 font-light leading-relaxed">
                                  {faq.a}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </section>

              </div>
            )}
          </main>

        </div>

        {/* EXPERIENCE DETAIL MODAL */}
        <AnimatePresence>
          {modalOpen && selectedExperience && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setModalOpen(false)}
                className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
              />

              {/* Modal Container */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 26, stiffness: 260 }}
                className="relative w-full max-w-4xl max-h-[85vh] bg-[#080E24]/95 border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(99,102,241,0.2)] backdrop-blur-2xl overflow-y-auto flex flex-col text-left"
              >
                {/* Accent Top Line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent pointer-events-none" />

                {/* Modal Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-start sticky top-0 bg-[#080E24]/90 backdrop-blur-md z-10">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/25 text-[10px] text-indigo-300 font-bold uppercase tracking-wider">
                      {selectedExperience.company} &bull; {selectedExperience.role}
                    </span>
                    <h2 className="text-lg sm:text-xl font-black text-white leading-tight mt-1.5">
                      {selectedExperience.title}
                    </h2>
                  </div>
                  
                  <button
                    onClick={() => setModalOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-8 flex-1">
                  
                  {/* Overview details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white/[0.01] border border-white/5 rounded-2xl p-4 text-xs font-mono">
                    <div>
                      <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">Package</span>
                      <span className="text-sm font-bold text-white">{selectedExperience.package}</span>
                    </div>
                    <div className="border-l border-white/5 pl-4">
                      <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">Interview Mode</span>
                      <span className="text-sm font-bold text-white">{selectedExperience.mode}</span>
                    </div>
                    <div className="border-l border-white/5 pl-4">
                      <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">Difficulty</span>
                      <span className="text-sm font-bold text-amber-400">{selectedExperience.difficulty}</span>
                    </div>
                    <div className="border-l border-white/5 pl-4">
                      <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">Verdict</span>
                      <span className="text-sm font-bold text-emerald-400">{selectedExperience.verdict}</span>
                    </div>
                  </div>

                  {/* Summary Overview */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Overview Summary</h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                      {selectedExperience.summary}
                    </p>
                  </div>

                  {/* INTERVIEW HORIZONTAL TIMELINE */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Interview Timeline</h3>
                    
                    <div className="overflow-x-auto pb-2">
                      <div className="min-w-[650px] p-4 bg-slate-950/20 border border-white/5 rounded-2xl relative flex justify-between gap-4">
                        {/* Glowing connector lines */}
                        <div className="absolute top-[35px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-60 z-0" />
                        
                        {(selectedExperience.timeline || []).map((step, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center text-center relative z-10">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center border bg-slate-900 border-indigo-500 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                              <Check className="w-4 h-4 text-indigo-300" />
                            </div>
                            <span className="text-[10px] font-bold text-white mt-2 block">{step.roundName}</span>
                            <span className="text-[9px] text-slate-400 font-mono font-semibold mt-0.5">{step.date}</span>
                            <p className="text-[9px] text-slate-500 font-light mt-1.5 leading-relaxed max-w-[120px]">{step.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Questions Asked */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Questions Asked</h3>
                    <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-300 leading-relaxed font-light space-y-1.5">
                      {(selectedExperience.questionsAsked || []).map((q, idx) => (
                        <li key={idx} className="font-mono text-indigo-200">{q}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Preparation Tips & resources */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/5 text-xs sm:text-sm">
                    <div className="space-y-2">
                      <h4 className="font-bold text-white uppercase tracking-wider">Preparation Tips</h4>
                      <p className="text-slate-300 font-light leading-relaxed">{selectedExperience.prepTips}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-white uppercase tracking-wider">Resources Used</h4>
                      <p className="text-slate-300 font-light leading-relaxed">{selectedExperience.resources}</p>
                    </div>
                  </div>

                  {/* Candidate Advice */}
                  <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl text-xs sm:text-sm leading-relaxed text-slate-300 font-light">
                    <span className="block font-bold text-indigo-400 mb-1">Advice for Candidates:</span>
                    {selectedExperience.candidateAdvice}
                  </div>

                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-white/5 bg-slate-950/20 flex justify-end">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white text-xs font-bold shadow-md cursor-pointer hover:scale-[1.01]"
                  >
                    Close Report
                  </button>
                </div>

              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* SHARE EXPERIENCE FORM OVERLAY */}
        <AnimatePresence>
          {shareFormOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShareFormOpen(false)}
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
              />

              {/* Form container */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative w-full max-w-lg max-h-[85vh] bg-[#080E24]/90 border border-white/10 rounded-3xl p-6 shadow-[0_0_50px_rgba(99,102,241,0.15)] backdrop-blur-xl overflow-y-auto text-left"
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent pointer-events-none" />

                <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <BookOpenCheck className="w-5 h-5 text-indigo-400" />
                    Share Your Interview Experience
                  </h3>
                  <button
                    onClick={() => setShareFormOpen(false)}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>

                <form onSubmit={handleShareSubmit} className="space-y-4 text-xs sm:text-sm">
                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-400 uppercase tracking-wide">Experience Title *</label>
                    <input
                      type="text"
                      required
                      value={newExpTitle}
                      onChange={(e) => setNewExpTitle(e.target.value)}
                      placeholder="e.g. Google SWE Internship Hiring Process Experience"
                      className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500/60"
                    />
                  </div>

                  {/* Company & Role */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block font-bold text-slate-400 uppercase tracking-wide">Target Company *</label>
                      <input
                        type="text"
                        required
                        value={newExpCompany}
                        onChange={(e) => setNewExpCompany(e.target.value)}
                        placeholder="e.g. Amazon"
                        className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500/60"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block font-bold text-slate-400 uppercase tracking-wide">Role *</label>
                      <input
                        type="text"
                        required
                        value={newExpRole}
                        onChange={(e) => setNewExpRole(e.target.value)}
                        placeholder="e.g. Cloud Support Associate"
                        className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500/60"
                      />
                    </div>
                  </div>

                  {/* Package */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-400 uppercase tracking-wide">Package (LPA) *</label>
                    <input
                      type="text"
                      required
                      value={newExpPackage}
                      onChange={(e) => setNewExpPackage(e.target.value)}
                      placeholder="e.g. 32 LPA"
                      className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500/60"
                    />
                  </div>

                  {/* Summary */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-400 uppercase tracking-wide">Process Summary Overview</label>
                    <textarea
                      value={newExpSummary}
                      onChange={(e) => setNewExpSummary(e.target.value)}
                      placeholder="Explain the coding assessments and phone interview rounds..."
                      className="w-full h-20 bg-slate-950/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500/60"
                    />
                  </div>

                  {/* Questions asked */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-400 uppercase tracking-wide">Questions Asked (One per line)</label>
                    <textarea
                      value={newExpQuestions}
                      onChange={(e) => setNewExpQuestions(e.target.value)}
                      placeholder="e.g. Solve validating a binary search tree..."
                      className="w-full h-20 bg-slate-950/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500/60 font-mono"
                    />
                  </div>

                  {/* Tips */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-400 uppercase tracking-wide">Preparation Advice &amp; Tips</label>
                    <textarea
                      value={newExpTips}
                      onChange={(e) => setNewExpTips(e.target.value)}
                      placeholder="What should candidates prepare to clear these rounds..."
                      className="w-full h-20 bg-slate-950/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500/60"
                    />
                  </div>

                  <div className="flex space-x-3 mt-6 justify-end">
                    <button
                      type="button"
                      onClick={() => setShareFormOpen(false)}
                      className="px-5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] text-slate-300 hover:text-white font-medium transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white font-bold transition-all cursor-pointer shadow-lg shadow-indigo-500/25"
                    >
                      Submit Post
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>



      </div>
    </>
  );
};

export default InterviewExperiences;
