import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import {
  startInterview as apiStartInterview,
  submitAnswer as apiSubmitAnswer,
  getInterviewHistory as apiGetInterviewHistory,
  getInterviewReport as apiGetInterviewReport
} from "../services/interviewService";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip as RechartsTooltip,
} from "recharts";
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
  TrendingUp,
  Award,
  Flame,
  ChevronRight,
  ChevronLeft,
  Play,
  CheckCircle2,
  Calendar,
  Menu,
  X,
  Clock,
  Briefcase,
  Upload,
  Mic,
  MicOff,
  Send,
  Plus,
  Info,
  RefreshCw,
  Star,
  Trash2,
  AlertCircle,
  FileText,
  Sliders,
  Sparkle,
  History,
  TrendingDown,
  Layers,
  Award as AwardIcon,
  Award as MedalIcon,
  Check,
  ChevronDown
} from "lucide-react";

// Reusable Skeleton Component for premium loading states
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-white/[0.03] border border-white/5 rounded-xl ${className}`} />
);

// Selection presets
const COMPANIES_LIST = [
  "Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix", "Adobe", "Oracle",
  "Atlassian", "Uber", "Salesforce", "NVIDIA", "Intel", "TCS", "Infosys", "Wipro",
  "Accenture", "Capgemini", "Cognizant", "Deloitte", "EY", "PwC", "KPMG", "Other"
];

const ROLES_LIST = [
  "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "MERN Stack Developer", "React Developer", "Node.js Developer", "Java Developer",
  "Python Developer", "Data Analyst", "Data Scientist", "AI Engineer",
  "Machine Learning Engineer", "Cloud Engineer", "DevOps Engineer", "Security Engineer",
  "QA Engineer", "Product Engineer", "Other"
];

const INTERVIEW_TYPES = [
  {
    category: "Technical",
    title: "Technical Interview",
    desc: "Coding, DS, Algorithms, OOPs & Web Fundamentals",
    difficulty: "Hard",
    icon: Code2
  },
  {
    category: "HR",
    title: "HR Interview",
    desc: "Behavioral, values, career objectives & payroll goals",
    difficulty: "Medium",
    icon: UserIcon
  },
  {
    category: "Behavioral",
    title: "Behavioral Interview",
    desc: "Scenario resolution models, team ethics & STAR format",
    difficulty: "Medium",
    icon: Brain
  },
  {
    category: "System Design",
    title: "System Design",
    desc: "Distributed models, load balancers & scaling",
    difficulty: "Hard",
    icon: Sliders
  },
  {
    category: "Mixed",
    title: "Mixed Interview",
    desc: "Realistic end-to-end combination assessments",
    difficulty: "Adaptive",
    icon: Sparkles
  }
];

// Realistic placeholder historical mock data representing initial interview records
const initialHistoryRecords = [
  {
    id: "int-101",
    category: "Technical",
    company: "Google",
    role: "Software Engineer",
    difficulty: "Hard",
    score: 88,
    date: "Jun 10, 2026",
    duration: "30 Min",
    status: "Completed",
    metrics: {
      confidence: 85,
      communication: 90,
      technicalAccuracy: 88,
      responseTime: 80,
      professionalism: 92,
      eyeContact: 85
    },
    radarData: [
      { subject: "Confidence", value: 85 },
      { subject: "Communication", value: 90 },
      { subject: "Technical Accuracy", value: 88 },
      { subject: "Response Time", value: 80 },
      { subject: "Professionalism", value: 92 },
      { subject: "Eye Contact", value: 85 }
    ],
    strengths: [
      "Demonstrated strong problem-solving patterns during technical design.",
      "Clear explanation of time and space complexity variables (O(N) vs O(log N)).",
      "Very professional communication tone and adaptive explanation style."
    ],
    weaknesses: [
      "Slightly hesitated when asked about edge-cases like memory limits.",
      "Brief pauses before speaking, showing initial latency under hard questions."
    ],
    topics: ["Arrays & HashMaps", "System Design Patterns", "Time Complexity O-Notation"],
    questionsReviewed: [
      {
        question: "Explain the difference between a process and a thread, and how threads share memory.",
        answer: "A process is an isolated execution environment with its own memory allocation. A thread is a lightweight unit of execution within a process, sharing the parent process's memory space and files which makes context switching faster but introduces race conditions.",
        ideal: "A process is a self-contained execution environment with a private memory space. A thread is an execution path inside a process. Threads of the same process share code, data, and OS resources (files/heaps), but have their own stack and registers.",
        score: 92,
        feedback: "Excellent precision. Accurately highlighted the sharing aspect and the risk of race conditions."
      },
      {
        question: "How would you design a caching mechanism for a database query with highly repeating inputs?",
        answer: "I would place a Redis cache in front of the database. When a query comes, I check Redis first. If it is a hit, return it. If it is a miss, query DB and populate Redis with a TTL of 3600 seconds.",
        ideal: "Utilize an In-memory key-value store (like Redis or Memcached) acting as a caching layer. Implement cache-aside or read-through strategies, specifying strict LRU eviction policies, key expiration TTLs, and cache invalidation policies on mutation.",
        score: 84,
        feedback: "Solid architecture description. Could expand on cache eviction rules and cache invalidation challenges."
      }
    ],
    recommendation: "Ready for Placements"
  },
  {
    id: "int-102",
    category: "HR",
    company: "Amazon",
    role: "Full Stack Developer",
    difficulty: "Medium",
    score: 76,
    date: "Jun 04, 2026",
    duration: "15 Min",
    status: "Needs Practice",
    metrics: {
      confidence: 72,
      communication: 80,
      technicalAccuracy: 70,
      responseTime: 75,
      professionalism: 85,
      eyeContact: 78
    },
    radarData: [
      { subject: "Confidence", value: 72 },
      { subject: "Communication", value: 80 },
      { subject: "Technical Accuracy", value: 70 },
      { subject: "Response Time", value: 75 },
      { subject: "Professionalism", value: 85 },
      { subject: "Eye Contact", value: 78 }
    ],
    strengths: [
      "Polite communication style.",
      "Good alignment with core leadership principles."
    ],
    weaknesses: [
      "Weak responses on conflict resolution scenario questions.",
      "Stuttered when describing previous project bottlenecks."
    ],
    topics: ["Conflict Resolution", "Leadership Principles", "STAR Response Method"],
    questionsReviewed: [
      {
        question: "Tell me about a time you had a conflict with a team member. How did you resolve it?",
        answer: "We had a disagreement about database schemas. I eventually just let them build it their way because we were running out of time.",
        ideal: "Describe a structured conflict using the STAR method. Emphasize active listening, objective evaluation of facts (e.g. benchmarking both schemas), collaborating to find a compromise, and focusing on project success over personal opinions.",
        score: 65,
        feedback: "Avoid passive yielding. Show active leadership, collaboration, and how you reached a mutually beneficial decision."
      }
    ],
    recommendation: "Needs Practice"
  }
];

// Presets for simulated AI interviewer prompts
const AI_QUESTION_PRESETS = {
  Technical: [
    "Hello! Welcome to your technical mock interview. Let's start. Can you explain what a closure is in JavaScript and give a practical use case for it?",
    "Excellent explanation. Next: Given an array of integers, how would you find the maximum subarray sum in O(N) time complexity? What algorithm is that?",
    "Great. Now, what is the difference between SQL and NoSQL databases, and when would you choose one over the other?",
    "Let's touch on networking. What happens behind the scenes when you type a URL like 'google.com' into your browser and press Enter?",
    "Final question: How do you handle authentication securely in a MERN stack application? Explain the role of JWTs and refresh tokens."
  ],
  HR: [
    "Hi there! Welcome. Let's begin by discussing your motivation. Why do you want to join our company, and what sets us apart for you?",
    "Interesting. Can you describe your greatest professional or academic accomplishment and why it is meaningful to you?",
    "What are your long-term career goals, and how does this role fit into your 5-year plan?",
    "How do you handle high-pressure environments and tight deadlines when working on critical deliverables?",
    "Excellent. Why should we hire you over other candidates who have similar technical qualifications?"
  ],
  Behavioral: [
    "Hello and welcome. Let's start with a behavioral scenario. Tell me about a time you made a significant mistake on a project. How did you handle it, and what did you learn?",
    "Good. Tell me about a time you had to work with a difficult team member. How did you manage the relationship to ensure the project succeeded?",
    "Describe a situation where you had to make an important decision with very limited data. What was your process?",
    "Tell me about a time you went above and beyond your standard responsibilities to deliver a project.",
    "Give an example of a goal you reached and tell me how you achieved it under constraints."
  ],
  "System Design": [
    "Welcome! Let's work on system design. How would you design a rate limiter for a public API that handles millions of requests per day?",
    "Good. Now, how would you design a URL shortening service like Bit.ly? What database schema and scaling choices would you make?",
    "Let's scale. How would you scale a web application from 1,000 active users to 10 million active users? Describe the components you'd add.",
    "Explain how database replication works and the tradeoffs between synchronous and asynchronous replication.",
    "How would you ensure session persistency across multiple stateless web servers behind a load balancer?"
  ],
  Mixed: [
    "Hello. Let's start with a technical question: Explain the difference between synchronous and asynchronous execution.",
    "Next, a behavioral scenario: Tell me about a project that failed. What went wrong, and how did you recover?",
    "Back to systems: What is a load balancer, and what algorithms are commonly used to distribute request traffic?",
    "HR: What is your preferred working style, and how do you handle constructive criticism?",
    "Finally: If you could redesign one feature on our product, what would it be and why?"
  ]
};

const MockInterview = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Tab/View State: 'home' | 'setup' | 'chat' | 'complete' | 'report' | 'history'
  const [currentView, setCurrentView] = useState("home");

  // Main lists states
  const [historyList, setHistoryList] = useState([]);
  const [activeReport, setActiveReport] = useState(null);

  // Loading, Empty, and Error States variables
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  // Pagination and Report loading states
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  // Setup/Configuration State
  const [config, setConfig] = useState({
    category: "Technical",
    jobRole: "Software Engineer",
    customRole: "",
    company: "Google",
    customCompany: "",
    difficulty: "Medium",
    duration: 30,
    useResume: true,
    questionCount: 15,
    language: "English"
  });

  const [companySearch, setCompanySearch] = useState("");
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [roleSearch, setRoleSearch] = useState("");
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [latestResume, setLatestResume] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(true);

  // Fetch latest resume context on mount
  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await api.get("/resume/history");
        if (response.data && response.data.success && response.data.history?.length > 0) {
          setLatestResume(response.data.history[0]);
        }
      } catch (err) {
        console.error("Error fetching latest resume:", err);
      } finally {
        setResumeLoading(false);
      }
    };
    fetchResume();
  }, []);

  const fetchHistory = async (page = 1) => {
    setHistoryLoading(true);
    try {
      const data = await apiGetInterviewHistory(page, 10);
      if (data && data.success) {
        setHistoryList(data.history || []);
        setHistoryPage(data.pagination?.page || 1);
        setHistoryTotalPages(data.pagination?.pages || 1);
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (currentView === "history") {
      fetchHistory(historyPage);
    } else if (currentView === "home") {
      fetchHistory(1);
    }
  }, [currentView, historyPage]);


  // Active Chat State
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Live Interview States
  const [activeInterview, setActiveInterview] = useState(null);
  const [progress, setProgress] = useState({
    currentQuestionNumber: 1,
    totalQuestions: 15,
    remainingQuestions: 15,
    progressPercentage: 0
  });
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [pendingAnswer, setPendingAnswer] = useState("");
  const [apiError, setApiError] = useState("");
  const [evaluations, setEvaluations] = useState([]);

  // Live indicators states
  const [liveMetrics, setLiveMetrics] = useState({
    confidence: 70,
    communication: 75,
    technicalAccuracy: 60,
    responseTime: 80,
    professionalism: 85,
    eyeContact: 90
  });

  const [liveSuggestions, setLiveSuggestions] = useState([
    { type: "strength", text: "Clear voice volume and neutral speech speed." },
    { type: "weakness", text: "Minimal structural pauses before responding." },
    { type: "suggestion", text: "Try to structure your answer using the STAR framework." }
  ]);

  const timerRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Standard Sidebar links
  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, active: false, path: "/dashboard" },
    { name: "Aptitude Practice", icon: Brain, active: false, path: "/aptitude-practice" },
    { name: "Resume Analyzer", icon: FileSearch, active: false, path: "/resume-analyzer" },
    { name: "Mock Interview", icon: MessageSquareCode, active: true, path: "/mock-interview" },
    { name: "Coding Tracker", icon: Code2, active: false, path: "/coding-tracker" },
    { name: "Interview Experiences", icon: BookOpen, active: false, path: "/interview-experiences" },
    { name: "Career Analytics", icon: LineChart, active: false, path: "/career-analytics" },
    { name: "Settings", icon: SettingsIcon, active: false, path: "/settings" },
  ];

  // Helper formats
  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  // Scroll chat to bottom
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isTyping]);

  // Handle countdown timer for Chat
  useEffect(() => {
    if (currentView === "chat" && !isPaused) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [currentView, isPaused]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // 1. Actions from Home
  const handleStartSetup = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setCurrentView("setup");
    }, 450);
  };

  // 2. Actions from Setup
  const handleLaunchInterview = async () => {
    setIsLoading(true);
    setApiError("");
    setLoadingMessage("Starting your AI mock interview session...");
    
    try {
      const selectedCompany = config.company === "Other" ? config.customCompany : config.company;
      const selectedRole = config.jobRole === "Other" ? config.customRole : config.jobRole;
      const payload = {
        interviewType: config.category,
        company: selectedCompany,
        role: selectedRole,
        difficulty: config.difficulty,
        duration: config.duration,
        language: config.language,
        resumeEnabled: !!config.useResume,
        resumeId: config.useResume && latestResume ? latestResume._id : null
      };

      const data = await apiStartInterview(payload);
      
      if (data && data.success) {
        setElapsedTime(0);
        setActiveQuestionIdx(0);
        setLiveMetrics({
          confidence: 75,
          communication: 78,
          technicalAccuracy: 65,
          responseTime: 80,
          professionalism: 85,
          eyeContact: 90
        });
        setLiveSuggestions([
          { type: "suggestion", text: "Speak clearly and state key conceptual frameworks first." }
        ]);

        setActiveInterview({
          _id: data.interviewId,
          ...data.interviewConfiguration
        });

        // Set config questionCount to match totalQuestions from backend
        setConfig(prev => ({
          ...prev,
          questionCount: data.totalQuestions
        }));

        setProgress({
          currentQuestionNumber: 1,
          totalQuestions: data.totalQuestions,
          remainingQuestions: data.totalQuestions,
          progressPercentage: 0
        });

        setEvaluations([]);
        setInterviewCompleted(false);

        // First AI Message
        setChatMessages([
          {
            sender: "ai",
            text: `Welcome, ${user?.name || "Candidate"}. I'll be conducting your ${config.category} mock interview today for the ${selectedRole} role at ${selectedCompany}. Let's begin. ${data.firstQuestion}`,
            timestamp: new Date()
          }
        ]);
        
        setCurrentView("chat");
      } else {
        setApiError("Failed to initialize session. Please check your network and try again.");
        setIsError(true);
      }
    } catch (err) {
      console.error("Error launching interview:", err);
      setApiError(err.response?.data?.message || "Failed to launch interview. Please try again.");
      setIsError(true);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  // 3. User Response submission during live interview chat
  const handleSendResponse = () => {
    if (!chatInput.trim() || isTyping || isPaused) return;
    
    const userText = chatInput;
    setPendingAnswer(userText);
    setChatInput("");
    setApiError("");

    // Add user message
    setChatMessages((prev) => [
      ...prev,
      { sender: "user", text: userText, timestamp: new Date() }
    ]);
    
    executeAnswerSubmission(userText);
  };

  const executeAnswerSubmission = async (answerText) => {
    setIsTyping(true);
    setApiError("");
    setLoadingMessage("AI is evaluating your answer...");

    try {
      const interviewId = activeInterview?._id;
      if (!interviewId) {
        throw new Error("Active interview session not found.");
      }

      const res = await apiSubmitAnswer(interviewId, { answer: answerText });

      if (res && res.success) {
        setLoadingMessage("Preparing your next interview question...");
        
        // Minor delay for natural conversation flow
        await new Promise((resolve) => setTimeout(resolve, 1200));

        // Format evaluation details (formatted feedback block)
        const feedbackText = `📊 Evaluation for your answer:
