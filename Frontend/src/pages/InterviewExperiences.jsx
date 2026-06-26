import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/layout/Sidebar";
import TopNavbar from "../components/layout/TopNavbar";
import {
  getAllExperiences,
  getMetadata,
  createExperience,
  updateExperience,
  deleteExperience,
  getMyExperiences,
  likeExperience,
  bookmarkExperience,
  getBookmarks,
  getCompaniesFilter,
  getRolesFilter,
  getTopContributors,
  getPopularTags
} from "../services/interviewExperienceService";
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
  ChevronLeft,
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
  Trash2,
  TrendingUp,
  Pencil,
  AlertTriangle,
  Eye
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

// FAQ list (commented out for future implementation)
// const FAQ_LIST = [
//   { q: "How should I prepare for Google interviews?", a: "..." },
//   { q: "Which DSA topics are most asked?", a: "..." },
//   { q: "How many interview rounds does Amazon usually have?", a: "..." },
//   { q: "What is expected in HR interviews?", a: "HR rounds check culture fit, salary expectations, relocation preferences, and career alignment. Be honest, show interest in the company values, and prepare examples of conflict resolution or projects teamwork." }
// ];

// Skeleton loader for loading state representation
const ExperienceSkeleton = () => (
  <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden animate-pulse flex flex-col gap-4">
    <div className="flex justify-between items-center border-b border-white/5 pb-3">
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-white/5" />
        <div className="space-y-2">
          <div className="h-3 w-24 bg-white/10 rounded" />
          <div className="h-2.5 w-32 bg-white/5 rounded" />
        </div>
      </div>
      <div className="h-4 w-16 bg-white/5 rounded" />
    </div>
    <div className="space-y-3">
      <div className="h-3 w-40 bg-white/5 rounded" />
      <div className="h-4 w-3/4 bg-white/10 rounded" />
      <div className="h-3.5 w-full bg-white/5 rounded" />
    </div>
    <div className="flex gap-2">
      <div className="h-6 w-12 bg-white/5 rounded-lg" />
      <div className="h-6 w-12 bg-white/5 rounded-lg" />
    </div>
  </div>
);

