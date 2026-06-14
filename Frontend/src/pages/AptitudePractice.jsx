import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
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
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  BookOpenCheck,
  Zap,
  Activity,
  Maximize2,
  RefreshCw,
  Trophy,
  Info,
  Timer,
} from "lucide-react";

// Mock placement aptitude questions
const MOCK_QUESTIONS = [
  {
    id: 1,
    category: "Quantitative Aptitude",
    difficulty: "Medium",
    text: "A boat can travel with a speed of 13 km/hr in still water. If the speed of the stream is 4 km/hr, find the time taken by the boat to go 68 km downstream.",
    options: [
      { key: "A", text: "2 Hours" },
      { key: "B", text: "3 Hours" },
      { key: "C", text: "4 Hours" },
      { key: "D", text: "5 Hours" },
    ],
    correctAnswer: "C",
    hint: "Downstream speed is the sum of boat speed in still water and speed of the stream (13 + 4 = 17 km/hr). Time = Distance / Speed.",
    explanation:
      "Speed downstream = (13 + 4) km/hr = 17 km/hr. Distance = 68 km. Time taken = 68/17 = 4 hours.",
  },
  {
    id: 2,
    category: "Logical Reasoning",
    difficulty: "Easy",
    text: "Look at this series: 2, 1, 1/2, 1/4, ... What number should come next?",
    options: [
      { key: "A", text: "1/3" },
      { key: "B", text: "1/8" },
      { key: "C", text: "2/8" },
      { key: "D", text: "1/16" },
    ],
    correctAnswer: "B",
    hint: "Check the ratio between consecutive numbers. Each term is half of the previous term.",
    explanation:
      "This is a geometric series where each term is multiplied by 1/2. The next term is (1/4) * (1/2) = 1/8.",
  },
  {
    id: 3,
    category: "Verbal Ability",
    difficulty: "Medium",
    text: "Choose the word that is most nearly opposite in meaning to the word: MITIGATE",
    options: [
      { key: "A", text: "Aggravate" },
      { key: "B", text: "Alleviate" },
      { key: "C", text: "Abate" },
      { key: "D", text: "Accumulate" },
    ],
    correctAnswer: "A",
    hint: "First define mitigate: to make milder or less severe. We need the opposite (antonym).",
    explanation:
      "Mitigate means to make something less severe or painful. Aggravate means to make a problem worse or more serious, which is the antonym.",
  },
  {
    id: 4,
    category: "Data Interpretation",
    difficulty: "Hard",
    text: "Based on the table below, which company has the highest percentage growth in revenue from Q1 to Q2?\n\n| Company | Q1 Revenue ($M) | Q2 Revenue ($M) |\n|---------|-----------------|-----------------|\n| Alpha   | 120             | 150             |\n| Beta    | 80              | 110             |\n| Gamma   | 200             | 240             |\n| Delta   | 50              | 65              |",
    options: [
      { key: "A", text: "Alpha" },
      { key: "B", text: "Beta" },
      { key: "C", text: "Gamma" },
      { key: "D", text: "Delta" },
    ],
    correctAnswer: "B",
    hint: "Calculate percentage growth as: ((Q2 - Q1) / Q1) * 100 for each company and compare.",
    explanation:
      "Growth percentages: Alpha: 30/120 = 25%; Beta: 30/80 = 37.5%; Gamma: 40/200 = 20%; Delta: 15/50 = 30%. Beta has the highest growth (37.5%).",
  },
  {
    id: 5,
    category: "Quantitative Aptitude",
    difficulty: "Medium",
    text: "A sum of money at simple interest amounts to Rs. 815 in 3 years and to Rs. 854 in 4 years. What is the principal sum?",
    options: [
      { key: "A", text: "Rs. 650" },
      { key: "B", text: "Rs. 690" },
      { key: "C", text: "Rs. 698" },
      { key: "D", text: "Rs. 700" },
    ],
    correctAnswer: "C",
    hint: "Simple interest earned each year is constant. The difference between amounts of Year 4 and Year 3 is the interest of 1 year.",
    explanation:
      "S.I. for 1 year = Rs. (854 - 815) = Rs. 39. S.I. for 3 years = Rs. (39 * 3) = Rs. 117. Principal sum = Amount - Interest = Rs. (815 - 117) = Rs. 698.",
  },
  {
    id: 6,
    category: "Logical Reasoning",
    difficulty: "Hard",
    text: "Statements:\n- All bags are pockets.\n- All pockets are pouches.\n\nConclusions:\n- I. Some pouches are bags.\n- II. All bags are pouches.",
    options: [
      { key: "A", text: "Only conclusion I follows" },
      { key: "B", text: "Only conclusion II follows" },
      { key: "C", text: "Neither I nor II follows" },
      { key: "D", text: "Both I and II follow" },
    ],
    correctAnswer: "D",
    hint: "Draw a Venn diagram. Place Bags inside Pockets, and Pockets inside Pouches.",
    explanation:
      "Since all bags are inside pockets and all pockets are inside pouches, all bags are pouches (II follows). Also, the space occupied by bags is a part of pouches, so some pouches are bags (I follows).",
  },
  {
    id: 7,
    category: "Verbal Ability",
    difficulty: "Easy",
    text: "Find the correctly spelled word from the options below:",
    options: [
      { key: "A", text: "Consciencious" },
      { key: "B", text: "Conscientious" },
      { key: "C", text: "Conscentious" },
      { key: "D", text: "Consciencous" },
    ],
    correctAnswer: "B",
    hint: "Think of 'conscience' + 'tious' with minor spelling modifications.",
    explanation:
      "The correct spelling is 'Conscientious', which means wishing to do one's work or duty well and thoroughly.",
  },
  {
    id: 8,
    category: "Data Interpretation",
    difficulty: "Medium",
    text: "If the total budget of a project is $50,000, and it is allocated as: Development (40%), Design (20%), Testing (15%), Marketing (15%), and Operations (10%). How much more money is allocated to Development than to Design and Testing combined?",
    options: [
      { key: "A", text: "$2,500" },
      { key: "B", text: "$5,000" },
      { key: "C", text: "$7,500" },
      { key: "D", text: "$10,000" },
    ],
    correctAnswer: "A",
    hint: "Combine percentages of Design and Testing first, find the difference from Development, and apply it to the total budget.",
    explanation:
      "Design + Testing = 20% + 15% = 35%. Development = 40%. Difference = 40% - 35% = 5%. 5% of $50,000 = $2,500.",
  },
  {
    id: 9,
    category: "Quantitative Aptitude",
    difficulty: "Medium",
    text: "A can complete a project in 12 days and B can complete the same project in 18 days. If they work together for 4 days, what fraction of the project is left?",
    options: [
      { key: "A", text: "1/3" },
      { key: "B", text: "2/9" },
      { key: "C", text: "4/9" },
      { key: "D", text: "5/9" },
    ],
    correctAnswer: "C",
    hint: "Find the work rate per day for A and B, add them, multiply by 4 days, and subtract the sum from 1.",
    explanation:
      "A's rate = 1/12, B's rate = 1/18. Combined rate = 1/12 + 1/18 = 5/36 per day. In 4 days, they complete 4 * 5/36 = 5/9 of the work. Left fraction = 1 - 5/9 = 4/9.",
  },
  {
    id: 10,
    category: "Logical Reasoning",
    difficulty: "Hard",
    text: "In a certain code language, 'COMPUTER' is written as 'RFUVQNPC'. How is 'MEDICINE' written in that code?",
    options: [
      { key: "A", text: "EOJDJEFM" },
      { key: "B", text: "EOJDEJFM" },
      { key: "C", text: "MFEJDJOE" },
      { key: "D", text: "DJFMEJFM" },
    ],
    correctAnswer: "A",
    hint: "Swapping first and last letter positions, and reversing the order of the inner letters while shifting them +1 in the alphabet.",
    explanation:
      "For COMPUTER -> Reverse letter positions except ends: C and R swap. R...C. Inner letters 'OMPUTE' reversed is 'ETUPMO'. Incremented: FUVQNP. Combined: RFUVQNPC. Applying to MEDICINE -> Swap M and E: E...M. Inner letters 'EDICIN' reversed: 'NICIDE'. Incremented +1: 'OJDJEF'. Combined: EOJDJEFM.",
  },
];