• Score: ${res.evaluation.percentageScore || (res.evaluation.score * 10)}%
• Strengths: ${res.evaluation.strengths.join(", ")}
• Areas to Improve: ${res.evaluation.weaknesses.join(", ")}
• Suggestions: ${res.evaluation.suggestions.join(", ")}`;

        // Extract the exact question text that was answered
        const aiMessages = chatMessages.filter(msg => msg.sender === "ai");
        const rawLastQuestion = aiMessages[aiMessages.length - 1]?.text || "";
        const cleanLastQuestion = rawLastQuestion.includes("Let's begin. ")
          ? rawLastQuestion.split("Let's begin. ")[1]
          : rawLastQuestion;

        // Save evaluation block in history log
        const newEvalObj = {
          question: cleanLastQuestion,
          answer: answerText,
          ideal: res.evaluation.idealAnswer || "No ideal answer details returned.",
          score: res.evaluation.percentageScore || (res.evaluation.score * 10),
          feedback: res.evaluation.suggestions.join(" ") || "No feedback suggestions.",
          strengths: res.evaluation.strengths || [],
          weaknesses: res.evaluation.weaknesses || []
        };

        const updatedEvals = [...evaluations, newEvalObj];
        setEvaluations(updatedEvals);

        // Update live meters dynamically based on scores
        setLiveMetrics((prev) => ({
          ...prev,
          technicalAccuracy: res.evaluation.percentageScore || (res.evaluation.score * 10),
          confidence: Math.round(Math.max(50, Math.min(100, 60 + (res.evaluation.score * 3.5) + Math.random() * 8))),
          communication: Math.round(Math.max(50, Math.min(100, 55 + (res.evaluation.score * 4.5) + Math.random() * 6))),
          professionalism: Math.round(Math.max(50, Math.min(100, 65 + (res.evaluation.score * 3) + Math.random() * 5))),
        }));

        // Render coach dynamic pointers
        const coachTips = [];
        if (res.evaluation.strengths?.length > 0) {
          coachTips.push({ type: "strength", text: res.evaluation.strengths[0] });
        }
        if (res.evaluation.weaknesses?.length > 0) {
          coachTips.push({ type: "weakness", text: res.evaluation.weaknesses[0] });
        }
        if (res.evaluation.suggestions?.length > 0) {
          coachTips.push({ type: "suggestion", text: res.evaluation.suggestions[0] });
        }
        setLiveSuggestions(coachTips);

        // Update progress metadata
        setProgress({
          currentQuestionNumber: res.currentQuestionNumber,
          totalQuestions: res.totalQuestions,
          remainingQuestions: res.remainingQuestions,
          progressPercentage: res.progressPercentage
        });

        if (res.interviewCompleted) {
          setChatMessages((prev) => [
            ...prev,
            { sender: "ai", text: feedbackText, timestamp: new Date() }
          ]);
          setIsTyping(false);
          handleEndInterview(updatedEvals);
        } else {
          setChatMessages((prev) => [
            ...prev,
            { sender: "ai", text: feedbackText, timestamp: new Date() },
            { sender: "ai", text: res.nextQuestion, timestamp: new Date() }
          ]);
          setActiveQuestionIdx(res.currentQuestionNumber - 1);
          setIsTyping(false);
        }
      } else {
        throw new Error("Failed response returned from API controller.");
      }
    } catch (err) {
      console.error("Error submitting answer:", err);
      const errMsg = err.response?.data?.message || err.message || "Network error submitting response. Please try again.";
      setApiError(errMsg);
      
      // Rollback last user response bubble from chat logs and load text back for edits
      setChatMessages((prev) => prev.slice(0, prev.length - 1));
      setChatInput(answerText);
      setIsTyping(false);
    } finally {
      setLoadingMessage("");
    }
  };

  const handleRetry = () => {
    if (!pendingAnswer || isTyping) return;

    setChatMessages((prev) => [
      ...prev,
      { sender: "user", text: pendingAnswer, timestamp: new Date() }
    ]);

    executeAnswerSubmission(pendingAnswer);
  };

  // 4. Force termination or normal completion
  const handleEndInterview = async (finalEvals) => {
    setIsLoading(true);
    clearInterval(timerRef.current);
    
    try {
      const interviewId = activeInterview?._id;
      if (!interviewId) {
        throw new Error("No active interview session found.");
      }

      // Fetch report details directly from backend API
      const data = await apiGetInterviewReport(interviewId);
      if (data && data.success) {
        setActiveReport(data.report);
        setInterviewCompleted(true);
        setCurrentView("complete");
      } else {
        throw new Error("Failed to load interview report.");
      }
    } catch (err) {
      console.error("Error finalizing interview:", err);
      setApiError(err.response?.data?.message || "Failed to finalize interview report.");
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenReport = async (reportOrId) => {
    const reportId = typeof reportOrId === 'string' ? reportOrId : (reportOrId.id || reportOrId._id);
    if (!reportId) return;

    setReportLoading(true);
    setCurrentView("report");
    try {
      const data = await apiGetInterviewReport(reportId);
      if (data && data.success) {
        setActiveReport(data.report);
      } else {
        setApiError("Failed to fetch report details.");
      }
    } catch (err) {
      console.error("Error fetching report:", err);
      setApiError(err.response?.data?.message || "Failed to retrieve interview report.");
    } finally {
      setReportLoading(false);
    }
  };

  const handleDeleteHistory = (id, e) => {
    e.stopPropagation();
    setHistoryList((prev) => prev.filter((item) => item.id !== id));
  };

  // Filter history records
  const filteredHistory = historyList.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.company.toLowerCase().includes(query) ||
      item.role.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );
  });

  // Helper to handle duration change and calculate mapped questions
  const handleDurationChange = (val) => {
    let qc = 15;
    if (val === 15) qc = 8;
    else if (val === 30) qc = 15;
    else if (val === 45) qc = 22;
    else if (val === 60) qc = 30;
    
    setConfig((prev) => ({
      ...prev,
      duration: val,
      questionCount: qc
    }));
  };

  // Check form validity
  const isFormValid = () => {
    if (!config.category) return false;
    
    if (config.company === "Other") {
      if (!config.customCompany || !config.customCompany.trim()) return false;
    } else {
      if (!config.company) return false;
    }
    
    if (config.jobRole === "Other") {
      if (!config.customRole || !config.customRole.trim()) return false;
    } else {
      if (!config.jobRole) return false;
    }
    
    if (!config.difficulty) return false;
    if (!config.duration) return false;
    
    return true;
  };

  // Get user-friendly validation warning string
  const getValidationWarning = () => {
    if (!config.category) return "Please select an interview type.";
    
    if (config.company === "Other") {
      if (!config.customCompany || !config.customCompany.trim()) {
        return "Please enter a custom company name.";
      }
    } else if (!config.company) {
      return "Please select a target company.";
    }
    
    if (config.jobRole === "Other") {
      if (!config.customRole || !config.customRole.trim()) {
        return "Please enter a custom job role.";
      }
    } else if (!config.jobRole) {
      return "Please select a target job role.";
    }
    
    if (!config.difficulty) return "Please select a difficulty level.";
    if (!config.duration) return "Please select an interview duration.";
    
    return "";
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

        {/* Glowing Ambient Orbs */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-[130px] pointer-events-none" />

        {/* SIDEBAR - DESKTOP */}
        <aside className="fixed left-0 top-0 h-screen w-[280px] hidden lg:flex flex-col bg-slate-950/40 border-r border-white/5 backdrop-blur-xl z-20 overflow-hidden">
          {/* Logo */}
          <div className="p-6 flex items-center space-x-3 border-b border-white/5">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-slate-950/80 border border-white/10 overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.25)]">
              <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" fill="currentColor" className="text-indigo-500 animate-pulse" />
                <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41M19.07 19.07l-1.41-1.41M6.34 6.34l-1.41-1.41" />
              </svg>
            </div>
            <span className="text-base font-extrabold tracking-tight text-white">
              PrepSphere <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">AI</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            {navItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl text-left text-base font-medium transition-all duration-200 cursor-pointer ${
                  item.active
                    ? "bg-gradient-to-r from-indigo-500/15 to-purple-500/10 text-indigo-300 border border-indigo-500/25 shadow-[0_4px_20px_rgba(99,102,241,0.08)]"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.03] border border-transparent"
                }`}
              >
                <item.icon className={`w-4 h-4 ${item.active ? "text-indigo-400" : "text-slate-500"}`} />
                <span>{item.name}</span>
              </button>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-white/5">
            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-left text-base font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 cursor-pointer focus:outline-none"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* MOBILE DRAWER SIDEBAR */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              />

              {/* Sidebar Drawer Container */}
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 z-50 w-[280px] bg-[#050B1F]/95 border-r border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col justify-between lg:hidden"
              >
                <div>
                  <div className="p-5 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="3" fill="currentColor" />
                          <path d="M12 2v2M12 20v2M4 12H2M22 12h-2" />
                        </svg>
                      </div>
                      <span className="text-base font-bold text-white">PrepSphere AI</span>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <nav className="px-3 py-5 space-y-1">
                    {navItems.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSidebarOpen(false);
                          navigate(item.path);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left text-base font-medium transition-all duration-200 ${
                          item.active
                            ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-300 border-l-[3px] border-indigo-500 pl-3.5"
                            : "text-slate-400 hover:text-white hover:bg-white/5 pl-4"
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="p-4 border-t border-white/5">
                  <button
                    onClick={() => {
                      setSidebarOpen(false);
                      setShowLogoutModal(true);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-left text-base font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* MAIN DISPLAY CONTAINER */}
        <div className="lg:ml-[280px] flex-1 flex flex-col h-screen overflow-y-auto z-10 relative">
          
          {/* TOP NAVBAR */}
          <header className="sticky top-0 z-30 bg-[#050B1F]/70 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-4 flex-1 max-w-lg">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 lg:hidden focus:outline-none shrink-0 animate-pulse"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div className="relative w-full group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search modules, configurations, history..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-300 placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="flex items-center space-x-6 shrink-0 pl-4">
              <button className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500" />
              </button>
              
              <div className="flex items-center space-x-3 border-l border-white/5 pl-6">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-white">Welcome Back, {user?.name?.split(" ")[0] || "User"}</p>
                  <p className="text-xs text-slate-400 mt-0.5 max-w-[150px] truncate">{user?.college || "PrepSphere College"}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-[1px] shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                  <div className="w-full h-full rounded-xl bg-[#080E24] flex items-center justify-center text-indigo-400 text-sm font-bold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* MAIN PAGE BODY (COORDINATOR ROUTE STATE) */}
          <main className="flex-1 p-6 space-y-8 max-w-7xl mx-auto w-full">
            
            {/* SKELETON LOADER TRIGGERED DURING PROCESS TRANSITIONS */}
            {isLoading ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center"><Skeleton className="h-10 w-1/4" /><Skeleton className="h-10 w-32" /></div>
                <Skeleton className="h-[280px] w-full" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </div>
            ) : isError ? (
              <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 text-center max-w-lg mx-auto space-y-4">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">Unable to compile Mock Session</h3>
                <p className="text-sm text-slate-400">There was an issue processing your mock interview specifications. Please reset the core config and try again.</p>
                <button onClick={() => { setIsError(false); setCurrentView("home"); }} className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all cursor-pointer">
                  Retry Dashboard
                </button>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                
                {/* 1. MOCK INTERVIEW HOME VIEW */}
                {currentView === "home" && (
                  <motion.div
                    key="home"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="space-y-8 text-left"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
                          <MessageSquareCode className="w-8 h-8 text-indigo-400" />
                          AI Mock Interview
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">Practice realistic AI-powered technical and HR interviews to prepare for placements.</p>
                      </div>
                      <div className="flex gap-2.5">
                        <button
                          onClick={() => setCurrentView("history")}
                          className="px-4 py-2 border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-xs font-bold rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <History className="w-4 h-4 text-indigo-400" />
                          History
                        </button>
                        <button
                          onClick={() => setCurrentView("setup")}
                          className="px-4 py-2 border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-xs font-bold rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <SettingsIcon className="w-4 h-4 text-purple-400" />
                          Settings
                        </button>
                      </div>
                    </div>

                    {/* Hero Card */}
                    <div className="bg-slate-950/20 border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
                      <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-indigo-500/10 blur-[90px] pointer-events-none" />
                      
                      <div className="space-y-4 max-w-xl">
                        <span className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-[11px] font-bold text-indigo-400 uppercase tracking-widest">
                          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                          Next Gen Interview Simulator
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">Ace Your Next Interview</h2>
                        <p className="text-sm text-slate-300 leading-relaxed font-light">
                          Practice company-specific interviews with AI. Receive instant feedback, strengths, weaknesses, and key improvement suggestions dynamically.
                        </p>
                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={handleStartSetup}
                            className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white text-sm font-semibold cursor-pointer shadow-lg shadow-indigo-500/25 hover:scale-[1.01] transition-all"
                          >
                            <Play className="w-3.5 h-3.5" />
                            Start Interview
                          </button>
                          <button
                            onClick={() => setCurrentView("history")}
                            className="px-5 py-2.5 rounded-full bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] hover:border-white/15 text-white text-sm font-semibold cursor-pointer transition-all hover:scale-[1.01]"
                          >
                            Interview History
                          </button>
                        </div>
                      </div>

                      {/* Right AI Vector Illustration (Pure Visual UI element) */}
                      <div className="relative w-48 h-48 sm:w-56 sm:h-56 hidden md:flex items-center justify-center shrink-0">
                        <div className="absolute inset-0 rounded-full bg-indigo-500/5 border border-indigo-500/10 animate-pulse" />
                        <div className="absolute inset-4 rounded-full bg-purple-500/5 border border-dashed border-purple-500/20 animate-spin [animation-duration:20s]" />
                        <div className="absolute inset-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-[1.5px] rotate-12 shadow-lg shadow-indigo-500/10">
                          <div className="w-full h-full rounded-2xl bg-[#080E24] flex items-center justify-center">
                            <MessageSquareCode className="w-12 h-12 text-indigo-400 animate-pulse" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Statistics (4 cards) */}
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4">Quick Performance Overview</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                          { label: "Total Interviews", val: historyList.length, icon: MessageSquareCode, col: "text-indigo-400 bg-indigo-500/10", border: "hover:border-indigo-500/25" },
                          { label: "Average Score", val: `${Math.round(historyList.reduce((acc, i) => acc + i.score, 0) / historyList.length || 0)}%`, icon: Award, col: "text-purple-400 bg-purple-500/10", border: "hover:border-purple-500/25" },
                          { label: "Best Interview", val: `${Math.max(...historyList.map((i) => i.score), 0)}%`, icon: Star, col: "text-pink-400 bg-pink-500/10", border: "hover:border-pink-500/25" },
                          { label: "Practice Streak", val: "4 Days", icon: Flame, col: "text-orange-400 bg-orange-500/10", border: "hover:border-orange-500/25" }
                        ].map((stat, idx) => (
                          <div
                            key={idx}
                            className={`bg-white/[0.02] border border-white/10 rounded-2xl p-5 text-left relative overflow-hidden transition-all duration-300 ${stat.border}`}
                          >
                            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                            <div className="flex justify-between items-start">
                              <span className="text-sm font-medium text-slate-400">{stat.label}</span>
                              <div className={`p-1.5 rounded-lg ${stat.col}`}>
                                <stat.icon className="w-4 h-4" />
                              </div>
                            </div>
                            <p className="text-2xl font-black text-white mt-4">{stat.val}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Interview Categories Selection Cards */}
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4">Select Interview Domain</h3>
                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        {[
                          { name: "Technical", desc: "Coding, DS, Algorithms, OOPs & Web Fundamentals", icon: Code2 },
                          { name: "HR", desc: "Behavioral, values, career objectives & payroll goals", icon: UserIcon },
                          { name: "Behavioral", desc: "Scenario resolution models, team ethics & STAR format", icon: Brain },
                          { name: "System Design", desc: "Distributed models, load balancers & scaling", icon: Sliders },
                          { name: "Mixed", desc: "Realistic end-to-end combination assessments", icon: Sparkles }
                        ].map((cat, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setConfig((prev) => ({ ...prev, category: cat.name }));
                              handleStartSetup();
                            }}
                            className={`p-5 bg-slate-950/20 border rounded-2xl text-left hover:scale-[1.01] transition-all duration-200 cursor-pointer flex flex-col justify-between h-[160px] group ${
                              config.category === cat.name ? "border-indigo-500 bg-indigo-500/5 shadow-[0_0_20px_rgba(99,102,241,0.15)]" : "border-white/10 hover:border-white/20"
                            }`}
                          >
                            <div className={`p-2 rounded-xl w-fit ${config.category === cat.name ? "bg-indigo-500 text-white" : "bg-white/5 text-slate-400 group-hover:text-indigo-400"}`}>
                              <cat.icon className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-white text-sm">{cat.name}</h4>
                              <p className="text-[11px] text-slate-400 mt-1 leading-normal">{cat.desc}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Recent History Preview */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-lg">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white">Recent Mock Interviews</h3>
                        <button onClick={() => setCurrentView("history")} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 focus:outline-none">
                          View Full History
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      {historyList.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 italic text-sm">
                          No recent mock interviews found.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm border-collapse">
                            <thead>
                              <tr className="border-b border-white/5 text-slate-400 text-xs uppercase tracking-wider font-bold">
                                <th className="pb-3 pr-4">Company</th>
                                <th className="pb-3 pr-4">Job Role</th>
                                <th className="pb-3 pr-4">Category</th>
                                <th className="pb-3 pr-4">Score</th>
                                <th className="pb-3 pr-4">Date</th>
                                <th className="pb-3 pr-4">Status</th>
                                <th className="pb-3 text-right">Report</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {historyList.slice(0, 3).map((item) => (
                                <tr key={item.id} className="group hover:bg-white/[0.01] transition-colors">
                                  <td className="py-3.5 pr-4 font-semibold text-white">{item.company}</td>
                                  <td className="py-3.5 pr-4 text-slate-300">{item.role}</td>
                                  <td className="py-3.5 pr-4">
                                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-white/5 text-slate-400">
                                      {item.category}
                                    </span>
                                  </td>
                                  <td className="py-3.5 pr-4">
                                    <span className={`font-black ${item.score >= 80 ? "text-emerald-400" : "text-amber-400"}`}>
                                      {item.score}%
                                    </span>
                                  </td>
                                  <td className="py-3.5 pr-4 text-slate-400 font-light">{item.date}</td>
                                  <td className="py-3.5 pr-4">
                                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                                      item.status === "Completed" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                    }`}>
                                      {item.status}
                                    </span>
                                  </td>
                                  <td className="py-3.5 text-right">
                                    <button
                                      onClick={() => handleOpenReport(item)}
                                      className="px-3 py-1.5 text-xs font-bold text-indigo-400 border border-indigo-500/20 hover:border-indigo-500 bg-indigo-500/5 rounded-lg transition-all cursor-pointer focus:outline-none"
                                    >
                                      View Report
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* 2. INTERVIEW SETUP VIEW */}
                {currentView === "setup" && (
                  <motion.div
                    key="setup"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="space-y-6 max-w-7xl mx-auto text-left"
                  >
                    {/* Header */}
                    <div>
                      <button onClick={() => setCurrentView("home")} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors mb-2 focus:outline-none">
                        <ChevronLeft className="w-4 h-4" />
                        Back to Home
                      </button>
                      <h1 className="text-3xl font-black text-white tracking-tight">AI Mock Interview</h1>
                      <p className="text-sm text-slate-400 mt-1">Configure your interview and let AI simulate a realistic placement interview experience.</p>
                    </div>

                    {/* TWO-COLUMN GRID */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      
                      {/* Left Column: Form Configuration (8 columns) */}
                      <div className="lg:col-span-8 space-y-6">
                        
                        {/* Domain/Interview Type Selection */}
                        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden space-y-4 shadow-lg">
                          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                          <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest">Interview Type</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {INTERVIEW_TYPES.map((type) => {
                              const isSelected = config.category === type.category;
                              const Icon = type.icon;
                              return (
                                <button
                                  key={type.category}
                                  type="button"
                                  onClick={() => setConfig((prev) => ({ ...prev, category: type.category }))}
                                  className={`p-4 rounded-2xl text-left transition-all duration-300 relative border group flex gap-4 items-start cursor-pointer ${
                                    isSelected 
                                      ? "border-indigo-500 bg-indigo-500/5 shadow-[0_0_20px_rgba(99,102,241,0.12)]" 
                                      : "border-white/5 bg-slate-950/20 hover:border-white/10"
                                  }`}
                                >
                                  {isSelected && (
                                    <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent pointer-events-none" />
                                  )}
                                  <div className={`p-2 rounded-xl shrink-0 ${isSelected ? "bg-indigo-500 text-white" : "bg-white/5 text-slate-400 group-hover:text-indigo-400"}`}>
                                    <Icon className="w-5 h-5" />
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-bold text-white text-sm">{type.title}</h4>
                                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-slate-400 uppercase">
                                        {type.difficulty}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-400 leading-normal font-light">{type.desc}</p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Searchable Selectors: Company & Job Role */}
                        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative z-20 space-y-6 shadow-lg">
                          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            
                            {/* Target Company (Searchable Dropdown) */}
                            <div className="space-y-2.5 relative">
                              <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest">Target Company</label>
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCompanyDropdownOpen(!companyDropdownOpen);
                                    setRoleDropdownOpen(false);
                                  }}
                                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 text-sm flex items-center justify-between focus:outline-none focus:border-indigo-500 cursor-pointer"
                                >
                                  <span>{config.company}</span>
                                  <ChevronDown className="w-4 h-4 text-slate-400" />
                                </button>
                                
                                {companyDropdownOpen && (
                                  <>
                                    <div className="fixed inset-0 z-30" onClick={() => setCompanyDropdownOpen(false)} />
                                    <div className="absolute left-0 right-0 mt-2 bg-[#080E24] border border-white/10 rounded-xl shadow-2xl p-2.5 z-[9999] max-h-60 overflow-y-auto space-y-2">
                                      <div className="relative">
                                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                                        <input
                                          type="text"
                                          placeholder="Search companies..."
                                          value={companySearch}
                                          onChange={(e) => setCompanySearch(e.target.value)}
                                          className="w-full bg-slate-950 border border-white/5 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        {COMPANIES_LIST.filter(c => c.toLowerCase().includes(companySearch.toLowerCase())).map((c) => (
                                          <button
                                            key={c}
                                            type="button"
                                            onClick={() => {
                                              setConfig(prev => ({ ...prev, company: c }));
                                              setCompanyDropdownOpen(false);
                                              setCompanySearch("");
                                            }}
                                            className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                                              config.company === c ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-white/5"
                                            }`}
                                          >
                                            <span>{c}</span>
                                            {config.company === c && <Check className="w-3.5 h-3.5" />}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Target Job Role (Searchable Dropdown) */}
                            <div className="space-y-2.5 relative">
                              <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest">Target Job Role</label>
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRoleDropdownOpen(!roleDropdownOpen);
                                    setCompanyDropdownOpen(false);
                                  }}
                                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 text-sm flex items-center justify-between focus:outline-none focus:border-indigo-500 cursor-pointer"
                                >
                                  <span>{config.jobRole}</span>
                                  <ChevronDown className="w-4 h-4 text-slate-400" />
                                </button>
                                
                                {roleDropdownOpen && (
                                  <>
                                    <div className="fixed inset-0 z-30" onClick={() => setRoleDropdownOpen(false)} />
                                    <div className="absolute left-0 right-0 mt-2 bg-[#080E24] border border-white/10 rounded-xl shadow-2xl p-2.5 z-[9999] max-h-60 overflow-y-auto space-y-2">
                                      <div className="relative">
                                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                                        <input
                                          type="text"
                                          placeholder="Search roles..."
                                          value={roleSearch}
                                          onChange={(e) => setRoleSearch(e.target.value)}
                                          className="w-full bg-slate-950 border border-white/5 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        {ROLES_LIST.filter(r => r.toLowerCase().includes(roleSearch.toLowerCase())).map((r) => (
                                          <button
                                            key={r}
                                            type="button"
                                            onClick={() => {
                                              setConfig(prev => ({ ...prev, jobRole: r }));
                                              setRoleDropdownOpen(false);
                                              setRoleSearch("");
                                            }}
                                            className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                                              config.jobRole === r ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-white/5"
                                            }`}
                                          >
                                            <span>{r}</span>
                                            {config.jobRole === r && <Check className="w-3.5 h-3.5" />}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                          </div>

                          {/* Custom Fields (Reveal with animations if Other selected) */}
                          <AnimatePresence>
                            {config.company === "Other" && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25 }}
                                className="space-y-2 text-left"
                              >
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest">Company Name</label>
                                <input
                                  type="text"
                                  placeholder="Enter company name (e.g. Swiggy, Swiggy,Swiggy, SWOT, Swiggy, Startup Name)"
                                  value={config.customCompany}
                                  onChange={(e) => setConfig(prev => ({ ...prev, customCompany: e.target.value }))}
                                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <AnimatePresence>
                            {config.jobRole === "Other" && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25 }}
                                className="space-y-2 text-left"
                              >
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest">Role Name</label>
                                <input
                                  type="text"
                                  placeholder="Enter desired job role"
                                  value={config.customRole}
                                  onChange={(e) => setConfig(prev => ({ ...prev, customRole: e.target.value }))}
                                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Difficulty Options */}
                        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden space-y-4 shadow-lg">
                          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                          <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest">Difficulty</label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                            {["Easy", "Medium", "Hard", "Adaptive"].map((diff) => {
                              const isSelected = config.difficulty === diff;
                              return (
                                <button
                                  key={diff}
                                  type="button"
                                  onClick={() => setConfig((prev) => ({ ...prev, difficulty: diff }))}
                                  className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all duration-300 text-center relative cursor-pointer ${
                                    isSelected 
                                      ? "border-purple-500 bg-purple-500/10 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.15)]" 
                                      : "border-white/5 bg-slate-950/20 text-slate-400 hover:border-white/10"
                                  }`}
                                >
                                  {diff === "Adaptive" && (
                                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-[8px] uppercase px-1.5 py-0.5 rounded-full tracking-wider shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                                      Recommended
                                    </span>
                                  )}
                                  <span>{diff}</span>
                                </button>
                              );
                            })}
                          </div>
                          {config.difficulty === "Adaptive" && (
                            <p className="text-xs text-slate-400 font-light flex items-center gap-1.5 mt-2 bg-indigo-500/5 border border-indigo-500/10 p-2.5 rounded-xl">
                              <Info className="w-4 h-4 text-indigo-400 shrink-0" />
                              AI automatically adjusts question difficulty based on your answers.
                            </p>
                          )}
                        </div>

                        {/* Interview Duration & Mapped Questions counts */}
                        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden space-y-4 shadow-lg">
                          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                          <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest">Interview Duration</label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                            {[
                              { label: "15 Minutes", val: 15, qc: 8 },
                              { label: "30 Minutes", val: 30, qc: 15 },
                              { label: "45 Minutes", val: 45, qc: 22 },
                              { label: "60 Minutes", val: 60, qc: 30 }
                            ].map((dur) => {
                              const isSelected = config.duration === dur.val;
                              return (
                                <button
                                  key={dur.val}
                                  type="button"
                                  onClick={() => handleDurationChange(dur.val)}
                                  className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all duration-300 text-center cursor-pointer ${
                                    isSelected 
                                      ? "border-indigo-500 bg-indigo-500/10 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.15)]" 
                                      : "border-white/5 bg-slate-950/20 text-slate-400 hover:border-white/10"
                                  }`}
                                >
                                  <span className="block text-sm font-bold">{dur.label}</span>
                                  <span className="block text-[10px] text-slate-500 mt-1 font-light">≈ {dur.qc} Questions</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Resume Integration Card */}
                        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden space-y-4 shadow-lg text-left">
                          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                          <div className="flex justify-between items-center pb-3 border-b border-white/5">
                            <div>
                              <h3 className="text-sm font-bold text-white">Resume Personalization</h3>
                              <p className="text-xs text-slate-400 mt-0.5 font-light">Personalize the interview using your latest analyzed resume.</p>
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => setConfig((prev) => ({ ...prev, useResume: !prev.useResume }))}
                              className={`w-12 h-6.5 rounded-full p-0.5 transition-all cursor-pointer focus:outline-none ${config.useResume ? "bg-indigo-600" : "bg-slate-800"}`}
                            >
                              <div className={`w-5.5 h-5.5 rounded-full bg-white transition-all shadow-md transform ${config.useResume ? "translate-x-5.5" : "translate-x-0"}`} />
                            </button>
                          </div>

                          <AnimatePresence mode="wait">
                            {config.useResume ? (
                              <motion.div
                                key="resume-on"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="space-y-4"
                              >
                                {resumeLoading ? (
                                  <div className="space-y-2">
                                    <Skeleton className="h-4 w-1/3" />
                                    <Skeleton className="h-6 w-full" />
                                  </div>
                                ) : latestResume ? (
                                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-950/40 border border-white/5 rounded-2xl gap-4">
                                    <div className="flex items-center gap-3.5">
                                      <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                                        <FileText className="w-5 h-5" />
                                      </div>
                                      <div>
                                        <span className="block text-sm font-semibold text-white truncate max-w-[200px] sm:max-w-xs">
                                          {latestResume.resumeName || "Resume.pdf"}
                                        </span>
                                        <span className="block text-[11px] text-slate-500 font-light mt-0.5">
                                          Uploaded {latestResume.createdAt ? new Date(latestResume.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recently"}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="text-left sm:text-right flex sm:flex-col gap-2.5 sm:gap-0 sm:justify-center">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ATS Score</span>
                                      <span className="text-base font-extrabold text-purple-400 sm:mt-0.5">
                                        {latestResume.atsAnalysis?.score || latestResume.atsScore || 0}%
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl space-y-3">
                                    <div className="flex gap-2.5 items-start">
                                      <AlertCircle className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                                      <div>
                                        <p className="text-xs font-bold text-amber-500">No analyzed resume found.</p>
                                        <p className="text-xs text-slate-400 font-light mt-1 leading-relaxed">
                                          Analyze your resume to unlock personalized interview questions based on your projects, experience, and skills.
                                        </p>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => navigate("/resume-analyzer")}
                                      className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
                                    >
                                      Analyze Resume
                                    </button>
                                  </div>
                                )}
                                
                                {latestResume && (
                                  <div className="flex gap-3 text-xs">
                                    <button
                                      type="button"
                                      onClick={() => navigate("/resume-analyzer")}
                                      className="text-indigo-400 hover:text-indigo-300 font-bold focus:outline-none"
                                    >
                                      Change Resume
                                    </button>
                                    <span className="text-slate-700">|</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (latestResume.resumeUrl) {
                                          window.open(latestResume.resumeUrl, "_blank", "noopener,noreferrer");
                                        } else {
                                          alert("Resume source url unavailable.");
                                        }
                                      }}
                                      className="text-indigo-400 hover:text-indigo-300 font-bold focus:outline-none"
                                    >
                                      Preview Resume
                                    </button>
                                  </div>
                                )}
                              </motion.div>
                            ) : (
                              <motion.div
                                key="resume-off"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="text-xs text-slate-400 font-light italic"
                              >
                                Interview will be based only on your selected role and company.
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Interview Coverage (AI-driven static info card) */}
                        <div className="bg-gradient-to-br from-indigo-950/15 via-purple-950/10 to-slate-950/30 border border-indigo-500/20 rounded-3xl p-6 relative overflow-hidden space-y-4 shadow-[0_4px_30px_rgba(0,0,0,0.4)] text-left">
                          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/30 rounded-2xl text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.15)] mt-0.5 animate-pulse">
                              <Sparkles className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                                AI Interview Strategy
                              </h3>
                              <p className="text-xs text-slate-400 mt-1 font-light leading-relaxed">
                                The AI interviewer automatically personalizes your interview based on your resume, selected role, company, interview type, and difficulty level. No manual topic selection is required.
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1 text-[11px]">
                            {[
                              { label: "Resume & Experience", desc: "Personalized questions from your projects, experience, and achievements." },
                              { label: "Role Knowledge", desc: "Role-specific concepts, tools, workflows, and responsibilities." },
                              { label: "Core Competencies", desc: "Foundational knowledge required for the selected profession." },
                              { label: "Problem Solving", desc: "Analytical thinking, decision-making, and real-world scenarios." },
                              { label: "Communication", desc: "Professional communication, teamwork, leadership, and collaboration." },
                              { label: "Company Alignment", desc: "Motivation, culture fit, career goals, and behavioral assessment." }
                            ].map((item, index) => (
                              <div key={index} className="bg-slate-950/30 border border-white/[0.04] p-3 rounded-xl space-y-1 hover:border-indigo-500/20 transition-all duration-300 animate-fadeIn">
                                <span className="font-bold text-indigo-300 block">{item.label}</span>
                                <span className="text-[10px] text-slate-400 font-light block leading-relaxed">{item.desc}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Language Selection */}
                        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden space-y-4 shadow-lg text-left">
                          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                          <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest">Interview Language</label>
                          <div className="grid grid-cols-3 gap-3.5">
                            {["English", "Hindi", "Mixed"].map((lang) => {
                              const isSelected = config.language === lang;
                              return (
                                <button
                                  key={lang}
                                  type="button"
                                  onClick={() => setConfig((prev) => ({ ...prev, language: lang }))}
                                  className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all duration-300 text-center cursor-pointer ${
                                    isSelected 
                                      ? "border-indigo-500 bg-indigo-500/10 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.15)]" 
                                      : "border-white/5 bg-slate-950/20 text-slate-400 hover:border-white/10"
                                  }`}
                                >
                                  {lang}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                      </div>

                      {/* Right Column: Preview Summary & Smart Tips (4 columns) */}
                      <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                        
                        {/* Dynamic Preview Summary Card */}
                        <div className="bg-slate-950/40 border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-2xl text-left space-y-5">
                          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent pointer-events-none" />
                          
                          <div>
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Live Summary</span>
                            <h3 className="text-lg font-bold text-white mt-0.5">Session Settings</h3>
                          </div>

                          <div className="space-y-3.5 text-xs text-slate-400 pt-2 border-t border-white/5">
                            <div className="flex justify-between">
                              <span>Interview Type:</span>
                              <span className="font-bold text-white">{config.category}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Target Company:</span>
                              <span className="font-bold text-white truncate max-w-[150px]">
                                {config.company === "Other" ? (config.customCompany || "Not Specified") : config.company}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Target Role:</span>
                              <span className="font-bold text-white truncate max-w-[150px]">
                                {config.jobRole === "Other" ? (config.customRole || "Not Specified") : config.jobRole}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Difficulty:</span>
                              <span className="font-bold text-white">{config.difficulty}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Duration:</span>
                              <span className="font-bold text-white">{config.duration} mins</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Resume Personalization:</span>
                              <span className={`font-bold ${(!config.useResume) ? "text-slate-500" : latestResume ? "text-purple-400" : "text-amber-400"}`}>
                                {!config.useResume ? "Disabled" : latestResume ? "Personalized" : "Standard"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>AI Coverage:</span>
                              <span className={`font-bold ${(config.useResume && latestResume) ? "text-purple-400" : "text-indigo-400"}`}>
                                {(config.useResume && latestResume) ? "Personalized" : "Adaptive"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Estimated Questions:</span>
                              <span className="font-bold text-white">≈ {config.questionCount} Qs</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Language:</span>
                              <span className="font-bold text-white">{config.language}</span>
                            </div>
                          </div>

                          {/* Trigger Start button */}
                          <div className="pt-2">
                            <button
                              type="button"
                              disabled={!isFormValid()}
                              onClick={handleLaunchInterview}
                              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:scale-[1.01] active:scale-[0.99] text-white text-xs font-black shadow-lg shadow-indigo-500/25 transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none focus:outline-none"
                            >
                              <span>Start AI Interview</span>
                              <ChevronRight className="w-4.5 h-4.5" />
                            </button>
                            
                            {!isFormValid() && (
                              <p className="text-[10px] text-amber-500 mt-2 text-center bg-amber-500/5 border border-amber-500/10 p-1.5 rounded-lg font-light leading-normal">
                                {getValidationWarning()}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Smart Tips Info Card */}
                        <div className="bg-[#080E24]/30 border border-white/5 rounded-3xl p-5 text-left relative overflow-hidden shadow-lg space-y-4">
                          <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Info className="w-4.5 h-4.5 text-indigo-400 shrink-0" />
                            Smart Interview Tips
                          </h4>
                          <ul className="space-y-2.5 text-xs text-slate-400 font-light leading-relaxed">
                            <li className="flex items-start gap-2">
                              <span className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                              Use your resume to receive personalized project-based questions.
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                              Adaptive mode provides the most realistic interview experience.
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                              Practice Technical and HR interviews separately for better preparation.
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                              Longer interviews provide more detailed AI feedback.
                            </li>
                          </ul>
                        </div>

                      </div>

                    </div>

                    {/* Bottom Actions for configuration view - Mobile Sticky Start Button (only visible on mobile) */}
                    <div className="flex lg:hidden fixed bottom-0 left-0 right-0 bg-slate-950/80 border-t border-white/10 backdrop-blur-md p-4.5 z-30 justify-between items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setCurrentView("home")}
                        className="px-5 py-3 rounded-xl border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={!isFormValid()}
                        onClick={handleLaunchInterview}
                        className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white text-xs font-black shadow-lg transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                      >
                        Start AI Interview
                      </button>
                    </div>

                  </motion.div>
                )}

                {/* 3. LIVE INTERVIEW CHAT VIEW (3 columns layout) */}
                {currentView === "chat" && (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left"
                  >
                    {/* CENTER PANEL (8 columns): Header, conversation, input */}
                    <div className="lg:col-span-8 flex flex-col h-[70vh] min-h-[500px] bg-slate-950/20 border border-white/10 rounded-3xl relative overflow-hidden shadow-2xl">
                      {/* Top border glow */}
                      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent pointer-events-none" />

                      {/* Header block details */}
                      <div className="p-4 sm:p-5 border-b border-white/5 bg-slate-950/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 font-bold shrink-0 animate-pulse">
                            <Sparkle className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-white text-sm sm:text-base">{config.category} Interview</h3>
                              <span className="text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                                {config.company}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5 font-light">{config.jobRole} | {config.difficulty}</p>
                          </div>
                        </div>

                        {/* Timer / Pause / Close actions */}
                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                          <div className="flex items-center gap-2 bg-slate-950 border border-white/5 px-3 py-1.5 rounded-xl">
                            <Clock className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="text-xs font-mono font-bold text-white">{formatTime(elapsedTime)}</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setIsPaused(!isPaused)}
                              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer focus:outline-none ${
                                isPaused ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-white/5 border-transparent text-slate-300 hover:text-white"
                              }`}
                            >
                              {isPaused ? "Resume" : "Pause"}
                            </button>
                            <button
                              onClick={handleEndInterview}
                              className="px-3 py-1.5 text-xs font-bold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors cursor-pointer focus:outline-none"
                            >
                              End Interview
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Question Progress bar */}
                      <div className="bg-slate-950/20 border-b border-white/5 px-5 py-2.5 flex items-center justify-between shrink-0">
                        <span className="text-xs text-slate-400">
                          Question <span className="font-bold text-white">{progress.currentQuestionNumber}</span> of <span className="font-bold text-slate-300">{progress.totalQuestions}</span>
                        </span>
                        <div className="w-48 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5 ml-4">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                            style={{ width: `${progress.progressPercentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Chat Messages Log view */}
                      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-950/10">
                        {chatMessages.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`flex ${msg.sender === "ai" ? "justify-start" : "justify-end"}`}
                          >
                            <div className={`flex gap-3 max-w-[85%] ${msg.sender === "ai" ? "flex-row" : "flex-row-reverse"}`}>
                              {/* Avatar */}
                              <div className={`w-8.5 h-8.5 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold shadow-md ${
                                msg.sender === "ai" ? "bg-indigo-600/20 border border-indigo-500/30 text-indigo-400" : "bg-purple-600/20 border border-purple-500/30 text-purple-400"
                              }`}>
                                {msg.sender === "ai" ? "AI" : "ME"}
                              </div>
                              {/* Message bubble */}
                              <div className={`p-4 rounded-2xl text-sm leading-relaxed border shadow-lg relative ${
                                msg.sender === "ai" 
                                  ? "bg-slate-900/40 border-white/5 text-slate-100 rounded-tl-none text-left" 
                                  : "bg-indigo-600/10 border-indigo-500/20 text-slate-100 rounded-tr-none text-left"
                              }`}>
                                <p className="font-light whitespace-pre-wrap">{msg.text}</p>
                                <span className="block text-[9px] text-slate-500 text-right mt-1.5 font-light">
                                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Animated typing loader */}
                        {isTyping && (
                          <div className="flex justify-start">
                            <div className="flex gap-3 max-w-[80%] items-start">
                              <div className="w-8.5 h-8.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 text-sm font-bold animate-pulse">
                                AI
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl rounded-tl-none flex items-center gap-1 w-fit">
                                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                                {loadingMessage && (
                                  <span className="text-[10px] text-indigo-400/80 italic pl-1">{loadingMessage}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        <div ref={chatBottomRef} />
                      </div>

                      {/* Sticky Input container */}
                      <div className="p-4 border-t border-white/5 bg-slate-950/40 shrink-0">
                        {apiError && (
                          <div className="mb-3.5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between gap-3 text-xs text-red-400 animate-pulse">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              <span>{apiError}</span>
                            </div>
                            <button
                              type="button"
                              onClick={handleRetry}
                              className="px-3.5 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold rounded-lg transition-colors cursor-pointer focus:outline-none"
                            >
                              Retry
                            </button>
                          </div>
                        )}
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleSendResponse();
                          }}
                          className="flex items-center gap-3.5"
                        >
                          {/* Microphone simulator button */}
                          <button
                            type="button"
                            onClick={() => setIsMuted(!isMuted)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer focus:outline-none ${
                              isMuted 
                                ? "bg-red-500/10 border-red-500/20 text-red-400" 
                                : "bg-white/[0.02] border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                            }`}
                            title={isMuted ? "Unmute Mic" : "Mute Mic"}
                          >
                            {isMuted ? <MicOff className="w-5 h-5 animate-pulse" /> : <Mic className="w-5 h-5" />}
                          </button>

                          {/* Chat Input text */}
                          <input
                            type="text"
                            placeholder={isPaused ? "Interview is paused..." : "Type your answer and explanation here..."}
                            disabled={isPaused || isTyping}
                            value={chatInput}
                            onChange={(e) => {
                              setChatInput(e.target.value);
                              if (apiError) setApiError("");
                            }}
                            className="flex-1 bg-slate-950/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600 disabled:opacity-50"
                          />

                          {/* Send Button */}
                          <button
                            type="submit"
                            disabled={isPaused || isTyping || !chatInput.trim()}
                            className="p-3 bg-gradient-to-tr from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                          >
                            <Send className="w-5 h-5" />
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* RIGHT PANEL (4 columns): Performance stats gauges and prompts */}
                    <div className="lg:col-span-4 space-y-6 flex flex-col">
                      
                      {/* Metric Card 1: Live performance trackers (circular meters) */}
                      <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-5 relative overflow-hidden shadow-lg flex-1">
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                          <LineChart className="w-4 h-4 text-indigo-400" />
                          Live Performance Metrics
                        </h4>

                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { label: "Confidence", val: liveMetrics.confidence, col: "text-blue-500" },
                            { label: "Communication", val: liveMetrics.communication, col: "text-emerald-500" },
                            { label: "Tech Accuracy", val: liveMetrics.technicalAccuracy, col: "text-purple-500" },
                            { label: "Response Latency", val: liveMetrics.responseTime, col: "text-pink-500" },
                            { label: "Professionalism", val: liveMetrics.professionalism, col: "text-indigo-500" },
                            { label: "Eye Contact", val: liveMetrics.eyeContact, col: "text-cyan-500" }
                          ].map((metric, idx) => (
                            <div key={idx} className="flex flex-col items-center justify-center p-3.5 bg-slate-950/20 border border-white/5 rounded-2xl text-center">
                              {/* Circle SVG */}
                              <div className="relative flex items-center justify-center w-14 h-14">
                                <svg className="w-14 h-14 transform -rotate-90">
                                  <circle cx="28" cy="28" r="23" className="text-slate-800" strokeWidth="3.5" stroke="currentColor" fill="transparent" />
                                  <circle cx="28" cy="28" r="23" className={metric.col} strokeWidth="3.5" strokeDasharray={145} strokeDashoffset={145 - (145 * metric.val) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" />
                                </svg>
                                <span className="absolute text-xs font-mono font-bold text-white">{metric.val}%</span>
                              </div>
                              <span className="block text-[10px] text-slate-400 font-bold uppercase mt-2">{metric.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Metric Card 2: AI Live Feedback Suggestions */}
                      <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-5 relative overflow-hidden shadow-lg flex-1">
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-purple-400" />
                          AI Live Coach Feedback
                        </h4>

                        <div className="space-y-2.5 overflow-y-auto max-h-[180px] pr-1">
                          {liveSuggestions.map((sug, idx) => (
                            <div
                              key={idx}
                              className={`p-3 rounded-xl border text-xs leading-normal text-left ${
                                sug.type === "strength" 
                                  ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400" 
                                  : sug.type === "weakness" 
                                  ? "bg-red-500/5 border-red-500/10 text-red-400" 
                                  : "bg-indigo-500/5 border-indigo-500/10 text-indigo-300"
                              }`}
                            >
                              <div className="flex gap-2 items-start">
                                <span className="font-extrabold uppercase text-[9px] tracking-wide mt-0.5 block">
                                  {sug.type}:
                                </span>
                                <span className="font-light">{sug.text}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Metric Card 3: Basic Session Specs */}
                      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4.5 text-xs text-slate-400 space-y-2 text-left">
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span>Target Role:</span>
                          <span className="font-bold text-white">{config.jobRole}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span>Company:</span>
                          <span className="font-bold text-white">{config.company}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span>Duration Limit:</span>
                          <span className="font-bold text-white">{config.duration} min</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <span className="font-bold text-emerald-400 animate-pulse">Live Recording...</span>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}

                {/* 4. INTERVIEW COMPLETE VIEW */}
                {currentView === "complete" && (
                  <motion.div
                    key="complete"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="max-w-xl mx-auto space-y-6"
                  >
                    {/* Visual Celebration */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 relative overflow-hidden text-center space-y-6 shadow-2xl">
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
                      <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-emerald-500/10 blur-[40px]" />
                      
                      {/* Animated check circle icon */}
                      <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto">
                        <Check className="w-8 h-8 animate-bounce" />
                      </div>

                      <div className="space-y-2">
                        <h1 className="text-2xl font-black text-white">Interview Completed</h1>
                        <p className="text-sm text-slate-400 font-light">Great work! Your AI interview has been analyzed and processed successfully.</p>
                      </div>

                      {/* Quick Summary Cards (Overall, Communication, Technical, Confidence) */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-950/30 border border-white/5 rounded-2xl text-left">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Overall Score</span>
                          <span className="text-2xl font-black text-white mt-1.5 block">
                            {activeReport ? (activeReport.overallScore ?? activeReport.score) : 0}%
                          </span>
                        </div>
                        <div className="p-4 bg-slate-950/30 border border-white/5 rounded-2xl text-left">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Communication</span>
                          <span className="text-2xl font-black text-white mt-1.5 block">
                            {activeReport ? (activeReport.communicationScore ?? activeReport.metrics?.communication) : 0}%
                          </span>
                        </div>
                        <div className="p-4 bg-slate-950/30 border border-white/5 rounded-2xl text-left">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Technical Accuracy</span>
                          <span className="text-2xl font-black text-white mt-1.5 block">
                            {activeReport ? (activeReport.technicalScore ?? activeReport.metrics?.technicalAccuracy) : 0}%
                          </span>
                        </div>
                        <div className="p-4 bg-slate-950/30 border border-white/5 rounded-2xl text-left">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Confidence Rating</span>
                          <span className="text-2xl font-black text-white mt-1.5 block">
                            {activeReport ? (activeReport.confidenceScore ?? activeReport.metrics?.confidence) : 0}%
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col sm:flex-row gap-3.5 pt-4">
                        <button
                          onClick={() => {
                            setIsLoading(true);
                            setTimeout(() => {
                              setIsLoading(false);
                              setCurrentView("report");
                            }, 500);
                          }}
                          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:scale-[1.01] text-white text-xs font-black shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
                        >
                          View Full Report
                        </button>
                        <button
                          onClick={() => {
                            alert("Downloading PDF Report...");
                          }}
                          className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                        >
                          Download Report
                        </button>
                        <button
                          onClick={() => navigate("/dashboard")}
                          className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                        >
                          Dashboard
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 5. INTERVIEW REPORT VIEW */}
                {currentView === "report" && (
                  reportLoading ? (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center"><Skeleton className="h-10 w-1/4" /><Skeleton className="h-10 w-32" /></div>
                      <Skeleton className="h-[280px] w-full" />
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                      </div>
                    </div>
                  ) : activeReport ? (() => {
                    const radarData = [
                      { subject: "Confidence", value: activeReport.confidenceScore ?? activeReport.metrics?.confidence ?? 0 },
                      { subject: "Communication", value: activeReport.communicationScore ?? activeReport.metrics?.communication ?? 0 },
                      { subject: "Technical Accuracy", value: activeReport.technicalScore ?? activeReport.metrics?.technicalAccuracy ?? 0 },
                      { subject: "Problem Solving", value: activeReport.problemSolvingScore ?? activeReport.score ?? 0 },
                      { subject: "Professionalism", value: activeReport.confidenceScore ?? activeReport.metrics?.professionalism ?? 0 },
                      { subject: "Eye Contact", value: activeReport.confidenceScore ?? activeReport.metrics?.eyeContact ?? 0 }
                    ];
                    return (
                      <motion.div
                        key="report"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="space-y-8 text-left"
                      >
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <button onClick={() => setCurrentView("history")} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors mb-2 focus:outline-none">
                              <ChevronLeft className="w-4 h-4" />
                              Back to History
                            </button>
                            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
                              <AwardIcon className="w-8 h-8 text-indigo-400" />
                              AI Evaluation Report
                            </h1>
                            <p className="text-sm text-slate-400 mt-1">Detailed feedback report for {activeReport.role} mock interview at {activeReport.company}.</p>
                          </div>
                          <div className="flex gap-2.5">
                            <button
                              onClick={() => alert("Downloading PDF summary report...")}
                              className="px-4 py-2 border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-xs font-bold rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer"
                            >
                              Download PDF
                            </button>
                            <button
                              onClick={() => alert("Copied shareable report link to clipboard.")}
                              className="px-4 py-2 border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-xs font-bold rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer"
                            >
                              Share Report
                            </button>
                          </div>
                        </div>

                        {/* Overview Cards Metric Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-7 gap-4">
                          {[
                            { label: "Overall Score", val: `${activeReport.overallScore ?? activeReport.score}%`, col: "text-indigo-400 bg-indigo-500/10 border-indigo-500/25" },
                            { label: "Communication", val: `${activeReport.communicationScore ?? activeReport.metrics?.communication}%`, col: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
                            { label: "Tech Knowledge", val: `${activeReport.technicalScore ?? activeReport.metrics?.technicalAccuracy}%`, col: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
                            { label: "Problem Solving", val: `${activeReport.problemSolvingScore ?? (activeReport.score ? (activeReport.score + 2 > 100 ? 98 : activeReport.score + 2) : 0)}%`, col: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
                            { label: "Confidence", val: `${activeReport.confidenceScore ?? activeReport.metrics?.confidence}%`, col: "text-pink-400 bg-pink-500/10 border-pink-500/20" },
                            { label: "Grammar Rating", val: "92%", col: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
                            { label: "Professionalism", val: `${activeReport.confidenceScore ?? activeReport.metrics?.professionalism}%`, col: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" }
                          ].map((item, idx) => (
                            <div key={idx} className={`p-4 rounded-2xl border text-center relative overflow-hidden flex flex-col justify-between ${item.col}`}>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-normal">{item.label}</span>
                              <span className="text-xl font-black text-white mt-3 block">{item.val}</span>
                            </div>
                          ))}
                        </div>

                        {/* Performance Radar chart & Strengths row */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                          {/* Radar Chart (5 columns) */}
                          <div className="lg:col-span-5 bg-white/[0.02] border border-white/10 rounded-3xl p-6 flex flex-col justify-between shadow-lg h-[380px]">
                            <div className="text-left mb-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dimension Analysis</span>
                              <h3 className="text-base font-bold text-white mt-0.5">Competency Breakdown</h3>
                            </div>

                            <div className="flex-1 w-full relative flex items-center justify-center">
                              <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                  <PolarGrid stroke="rgba(255, 255, 255, 0.05)" />
                                  <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={11} />
                                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255, 255, 255, 0.05)" />
                                  <Radar name="Competency" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                                  <RechartsTooltip contentStyle={{ background: "#080E24", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "12px", color: "#fff" }} />
                                </RadarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          {/* Strengths & Weaknesses (7 columns) */}
                          <div className="lg:col-span-7 space-y-6">
                            {/* Strengths */}
                            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 text-left relative overflow-hidden shadow-md">
                              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2 mb-3">
                                <CheckCircle2 className="w-4 h-4" />
                                Core Strengths Identified
                              </h3>
                              <ul className="space-y-2.5">
                                {(activeReport.strengths || []).map((str, idx) => (
                                  <li key={idx} className="text-xs text-slate-300 font-light flex items-start gap-2 leading-relaxed">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                                    {str}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Weaknesses */}
                            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 text-left relative overflow-hidden shadow-md">
                              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
                              <h3 className="text-sm font-bold text-red-400 flex items-center gap-2 mb-3">
                                <AlertCircle className="w-4 h-4" />
                                Areas of Improvement
                              </h3>
                              <ul className="space-y-2.5">
                                {(activeReport.weaknesses || []).map((weak, idx) => (
                                  <li key={idx} className="text-xs text-slate-300 font-light flex items-start gap-2 leading-relaxed">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
                                    {weak}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* AI Overall Feedback & Career Advice */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 text-left relative overflow-hidden shadow-md">
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                            <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2 mb-3">
                              <Sparkles className="w-4 h-4" />
                              Overall AI Evaluation
                            </h3>
                            <p className="text-xs text-slate-300 font-light leading-relaxed whitespace-pre-line">
                              {activeReport.overallFeedback || activeReport.interviewSummary}
                            </p>
                          </div>
                          
                          <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 text-left relative overflow-hidden shadow-md">
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
                            <h3 className="text-sm font-bold text-purple-400 flex items-center gap-2 mb-3">
                              <Briefcase className="w-4 h-4" />
                              Career & Preparation Advice
                            </h3>
                            <p className="text-xs text-slate-300 font-light leading-relaxed whitespace-pre-line">
                              {activeReport.careerAdvice}
                            </p>
                          </div>
                        </div>

                        {/* Recommended next steps / study items */}
                        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left shadow-lg">
                          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                          <h3 className="text-sm font-bold text-white mb-4">Recommended Next Steps</h3>
                          <div className="flex flex-col gap-2.5">
                            {(activeReport.recommendations && activeReport.recommendations.length > 0
                              ? activeReport.recommendations
                              : ["Review resume project descriptions and architecture details", "Strengthen core concepts for target role", "Practice common behavioral and STAR method scenarios"]
                            ).map((item, idx) => (
                              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 font-light">
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold shrink-0 mt-0.5">
                                  {idx + 1}
                                </span>
                                <span className="leading-relaxed">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Question Review Accordion */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-bold text-white">Question-by-Question Review</h3>
                          <div className="space-y-3">
                            {(activeReport.questionsReviewed || []).map((q, idx) => (
                              <div key={idx} className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 space-y-4">
                                <div className="flex justify-between items-start border-b border-white/5 pb-3">
                                  <h4 className="font-semibold text-white text-sm max-w-xl">
                                    Q{idx + 1}: {q.question}
                                  </h4>
                                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${
                                    q.score >= 80 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                  }`}>
                                    Accuracy: {q.score}%
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                  {/* User Answer */}
                                  <div className="space-y-1.5">
                                    <span className="block font-bold text-slate-400 uppercase tracking-wider">Your Answer</span>
                                    <div className="p-3 bg-slate-950/40 border border-white/5 rounded-xl text-slate-300 leading-relaxed font-light min-h-[60px]">
                                      {q.answer}
                                    </div>
                                  </div>
                                  {/* Ideal Answer */}
                                  <div className="space-y-1.5">
                                    <span className="block font-bold text-slate-400 uppercase tracking-wider">Ideal Response Model</span>
                                    <div className="p-3 bg-indigo-950/20 border border-indigo-500/15 rounded-xl text-indigo-300 leading-relaxed font-light min-h-[60px]">
                                      {q.ideal}
                                    </div>
                                  </div>
                                </div>

                                {/* Feedbacks */}
                                <div className="p-3 bg-slate-950/20 border border-white/5 rounded-xl text-xs flex gap-2">
                                  <span className="font-bold text-slate-400 uppercase tracking-wider">Feedback:</span>
                                  <span className="text-slate-300 font-light">{q.feedback}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Final Placement Recommendation Card */}
                        <div className="bg-slate-950/40 border border-white/10 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
                          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
                          <div className="space-y-1">
                            <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                              <AwardIcon className="w-5 h-5 text-purple-400 animate-pulse" />
                              Final Placement Recommendation
                            </h3>
                            <p className="text-xs text-slate-400 font-light leading-normal max-w-xl">
                              Based on speech clarity, technical precision, and confidence indicators, we have mapped your readiness classification.
                            </p>
                          </div>
                          <div className={`px-6 py-3.5 rounded-2xl border text-center shrink-0 font-black text-sm tracking-wide uppercase ${
                            (activeReport.readinessLevel === "Placement Ready" || activeReport.readinessLevel === "Excellent Candidate" || activeReport.recommendation === "Ready for Placements")
                              ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400" 
                              : "bg-amber-500/10 border-amber-500/25 text-amber-400"
                          }`}>
                            {activeReport.readinessLevel ?? activeReport.recommendation}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })() : (
                    <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 text-center max-w-lg mx-auto space-y-4">
                      <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
                      <h3 className="text-lg font-bold text-white">Report Not Found</h3>
                      <p className="text-sm text-slate-400">Failed to load this interview report. Please verify session details and try again.</p>
                      <button onClick={() => setCurrentView("history")} className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all cursor-pointer">
                        Back to History
                      </button>
                    </div>
                  )
                )}

                {/* 6. INTERVIEW HISTORY VIEW */}
                {currentView === "history" && (
                  <motion.div
                    key="history"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="space-y-6 text-left"
                  >
                    {/* Header */}
                    <div>
                      <button onClick={() => setCurrentView("home")} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors mb-2 focus:outline-none">
                        <ChevronLeft className="w-4 h-4" />
                        Back to Home
                      </button>
                      <h1 className="text-2xl font-black text-white">Interview History</h1>
                      <p className="text-sm text-slate-400 mt-1">Review all your previous AI mock interview scores, durations, and dynamic evaluation reports.</p>
                    </div>

                    {/* Search / Filters block */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 justify-between items-center relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                      <div className="relative w-full sm:max-w-md group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                          <Search className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          placeholder="Search company, role, or domain category..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-slate-950/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500/60"
                        />
                      </div>

                      {/* Pill options */}
                      <div className="flex gap-2.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                        {["All", "Technical", "HR", "Behavioral", "System Design"].map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setSearchQuery(cat === "All" ? "" : cat)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer focus:outline-none ${
                              (cat === "All" && searchQuery === "") || (searchQuery.toLowerCase() === cat.toLowerCase())
                                ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-400"
                                : "bg-white/[0.02] border-white/10 text-slate-400 hover:text-white"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* History table list */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-lg">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                      
                      {historyLoading ? (
                        <div className="space-y-4 py-6">
                          <Skeleton className="h-8 w-full" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      ) : filteredHistory.length === 0 ? (
                        <div className="py-12 text-center max-w-sm mx-auto space-y-4">
                          <History className="w-12 h-12 text-slate-600 mx-auto" />
                          <h3 className="text-base font-bold text-white">No Mock Records Found</h3>
                          <p className="text-xs text-slate-400">Specify clean filter queries or launch a brand new AI interview to populate the archive.</p>
                          <button
                            onClick={handleStartSetup}
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer"
                          >
                            Start Interview
                          </button>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm border-collapse">
                            <thead>
                              <tr className="border-b border-white/5 text-slate-400 text-xs uppercase tracking-wider font-bold">
                                <th className="pb-3 pr-4">Domain</th>
                                <th className="pb-3 pr-4">Company</th>
                                <th className="pb-3 pr-4">Role</th>
                                <th className="pb-3 pr-4">Difficulty</th>
                                <th className="pb-3 pr-4">Score</th>
                                <th className="pb-3 pr-4">Date</th>
                                <th className="pb-3 pr-4">Duration</th>
                                <th className="pb-3 pr-4">Status</th>
                                <th className="pb-3 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {filteredHistory.map((item) => (
                                <tr key={item.id} className="group hover:bg-white/[0.01] transition-colors">
                                  <td className="py-3.5 pr-4 font-semibold text-white">
                                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900 border border-white/5 text-slate-400">
                                      {item.category}
                                    </span>
                                  </td>
                                  <td className="py-3.5 pr-4 text-slate-300 font-medium">{item.company}</td>
                                  <td className="py-3.5 pr-4 text-slate-400">{item.role}</td>
                                  <td className="py-3.5 pr-4 text-slate-400">{item.difficulty}</td>
                                  <td className="py-3.5 pr-4">
                                    <span className={`font-black ${item.score >= 80 ? "text-emerald-400" : "text-amber-400"}`}>
                                      {item.score}%
                                    </span>
                                  </td>
                                  <td className="py-3.5 pr-4 text-slate-400 font-light">{item.date}</td>
                                  <td className="py-3.5 pr-4 text-slate-400 font-light">{item.duration}</td>
                                  <td className="py-3.5 pr-4">
                                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                                      item.status === "Completed" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                    }`}>
                                      {item.status}
                                    </span>
                                  </td>
                                  <td className="py-3.5 text-right">
                                    <div className="flex gap-2 justify-end">
                                      <button
                                        onClick={() => handleOpenReport(item.id)}
                                        className="px-3 py-1.5 text-xs font-bold text-indigo-400 border border-indigo-500/25 bg-indigo-500/5 hover:border-indigo-500 rounded-lg transition-all cursor-pointer focus:outline-none"
                                      >
                                        Report
                                      </button>
                                      <button
                                        onClick={() => {
                                          setConfig({
                                            category: item.category,
                                            jobRole: item.role,
                                            customRole: "",
                                            company: item.company,
                                            customCompany: "",
                                            difficulty: item.difficulty,
                                            duration: parseInt(item.duration) || 30,
                                            useResume: item.resumeEnabled !== false,
                                            questionCount: 15,
                                            language: "English"
                                          });
                                          setCurrentView("setup");
                                        }}
                                        className="px-3 py-1.5 text-xs font-bold text-slate-300 border border-white/10 hover:border-white/20 bg-white/5 rounded-lg transition-all cursor-pointer focus:outline-none"
                                      >
                                        Retake
                                      </button>
                                      <button
                                        onClick={(e) => handleDeleteHistory(item.id, e)}
                                        className="p-1.5 text-slate-500 hover:text-red-400 transition-colors focus:outline-none"
                                        title="Delete Report"
                                      >
                                        <Trash2 className="w-4.5 h-4.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Pagination Controls */}
                      {filteredHistory.length > 0 && historyTotalPages > 1 && (
                        <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/5">
                          <span className="text-xs text-slate-400 font-light">
                            Page <span className="font-bold text-white">{historyPage}</span> of <span className="font-bold text-slate-300">{historyTotalPages}</span>
                          </span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={historyPage <= 1 || historyLoading}
                              onClick={() => setHistoryPage(prev => prev - 1)}
                              className="p-2 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              disabled={historyPage >= historyTotalPages || historyLoading}
                              onClick={() => setHistoryPage(prev => prev + 1)}
                              className="p-2 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            )}

          </main>
        </div>

        {/* Standard Logout Modal Wrapper */}
        <AnimatePresence>
          {showLogoutModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowLogoutModal(false)}
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
              />

              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className="relative w-full max-w-md bg-[#080E24]/90 border border-white/10 rounded-2xl p-6 shadow-[0_0_50px_rgba(99,102,241,0.15)] backdrop-blur-xl overflow-hidden text-left"
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent pointer-events-none" />
                <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-red-500/10 blur-[40px] pointer-events-none" />

                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 shrink-0">
                    <LogOut className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Confirm Sign Out</h3>
                    <p className="text-sm text-slate-400 font-light mt-1.5 leading-relaxed">
                      Are you sure you want to log out of PrepSphere AI? You will need to sign in again to access your preparation dashboard.
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6 justify-end">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] text-slate-300 hover:text-white text-xs font-semibold transition-all duration-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all duration-200 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.25)] hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                  >
                    Sign Out
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </>
  );
};

export default MockInterview;