const InterviewExperiences = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const location = useLocation();

  // ─── Session Storage Key ────────────────────────────────────────────────────
  const SESSION_KEY = "ie_page_state";

  // ─── Read restored snapshot from sessionStorage on first render ─────────────
  // Using a ref so getRestoredState() runs once synchronously (not in effect)
  const restoredRef = useRef(null);
  if (restoredRef.current === null) {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.__restore) {
          restoredRef.current = parsed;
        }
      }
    } catch { /* ignore */ }
    if (restoredRef.current === null) restoredRef.current = false; // mark as "checked, nothing found"
  }
  const restored = restoredRef.current || null; // null = fresh load, object = restoring

  // ─── Refs ────────────────────────────────────────────────────────────────────
  const mainScrollRef = useRef(null);
  const scrollRestoredRef = useRef(false);
  const isFirstFetchRef = useRef(true);
  const companyDebounceRef = useRef(null);
  const companyInputRef = useRef(null);
  const companyDropdownRef = useRef(null);
  const roleDebounceRef = useRef(null);
  const roleInputRef = useRef(null);
  const roleDropdownRef = useRef(null);

  // ─── UI State ─────────────────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ─── Share/Edit Form ──────────────────────────────────────────────────────────
  const [shareFormOpen, setShareFormOpen] = useState(false);
  const [newExpCompany, setNewExpCompany] = useState("");
  const [newExpRole, setNewExpRole] = useState("");
  const [newExpPackage, setNewExpPackage] = useState("");
  const [newExpSummary, setNewExpSummary] = useState("");
  const [newExpTips, setNewExpTips] = useState("");
  const [newExpType, setNewExpType] = useState("Full Time");
  const [newExpDifficulty, setNewExpDifficulty] = useState("Medium");
  const [newExpCollege, setNewExpCollege] = useState("");
  const [newExpGradYear, setNewExpGradYear] = useState("");
  const [newExpOA, setNewExpOA] = useState("");
  const [newExpTech1, setNewExpTech1] = useState("");
  const [newExpTech2, setNewExpTech2] = useState("");
  const [newExpTech3, setNewExpTech3] = useState("");
  const [newExpHR, setNewExpHR] = useState("");
  const [newExpResult, setNewExpResult] = useState("Selected");
  const [newExpTags, setNewExpTags] = useState("");

  // ─── Control States ───────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState(restored?.viewMode || "all");
  const [editingExperience, setEditingExperience] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);

  // ─── Feed & Interaction State ─────────────────────────────────────────────────
  const [experiences, setExperiences] = useState(restored?.experiences || []);
  const [likedList, setLikedList] = useState(() => new Set(restored?.likedList || []));
  const [bookmarkedList, setBookmarkedList] = useState(() => new Set(restored?.bookmarkedList || []));
  const [processingIds, setProcessingIds] = useState(new Set());

  // ─── Filter Values ────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState(restored?.searchQuery || "");
  const [filterCompany, setFilterCompany] = useState(restored?.filterCompany || "All");
  const [filterRole, setFilterRole] = useState(restored?.filterRole || "All");
  const [filterDifficulty, setFilterDifficulty] = useState(restored?.filterDifficulty || "All");
  const [filterMode, setFilterMode] = useState(restored?.filterMode || "All");
  const [sortBy, setSortBy] = useState(restored?.sortBy || "Latest");

  // ─── Autocomplete Input Values ────────────────────────────────────────────────
  const [companyInputValue, setCompanyInputValue] = useState(restored?.companyInputValue || "");
  const [roleInputValue, setRoleInputValue] = useState(restored?.roleInputValue || "");

  // ─── Pagination & Loading ─────────────────────────────────────────────────────
  const [loadingFeed, setLoadingFeed] = useState(!restored);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(restored?.currentPage || 1);
  const [totalPages, setTotalPages] = useState(restored?.totalPages || 1);
  const [totalResults, setTotalResults] = useState(restored?.totalResults || 0);

  // ─── Metadata & Sidebar ───────────────────────────────────────────────────────
  const [featuredCompanies, setFeaturedCompanies] = useState([]);
  const [communityStats, setCommunityStats] = useState([
    { label: "Total Experiences", val: "0", suffix: "+" },
    { label: "Top Companies", val: "0", suffix: "" },
    { label: "Monthly Posts", val: "0", suffix: "" },
    { label: "Active Contributors", val: "0", suffix: "" },
    { label: "Average Package", val: "0", suffix: " LPA" }
  ]);
  const [topContributors, setTopContributors] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [loadingContributors, setLoadingContributors] = useState(true);
  const [loadingTags, setLoadingTags] = useState(true);

  // ─── Autocomplete Suggestion State ───────────────────────────────────────────
  const [companySuggestions, setCompanySuggestions] = useState([]);
  const [showCompanySuggestions, setShowCompanySuggestions] = useState(false);
  const [roleSuggestions, setRoleSuggestions] = useState([]);
  const [showRoleSuggestions, setShowRoleSuggestions] = useState(false);

  // ─── Debounced Search ─────────────────────────────────────────────────────────
  const [debouncedSearch, setDebouncedSearch] = useState(restored?.searchQuery || "");


  // ─── Clear restore flag on mount ─────────────────────────────────────────────
  useEffect(() => {
    if (restored) {
      try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          delete parsed.__restore;
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(parsed));
        }
      } catch { /* ignore */ }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Search debounce (skip page reset when restoring) ────────────────────────
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      // Only reset page if searchQuery actually changed from the restored value
      if (searchQuery !== (restored?.searchQuery || "")) {
        setCurrentPage(1);
      }
    }, 400);
    return () => clearTimeout(handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // ─── Fetch Metadata ───────────────────────────────────────────────────────────
  const fetchMeta = useCallback(async () => {
    setLoadingMeta(true);
    try {
      const data = await getMetadata();
      if (data && data.success) {
        setCommunityStats([
          { label: "Total Experiences", val: String(data.stats.totalExperiences), suffix: "+" },
          { label: "Top Companies", val: String(data.stats.totalCompanies), suffix: "" },
          { label: "Monthly Posts", val: String(data.stats.monthlyPosts), suffix: "" },
          { label: "Active Contributors", val: String(data.stats.totalContributors), suffix: "" },
          { label: "Average Package", val: String(data.stats.averagePackage), suffix: " LPA" }
        ]);
        setFeaturedCompanies(data.featuredCompanies || []);
      }
    } catch (err) {
      console.error("Error fetching metadata:", err);
    } finally {
      setLoadingMeta(false);
    }
  }, []);

  useEffect(() => { fetchMeta(); }, [fetchMeta]);

  // ─── Fetch Feed (skips first call if restoring from session) ─────────────────
  const fetchFeed = useCallback(async () => {
    // Skip first fetch if we have a restored cache
    if (isFirstFetchRef.current && restored && (restored.experiences || []).length > 0) {
      isFirstFetchRef.current = false;
      setLoadingFeed(false);
      return;
    }
    isFirstFetchRef.current = false;

    setLoadingFeed(true);
    setError(null);
    try {
      let experiencesList = [];
      if (viewMode === "my") {
        const data = await getMyExperiences();
        if (data && data.success) {
          experiencesList = data.experiences || [];
          setExperiences(experiencesList);
          setTotalPages(1);
          setTotalResults(experiencesList.length);
        } else { throw new Error("Failed to load your interview experiences."); }
      } else if (viewMode === "saved") {
        const data = await getBookmarks();
        if (data && data.success) {
          experiencesList = data.experiences || [];
          setExperiences(experiencesList);
          setTotalPages(1);
          setTotalResults(experiencesList.length);
        } else { throw new Error("Failed to load saved interview experiences."); }
      } else {
        const params = {
          page: currentPage, limit: 5, search: debouncedSearch,
          company: filterCompany === "All" ? "" : filterCompany,
          role: filterRole === "All" ? "" : filterRole,
          difficulty: filterDifficulty === "All" ? "" : filterDifficulty,
          interviewType: filterMode === "All" ? "" : filterMode,
          sortBy: sortBy === "Latest" ? "newest" : sortBy === "Oldest" ? "oldest" :
                  sortBy === "Highest Package" ? "highestPackage" : sortBy === "Lowest Package" ? "lowestPackage" : "newest"
        };
        const data = await getAllExperiences(params);
        if (data && data.success) {
          experiencesList = data.experiences || [];
          setExperiences(experiencesList);
          setTotalPages(data.totalPages || 1);
          setTotalResults(data.totalResults || 0);
        } else { throw new Error("Failed to load interview experiences."); }
      }
      setLikedList(prev => {
        const next = new Set(prev);
        experiencesList.forEach(exp => { if (exp.isLiked) next.add(exp._id); else next.delete(exp._id); });
        return next;
      });
      setBookmarkedList(prev => {
        const next = new Set(prev);
        experiencesList.forEach(exp => { if (exp.isBookmarked) next.add(exp._id); else next.delete(exp._id); });
        return next;
      });
    } catch (err) {
      console.error("Error loading experiences:", err);
      setError("Unable to load interview experiences. Please try again later.");
    } finally {
      setLoadingFeed(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearch, filterCompany, filterRole, filterDifficulty, filterMode, sortBy, viewMode]);

  useEffect(() => { fetchFeed(); }, [fetchFeed]);

  // ─── Scroll Restoration: fires AFTER feed finishes loading ───────────────────
  useEffect(() => {
    if (!loadingFeed && restored?.scrollY && mainScrollRef.current && !scrollRestoredRef.current) {
      scrollRestoredRef.current = true;
      const targetScroll = restored.scrollY;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (mainScrollRef.current) mainScrollRef.current.scrollTop = targetScroll;
        });
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingFeed]);

  // ─── Top Contributors ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchContributors = async () => {
      setLoadingContributors(true);
      try {
        const data = await getTopContributors();
        if (data && data.success) setTopContributors(data.contributors || []);
      } catch (err) { console.error("Error fetching contributors:", err); }
      finally { setLoadingContributors(false); }
    };
    fetchContributors();
  }, []);

  // ─── Popular Tags ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchTags = async () => {
      setLoadingTags(true);
      try {
        const data = await getPopularTags();
        if (data && data.success) setPopularTags(data.tags || []);
      } catch (err) { console.error("Error fetching popular tags:", err); }
      finally { setLoadingTags(false); }
    };
    fetchTags();
  }, []);

  // ─── Company Autocomplete ─────────────────────────────────────────────────────
  const doFetchCompanies = useCallback(async (query) => {
    if (!query.trim()) { setCompanySuggestions([]); setShowCompanySuggestions(false); return; }
    try {
      const data = await getCompaniesFilter(query);
      if (data && data.success && Array.isArray(data.companies)) {
        setCompanySuggestions(data.companies);
        setShowCompanySuggestions(data.companies.length > 0);
      }
    } catch (err) { console.error("Company autocomplete error:", err); }
  }, []);

  useEffect(() => {
    if (companyDebounceRef.current) clearTimeout(companyDebounceRef.current);
    companyDebounceRef.current = setTimeout(() => doFetchCompanies(companyInputValue), 300);
    return () => clearTimeout(companyDebounceRef.current);
  }, [companyInputValue, doFetchCompanies]);

  // ─── Role Autocomplete ────────────────────────────────────────────────────────
  const doFetchRoles = useCallback(async (query) => {
    if (!query.trim()) { setRoleSuggestions([]); setShowRoleSuggestions(false); return; }
    try {
      const data = await getRolesFilter(query);
      if (data && data.success && Array.isArray(data.roles)) {
        setRoleSuggestions(data.roles);
        setShowRoleSuggestions(data.roles.length > 0);
      }
    } catch (err) { console.error("Role autocomplete error:", err); }
  }, []);

  useEffect(() => {
    if (roleDebounceRef.current) clearTimeout(roleDebounceRef.current);
    roleDebounceRef.current = setTimeout(() => doFetchRoles(roleInputValue), 300);
    return () => clearTimeout(roleDebounceRef.current);
  }, [roleInputValue, doFetchRoles]);

  // ─── Click-outside: dismiss autocomplete dropdowns ───────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(e.target)) {
        setShowCompanySuggestions(false);
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target)) {
        setShowRoleSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };


  const filteredExperiences = useMemo(() => {
    if (viewMode === "all") return experiences;
    
    return experiences.filter(exp => {
      if (debouncedSearch) {
        const term = debouncedSearch.toLowerCase();
        const matchesCompany = exp.company?.toLowerCase().includes(term);
        const matchesRole = exp.role?.toLowerCase().includes(term);
        const matchesExp = exp.overallExperience?.toLowerCase().includes(term);
        const matchesTips = exp.preparationTips?.toLowerCase().includes(term);
        if (!matchesCompany && !matchesRole && matchesExp && !matchesTips) return false;
      }
      if (filterCompany !== "All" && exp.company?.toLowerCase() !== filterCompany.toLowerCase()) {
        return false;
      }
      if (filterRole !== "All" && exp.role?.toLowerCase() !== filterRole.toLowerCase()) {
        return false;
      }
      if (filterDifficulty !== "All" && exp.difficulty !== filterDifficulty) {
        return false;
      }
      if (filterMode !== "All" && exp.interviewType !== filterMode) {
        return false;
      }
      return true;
    });
  }, [experiences, viewMode, debouncedSearch, filterCompany, filterRole, filterDifficulty, filterMode]);


  // Toggle dynamic like
  const handleLike = async (id, e) => {
    e.stopPropagation();
    if (processingIds.has(id)) return;

    setProcessingIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    try {
      const data = await likeExperience(id);
      if (data && data.success) {
        const updated = new Set(likedList);
        if (data.liked) {
          updated.add(id);
        } else {
          updated.delete(id);
        }
        setLikedList(updated);
        setExperiences(prev => prev.map(exp => exp._id === id ? { ...exp, likes: data.likes } : exp));
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // Toggle dynamic bookmark
  const handleBookmark = async (id, e) => {
    e.stopPropagation();
    if (processingIds.has(id)) return;

    setProcessingIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    try {
      const data = await bookmarkExperience(id);
      if (data && data.success) {
        const updated = new Set(bookmarkedList);
        if (data.bookmarked) {
          updated.add(id);
        } else {
          updated.delete(id);
        }
        setBookmarkedList(updated);

        // If in saved view, remove immediately from list
        if (viewMode === "saved") {
          setExperiences(prev => prev.filter(exp => exp._id !== id));
        } else {
          setExperiences(prev => prev.map(exp => exp._id === id ? { ...exp, isBookmarked: data.bookmarked } : exp));
        }
      }
    } catch (err) {
      console.error("Error toggling bookmark:", err);
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // Toggle Accordion Collapse
  // const toggleFaq = (idx) => {
  //   setExpandedFaqs(prev => ({
  //     ...prev,
  //     [idx]: !prev[idx]
  //   }));
  // };

  const handleResetFilters = () => {
    setSearchQuery("");
    setFilterCompany("All");
    setFilterRole("All");
    setFilterDifficulty("All");
    setFilterMode("All");
    setSortBy("Latest");
    setCurrentPage(1);
    setCompanyInputValue("");
    setRoleInputValue("");
    setShowCompanySuggestions(false);
    setShowRoleSuggestions(false);
    // Clear session cache so next load is always fresh after a reset
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
  };

  // Autocomplete selection handlers
  const handleCompanySelect = (name) => {
    setFilterCompany(name);
    setCompanyInputValue(name);
    setShowCompanySuggestions(false);
    setCurrentPage(1);
  };

  const handleRoleSelect = (name) => {
    setFilterRole(name);
    setRoleInputValue(name);
    setShowRoleSuggestions(false);
    setCurrentPage(1);
  };

  // Navigate to detail page — snapshot full page state to sessionStorage first
  const handleReadMore = (id) => {
    const scrollY = mainScrollRef.current?.scrollTop || 0;
    try {
      const snapshot = {
        __restore: true,
        scrollY,
        searchQuery,
        filterCompany,
        filterRole,
        filterDifficulty,
        filterMode,
        sortBy,
        currentPage,
        totalPages,
        totalResults,
        viewMode,
        companyInputValue,
        roleInputValue,
        experiences,
        likedList: Array.from(likedList),
        bookmarkedList: Array.from(bookmarkedList),
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(snapshot));
    } catch { /* ignore storage errors */ }
    navigate(`/interview-experiences/${id}`);
  };



  // const handleScrollToSection = (id) => {
  //   const el = document.getElementById(id);
  //   if (el) {
  //     el.scrollIntoView({ behavior: "smooth", block: "start" });
  //   }
  // };

  // Click handler to launch form overlay in create mode
  const handleCreateClick = () => {
    setEditingExperience(null);
    setFormError(null);
    setShowAdditionalDetails(false);

    setNewExpCompany("");
    setNewExpRole("");
    setNewExpType("Full Time");
    setNewExpPackage("");
    setNewExpDifficulty("Medium");
    setNewExpSummary("");
    setNewExpTips("");
    setNewExpCollege("");
    setNewExpGradYear("");
    setNewExpOA("");
    setNewExpTech1("");
    setNewExpTech2("");
    setNewExpTech3("");
    setNewExpHR("");
    setNewExpResult("Selected");
    setNewExpTags("");

    setShareFormOpen(true);
  };

  // Click handler to launch form overlay in edit mode
  const handleEditClick = (exp, e) => {
    if (e) e.stopPropagation();
    setEditingExperience(exp);
    setFormError(null);
    setShowAdditionalDetails(true);

    setNewExpCompany(exp.company || "");
    setNewExpRole(exp.role || "");
    setNewExpType(exp.interviewType || "Full Time");
    setNewExpPackage(exp.package ? String(exp.package) : "");
    setNewExpDifficulty(exp.difficulty || "Medium");
    setNewExpSummary(exp.overallExperience || "");
    setNewExpTips(exp.preparationTips || "");
    setNewExpCollege(exp.college || "");
    setNewExpGradYear(exp.graduationYear ? String(exp.graduationYear) : "");
    setNewExpOA(exp.onlineAssessment || "");
    setNewExpTech1(exp.technicalRound1 || "");
    setNewExpTech2(exp.technicalRound2 || "");
    setNewExpTech3(exp.technicalRound3 || "");
    setNewExpHR(exp.hrRound || "");
    setNewExpResult(exp.result || "Selected");
    setNewExpTags(exp.tags ? exp.tags.join(", ") : "");

    setShareFormOpen(true);
  };

  // Delete experience setup
  const handleDeleteClick = (id, e) => {
    if (e) e.stopPropagation();
    setDeleteTarget(id);
  };

  // Delete experience confirm action
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const response = await deleteExperience(deleteTarget);
      if (response && response.success) {
        setDeleteTarget(null);
        fetchFeed();
        fetchMeta();
      } else {
        alert(response.message || "Failed to delete experience.");
      }
    } catch (err) {
      console.error("Deletion error:", err);
      alert(err.response?.data?.message || err.message || "Failed to delete experience.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Create or Update Experience Submission
  const handleShareSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Client-side validations
    if (!newExpCompany || !String(newExpCompany).trim()) {
      setFormError("Company name is required.");
      return;
    }
    if (!newExpRole || !String(newExpRole).trim()) {
      setFormError("Role / Job title is required.");
      return;
    }
    if (!newExpSummary || String(newExpSummary).trim().length < 50) {
      setFormError("Overall experience must be at least 50 characters long.");
      return;
    }
    if (newExpPackage) {
      const pkgVal = Number(newExpPackage);
      if (isNaN(pkgVal) || pkgVal < 0) {
        setFormError("Package (LPA) must be a positive number.");
        return;
      }
    }
    if (newExpGradYear) {
      const gradYearVal = Number(newExpGradYear);
      if (isNaN(gradYearVal) || gradYearVal < 1900 || gradYearVal > 2100) {
        setFormError("Graduation year must be between 1900 and 2100.");
        return;
      }
    }

    setIsSubmitting(true);

    const payload = {
      company: newExpCompany,
      role: newExpRole,
      interviewType: newExpType,
      package: newExpPackage ? Number(newExpPackage) : undefined,
      difficulty: newExpDifficulty,
      overallExperience: newExpSummary,
      preparationTips: newExpTips,
      college: newExpCollege || undefined,
      graduationYear: newExpGradYear ? Number(newExpGradYear) : undefined,
      onlineAssessment: newExpOA,
      technicalRound1: newExpTech1,
      technicalRound2: newExpTech2,
      technicalRound3: newExpTech3 || undefined,
      hrRound: newExpHR,
      result: newExpResult,
      tags: newExpTags ? newExpTags.split(",").map(t => t.trim()).filter(Boolean) : []
    };

    try {
      if (editingExperience) {
        const response = await updateExperience(editingExperience._id, payload);
        if (response && response.success) {
          setShareFormOpen(false);
          fetchFeed();
          fetchMeta();
        } else {
          setFormError(response.message || "Failed to update experience.");
        }
      } else {
        const response = await createExperience(payload);
        if (response && response.success) {
          setShareFormOpen(false);
          fetchFeed();
          fetchMeta();
        } else {
          setFormError(response.message || "Failed to share experience.");
        }
      }
    } catch (err) {
      console.error("Mutation error:", err);
      setFormError(err.response?.data?.message || err.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
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
        <div ref={mainScrollRef} className="lg:ml-[280px] flex-1 flex flex-col h-screen overflow-y-auto z-10 relative">
          
          <TopNavbar
            onMenuClick={() => setSidebarOpen(true)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchPlaceholder="Search by company, role, technology, or keyword..."
          >
            {/* DEMO EMPTY STATE TOGGLE */}
            {/* <div className="flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-xl">
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
            </div> */}
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
                  Learn From Real Interview Experiences
                </h1>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
                  Learn from real interview experiences shared by students and professionals from top companies. Master coding strategies and structural processes.
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={handleCreateClick}
                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white text-sm font-bold cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all border border-indigo-500/20"
                  >
                    Share Experience
                  </button>
                  {/* <button
                    onClick={() => handleScrollToSection("featured-companies")}
                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] hover:border-white/15 text-white text-sm font-semibold cursor-pointer transition-all"
                  >
                    Browse Companies
                  </button> */}
                </div>
              </div>
            </section>

            {(!loadingFeed && experiences.length === 0)  ? (
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
                  <h3 className="text-lg font-bold text-white">No Interview Experiences Yet</h3>
                  <p className="text-sm text-slate-400 leading-relaxed font-light max-w-xs mx-auto">
                    Be the first to share your interview experience and help the PrepSphere community.
                  </p>
                </div>
                <button
                  onClick={handleCreateClick}
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
                        placeholder="Search company, role, tags or keyword..."
                        className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500/60"
                      />
                    </div>

                    {/* Company Autocomplete Filter */}
                    <div className="relative" ref={companyDropdownRef}>
                      <div className="relative flex items-center">
                        <input
                          ref={companyInputRef}
                          type="text"
                          value={companyInputValue}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCompanyInputValue(val);
                            if (!val.trim()) {
                              setFilterCompany("All");
                              setCompanySuggestions([]);
                              setShowCompanySuggestions(false);
                              setCurrentPage(1);
                            }
                          }}
                          onFocus={() => {
                            if (companyInputValue.trim()) {
                              doFetchCompanies(companyInputValue);
                            }
                          }}
                          placeholder="Company..."
                          className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 pr-7 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500/60 placeholder-slate-500"
                        />
                        {companyInputValue && (
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setCompanyInputValue("");
                              setFilterCompany("All");
                              setCompanySuggestions([]);
                              setShowCompanySuggestions(false);
                              setCurrentPage(1);
                            }}
                            className="absolute right-2 text-slate-400 hover:text-white cursor-pointer transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      {showCompanySuggestions && companySuggestions.length > 0 && (
                        <div className="absolute z-50 top-full mt-1 w-full bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                          {companySuggestions.map((name) => (
                            <button
                              key={name}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleCompanySelect(name);
                              }}
                              className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-indigo-500/10 hover:text-white transition-colors cursor-pointer"
                            >
                              {name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Role Autocomplete Filter */}
                    <div className="relative" ref={roleDropdownRef}>
                      <div className="relative flex items-center">
                        <input
                          ref={roleInputRef}
                          type="text"
                          value={roleInputValue}
                          onChange={(e) => {
                            const val = e.target.value;
                            setRoleInputValue(val);
                            if (!val.trim()) {
                              setFilterRole("All");
                              setRoleSuggestions([]);
                              setShowRoleSuggestions(false);
                              setCurrentPage(1);
                            }
                          }}
                          onFocus={() => {
                            if (roleInputValue.trim()) {
                              doFetchRoles(roleInputValue);
                            }
                          }}
                          placeholder="Role..."
                          className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 pr-7 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500/60 placeholder-slate-500"
                        />
                        {roleInputValue && (
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setRoleInputValue("");
                              setFilterRole("All");
                              setRoleSuggestions([]);
                              setShowRoleSuggestions(false);
                              setCurrentPage(1);
                            }}
                            className="absolute right-2 text-slate-400 hover:text-white cursor-pointer transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      {showRoleSuggestions && roleSuggestions.length > 0 && (
                        <div className="absolute z-50 top-full mt-1 w-full bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                          {roleSuggestions.map((name) => (
                            <button
                              key={name}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleRoleSelect(name);
                              }}
                              className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-indigo-500/10 hover:text-white transition-colors cursor-pointer"
                            >
                              {name}
                            </button>
                          ))}
                        </div>
                      )}
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
                        onChange={(e) => {
                          setSortBy(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 text-slate-300 text-xs sm:text-sm focus:outline-none focus:border-indigo-500/60"
                      >
                        <option value="Latest">Latest</option>
                        <option value="Oldest">Oldest</option>
                        <option value="Highest Package">Highest Package</option>
                        <option value="Lowest Package">Lowest Package</option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* FEATURED COMPANIES CAROUSEL */}
                <section id="featured-companies" className="space-y-4 scroll-mt-24">
                  <h3 className="text-base font-semibold text-white text-left flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                    Popular Companies
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 text-left">
                    {loadingMeta ? (
                      [1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 h-[130px] animate-pulse" />
                      ))
                    ) : (
                      featuredCompanies.map((company, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setCompanyInputValue(company.name);
                            setFilterCompany(company.name);
                            setCurrentPage(1);
                          }}
                          className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-indigo-500/25 transition-all cursor-pointer relative group h-[130px] shadow-sm hover:scale-[1.02]"
                        >
                          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent" />
                          <div className="flex justify-between items-center">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${company.logoColor}`}>
                              {company.name.charAt(0)}
                            </div>
                            <span className="text-[9px] font-bold text-slate-500 uppercase font-mono">{company.difficulty}</span>
                          </div>
                          <div className="mt-3">
                            <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{company.name}</h4>
                            <span className="text-[10px] text-slate-400 font-light mt-0.5 block">{company.count}</span>
                          </div>
                          <div className="border-t border-white/5 pt-1.5 mt-1 flex justify-between text-[9px] font-mono text-slate-400">
                            <span>Avg Package</span>
                            <span className="font-bold text-indigo-400">{company.package}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                {/* MAIN SPLIT GRID (FEED & SIDEBAR) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column (8 cols): Experiences Feed List */}
                  <div className="lg:col-span-8 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
                      <h3 className="text-base font-semibold text-white text-left flex items-center gap-2">
                        <Compass className="w-5 h-5 text-purple-400" />
                        Interview Experience Feed ({totalResults})
                      </h3>
                      <div className="flex bg-white/[0.03] border border-white/10 rounded-xl p-1 self-start sm:self-auto">
                        <button
                          onClick={() => {
                            setViewMode("all");
                            setCurrentPage(1);
                          }}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            viewMode === "all"
                              ? "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white shadow-md"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          All Experiences
                        </button>
                        <button
                          onClick={() => {
                            setViewMode("my");
                            setCurrentPage(1);
                          }}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            viewMode === "my"
                              ? "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white shadow-md"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          My Shared Experiences
                        </button>
                        <button
                          onClick={() => {
                            setViewMode("saved");
                            setCurrentPage(1);
                          }}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            viewMode === "saved"
                              ? "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white shadow-md"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          Saved Experiences
                        </button>
                      </div>
                    </div>
                    {error ? (
                      <div className="flex flex-col items-center justify-center p-12 bg-red-500/5 border border-red-500/10 rounded-3xl text-center space-y-4">
                        <p className="text-sm text-red-400 font-medium">{error}</p>
                        <button
                          onClick={fetchFeed}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Retry Loading
                        </button>
                      </div>
                    ) : loadingFeed ? (
                      <div className="space-y-6">
                        <ExperienceSkeleton />
                        <ExperienceSkeleton />
                        <ExperienceSkeleton />
                      </div>
                    ) : filteredExperiences.length === 0 ? (
                      <div className="p-12 text-center bg-white/[0.02] border border-white/10 rounded-3xl text-slate-500 font-medium">
                        No interview experiences match the active query.
                      </div>
                    ) : (
                      filteredExperiences.map((exp) => {
                        let diffColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                        if (exp.difficulty === "Medium") diffColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
                        if (exp.difficulty === "Hard") diffColor = "text-red-400 bg-red-500/10 border-red-500/20";

                        const isLiked = likedList.has(exp._id);
                        const isBookmarked = bookmarkedList.has(exp._id);
                        const isOwner = user?._id && (exp.author === user._id || exp.author?._id === user._id);

                        const authorName = exp.author?.name || "PrepSphere Contributor";
                        const authorCollege = exp.author?.college || "PrepSphere";
                        const authorAvatar = exp.author?.name ? exp.author.name.charAt(0).toUpperCase() : "U";
                        const authorImage = exp.author?.profileImage || null;
                        const formattedDate = new Date(exp.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        });
                        const packageText = exp.package ? `${exp.package} LPA` : "N/A";
                        const previewText = exp.overallExperience
                          ? exp.overallExperience.substring(0, 240) + (exp.overallExperience.length > 240 ? "..." : "")
                          : "";

                        return (
                          <div
                            key={exp._id}
                            className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left shadow-md hover:border-purple-500/20 transition-all flex flex-col justify-between h-auto gap-4"
                          >
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
                            
                            {/* Author Row */}
                            <div className="flex justify-between items-center border-b border-white/5 pb-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-300 flex items-center justify-center font-bold text-sm overflow-hidden flex-shrink-0">
                                  {authorImage ? (
                                    <img src={authorImage} alt={authorName} className="w-full h-full object-cover" />
                                  ) : (
                                    authorAvatar
                                  )}
                                </div>
                                <div>
                                  <h4 className="text-xs sm:text-sm font-bold text-white">{authorName}</h4>
                                  <span className="text-[10px] text-slate-400 font-mono">{authorCollege} &bull; {formattedDate}</span>
                                </div>
                              </div>

                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                exp.result === "Selected" ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/25" : "text-slate-400 bg-slate-800"
                              }`}>
                                {exp.result}
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
                                <span className="text-indigo-400">{packageText}</span>
                                <span className={`ml-auto font-mono text-[9px] px-1.5 py-0.5 rounded border ${diffColor}`}>{exp.difficulty}</span>
                              </div>

                              <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                                {exp.company} {exp.role} Interview Experience
                              </h3>
                              
                              <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
                                {previewText}
                              </p>
                            </div>

                            {/* Tags cloud */}
                            {exp.tags && exp.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {exp.tags.map((tag, idx) => (
                                  <span key={idx} className="bg-white/5 border border-white/10 text-slate-300 rounded-lg px-2.5 py-0.5 text-[10px]">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Bottom action row */}
                            <div className="border-t border-white/5 pt-4 mt-2 flex flex-wrap gap-4 items-center text-xs">
                              {/* Like button */}
                              <button
                                onClick={(e) => handleLike(exp._id, e)}
                                disabled={processingIds.has(exp._id)}
                                className={`flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer disabled:opacity-50 ${
                                  isLiked ? "text-red-400" : "text-slate-400"
                                }`}
                              >
                                <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                                <span>{exp.likes || 0}</span>
                              </button>

                              {/* Comment indicator
                              <div className="flex items-center gap-1.5 text-slate-400" title="Comments">
                                <MessageSquare className="w-4 h-4" />
                                <span>{exp.commentsCount || 0}</span>
                              </div> */}

                              {/* Views count */}
                              <div className="flex items-center gap-1.5 text-slate-400" title="Views">
                                <Eye className="w-4 h-4" />
                                <span>{exp.views || 0}</span>
                              </div>

                              {/* Bookmark Toggle */}
                              <button
                                onClick={(e) => handleBookmark(exp._id, e)}
                                disabled={processingIds.has(exp._id)}
                                className={`p-1 rounded hover:text-white cursor-pointer disabled:opacity-50 ${
                                  isBookmarked ? "text-indigo-400" : "text-slate-400"
                                }`}
                                title="Bookmark Experience"
                              >
                                <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
                              </button>

                              {isOwner && (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={(e) => handleEditClick(exp, e)}
                                    className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/20 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
                                    title="Edit Experience"
                                  >
                                    <Pencil className="w-3 h-3 text-indigo-400" />
                                    <span className="text-[10px] font-bold">Edit</span>
                                  </button>
                                  <button
                                    onClick={(e) => handleDeleteClick(exp._id, e)}
                                    className="flex items-center gap-1.5 px-3 py-1 bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 hover:border-red-500/20 text-red-400 hover:text-red-300 rounded-xl transition-all cursor-pointer"
                                    title="Delete Experience"
                                  >
                                    <Trash2 className="w-3 h-3 text-red-400" />
                                    <span className="text-[10px] font-bold">Delete</span>
                                  </button>
                                </div>
                              )}

                              <button
                                onClick={() => handleReadMore(exp._id)}
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

                    {/* PAGINATION CONTROLS */}
                    {!loadingFeed && totalPages > 1 && (
                      <div className="flex items-center justify-center gap-3 mt-8">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="p-2 rounded-xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] disabled:opacity-40 disabled:hover:bg-white/[0.02] text-slate-300 hover:text-white transition-all cursor-pointer focus:outline-none"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-xs text-slate-400 font-medium">
                          Page <strong className="text-white font-semibold">{currentPage}</strong> of <strong className="text-white font-semibold">{totalPages}</strong>
                        </span>
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] disabled:opacity-40 disabled:hover:bg-white/[0.02] text-slate-300 hover:text-white transition-all cursor-pointer focus:outline-none"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
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
                        {communityStats.map((stat, idx) => (
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
                        Most interview experiences shared this heavily focused on **Graphs** and **Dynamic Programming** models.
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
                      
                      <div className="space-y-3">
                        {loadingContributors ? (
                          [1, 2, 3].map(i => (
                            <div key={i} className="flex items-center gap-2.5 animate-pulse">
                              <div className="w-8 h-8 rounded-lg bg-white/5 flex-shrink-0" />
                              <div className="flex-1 space-y-1.5">
                                <div className="h-2.5 w-24 bg-white/10 rounded" />
                                <div className="h-2 w-32 bg-white/5 rounded" />
                              </div>
                            </div>
                          ))
                        ) : topContributors.length === 0 ? (
                          <p className="text-xs text-slate-500 text-center py-4">No contributors yet. Be the first!</p>
                        ) : (
                          topContributors.map((c, idx) => {
                            const badgeStyle = idx === 0
                              ? "text-yellow-400 bg-yellow-500/10 border border-yellow-500/20"
                              : idx === 1
                              ? "text-slate-300 bg-slate-500/10 border border-slate-500/20"
                              : idx === 2
                              ? "text-amber-500 bg-amber-500/10 border border-amber-500/20"
                              : "text-purple-400 bg-purple-500/10 border border-purple-500/20";
                            const avatarBgStyle = idx === 0
                              ? "bg-yellow-500/10 text-yellow-300"
                              : idx === 1
                              ? "bg-slate-500/10 text-slate-300"
                              : idx === 2
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-indigo-500/10 text-indigo-300";
                            const contributorName = c.name || "Anonymous";
                            const contributorImage = c.profileImage || null;
                            return (
                              <div key={idx} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                                <div className="flex items-center space-x-2.5">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs overflow-hidden flex-shrink-0 ${avatarBgStyle}`}>
                                    {contributorImage ? (
                                      <img src={contributorImage} alt={contributorName} className="w-full h-full object-cover" />
                                    ) : contributorName.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-bold text-white">{contributorName}</h4>
                                    <span className="text-[9px] text-slate-400 font-mono">
                                      {c.postCount} posts &bull; {c.totalLikes} upvotes
                                    </span>
                                  </div>
                                </div>
                                
                                <span className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase font-mono ${badgeStyle}`}>
                                  #{idx + 1}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>


                    {/* Popular Topics Cloud Widget */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-lg">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Flame className="w-4 h-4 text-cyan-400" />
                        Popular Topics Tags
                      </h3>
                      
                      {loadingTags ? (
                        <div className="flex flex-wrap gap-2">
                          {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-6 w-16 bg-white/5 rounded-lg animate-pulse" />
                          ))}
                        </div>
                      ) : popularTags.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-4">No tags yet.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {popularTags.map((tag, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSearchQuery(typeof tag === "string" ? tag : tag.tag)}
                              className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg px-2.5 py-1 text-xs transition-colors cursor-pointer"
                            >
                              #{typeof tag === "string" ? tag : tag.tag}
                              {typeof tag === "object" && tag.count && (
                                <span className="ml-1 text-indigo-400 font-mono text-[9px]">({tag.count})</span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>


                  </div>
                </div>

                {/* FAQ ACCORDION SECTION */}
                {/* <section className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left shadow-lg">
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
                </section> */}

              </div>
            )}
          </main>

        </div>



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
                  {/* Inline Error Banner */}
                  {formError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold">
                      {formError}
                    </div>
                  )}

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

                  {/* Mode & Difficulty */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block font-bold text-slate-400 uppercase tracking-wide">Interview Type / Mode *</label>
                      <select
                        value={newExpType}
                        onChange={(e) => setNewExpType(e.target.value)}
                        className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-indigo-500/60"
                      >
                        <option value="Internship">Internship</option>
                        <option value="Full Time">Full Time</option>
                        <option value="On Campus">On Campus</option>
                        <option value="Off Campus">Off Campus</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block font-bold text-slate-400 uppercase tracking-wide">Difficulty *</label>
                      <select
                        value={newExpDifficulty}
                        onChange={(e) => setNewExpDifficulty(e.target.value)}
                        className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-indigo-500/60"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  {/* Package (LPA) */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-400 uppercase tracking-wide">Package (LPA)</label>
                    <input
                      type="text"
                      value={newExpPackage}
                      onChange={(e) => setNewExpPackage(e.target.value)}
                      placeholder="e.g. 32 (Leave empty if not applicable)"
                      className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500/60"
                    />
                  </div>

                  {/* Overall Experience / Summary */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-400 uppercase tracking-wide">Overall Experience * (Min 50 chars)</label>
                    <textarea
                      required
                      value={newExpSummary}
                      onChange={(e) => setNewExpSummary(e.target.value)}
                      placeholder="Explain the coding assessments and phone interview rounds..."
                      className="w-full h-20 bg-slate-950/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500/60"
                    />
                  </div>

                  {/* Prep Tips */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-400 uppercase tracking-wide">Preparation Advice &amp; Tips</label>
                    <textarea
                      value={newExpTips}
                      onChange={(e) => setNewExpTips(e.target.value)}
                      placeholder="What should candidates prepare to clear these rounds..."
                      className="w-full h-20 bg-slate-950/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500/60"
                    />
                  </div>

                  {/* Section B Accordion */}
                  <div className="border-t border-white/5 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAdditionalDetails(!showAdditionalDetails)}
                      className="w-full flex justify-between items-center py-2 px-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 rounded-xl text-xs sm:text-sm font-bold text-white transition-all cursor-pointer font-inter"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                        Additional Interview Details
                      </span>
                      {showAdditionalDetails ? <ChevronUp className="w-4 h-4 text-indigo-400" /> : <ChevronDown className="w-4 h-4 text-indigo-400" />}
                    </button>
                  </div>

                  {/* Collapsible Accordion Content */}
                  <AnimatePresence initial={false}>
                    {showAdditionalDetails && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden space-y-4"
                      >
                        <div className="pt-2 space-y-4">
                          {/* College & Graduation Year */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="block font-bold text-slate-400 uppercase tracking-wide">College</label>
                              <input
                                type="text"
                                value={newExpCollege}
                                onChange={(e) => setNewExpCollege(e.target.value)}
                                placeholder="e.g. BITS Pilani"
                                className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500/60"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="block font-bold text-slate-400 uppercase tracking-wide">Graduation Year</label>
                              <input
                                type="text"
                                value={newExpGradYear}
                                onChange={(e) => setNewExpGradYear(e.target.value)}
                                placeholder="e.g. 2026"
                                className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500/60"
                              />
                            </div>
                          </div>

                          {/* Verdict / Result */}
                          <div className="space-y-1.5">
                            <label className="block font-bold text-slate-400 uppercase tracking-wide">Verdict / Result *</label>
                            <select
                              value={newExpResult}
                              onChange={(e) => setNewExpResult(e.target.value)}
                              className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-indigo-500/60"
                            >
                              <option value="Selected">Selected</option>
                              <option value="Rejected">Rejected</option>
                              <option value="Waiting">Waiting</option>
                            </select>
                          </div>

                          {/* Tags */}
                          <div className="space-y-1.5">
                            <label className="block font-bold text-slate-400 uppercase tracking-wide">Tags (comma-separated)</label>
                            <input
                              type="text"
                              value={newExpTags}
                              onChange={(e) => setNewExpTags(e.target.value)}
                              placeholder="e.g. DSA, React, System Design"
                              className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500/60"
                            />
                          </div>

                          {/* Online Assessment Details */}
                          <div className="space-y-1.5">
                            <label className="block font-bold text-slate-400 uppercase tracking-wide">Online Assessment Details</label>
                            <textarea
                              value={newExpOA}
                              onChange={(e) => setNewExpOA(e.target.value)}
                              placeholder="Describe the coding test format, number of questions, etc."
                              className="w-full h-16 bg-slate-950/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500/60"
                            />
                          </div>

                          {/* Technical Rounds 1 & 2 */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="block font-bold text-slate-400 uppercase tracking-wide">Technical Round 1 Details</label>
                              <textarea
                                value={newExpTech1}
                                onChange={(e) => setNewExpTech1(e.target.value)}
                                placeholder="DSA questions asked, complexity analysis..."
                                className="w-full h-16 bg-slate-950/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500/60"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="block font-bold text-slate-400 uppercase tracking-wide">Technical Round 2 Details</label>
                              <textarea
                                value={newExpTech2}
                                onChange={(e) => setNewExpTech2(e.target.value)}
                                placeholder="System design, core topics, coding questions..."
                                className="w-full h-16 bg-slate-950/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500/60"
                              />
                            </div>
                          </div>

                          {/* Technical Round 3 & HR Round */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="block font-bold text-slate-400 uppercase tracking-wide">Technical Round 3 Details (Optional)</label>
                              <textarea
                                value={newExpTech3}
                                onChange={(e) => setNewExpTech3(e.target.value)}
                                placeholder="Third technical round details if any..."
                                className="w-full h-16 bg-slate-950/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500/60"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="block font-bold text-slate-400 uppercase tracking-wide">HR Round Details</label>
                              <textarea
                                value={newExpHR}
                                onChange={(e) => setNewExpHR(e.target.value)}
                                placeholder="Behavioral questions, STAR method, salary discussion..."
                                className="w-full h-16 bg-slate-950/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500/60"
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex space-x-3 mt-6 justify-end">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setShareFormOpen(false)}
                      className="px-5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] text-slate-300 hover:text-white font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white font-bold transition-all cursor-pointer shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 font-inter"
                    >
                      {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                      {isSubmitting ? "Submitting..." : editingExperience ? "Update Post" : "Submit Post"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* DELETE EXPERIENCE CONFIRMATION MODAL */}
        <AnimatePresence>
          {deleteTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDeleteTarget(null)}
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
              />

              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative w-full max-w-md bg-[#080E24]/90 border border-white/10 rounded-3xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.15)] backdrop-blur-xl text-left"
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-red-500 pointer-events-none" />

                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 shrink-0">
                      <AlertTriangle className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-white font-inter">Delete Interview Experience?</h3>
                      <p className="text-slate-400 font-light mt-1.5 leading-relaxed font-inter">
                        Are you sure you want to permanently delete this interview experience post? This action cannot be undone, and the post will be removed from the community feed instantly.
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4 justify-end font-bold">
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(null)}
                      disabled={isDeleting}
                      className="px-5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-inter"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteConfirm}
                      disabled={isDeleting}
                      className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-red-900/50 disabled:text-slate-500 text-white shadow-md shadow-red-600/15 cursor-pointer disabled:cursor-not-allowed transition-all flex items-center gap-1.5 font-inter"
                    >
                      {isDeleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                      {isDeleting ? "Deleting..." : "Delete Post"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </>
  );
};

export default InterviewExperiences;