const AptitudePractice = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Active quiz state from backend
  const [attemptId, setAttemptId] = useState(null);
  const [quizId, setQuizId] = useState(null);
  const [quizCategory, setQuizCategory] = useState("");
  const [quizDifficulty, setQuizDifficulty] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Core SPA view control: 'home' | 'setup' | 'loading' | 'quiz' | 'results'
  const [view, setView] = useState("home");

  // Developer settings / Interactive states simulation
  const [hasAttemptedQuizzes, setHasAttemptedQuizzes] = useState(true);
  const [simulateUnfinishedQuiz, setSimulateUnfinishedQuiz] = useState(false);

  // Dashboard Stats State
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoadingDashboard(true);
    setDashboardError(null);
    try {
      const response = await api.get("/aptitude/dashboard");
      if (response.data && response.data.success) {
        setDashboardData(response.data);
        setHasAttemptedQuizzes(response.data.hasAttempts);
      } else {
        throw new Error(
          response.data?.message || "Failed to load dashboard statistics.",
        );
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setDashboardError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch preparation statistics.",
      );
    } finally {
      setLoadingDashboard(false);
    }
  }, []);

  // Fetch dashboard data on mount and when returning to home view
  useEffect(() => {
    if (view === "home") {
      fetchDashboardData();
    }
  }, [view, fetchDashboardData]);

  // Quiz configuration state
  const [selectedCategory, setSelectedCategory] = useState("Mixed Aptitude");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Adaptive");

  // Loading view cycle status message index
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingMessages = [
    "Preparing your aptitude quiz...",
    "Generating AI Quiz...",
    "Preparing Placement-Oriented Questions...",
    "Selecting Balanced Difficulty...",
    "Creating Personalized Assessment...",
  ];

  // Active quiz states
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionIdx]: selectedOptionKey }
  const [flaggedQuestions, setFlaggedQuestions] = useState({}); // { [questionIdx]: boolean }
  const [skippedQuestions, setSkippedQuestions] = useState({}); // { [questionIdx]: boolean }
  const [showHint, setShowHint] = useState(false);
  const [showPaletteDrawer, setShowPaletteDrawer] = useState(false);

  // Quiz Timer states
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes = 900 seconds
  const timerRef = useRef(null);

  // References to states for timer callbacks and submission
  const answersRef = useRef({});
  const questionsRef = useRef([]);
  const attemptIdRef = useRef(null);
  const quizIdRef = useRef(null);
  const timeLeftRef = useRef(900);

  // Keep references up to date
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  useEffect(() => {
    attemptIdRef.current = attemptId;
  }, [attemptId]);

  useEffect(() => {
    quizIdRef.current = quizId;
  }, [quizId]);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  const clearQuizSession = useCallback(() => {
    sessionStorage.removeItem("active_quiz_attemptId");
    sessionStorage.removeItem("active_quiz_quizId");
    sessionStorage.removeItem("active_quiz_category");
    sessionStorage.removeItem("active_quiz_difficulty");
    sessionStorage.removeItem("active_quiz_questions");
    sessionStorage.removeItem("active_quiz_answers");
    sessionStorage.removeItem("active_quiz_startedAt");
    sessionStorage.removeItem("active_quiz_view");
  }, []);

  const submitActiveQuiz = useCallback(async () => {
    try {
      const elapsed = 900 - timeLeftRef.current;
      const formattedAnswers = questionsRef.current.map((q, idx) => ({
        questionId: q.questionId || q._id,
        selectedOption: answersRef.current[idx] || "",
      }));

      // Clear the session storage immediately to avoid reload loops
      clearQuizSession();

      await api.post("/aptitude/submit", {
        attemptId: attemptIdRef.current,
        quizId: quizIdRef.current,
        timeTaken: elapsed,
        answers: formattedAnswers,
      });
    } catch (err) {
      console.error("Error submitting quiz:", err);
    } finally {
      setView("results");
    }
  }, [clearQuizSession]);

  // Restore active quiz session from sessionStorage upon page load/refresh
  useEffect(() => {
    const savedView = sessionStorage.getItem("active_quiz_view");
    if (savedView === "quiz") {
      const savedAttemptId = sessionStorage.getItem("active_quiz_attemptId");
      const savedQuizId = sessionStorage.getItem("active_quiz_quizId");
      const savedCategory = sessionStorage.getItem("active_quiz_category");
      const savedDifficulty = sessionStorage.getItem("active_quiz_difficulty");
      const savedQuestions = sessionStorage.getItem("active_quiz_questions");
      const savedAnswers = sessionStorage.getItem("active_quiz_answers");

      if (savedAttemptId && savedQuizId && savedQuestions) {
        setAttemptId(savedAttemptId);
        setQuizId(savedQuizId);
        setQuizCategory(savedCategory || "");
        setQuizDifficulty(savedDifficulty || "");
        setQuestions(JSON.parse(savedQuestions));
        if (savedAnswers) {
          setAnswers(JSON.parse(savedAnswers));
        }
        setView("quiz");
      }
    }
  }, []);

  // Save selected answers to sessionStorage as they change
  useEffect(() => {
    if (view === "quiz") {
      sessionStorage.setItem("active_quiz_answers", JSON.stringify(answers));
    }
  }, [answers, view]);

  // Sidebar navigation items
  const navItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      active: false,
      path: "/dashboard",
    },
    {
      name: "Aptitude Practice",
      icon: Brain,
      active: true,
      path: "/aptitude-practice",
    },
    {
      name: "Resume Analyzer",
      icon: FileSearch,
      active: false,
      path: "/resume-analyzer",
    },
    {
      name: "Mock Interview",
      icon: MessageSquareCode,
      active: false,
      path: "/mock-interview",
    },
    {
      name: "Coding Tracker",
      icon: Code2,
      active: false,
      path: "/coding-tracker",
    },
    {
      name: "Interview Experiences",
      icon: BookOpen,
      active: false,
      path: "/interview-experiences",
    },
    {
      name: "Career Analytics",
      icon: LineChart,
      active: false,
      path: "/career-analytics",
    },
    { name: "Settings", icon: SettingsIcon, active: false, path: "/settings" },
  ];

  // Trigger loading process and fetch from backend API
  const startLoadingQuiz = async () => {
    if (loadingQuiz) return;
    setLoadingQuiz(true);
    setApiError(null);
    setView("loading");
    setLoadingStep(0);
    setAnswers({});
    setFlaggedQuestions({});
    setSkippedQuestions({});
    setCurrentQuestionIdx(0);
    setTimeLeft(900);
    setShowHint(false);

    try {
      const response = await api.post("/aptitude/generate", {
        category: selectedCategory,
        difficulty: selectedDifficulty,
      });

      if (response.data && response.data.success) {
        const data = response.data;
        const startedTime = Date.now();
        setAttemptId(data.attemptId);
        setQuizId(data.quiz._id);
        setQuizCategory(data.quiz.category);
        setQuizDifficulty(data.quiz.difficulty);
        setQuestions(data.quiz.questions);

        // Store active quiz configuration & started time in sessionStorage for recovery on refresh
        sessionStorage.setItem("active_quiz_attemptId", data.attemptId);
        sessionStorage.setItem("active_quiz_quizId", data.quiz._id);
        sessionStorage.setItem(
          "active_quiz_category",
          data.quiz.category || "",
        );
        sessionStorage.setItem(
          "active_quiz_difficulty",
          data.quiz.difficulty || "",
        );
        sessionStorage.setItem(
          "active_quiz_questions",
          JSON.stringify(data.quiz.questions),
        );
        sessionStorage.setItem("active_quiz_startedAt", startedTime.toString());
        sessionStorage.setItem("active_quiz_view", "quiz");

        // Frontend Validation
        console.table(
          data.quiz.questions.map((q) => ({
            question: q.question,
            correctAnswer: q.correctAnswer,
          })),
        );

        // Success: Transition to quiz view
        setView("quiz");
      } else {
        throw new Error(response.data?.message || "Failed to retrieve quiz.");
      }
    } catch (err) {
      console.error("Error generating quiz:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Something went wrong while preparing your quiz.";
      setApiError(errorMessage);
      setView("setup");
    } finally {
      setLoadingQuiz(false);
    }
  };

  // Run cycle through loading state messages
  useEffect(() => {
    if (view === "loading") {
      const stepInterval = setInterval(() => {
        setLoadingStep((prev) => {
          if (prev >= loadingMessages.length - 1) {
            return prev; // hold at the last message or wrap
          }
          return prev + 1;
        });
      }, 500);
      return () => clearInterval(stepInterval);
    }
  }, [view]);

  // Quiz countdown timer ticker
  useEffect(() => {
    if (view === "quiz") {
      const startedAtStr = sessionStorage.getItem("active_quiz_startedAt");
      const startedAt = startedAtStr ? parseInt(startedAtStr, 10) : Date.now();
      if (!startedAtStr) {
        sessionStorage.setItem("active_quiz_startedAt", startedAt.toString());
      }

      const updateTimer = () => {
        const quizDuration = 900 * 1000; // 15 mins in ms
        const elapsed = Date.now() - startedAt;
        const remainingMs = quizDuration - elapsed;

        if (remainingMs <= 0) {
          setTimeLeft(0);
          clearInterval(timerRef.current);
          submitActiveQuiz();
        } else {
          setTimeLeft(Math.max(0, Math.ceil(remainingMs / 1000)));
        }
      };

      // Initial run
      updateTimer();

      timerRef.current = setInterval(updateTimer, 1000);
      return () => clearInterval(timerRef.current);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [view, submitActiveQuiz]);

  // Keyboard accessibility listeners (Quiz Screen only)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (view !== "quiz") return;

      // Arrow keys navigation
      if (e.key === "ArrowRight") {
        handleNextQuestion();
      } else if (e.key === "ArrowLeft") {
        handlePrevQuestion();
      }

      // Numeric keys for option selection (1=A, 2=B, 3=C, 4=D)
      if (e.key === "1") handleSelectOption("A");
      else if (e.key === "2") handleSelectOption("B");
      else if (e.key === "3") handleSelectOption("C");
      else if (e.key === "4") handleSelectOption("D");

      // Enter to finish or skip
      if (e.key === "Enter") {
        if (currentQuestionIdx === 9) {
          submitActiveQuiz();
        } else {
          handleNextQuestion();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [view, currentQuestionIdx, answers, submitActiveQuiz]);

  // Options selections
  const handleSelectOption = (optionKey) => {
    if (timeLeft <= 0) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIdx]: optionKey,
    }));
    // Remove from skipped list when answered
    if (skippedQuestions[currentQuestionIdx]) {
      setSkippedQuestions((prev) => {
        const copy = { ...prev };
        delete copy[currentQuestionIdx];
        return copy;
      });
    }
  };

  // Navigations inside the quiz
  const handleNextQuestion = () => {
    if (currentQuestionIdx < 9) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setShowHint(false);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx((prev) => prev - 1);
      setShowHint(false);
    }
  };

  const handleSkipQuestion = () => {
    setSkippedQuestions((prev) => ({
      ...prev,
      [currentQuestionIdx]: true,
    }));
    handleNextQuestion();
  };

  const handleFlagQuestion = () => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [currentQuestionIdx]: !prev[currentQuestionIdx],
    }));
  };

  const handleQuitQuiz = () => {
    if (
      window.confirm(
        "Are you sure you want to quit this quiz? Your progress will be discarded.",
      )
    ) {
      clearQuizSession();
      setView("home");
    }
  };

  // Format timer text
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate statistics from quiz answers
  const getQuizMetrics = () => {
    const attempted = Object.keys(answers).length;
    let correctCount = 0;

    // Evaluate correctness only if the quiz is NOT in progress (submitted/results view) to avoid leaking answers
    if (view === "results") {
      const activeQuestions =
        questions && questions.length > 0 ? questions : [];
      activeQuestions.forEach((q, idx) => {
        if (!q.correctAnswer) {
          throw new Error(`Question ${idx + 1} is missing correctAnswer.`);
        }
        if (answers[idx] === q.correctAnswer) {
          correctCount += 1;
        }
      });
    }

    const accuracy =
      attempted > 0 ? Math.round((correctCount / attempted) * 100) : 0;
    const score = correctCount; // score out of 10
    return { attempted, correctCount, accuracy, score };
  };

  const currentMetrics = getQuizMetrics();

  // Progress Bar percentage calculation
  const progressPercent =
    (Object.keys(answers).length / (questions.length || 10)) * 100;

  return (
    <>
      <style>{`
        .dash-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.012) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.012) 1px, transparent 1px);
          background-size: 50px 50px;
        }
        
        .timer-warning {
          animation: pulse-red 1.5s infinite;
        }
        
        @keyframes pulse-red {
          0%, 100% { border-color: rgba(239, 68, 68, 0.4); box-shadow: 0 0 15px rgba(239, 68, 68, 0.15); }
          50% { border-color: rgba(239, 68, 68, 0.9); box-shadow: 0 0 25px rgba(239, 68, 68, 0.4); }
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
        {/* Ambient Grid Background */}
        <div className="absolute inset-0 dash-grid-pattern opacity-60 pointer-events-none" />

        {/* Purple/Indigo Ambient Glow circles */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-[130px] pointer-events-none" />

        {/* SIDEBAR - DESKTOP */}
        <aside className="fixed left-0 top-0 h-screen w-[280px] hidden lg:flex flex-col bg-slate-950/40 border-r border-white/5 backdrop-blur-xl z-20 overflow-hidden">
          {/* Logo */}
          <div className="p-6 flex items-center space-x-3 border-b border-white/5">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-slate-950/80 border border-white/10 overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.25)]">
              <svg
                className="w-4 h-4 text-indigo-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                  fill="currentColor"
                  className="text-indigo-500 animate-pulse"
                />
                <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41M19.07 19.07l-1.41-1.41M6.34 6.34l-1.41-1.41" />
              </svg>
            </div>
            <span className="text-base font-extrabold tracking-tight text-white font-inter">
              PrepSphere{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                AI
              </span>
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
                <item.icon
                  className={`w-4 h-4 ${item.active ? "text-indigo-400" : "text-slate-500"}`}
                />
                <span>{item.name}</span>
              </button>
            ))}
          </nav>

          {/* Logout Actions */}
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
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              />

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
                        <svg
                          className="w-3.5 h-3.5 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="3" fill="currentColor" />
                          <path d="M12 2v2M12 20v2M4 12H2M22 12h-2" />
                        </svg>
                      </div>
                      <span className="text-base font-bold text-white">
                        PrepSphere AI
                      </span>
                    </div>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                    >
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
          <header className="sticky top-0 z-30 bg-[#050B1F]/70 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1 max-w-lg">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 lg:hidden focus:outline-none shrink-0"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="relative w-full group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search resources, templates, equations..."
                  className="w-full bg-slate-950/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-300 placeholder:text-slate-600"
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
                  <p className="text-sm font-semibold text-white">
                    Welcome, {user?.name?.split(" ")[0] || "User"}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 max-w-[150px] truncate">
                    {user?.college || "PrepSphere College"}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-[1px] shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                  <div className="w-full h-full rounded-xl bg-[#080E24] flex items-center justify-center text-indigo-400 text-sm font-bold">
                    {user?.name ? (
                      user.name.charAt(0).toUpperCase()
                    ) : (
                      <UserIcon className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* MAIN DYNAMIC CONTENT */}
          <main className="flex-1 p-6 space-y-8 max-w-7xl mx-auto w-full">
            <AnimatePresence mode="wait">
              {/* ==================== HOME VIEW ==================== */}
              {view === "home" && (
                <motion.div
                  key="home"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-8"
                >
                  {/* Hero Section */}
                  <div className="relative rounded-3xl border border-white/10 bg-slate-950/20 backdrop-blur-xl p-6 sm:p-8 overflow-hidden text-left">
                    <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent pointer-events-none" />
                    <div className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />

                    <div className="relative z-10 max-w-2xl space-y-4">
                      <div className="inline-flex items-center space-x-1.5 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-xs text-indigo-400 font-bold uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Practice &amp; Cognitive Metrics</span>
                      </div>
                      <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                        Welcome Back, {user?.name || "PrepSphere User"}
                      </h1>
                      <p className="text-sm text-slate-300 leading-relaxed font-light">
                        Continue sharpening your aptitude skills with
                        AI-generated practice tests designed for placements and
                        technical interviews.
                      </p>

                      {hasAttemptedQuizzes && !loadingDashboard && (
                        <div className="flex flex-wrap gap-3 pt-2">
                          <button
                            onClick={() => setView("setup")}
                            className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white text-sm font-bold cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                          >
                            <Play className="w-4 h-4 fill-white" />
                            Start New Quiz
                          </button>
                          <button
                            onClick={() => navigate("/aptitude/history")}
                            className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] hover:border-white/15 text-white text-sm font-semibold cursor-pointer transition-all"
                          >
                            <Clock className="w-4 h-4 text-indigo-400" />
                            View History
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {!hasAttemptedQuizzes ? (
                    /* EMPTY STATE */
                    <div className="flex flex-col items-center justify-center p-16 bg-white/[0.02] border border-white/10 rounded-3xl backdrop-blur-xl text-center max-w-lg mx-auto space-y-5">
                      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Brain className="w-8 h-8" />
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="text-lg font-bold text-white">
                          No Aptitude Tests Yet
                        </h3>
                        <p className="text-sm text-slate-400 leading-relaxed font-light max-w-xs mx-auto">
                          Start your first AI-generated aptitude quiz and begin
                          tracking your preparation journey.
                        </p>
                      </div>
                      <button
                        onClick={() => setView("setup")}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white text-sm font-bold transition-all cursor-pointer shadow-lg shadow-indigo-500/25 hover:scale-[1.01]"
                      >
                        Start First Quiz
                      </button>
                    </div>
                  ) : loadingDashboard ? (
                    /* SKELETON LOADING STATE */
                    <div className="space-y-8">
                      {/* Stats Cards Skeletons */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 h-[120px] flex flex-col justify-between"
                          >
                            <div className="flex justify-between">
                              <div className="h-4 bg-white/5 rounded w-1/2" />
                              <div className="h-7 w-7 bg-white/5 rounded-lg" />
                            </div>
                            <div className="h-7 bg-white/5 rounded w-1/3" />
                            <div className="h-3 bg-white/5 rounded w-2/3" />
                          </div>
                        ))}
                      </div>

                      {/* Main Grid: Review & recommendations Skeletons */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
                        <div className="lg:col-span-7 bg-white/[0.02] border border-white/10 rounded-3xl p-6 h-[280px] flex flex-col justify-between">
                          <div className="h-5 bg-white/5 rounded w-1/3" />
                          <div className="grid grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                              <div key={i} className="space-y-1.5">
                                <div className="h-3 bg-white/5 rounded w-1/2" />
                                <div className="h-4 bg-white/5 rounded w-2/3" />
                              </div>
                            ))}
                          </div>
                          <div className="h-10 bg-white/5 rounded-xl w-full" />
                        </div>
                        <div className="lg:col-span-5 bg-white/[0.02] border border-white/10 rounded-3xl p-6 h-[280px] flex flex-col justify-between">
                          <div className="h-5 bg-white/5 rounded w-1/2" />
                          <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className="h-12 bg-white/5 rounded-xl"
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Matrix Performance Skeletons */}
                      <div className="space-y-4">
                        <div className="h-5 bg-white/5 rounded w-1/4 animate-pulse" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 animate-pulse">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 h-[140px] flex flex-col justify-between"
                            >
                              <div className="h-4 bg-white/5 rounded w-2/3" />
                              <div className="h-3 bg-white/5 rounded w-1/2" />
                              <div className="h-1.5 bg-slate-950 rounded-full" />
                              <div className="h-3 bg-white/5 rounded w-1/3" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* HOME DASHBOARD ELEMENTS */
                    <>
                      {/* Statistics Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 text-left relative overflow-hidden group hover:border-indigo-500/25 transition-all">
                          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                              Overall Score
                            </span>
                            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                              <Trophy className="w-4 h-4" />
                            </div>
                          </div>
                          <div className="mt-4 flex items-baseline space-x-1">
                            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                              {dashboardData?.overallStats?.averageAccuracy ??
                                0}
                            </span>
                            <span className="text-xs text-slate-400 font-semibold">
                              / 100
                            </span>
                          </div>
                          <div className="mt-2 text-xs text-indigo-400 font-semibold flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            <span>
                              {dashboardData?.overallStats?.rank ??
                                "Needs Improvement"}
                            </span>
                          </div>
                        </div>

                        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 text-left relative overflow-hidden group hover:border-purple-500/25 transition-all">
                          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                              Highest Accuracy
                            </span>
                            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          </div>
                          <div className="mt-4">
                            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                              {dashboardData?.overallStats?.highestAccuracy ??
                                0}
                              %
                            </span>
                          </div>
                          <div className="mt-2 text-xs text-purple-400 font-semibold truncate">
                            <span>
                              Achieved in{" "}
                              {dashboardData?.overallStats?.highestCategory ||
                                "N/A"}
                            </span>
                          </div>
                        </div>

                        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 text-left relative overflow-hidden group hover:border-cyan-500/25 transition-all">
                          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                              Quizzes Completed
                            </span>
                            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                              <BookOpenCheck className="w-4 h-4" />
                            </div>
                          </div>
                          <div className="mt-4">
                            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
                              {dashboardData?.overallStats?.completedCount ?? 0}
                            </span>
                          </div>
                          <div className="mt-2 text-xs text-cyan-400 font-semibold">
                            <span>
                              {dashboardData?.overallStats?.completedCount ?? 0}{" "}
                              Mock Assessments Completed
                            </span>
                          </div>
                        </div>

                        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 text-left relative overflow-hidden group hover:border-pink-500/25 transition-all">
                          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                              Current Streak
                            </span>
                            <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400">
                              <Flame className="w-4 h-4 animate-pulse" />
                            </div>
                          </div>
                          <div className="mt-4">
                            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                              {dashboardData?.overallStats?.streak ?? 0} Days
                            </span>
                          </div>
                          <div className="mt-2 text-xs text-pink-400 font-semibold">
                            <span>Daily target active</span>
                          </div>
                        </div>
                      </div>

                      {/* Main Grid: Previous Quiz & AI Recommendation */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Previous Quiz Card (7 cols) */}
                        <div className="lg:col-span-7 bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left flex flex-col justify-between shadow-lg">
                          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

                          <div>
                            <div className="flex justify-between items-center pb-3.5 border-b border-white/5 mb-4">
                              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Clock className="w-4 h-4 text-indigo-400" />
                                Last Assessment Review
                              </h3>
                              <span className="text-xs px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wide border text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
                                Completed
                              </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-2">
                              <div>
                                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                  Category
                                </span>
                                <span className="text-sm font-semibold text-slate-200">
                                  {dashboardData?.latestAttempt?.category ||
                                    "N/A"}
                                </span>
                              </div>
                              <div>
                                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                  Difficulty
                                </span>
                                <span className="text-sm font-semibold text-slate-200">
                                  {dashboardData?.latestAttempt?.difficulty ||
                                    "N/A"}
                                </span>
                              </div>
                              <div>
                                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                  Completed Date
                                </span>
                                <span className="text-sm font-semibold text-slate-200 font-mono">
                                  {dashboardData?.latestAttempt
                                    ?.completedDate || "N/A"}
                                </span>
                              </div>
                              <div>
                                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                  Score Achieved
                                </span>
                                <span className="text-sm font-bold text-indigo-400 font-mono">
                                  {dashboardData?.latestAttempt?.score ?? 0} /
                                  10
                                </span>
                              </div>
                              <div>
                                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                  Accuracy Rating
                                </span>
                                <span className="text-sm font-bold text-emerald-400 font-mono">
                                  {dashboardData?.latestAttempt?.accuracy ?? 0}%
                                </span>
                              </div>
                              <div>
                                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                  Questions &amp; Time
                                </span>
                                <span className="text-sm font-semibold text-slate-200">
                                  {dashboardData?.latestAttempt
                                    ?.attemptedCount ?? 0}{" "}
                                  Attempted |{" "}
                                  {dashboardData?.latestAttempt
                                    ?.timeTakenMinutes ?? 0}{" "}
                                  Minutes
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-6 border-t border-white/5 mt-6 flex gap-3">
                            <button
                              onClick={() => setView("setup")}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white text-sm font-bold shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:scale-[1.01] transition-all cursor-pointer"
                            >
                              <Play className="w-4 h-4 fill-white" />
                              Start New Quiz
                            </button>
                          </div>
                        </div>

                        {/* AI Recommendation Card (5 cols) */}
                        <div className="lg:col-span-5 bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left flex flex-col justify-between shadow-lg">
                          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

                          <div>
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4 pb-3.5 border-b border-white/5">
                              <Sparkles className="w-4 h-4 text-purple-400" />
                              AI Insights &amp; Directives
                            </h3>

                            <div className="space-y-4">
                              {(dashboardData?.recommendations || []).map(
                                (rec, idx) => {
                                  const IconComponent =
                                    rec.icon === "zap"
                                      ? Zap
                                      : rec.icon === "check"
                                        ? CheckCircle2
                                        : rec.icon === "calendar"
                                          ? Calendar
                                          : Info;
                                  const colorClass =
                                    rec.color === "indigo"
                                      ? "bg-indigo-500/10 text-indigo-400"
                                      : rec.color === "emerald"
                                        ? "bg-emerald-500/10 text-emerald-400"
                                        : rec.color === "pink"
                                          ? "bg-pink-500/10 text-pink-400"
                                          : rec.color === "purple"
                                            ? "bg-purple-500/10 text-purple-400"
                                            : "bg-amber-500/10 text-amber-400";
                                  const boldColorClass =
                                    rec.color === "indigo"
                                      ? "text-indigo-300"
                                      : rec.color === "emerald"
                                        ? "text-emerald-300"
                                        : rec.color === "pink"
                                          ? "text-pink-300"
                                          : rec.color === "purple"
                                            ? "text-purple-300"
                                            : "text-amber-300";
                                  return (
                                    <div
                                      key={idx}
                                      className="flex gap-3 items-start p-3 bg-white/[0.01] border border-white/5 rounded-xl"
                                    >
                                      <div
                                        className={`p-1 rounded shrink-0 ${colorClass}`}
                                      >
                                        <IconComponent className="w-3.5 h-3.5" />
                                      </div>
                                      <p className="text-xs text-slate-300 font-light leading-relaxed">
                                        {rec.text}
                                        <strong
                                          className={`${boldColorClass} font-semibold`}
                                        >
                                          {rec.boldText}
                                        </strong>
                                        {rec.suffix}
                                      </p>
                                    </div>
                                  );
                                },
                              )}
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-500 italic mt-6 border-t border-white/5 pt-3">
                            Recommendations update dynamically after each
                            completed quiz.
                          </div>
                        </div>
                      </div>

                      {/* Category Performance Matrix */}
                      <div className="space-y-4 text-left">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                          <Award className="w-5 h-5 text-indigo-400" />
                          Category Analytics Matrix
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                          {[
                            {
                              name: "Quantitative Aptitude",
                              color: "indigo",
                              bgGlow: "via-indigo-500/20",
                              progressColor: "bg-indigo-500",
                            },
                            {
                              name: "Logical Reasoning",
                              color: "purple",
                              bgGlow: "via-purple-500/20",
                              progressColor: "bg-purple-500",
                            },
                            {
                              name: "Verbal Ability",
                              color: "pink",
                              bgGlow: "via-pink-500/20",
                              progressColor: "bg-pink-500",
                            },
                            {
                              name: "Data Interpretation",
                              color: "cyan",
                              bgGlow: "via-cyan-500/20",
                              progressColor: "bg-cyan-500",
                            },
                            {
                              name: "Mixed Aptitude",
                              color: "indigo",
                              bgGlow: "via-indigo-500/20",
                              progressColor: "bg-indigo-500",
                            },
                          ].map((cat, idx) => {
                            const stats = dashboardData?.categoryAnalytics?.[
                              cat.name
                            ] || { attempts: 0, avg: 0, best: 0 };
                            return (
                              <div
                                key={idx}
                                className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:border-white/20 transition-all flex flex-col justify-between"
                              >
                                <div
                                  className={`absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent ${cat.bgGlow} to-transparent`}
                                />
                                <div className="space-y-3">
                                  <h4 className="text-sm font-bold text-white">
                                    {cat.name}
                                  </h4>
                                  <div className="text-xs text-slate-400">
                                    <div className="flex justify-between items-center">
                                      <span>Attempts: {stats.attempts}</span>
                                      <span>Avg: {stats.avg}%</span>
                                    </div>

                                    
                                  </div>
                                </div>
                                <div className="mt-4 space-y-1">
                                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full ${cat.progressColor}`}
                                      style={{ width: `${stats.avg}%` }}
                                    />
                                  </div>
                                  <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                                    <span>Progress Stage</span>
                                    <span>{stats.avg}%</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Recent Quiz Activity Table */}
                      <div
                        id="recent-activity"
                        className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left shadow-lg"
                      >
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-indigo-400" />
                            Recent Quiz History
                          </h3>
                        </div>

                        <div className="overflow-x-auto w-full">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b border-white/5 text-[11px] text-slate-500 font-bold uppercase tracking-wider text-left">
                                <th className="pb-3 pl-3">Category</th>
                                <th className="pb-3">Difficulty</th>
                                <th className="pb-3">Score</th>
                                <th className="pb-3">Accuracy</th>
                                <th className="pb-3">Date</th>
                                <th className="pb-3 pr-3 text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-xs text-slate-300 font-medium">
                              {(dashboardData?.history || []).map(
                                (item, idx) => (
                                  <tr
                                    key={idx}
                                    className="hover:bg-white/[0.01] transition-colors"
                                  >
                                    <td className="py-4 pl-3 text-white font-semibold">
                                      {item.category}
                                    </td>
                                    <td className="py-4">
                                      <span
                                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                                          item.difficulty === "Easy"
                                            ? "text-emerald-400 bg-emerald-500/10"
                                            : item.difficulty === "Medium"
                                              ? "text-indigo-400 bg-indigo-500/10"
                                              : "text-purple-400 bg-purple-500/10"
                                        }`}
                                      >
                                        {item.difficulty}
                                      </span>
                                    </td>
                                    <td className="py-4 font-mono">
                                      {item.score}
                                    </td>
                                    <td className="py-4 font-mono text-emerald-400">
                                      {item.accuracy}
                                    </td>
                                    <td className="py-4 font-mono text-slate-400">
                                      {item.date}
                                    </td>
                                    <td className="py-4 pr-3 text-right">
                                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        {item.status}
                                      </span>
                                    </td>
                                  </tr>
                                ),
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* ==================== QUIZ SETUP VIEW ==================== */}
              {view === "setup" && (
                <motion.div
                  key="setup"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="max-w-3xl mx-auto space-y-6 text-left"
                >
                  {/* Setup Page Header */}
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <button
                      onClick={() => setView("home")}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight text-white">
                        AI Quiz Configuration
                      </h1>
                      <p className="text-sm text-slate-400 font-light">
                        Select categories and target difficulty. Our AI will
                        construct custom assessment questions.
                      </p>
                    </div>
                  </div>

                  {/* Form Container */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Setup Controls (Left 2 columns) */}
                    <div className="md:col-span-2 space-y-6">
                      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

                        {/* Category */}
                        <div className="space-y-2.5">
                          <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider">
                            Category
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                              "Mixed Aptitude",
                              "Quantitative Aptitude",
                              "Logical Reasoning",
                              "Verbal Ability",
                              "Data Interpretation",
                            ].map((cat) => (
                              <button
                                type="button"
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`p-3.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                                  selectedCategory === cat
                                    ? "bg-indigo-500/15 border-indigo-500/50 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                                    : "bg-slate-950/20 border-white/5 text-slate-400 hover:text-white hover:border-white/15"
                                }`}
                              >
                                <span>{cat}</span>
                                {cat === "Mixed Aptitude" && (
                                  <span className="block text-[9px] text-indigo-400 font-extrabold mt-1">
                                    RECOMMENDED
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Difficulty */}
                        <div className="space-y-2.5 pt-3 border-t border-white/5">
                          <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider">
                            Difficulty
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            {["Easy", "Medium", "Hard", "Adaptive"].map(
                              (diff) => (
                                <button
                                  type="button"
                                  key={diff}
                                  onClick={() => setSelectedDifficulty(diff)}
                                  className={`p-3.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                                    selectedDifficulty === diff
                                      ? "bg-indigo-500/15 border-indigo-500/50 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                                      : "bg-slate-950/20 border-white/5 text-slate-400 hover:text-white hover:border-white/15"
                                  }`}
                                >
                                  {diff}
                                  {diff === "Adaptive" && (
                                    <span className="block text-[9px] text-indigo-400 font-extrabold mt-0.5">
                                      AI CHOSEN
                                    </span>
                                  )}
                                </button>
                              ),
                            )}
                          </div>
                        </div>

                        {/* Read-Only Configuration Fields */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                          <div className="space-y-1">
                            <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                              Questions
                            </span>
                            <div className="bg-slate-950/40 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-slate-400 font-semibold cursor-not-allowed">
                              10 AI Generated Questions
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                              Estimated Time
                            </span>
                            <div className="bg-slate-950/40 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-slate-400 font-semibold cursor-not-allowed">
                              15 Minutes
                            </div>
                          </div>
                        </div>
                      </div>

                      {apiError && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-left space-y-3">
                          <p className="text-xs text-red-400 font-bold uppercase tracking-wider">
                            Error Generating Assessment
                          </p>
                          <p className="text-sm text-slate-300 font-light leading-relaxed">
                            {apiError}
                          </p>
                          <button
                            type="button"
                            onClick={startLoadingQuiz}
                            className="px-4 py-2 rounded-xl bg-red-500/25 hover:bg-red-500/40 text-white text-xs font-bold transition-all cursor-pointer"
                          >
                            Retry Request
                          </button>
                        </div>
                      )}

                      {/* Setup Start Button */}
                      <button
                        onClick={startLoadingQuiz}
                        disabled={loadingQuiz}
                        className="w-full flex items-center justify-center gap-1.5 py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white text-base font-bold transition-all duration-200 cursor-pointer hover:scale-[1.01] shadow-[0_0_30px_rgba(99,102,241,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingQuiz ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                            <span>Preparing your aptitude quiz...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5 fill-white" />
                            <span>Start Quiz</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Quiz Information Card (Right 1 column) */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 relative overflow-hidden h-fit space-y-4">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

                      <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                        <Info className="w-4 h-4 text-purple-400" />
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                          Quiz Guideline
                        </h4>
                      </div>

                      <ul className="space-y-3.5 text-xs text-slate-300 font-light leading-relaxed">
                        <li className="flex gap-2">
                          <span className="text-purple-400 shrink-0 font-bold">
                            •
                          </span>
                          <span>
                            10 AI-generated questions specific to your chosen
                            category.
                          </span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-purple-400 shrink-0 font-bold">
                            •
                          </span>
                          <span>
                            Personalized difficulty curves constructed
                            dynamically.
                          </span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-purple-400 shrink-0 font-bold">
                            •
                          </span>
                          <span>
                            Balanced placement-oriented patterns mimicking top
                            tier companies.
                          </span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-purple-400 shrink-0 font-bold">
                            •
                          </span>
                          <span>
                            Instant evaluation report and solutions generated
                            after submission.
                          </span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-purple-400 shrink-0 font-bold">
                            •
                          </span>
                          <span>Estimated completion limit: 15 minutes.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ==================== LOADING VIEW ==================== */}
              {view === "loading" && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center min-h-[450px] space-y-8 max-w-lg mx-auto"
                >
                  {/* Glowing Spinner circle */}
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-[3px] border-white/5" />
                    <div className="absolute inset-0 rounded-full border-[3px] border-indigo-500 border-t-transparent animate-spin" />
                    <Brain className="absolute inset-0 m-auto w-8 h-8 text-indigo-400 animate-pulse" />
                  </div>

                  <div className="space-y-3.5 text-center w-full">
                    <h3 className="text-xl font-bold text-white">
                      Generating Assessment
                    </h3>

                    {/* Animated Text Message Cycle */}
                    <div className="h-6 overflow-hidden relative w-full flex justify-center items-center">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={loadingStep}
                          initial={{ y: 15, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -15, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="text-sm text-indigo-300 font-semibold font-mono"
                        >
                          {loadingMessages[loadingStep]}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Skeletons block */}
                  <div className="w-full bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-4 animate-pulse">
                    <div className="h-4 bg-white/5 rounded w-1/3" />
                    <div className="space-y-2">
                      <div className="h-3 bg-white/5 rounded w-full" />
                      <div className="h-3 bg-white/5 rounded w-5/6" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="h-10 bg-white/5 rounded-xl" />
                      <div className="h-10 bg-white/5 rounded-xl" />
                      <div className="h-10 bg-white/5 rounded-xl" />
                      <div className="h-10 bg-white/5 rounded-xl" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ==================== ACTIVE QUIZ VIEW ==================== */}
              {view === "quiz" && (
                <motion.div
                  key="quiz"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left relative"
                >
                  {/* Left & Center Main Block (8 cols on Desktop, shifts below timer on Tablet/Mobile) */}
                  <div className="lg:col-span-8 space-y-6">
                    {/* Quiz Progress and Header */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 relative overflow-hidden space-y-4">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

                      <div className="flex flex-wrap justify-between items-center gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 font-bold uppercase tracking-wider">
                            {selectedCategory}
                          </span>
                          <span className="px-2.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 font-bold uppercase tracking-wider">
                            {selectedDifficulty}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-mono font-bold">
                          Question {currentQuestionIdx + 1} of 10
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Question Card */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden space-y-6 shadow-lg min-h-[300px] flex flex-col justify-between">
                      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

                      <div className="space-y-5">
                        <h2 className="text-sm font-extrabold text-indigo-400 uppercase tracking-widest font-mono">
                          Question {currentQuestionIdx + 1}
                        </h2>

                        {/* Question body (handles math blocks and markdown-styled lists/tables) */}
                        <div className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed whitespace-pre-line">
                          {questions[currentQuestionIdx]?.question || ""}
                        </div>
                      </div>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 gap-3.5 mt-8">
                        {(questions[currentQuestionIdx]?.options || []).map(
                          (opt) => {
                            const isSelected =
                              answers[currentQuestionIdx] === opt.key;
                            return (
                              <button
                                type="button"
                                key={opt.key}
                                onClick={() => handleSelectOption(opt.key)}
                                className={`w-full p-4 rounded-xl border text-xs sm:text-sm font-semibold transition-all duration-200 text-left flex items-center gap-4 cursor-pointer select-none ${
                                  isSelected
                                    ? "bg-indigo-500/10 border-indigo-500/50 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.08)]"
                                    : "bg-slate-950/20 border-white/5 text-slate-300 hover:text-white hover:border-white/15"
                                }`}
                              >
                                <span
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                    isSelected
                                      ? "bg-indigo-500 text-white"
                                      : "bg-white/5 text-slate-400"
                                  }`}
                                >
                                  {opt.key}
                                </span>
                                <span>{opt.text}</span>
                              </button>
                            );
                          },
                        )}
                      </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex flex-wrap justify-between items-center gap-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handlePrevQuestion}
                          disabled={currentQuestionIdx === 0}
                          className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4 rotate-180" />
                          Previous
                        </button>
                        <button
                          type="button"
                          onClick={handleSkipQuestion}
                          disabled={currentQuestionIdx === 9}
                          className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                        >
                          Skip
                        </button>
                        <button
                          type="button"
                          onClick={handleFlagQuestion}
                          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            flaggedQuestions[currentQuestionIdx]
                              ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
                              : "border-white/5 bg-white/[0.02] text-slate-400 hover:text-white"
                          }`}
                        >
                          ★ Flag Review
                        </button>
                      </div>

                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={handleQuitQuiz}
                          className="px-4 py-2.5 rounded-xl border border-red-500/10 hover:border-red-500/30 bg-red-500/5 hover:bg-red-500/15 text-xs font-bold text-red-400 transition-all cursor-pointer w-full sm:w-auto text-center"
                        >
                          Quit Quiz
                        </button>

                        {currentQuestionIdx === 9 ? (
                          <button
                            type="button"
                            onClick={submitActiveQuiz}
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white text-xs font-black shadow-lg shadow-indigo-500/25 transition-all cursor-pointer w-full sm:w-auto hover:scale-[1.01]"
                          >
                            Submit
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleNextQuestion}
                            className="flex items-center justify-center gap-1 px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-black shadow-lg shadow-indigo-500/25 transition-all cursor-pointer w-full sm:w-auto hover:scale-[1.01]"
                          >
                            Next Question
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column (Timer, AI Insight, Question Palette - 4 cols on Desktop) */}
                  <div className="lg:col-span-4 space-y-6">
                    {/* Timer Panel */}
                    <div
                      className={`bg-white/[0.02] border border-white/10 rounded-3xl p-5 text-center relative overflow-hidden flex flex-col items-center justify-center shadow-lg ${
                        timeLeft < 120 ? "timer-warning" : ""
                      }`}
                    >
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

                      {/* SVG Circular Countdown */}
                      <div className="relative w-28 h-28 flex items-center justify-center my-3">
                        <svg className="w-28 h-28 transform -rotate-90">
                          <circle
                            cx="56"
                            cy="56"
                            r="44"
                            className="text-slate-800"
                            strokeWidth="5"
                            stroke="currentColor"
                            fill="transparent"
                          />
                          <circle
                            cx="56"
                            cy="56"
                            r="44"
                            className="text-transparent"
                            strokeWidth="5"
                            strokeDasharray={276}
                            strokeDashoffset={276 - (276 * timeLeft) / 900}
                            strokeLinecap="round"
                            stroke={timeLeft < 120 ? "#ef4444" : "#6366f1"}
                            fill="transparent"
                            style={{
                              transition: "stroke-dashoffset 1s linear",
                            }}
                          />
                        </svg>
                        <div className="absolute text-center">
                          <span
                            className={`text-xl font-mono font-black ${
                              timeLeft < 120 ? "text-red-500" : "text-white"
                            }`}
                          >
                            {formatTime(timeLeft)}
                          </span>
                          <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                            Time Left
                          </span>
                        </div>
                      </div>

                      {/* Small Quick Metrics */}
                      <div className="w-full grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/5 text-[11px] text-slate-400 font-semibold font-mono">
                        <div>
                          <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">
                            Attempted
                          </span>
                          <span className="text-sm font-bold text-white">
                            {currentMetrics.attempted} / 10
                          </span>
                        </div>
                        <div className="border-l border-white/5">
                          <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">
                            Remaining
                          </span>
                          <span className="text-sm font-bold text-slate-300">
                            {(questions.length || 10) -
                              currentMetrics.attempted}{" "}
                            / 10
                          </span>
                        </div>
                        <div className="border-l border-white/5">
                          <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">
                            Status
                          </span>
                          <span className="text-sm font-bold text-indigo-400">
                            In Progress
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Question Palette Grid */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-5 relative overflow-hidden text-left shadow-lg">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

                      <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4">
                        <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                          Question Palette
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono">
                          10 Total
                        </span>
                      </div>

                      {/* Circle Grid */}
                      <div className="grid grid-cols-5 gap-2.5 justify-items-center">
                        {questions.map((_, idx) => {
                          const isCurrent = currentQuestionIdx === idx;
                          const isAnswered = answers[idx] !== undefined;
                          const isSkipped = skippedQuestions[idx] === true;
                          const isFlagged = flaggedQuestions[idx] === true;

                          return (
                            <button
                              type="button"
                              key={idx}
                              onClick={() => {
                                setCurrentQuestionIdx(idx);
                                setShowHint(false);
                              }}
                              className={`relative w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs font-mono transition-all cursor-pointer ${
                                isCurrent
                                  ? "bg-indigo-500/10 border-2 border-indigo-500 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.2)]"
                                  : isAnswered
                                    ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-400"
                                    : isSkipped
                                      ? "bg-amber-500/5 border border-amber-500/30 text-amber-400"
                                      : "bg-slate-950/40 border border-white/10 text-slate-500"
                              }`}
                            >
                              {idx + 1}
                              {/* Star Flag indicator */}
                              {isFlagged && (
                                <span
                                  className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-500 border border-slate-950 rounded-full"
                                  title="Flagged for Review"
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Status Legend */}
                      <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500/40 inline-block" />
                          <span>Answered</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded bg-amber-500/15 border border-amber-500/30 inline-block" />
                          <span>Skipped</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded bg-indigo-500/10 border-2 border-indigo-500 inline-block" />
                          <span>Active</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded bg-orange-500 inline-block" />
                          <span>Flagged</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tablet/Mobile question palette drawer button */}
                  <div className="fixed bottom-4 right-4 z-40 lg:hidden">
                    <button
                      type="button"
                      onClick={() => setShowPaletteDrawer(true)}
                      className="p-3.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center cursor-pointer"
                    >
                      <Maximize2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Mobile Palette Overlay Drawer */}
                  <AnimatePresence>
                    {showPaletteDrawer && (
                      <>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setShowPaletteDrawer(false)}
                          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
                        />
                        <motion.div
                          initial={{ y: "100%" }}
                          animate={{ y: 0 }}
                          exit={{ y: "100%" }}
                          transition={{
                            type: "spring",
                            damping: 25,
                            stiffness: 200,
                          }}
                          className="fixed inset-x-0 bottom-0 z-50 bg-[#050B1F] border-t border-white/10 rounded-t-3xl p-6 space-y-4 lg:hidden"
                        >
                          <div className="flex justify-between items-center">
                            <h4 className="text-sm font-bold text-white">
                              Assessment Navigation
                            </h4>
                            <button
                              type="button"
                              onClick={() => setShowPaletteDrawer(false)}
                              className="p-1 rounded-lg text-slate-400 hover:text-white"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Palette elements copied for drawer */}
                          <div className="grid grid-cols-5 gap-2.5 justify-items-center py-2">
                            {questions.map((_, idx) => {
                              const isCurrent = currentQuestionIdx === idx;
                              const isAnswered = answers[idx] !== undefined;
                              const isSkipped = skippedQuestions[idx] === true;
                              const isFlagged = flaggedQuestions[idx] === true;

                              return (
                                <button
                                  type="button"
                                  key={idx}
                                  onClick={() => {
                                    setCurrentQuestionIdx(idx);
                                    setShowPaletteDrawer(false);
                                    setShowHint(false);
                                  }}
                                  className={`relative w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs font-mono transition-all cursor-pointer ${
                                    isCurrent
                                      ? "bg-indigo-500/10 border-2 border-indigo-500 text-indigo-300"
                                      : isAnswered
                                        ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-400"
                                        : isSkipped
                                          ? "bg-amber-500/5 border border-amber-500/30 text-amber-400"
                                          : "bg-slate-950/40 border border-white/10 text-slate-500"
                                  }`}
                                >
                                  {idx + 1}
                                  {isFlagged && (
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-500 border border-slate-950 rounded-full" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* ==================== RESULTS SUMMARY VIEW ==================== */}
              {view === "results" && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="max-w-2xl mx-auto space-y-6 text-left"
                >
                  <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden text-center space-y-6 shadow-2xl">
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent pointer-events-none" />
                    <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-emerald-500/10 blur-[40px] pointer-events-none" />

                    {/* Trophy icon */}
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Trophy className="w-8 h-8 animate-bounce" />
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-2xl font-black text-white">
                        Quiz Completed!
                      </h2>
                      <p className="text-sm text-slate-400 font-light max-w-md mx-auto">
                        Your performance indicators have been parsed and synced
                        with the PrepSphere core diagnostics system.
                      </p>
                    </div>

                    {/* Score Overview */}
                    <div className="grid grid-cols-3 gap-4 py-4 max-w-md mx-auto border-y border-white/5 font-mono">
                      <div>
                        <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                          Total Score
                        </span>
                        <span className="text-xl sm:text-2xl font-black text-indigo-400">
                          {currentMetrics.score} / 10
                        </span>
                      </div>
                      <div className="border-l border-white/5">
                        <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                          Accuracy
                        </span>
                        <span className="text-xl sm:text-2xl font-black text-emerald-400">
                          {currentMetrics.accuracy}%
                        </span>
                      </div>
                      <div className="border-l border-white/5">
                        <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                          Attempted
                        </span>
                        <span className="text-xl sm:text-2xl font-black text-white">
                          {currentMetrics.attempted} / 10
                        </span>
                      </div>
                    </div>

                    {/* Review Section */}
                    <div className="text-left space-y-4 pt-4">
                      <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                        Detailed Solution Review
                      </h3>
                      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                        {questions.map((q, idx) => {
                          if (!q.correctAnswer) {
                            throw new Error(
                              `Question ${idx + 1} is missing correctAnswer.`,
                            );
                          }
                          const isCorrect = answers[idx] === q.correctAnswer;
                          const wasSkipped = answers[idx] === undefined;
                          return (
                            <div
                              key={q._id || idx}
                              className="p-4 bg-slate-950/40 border border-white/5 rounded-xl space-y-2"
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-400 font-mono">
                                  Question {idx + 1}
                                </span>
                                <span
                                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                    wasSkipped
                                      ? "text-amber-400 bg-amber-500/10"
                                      : isCorrect
                                        ? "text-emerald-400 bg-emerald-500/10"
                                        : "text-red-400 bg-red-500/10"
                                  }`}
                                >
                                  {wasSkipped
                                    ? "Skipped"
                                    : isCorrect
                                      ? "Correct"
                                      : "Incorrect"}
                                </span>
                              </div>
                              <p className="text-xs text-white font-medium leading-relaxed whitespace-pre-line">
                                {q.question || ""}
                              </p>
                              <div className="text-[11px] space-y-1 pt-1.5 border-t border-white/5">
                                <div className="text-slate-400">
                                  Your Option:{" "}
                                  <strong className="text-white font-semibold font-mono">
                                    {answers[idx] || "None"}
                                  </strong>{" "}
                                  | Correct Option:{" "}
                                  <strong className="text-emerald-400 font-semibold font-mono">
                                    {q.correctAnswer}
                                  </strong>
                                </div>
                                <div className="text-indigo-300 font-light leading-relaxed">
                                  <strong>Explanation:</strong>{" "}
                                  {q.explanation || "No explanation provided."}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      onClick={() => setView("home")}
                      className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] hover:border-white/15 text-sm font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
                    >
                      Back to Aptitude Home
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>

        {/* LOGOUT CONFIRMATION MODAL */}
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
                    <LogOut className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Confirm Sign Out
                    </h3>
                    <p className="text-sm text-slate-400 font-light mt-1.5 leading-relaxed">
                      Are you sure you want to log out of PrepSphere AI? You
                      will need to sign in again to access your preparation
                      dashboard.
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
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                    className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all duration-200 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.25)]"
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

export default AptitudePractice;
