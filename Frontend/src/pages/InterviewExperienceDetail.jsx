import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/layout/Sidebar";
import TopNavbar from "../components/layout/TopNavbar";
import {
  getExperienceById,
  getSimilarExperiences,
  likeExperience,
  bookmarkExperience,
  reportExperience,
  incrementViewCount,
  getComments,
  addComment,
  deleteComment
} from "../services/interviewExperienceService";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Calendar,
  Clock,
  Menu,
  Activity,
  Users,
  BookOpen,
  DollarSign,
  Briefcase,
  AlertTriangle,
  RefreshCw,
  Award,
  Zap,
  CheckCircle2,
  Trash2,
  Pencil,
  Heart,
  Bookmark,
  Eye,
  MessageSquare,
  Send,
  X,
  Check
} from "lucide-react";

const DetailSkeleton = () => (
  <div className="space-y-8 animate-pulse text-left">
    {/* Header Skeleton */}
    <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4">
      <div className="h-4 w-32 bg-white/10 rounded" />
      <div className="h-8 w-2/3 bg-white/10 rounded" />
      <div className="flex gap-4">
        <div className="h-4 w-20 bg-white/5 rounded" />
        <div className="h-4 w-20 bg-white/5 rounded" />
      </div>
    </div>

    {/* Body Grid Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 h-48 bg-white/5 rounded" />
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 h-64 bg-white/5 rounded" />
      </div>
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 h-40 bg-white/5 rounded" />
      </div>
    </div>
  </div>
);

const InterviewExperienceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingSimilar, setLoadingSimilar] = useState(true);
  const [errorState, setErrorState] = useState(null); // null | '404' | 'error'
  
  const [experience, setExperience] = useState(null);
  const [similarExperiences, setSimilarExperiences] = useState([]);

  // Dynamic interaction states
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [viewsCount, setViewsCount] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  // Discussion states
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Report Modal states
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);

  // Fetch comments for discussion widget
  const fetchCommentsList = useCallback(async () => {
    setLoadingComments(true);
    try {
      const response = await getComments(id);
      if (response && response.success) {
        setComments(response.comments || []);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setLoadingComments(false);
    }
  }, [id]);

  // Session-limited views counter
  const handleIncrementView = useCallback(async () => {
    const sessionKey = `viewed_experience_${id}`;
    if (!sessionStorage.getItem(sessionKey)) {
      try {
        const response = await incrementViewCount(id);
        if (response && response.success) {
          setViewsCount(response.views);
          sessionStorage.setItem(sessionKey, "true");
        }
      } catch (err) {
        console.error("Error incrementing view count:", err);
      }
    }
  }, [id]);

  // Fetch Experience Detail and similar posts
  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setErrorState(null);
    try {
      const response = await getExperienceById(id);
      if (response && response.success && response.data) {
        setExperience(response.data);
        setIsLiked(response.data.isLiked || false);
        setLikesCount(response.data.likes || 0);
        setIsBookmarked(response.data.isBookmarked || false);
        setViewsCount(response.data.views || 0);
        
        // Trigger view count increment once successfully loaded
        handleIncrementView();
      } else {
        setErrorState("404");
      }
    } catch (err) {
      console.error("Error fetching experience details:", err);
      if (err.response?.status === 404 || err.status === 404) {
        setErrorState("404");
      } else {
        setErrorState("error");
      }
    } finally {
      setLoading(false);
    }
  }, [id, handleIncrementView]);

  const fetchSimilar = useCallback(async () => {
    setLoadingSimilar(true);
    try {
      const response = await getSimilarExperiences(id);
      if (response && response.success) {
        setSimilarExperiences(response.experiences || []);
      }
    } catch (err) {
      console.error("Error fetching similar experiences:", err);
    } finally {
      setLoadingSimilar(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
    fetchSimilar();
    fetchCommentsList();
  }, [id, fetchDetails, fetchSimilar, fetchCommentsList]);

  // Construct dynamic list of rounds
  const getTimelineRounds = () => {
    if (!experience) return [];
    return [
      { key: "onlineAssessment", title: "Online Assessment", data: experience.onlineAssessment },
      { key: "technicalRound1", title: "Technical Round 1", data: experience.technicalRound1 },
      { key: "technicalRound2", title: "Technical Round 2", data: experience.technicalRound2 },
      { key: "technicalRound3", title: "Technical Round 3", data: experience.technicalRound3 },
      { key: "hrRound", title: "HR Round", data: experience.hrRound }
    ].filter(round => round.data && round.data.trim() !== "");
  };

  const handleLike = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const data = await likeExperience(id);
      if (data && data.success) {
        setIsLiked(data.liked);
        setLikesCount(data.likes);
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const data = await bookmarkExperience(id);
      if (data && data.success) {
        setIsBookmarked(data.bookmarked);
      }
    } catch (err) {
      console.error("Error toggling bookmark:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportReason) {
      setReportError("Please select a reason for reporting");
      return;
    }
    setSubmittingReport(true);
    setReportError("");
    try {
      const response = await reportExperience(id, {
        reason: reportReason,
        description: reportDescription
      });
      if (response && response.success) {
        setReportSuccess(true);
        setTimeout(() => {
          setReportModalOpen(false);
          setReportSuccess(false);
          setReportReason("");
          setReportDescription("");
        }, 2000);
      }
    } catch (err) {
      console.error("Error reporting experience:", err);
      setReportError(err.response?.data?.message || err.message || "Failed to submit report");
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment || !newComment.trim()) return;
    setSubmittingComment(true);
    try {
      const response = await addComment(id, newComment.trim());
      if (response && response.success && response.comment) {
        setComments(prev => [...prev, response.comment]);
        setNewComment("");
        setExperience(prev => prev ? { ...prev, commentsCount: (prev.commentsCount || 0) + 1 } : null);
      }
    } catch (err) {
      console.error("Error posting comment:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCommentDelete = async (commentId) => {
    try {
      const response = await deleteComment(commentId);
      if (response && response.success) {
        setComments(prev => prev.filter(c => c._id !== commentId));
        setExperience(prev => prev ? { ...prev, commentsCount: Math.max(0, (prev.commentsCount || 0) - 1) } : null);
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  const rounds = getTimelineRounds();

  return (
    <>
      <style>{`
        .dash-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.012) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.012) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>

      <div className="h-screen bg-[#050B1F] text-slate-100 font-inter flex overflow-hidden relative">
        {/* Ambient Grid Pattern */}
        <div className="absolute inset-0 dash-grid-pattern opacity-60 pointer-events-none" />

        {/* Spotlights */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-[130px] pointer-events-none" />

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main scrollable area */}
        <div className="lg:ml-[280px] flex-1 flex flex-col h-screen overflow-y-auto z-10 relative">
          
          <TopNavbar
            onMenuClick={() => setSidebarOpen(true)}
            searchPlaceholder="Search experiences..."
          />

          <main className="flex-1 p-6 space-y-8 max-w-7xl mx-auto w-full">
            
            {/* Back Button */}
            <div className="text-left">
              <button
                onClick={() => navigate("/interview-experiences")}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] hover:border-white/15 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Feed
              </button>
            </div>

            {loading ? (
              <DetailSkeleton />
            ) : errorState === "404" ? (
              /* 404 NOT FOUND STATE */
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center p-16 bg-white/[0.02] border border-white/10 rounded-3xl backdrop-blur-xl text-center max-w-lg mx-auto space-y-5"
              >
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                  <AlertTriangle className="w-8 h-8 animate-bounce" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white font-inter">Interview Experience Not Found</h3>
                  <p className="text-sm text-slate-400 leading-relaxed font-light max-w-xs mx-auto">
                    The interview experience you're looking for may have been removed or no longer exists.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/interview-experiences")}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white text-sm font-bold transition-all cursor-pointer shadow-lg shadow-indigo-500/25 hover:scale-[1.01]"
                >
                  Return to Interview Experiences
                </button>
              </motion.div>
            ) : errorState === "error" ? (
              /* OTHER SERVER ERROR STATE */
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center p-16 bg-white/[0.02] border border-white/10 rounded-3xl backdrop-blur-xl text-center max-w-lg mx-auto space-y-5"
              >
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white font-inter">Unable to Load Details</h3>
                  <p className="text-sm text-slate-400 leading-relaxed font-light max-w-xs mx-auto">
                    There was a network or server issue trying to load this experience details.
                  </p>
                </div>
                <button
                  onClick={fetchDetails}
                  className="px-6 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white text-sm font-bold transition-all cursor-pointer"
                >
                  Retry Connection
                </button>
              </motion.div>
            ) : (
              /* DYNAMIC EXPERIENCE LAYOUT */
              <div className="space-y-8">
                
                {/* Header Info Block */}
                <section className="relative rounded-3xl border border-white/10 bg-slate-950/20 backdrop-blur-xl p-6 sm:p-8 overflow-hidden text-left">
                  <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent pointer-events-none" />
                  <div className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />

                  <div className="relative z-10 space-y-5">
                    {/* Meta Row */}
                    <div className="flex flex-wrap items-center gap-2.5 text-[10px] sm:text-xs font-semibold text-slate-400">
                      <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-lg px-2.5 py-0.5 font-bold uppercase">
                        {experience.company}
                      </span>
                      <span>&bull;</span>
                      <span>{experience.role}</span>
                      <span>&bull;</span>
                      <span className="text-indigo-400 font-mono font-bold">{experience.package ? `${experience.package} LPA` : "N/A"}</span>
                      <span>&bull;</span>
                      <span className={`px-2.5 py-0.5 rounded-lg border font-mono ${
                        experience.difficulty === "Easy" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
                        experience.difficulty === "Medium" ? "text-amber-400 bg-amber-500/10 border-amber-500/20" :
                        "text-red-400 bg-red-500/10 border-red-500/20"
                      }`}>
                        {experience.difficulty}
                      </span>
                      <span className="ml-auto bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-lg px-2.5 py-0.5 font-bold uppercase tracking-wider">
                        {experience.result}
                      </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-inter leading-tight">
                      {experience.company} {experience.role} Interview Experience
                    </h1>

                    {/* Author card details */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/5 pt-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-300 flex items-center justify-center font-bold text-base">
                          {experience.user?.name ? experience.user.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div className="text-left font-inter">
                          <h4 className="text-xs sm:text-sm font-bold text-white">
                            {experience.user?.name || "PrepSphere Contributor"}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {experience.user?.college || experience.college || "PrepSphere College"}
                            {experience.graduationYear ? ` \u2022 Class of ${experience.graduationYear}` : ""}
                            {` \u2022 ${new Date(experience.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                          </span>
                        </div>
                      </div>

                      {/* View Counter */}
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-400 font-mono self-start sm:self-auto">
                        <Eye className="w-4 h-4" />
                        <span>{viewsCount} views</span>
                      </div>
                    </div>

                    {/* Community Actions Row */}
                    <div className="flex flex-wrap items-center gap-3 border-t border-white/5 pt-4">
                      {/* Like Button */}
                      <button
                        onClick={handleLike}
                        disabled={actionLoading}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-red-500/20 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 ${
                          isLiked ? "text-red-400 border-red-500/25 bg-red-500/5" : "text-slate-300 hover:text-white"
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                        <span>{likesCount} Likes</span>
                      </button>

                      {/* Bookmark Button */}
                      <button
                        onClick={handleBookmark}
                        disabled={actionLoading}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/20 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 ${
                          isBookmarked ? "text-indigo-400 border-indigo-500/25 bg-indigo-500/5" : "text-slate-300 hover:text-white"
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
                        <span>{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
                      </button>

                      {/* Report Button */}
                      <button
                        onClick={() => setReportModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-red-500/20 text-xs font-bold text-slate-300 hover:text-red-400 transition-all cursor-pointer"
                      >
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span>Report</span>
                      </button>
                    </div>
                  </div>
                </section>

                {/* Split grid for Details and Timeline */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column (8 cols): Overall description and Chronological Rounds */}
                  <div className="lg:col-span-8 space-y-8">
                    
                    {/* Overall description */}
                    <section className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left shadow-lg">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/25 to-transparent" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2 font-inter">
                        <BookOpen className="w-4.5 h-4.5 text-indigo-400" />
                        Overall Interview Experience
                      </h3>
                      <div className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed whitespace-pre-line font-inter">
                        {experience.overallExperience}
                      </div>
                    </section>

                    {/* Chronological Interview Timeline */}
                    {rounds.length > 0 && (
                      <section className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left shadow-lg space-y-6">
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-inter">
                          <Activity className="w-4.5 h-4.5 text-blue-400" />
                          Detailed Interview Rounds Timeline
                        </h3>

                        <div className="space-y-6 relative pl-6 border-l border-white/10 ml-3">
                          {rounds.map((round, idx) => (
                            <div key={round.key} className="relative space-y-2">
                              {/* Bullet pin */}
                              <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-indigo-500 border border-[#050B1F] flex items-center justify-center shadow-lg">
                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                              </div>
                              
                              <div className="bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-all text-left">
                                <h4 className="text-sm font-bold text-white font-inter flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xs font-bold font-mono">
                                    {idx + 1}
                                  </span>
                                  {round.title}
                                </h4>
                                
                                <p className="text-xs sm:text-sm text-slate-300 font-light mt-3 leading-relaxed whitespace-pre-line">
                                  {round.data}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Discussion Section */}
                    <section className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden text-left shadow-lg space-y-6">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-pink-500/25 to-transparent" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-inter">
                        <MessageSquare className="w-4.5 h-4.5 text-pink-400" />
                        Discussion &amp; Comments ({comments.length})
                      </h3>

                      {/* Comment Input */}
                      <form onSubmit={handleCommentSubmit} className="space-y-3">
                        <div className="relative rounded-2xl border border-white/10 bg-slate-950/20 backdrop-blur-xl p-1.5 focus-within:border-indigo-500/30 transition-all">
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment or ask a question..."
                            maxLength={1000}
                            rows={3}
                            className="w-full bg-transparent border-0 outline-none text-slate-200 placeholder-slate-500 text-xs sm:text-sm p-3 resize-none focus:ring-0"
                          />
                          <div className="flex justify-between items-center border-t border-white/5 pt-2 px-3 pb-1">
                            <span className="text-[10px] text-slate-500">
                              {newComment.length}/1000 characters
                            </span>
                            <button
                              type="submit"
                              disabled={submittingComment || !newComment.trim()}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:hover:scale-100 rounded-xl text-xs font-bold text-white transition-all cursor-pointer"
                            >
                              {submittingComment ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <Send className="w-3 h-3" />
                              )}
                              Comment
                            </button>
                          </div>
                        </div>
                      </form>

                      {/* Comments List */}
                      {loadingComments ? (
                        <div className="space-y-4 animate-pulse">
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/5" />
                            <div className="flex-1 space-y-2">
                              <div className="h-3 w-24 bg-white/10 rounded" />
                              <div className="h-3 w-full bg-white/5 rounded" />
                            </div>
                          </div>
                        </div>
                      ) : comments.length === 0 ? (
                        <div className="p-8 text-center bg-white/[0.01] border border-white/5 border-dashed rounded-2xl text-xs text-slate-500">
                          No comments posted yet. Start the conversation!
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                          {comments.map((comment) => {
                            const isCommentOwner = user?._id && comment.user?._id === user._id;
                            return (
                              <div key={comment._id} className="flex items-start gap-3 p-4 bg-white/[0.01] border border-white/5 rounded-2xl hover:bg-white/[0.02] transition-all relative group">
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs">
                                  {comment.user?.name ? comment.user.name.charAt(0).toUpperCase() : "U"}
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                  <div className="flex flex-wrap items-baseline gap-2">
                                    <span className="text-xs font-bold text-white">
                                      {comment.user?.name || "PrepSphere Contributor"}
                                    </span>
                                    <span className="text-[9px] text-slate-500 font-mono">
                                      {new Date(comment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                  </div>
                                  <p className="text-xs sm:text-sm text-slate-300 font-light mt-1.5 leading-relaxed break-words whitespace-pre-line">
                                    {comment.content}
                                  </p>
                                </div>

                                {isCommentOwner && (
                                  <button
                                    onClick={() => handleCommentDelete(comment._id)}
                                    className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                                    title="Delete Comment"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </section>

                  </div>

                  {/* Right Column (4 cols): Prep Tips & Tags */}
                  <div className="lg:col-span-4 space-y-8 text-left">
                    
                    {/* Preparation Advice and Tips widget */}
                    {experience.preparationTips && experience.preparationTips.trim() && (
                      <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-lg bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
                        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent pointer-events-none" />
                        
                        <div className="flex items-center space-x-2 text-indigo-400 mb-3">
                          <Sparkles className="w-4.5 h-4.5" />
                          <span className="text-xs font-bold uppercase tracking-wider font-inter">Preparation Advice &amp; Tips</span>
                        </div>
                        
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light whitespace-pre-line font-inter">
                          {experience.preparationTips}
                        </p>
                      </div>
                    )}

                    {/* Metadata tags cloud */}
                    {experience.tags && experience.tags.length > 0 && (
                      <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-lg space-y-4">
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-inter">
                          <Zap className="w-4 h-4 text-purple-400" />
                          Associated Skill Tags
                        </h3>
                        
                        <div className="flex flex-wrap gap-2">
                          {experience.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="bg-white/5 border border-white/10 text-slate-300 rounded-lg px-2.5 py-1 text-xs transition-colors cursor-default hover:bg-white/10 font-inter"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                </div>

                {/* Similar experiences carousel/grid section */}
                {loadingSimilar ? (
                  <div className="h-32 bg-white/[0.02] border border-white/10 rounded-3xl animate-pulse" />
                ) : similarExperiences.length > 0 ? (
                  <section className="space-y-4 pt-4 text-left border-t border-white/5">
                    <h3 className="text-base font-bold text-white flex items-center gap-2 font-inter">
                      <Users className="w-5 h-5 text-indigo-400" />
                      Similar Interview Experiences
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {similarExperiences.map((simExp) => {
                        let simDiffColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                        if (simExp.difficulty === "Medium") simDiffColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
                        if (simExp.difficulty === "Hard") simDiffColor = "text-red-400 bg-red-500/10 border-red-500/20";

                        return (
                          <div
                            key={simExp._id}
                            onClick={() => {
                              navigate(`/interview-experiences/${simExp._id}`);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 flex flex-col justify-between hover:border-indigo-500/25 transition-all cursor-pointer shadow-sm hover:scale-[1.01] hover:bg-white/[0.04]"
                          >
                            <div className="space-y-2 text-left">
                              <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400 font-mono">
                                <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded px-1.5 py-0.5 font-bold uppercase">
                                  {simExp.company}
                                </span>
                                <span className={`px-1.5 py-0.5 rounded border ${simDiffColor}`}>{simExp.difficulty}</span>
                              </div>
                              <h4 className="text-sm font-bold text-white font-inter">{simExp.company} {simExp.role}</h4>
                              <p className="text-xs text-slate-400 line-clamp-2 font-light leading-relaxed font-inter">
                                {simExp.overallExperience}
                              </p>
                            </div>
                            <div className="border-t border-white/5 pt-3 mt-4 flex justify-between items-center text-[10px] text-slate-400 font-inter">
                              <span>{simExp.user?.name || "PrepSphere Contributor"}</span>
                              <span className="font-bold text-indigo-400 font-mono">{simExp.package ? `${simExp.package} LPA` : "N/A"}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ) : null}

              </div>
            )}
          </main>

        </div>

        {/* REPORT CONTENT MODAL OVERLAY */}
        <AnimatePresence>
          {reportModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setReportModalOpen(false)}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-md bg-[#0a1128] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl text-left overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-red-500/30 to-transparent pointer-events-none" />

                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Report Experience
                  </h3>
                  <button
                    onClick={() => setReportModalOpen(false)}
                    className="p-1 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {reportSuccess ? (
                  <div className="p-8 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                      <Check className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Report Submitted</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      Thank you. We will review this content to ensure it aligns with our community guidelines.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleReportSubmit} className="space-y-4">
                    {reportError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{reportError}</span>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Reason for Report <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white outline-none focus:border-red-500/30 transition-all cursor-pointer"
                      >
                        <option value="">Select a reason...</option>
                        <option value="Spam">Spam / Advertising</option>
                        <option value="Offensive Content">Offensive Content</option>
                        <option value="Incorrect Information">Incorrect Information</option>
                        <option value="Duplicate">Duplicate Post</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Description / Optional Context
                      </label>
                      <textarea
                        value={reportDescription}
                        onChange={(e) => setReportDescription(e.target.value)}
                        placeholder="Provide details about why this content should be reported..."
                        maxLength={2000}
                        rows={4}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white outline-none focus:border-red-500/30 transition-all resize-none"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setReportModalOpen(false)}
                        className="px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/15 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submittingReport}
                        className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-red-950/20 disabled:opacity-40"
                      >
                        {submittingReport ? (
                          <div className="flex items-center gap-1.5">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Submitting...
                          </div>
                        ) : (
                          "Submit Report"
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </>
  );
};

export default InterviewExperienceDetail;
