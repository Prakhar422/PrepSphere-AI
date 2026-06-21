import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/layout/Sidebar";
import TopNavbar from "../components/layout/TopNavbar";
import { generateInterviewReportPDF, generateAccountSummaryPDF } from "../utils/reportPdfGenerator";
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
  Lock,
  Mail,
  Monitor,
  Check,
  Globe,
  Trash2,
  AlertTriangle,
  Download,
  Info
} from "lucide-react";

const Settings = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  // Sidebar Layout Responsive Controls
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Inline Feedback States
  const [profileFeedback, setProfileFeedback] = useState({ type: "", message: "" });
  const [passwordFeedback, setPasswordFeedback] = useState({ type: "", message: "" });
  const [emailFeedback, setEmailFeedback] = useState({ type: "", message: "" });
  const [dataExportFeedback, setDataExportFeedback] = useState({ type: "", message: "" });
  const [dangerZoneFeedback, setDangerZoneFeedback] = useState({ type: "", message: "" });

  // Additional loading states for export actions
  const [exportingData, setExportingData] = useState(false);
  const [exportingReports, setExportingReports] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);

  // History delete input matching & loading
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletingHistory, setDeletingHistory] = useState(false);

  // Open modal helper clearing other modal states
  const openModal = (type, target = "") => {
    setModalType(type);
    setDeleteTarget(target);
    setDeleteConfirmText("");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setNewEmail("");
    setValidationErrors({});
    setPasswordFeedback({ type: "", message: "" });
    setEmailFeedback({ type: "", message: "" });
    setDangerZoneFeedback({ type: "", message: "" });
  };


  // Appearance preferences state
  const [accentColor, setAccentColor] = useState("purple"); // 'purple' | 'blue' | 'cyan' | 'emerald'
  const [density, setDensity] = useState("comfortable"); // 'comfortable' | 'compact'
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  // Loading States
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);
  const [loggingOutEverywhere, setLoggingOutEverywhere] = useState(false);

  // Validation Error States
  const [validationErrors, setValidationErrors] = useState({});

  // Profile data state (defaults to auth context data if available)
  const [name, setName] = useState(user?.name || "Prakhar Sharma");
  const [email, setEmail] = useState(user?.email || "prakhar@prepsphere.ai");
  const [college, setCollege] = useState(user?.college || "BITS Pilani");
  const [degree, setDegree] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [branch, setBranch] = useState("");
  const [bio, setBio] = useState("");

  // Temporary Edit inputs (holds editing state before save)
  const [editName, setEditName] = useState(name);
  const [editCollege, setEditCollege] = useState(college);
  const [editDegree, setEditDegree] = useState(degree);
  const [editGradYear, setEditGradYear] = useState(gradYear);
  const [editBranch, setEditBranch] = useState(branch);
  const [editBio, setEditBio] = useState(bio);

  const fileInputRef = React.useRef(null);

  // Load Profile details on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/settings/profile");
        if (response.data && response.data.success) {
          const u = response.data.user;
          setName(u.name || "");
          setEmail(u.email || "");
          setCollege(u.college || "");
          setDegree(u.degree || "");
          setGradYear(u.graduationYear || "");
          setBranch(u.branch || "");
          setBio(u.bio || "");
          setHasPassword(u.hasPassword || false);
          updateUser({ ...user, ...u });

          setEditName(u.name || "");
          setEditCollege(u.college || "");
          setEditDegree(u.degree || "");
          setEditGradYear(u.graduationYear || "");
          setEditBranch(u.branch || "");
          setEditBio(u.bio || "");
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
        setProfileFeedback({ type: "error", message: "Failed to load profile settings." });
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  // Connected accounts state toggles (Google, GitHub linked by default)
  const [googleConnected, setGoogleConnected] = useState(true);
  const [githubConnected, setGithubConnected] = useState(true);
  const [linkedinConnected, setLinkedinConnected] = useState(false);
  const [leetcodeConnected, setLeetcodeConnected] = useState(false);
  const [gfgConnected, setGfgConnected] = useState(false);
  const [codeforcesConnected, setCodeforcesConnected] = useState(false);

  // Interactive Modal Type overlays controller
  const [modalType, setModalType] = useState("none"); // 'none' | 'password' | 'email' | 'delete-history' | 'delete-account'
  const [deleteTarget, setDeleteTarget] = useState(""); // history target

  // Form states for modals
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");

  // Map theme highlights dynamically based on selected accent color
  const colorTheme = {
    purple: {
      text: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      accent: "from-indigo-400 to-purple-400",
      glowBorder: "hover:border-purple-500/25",
      btnBg: "bg-gradient-to-r from-indigo-500 to-purple-600",
      bulletColor: "bg-purple-500",
    },
    blue: {
      text: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      accent: "from-blue-400 to-indigo-400",
      glowBorder: "hover:border-blue-500/25",
      btnBg: "bg-gradient-to-r from-blue-500 to-indigo-600",
      bulletColor: "bg-blue-500",
    },
    cyan: {
      text: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
      accent: "from-cyan-400 to-blue-400",
      glowBorder: "hover:border-cyan-500/25",
      btnBg: "bg-gradient-to-r from-cyan-500 to-blue-600",
      bulletColor: "bg-cyan-500",
    },
    emerald: {
      text: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      accent: "from-emerald-400 to-teal-400",
      glowBorder: "hover:border-emerald-500/25",
      btnBg: "bg-gradient-to-r from-emerald-500 to-teal-600",
      bulletColor: "bg-emerald-500",
    }
  }[accentColor];



  // Profile save updates
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    setProfileFeedback({ type: "", message: "" });

    // Validate name
    if (!editName.trim()) {
      setValidationErrors(prev => ({ ...prev, name: "Name is required" }));
      return;
    }

    // Validate college
    if (!editCollege.trim()) {
      setValidationErrors(prev => ({ ...prev, college: "College is required" }));
      return;
    }

    // Validate branch
    if (!editBranch.trim()) {
      setValidationErrors(prev => ({ ...prev, branch: "Branch is required" }));
      return;
    }

    // Validate graduation year
    const gradYearRegex = /^\d{4}$/;
    const gradYearInt = parseInt(editGradYear.trim(), 10);
    if (!editGradYear.trim() || !gradYearRegex.test(editGradYear.trim()) || isNaN(gradYearInt) || gradYearInt < 1900 || gradYearInt > 2100) {
      setValidationErrors(prev => ({ ...prev, gradYear: "Graduation year must be a 4-digit year between 1900 and 2100" }));
      return;
    }

    setSavingProfile(true);

    try {
      const response = await api.put("/settings/profile", {
        name: editName.trim(),
        college: editCollege.trim(),
        degree: editDegree.trim(),
        graduationYear: editGradYear.trim(),
        branch: editBranch.trim(),
        bio: editBio.trim()
      });

      if (response.data && response.data.success) {
        const u = response.data.user;
        setName(u.name);
        setCollege(u.college);
        setDegree(u.degree);
        setGradYear(u.graduationYear);
        setBranch(u.branch);
        setBio(u.bio);

        updateUser({ ...user, ...u });
        setProfileFeedback({ type: "success", message: "Profile Updated Successfully" });
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
      const errMsg = error.response?.data?.message || "Failed to save changes. Network Error.";
      setProfileFeedback({ type: "error", message: errMsg });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelProfile = () => {
    setEditName(name);
    setEditCollege(college);
    setEditDegree(degree);
    setEditGradYear(gradYear);
    setEditBranch(branch);
    setEditBio(bio);
    setValidationErrors({});
    setProfileFeedback({ type: "success", message: "Profile edit discarded." });
  };

  // Connected accounts count check
  const connectedCount = [googleConnected, githubConnected, linkedinConnected, leetcodeConnected, gfgConnected, codeforcesConnected].filter(Boolean).length;

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    setPasswordFeedback({ type: "", message: "" });

    if (!oldPassword) {
      setValidationErrors(prev => ({ ...prev, oldPassword: "Current password is required" }));
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setValidationErrors(prev => ({ ...prev, newPassword: "New password must be at least 8 characters long" }));
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match" }));
      return;
    }

    setChangingPassword(true);

    try {
      const response = await api.put("/settings/change-password", {
        oldPassword,
        newPassword,
        confirmPassword
      });

      if (response.data && response.data.success) {
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordFeedback({ type: "success", message: "Password Changed Successfully" });
        setTimeout(() => {
          setModalType("none");
          setPasswordFeedback({ type: "", message: "" });
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to change password:", error);
      const errMsg = error.response?.data?.message || "Password change failed. Network Error.";
      setPasswordFeedback({ type: "error", message: errMsg });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    setEmailFeedback({ type: "", message: "" });

    if (!newEmail.trim()) {
      setValidationErrors(prev => ({ ...prev, newEmail: "New email address is required" }));
      return;
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(newEmail.trim())) {
      setValidationErrors(prev => ({ ...prev, newEmail: "Please enter a valid email address" }));
      return;
    }

    if (!oldPassword) {
      setValidationErrors(prev => ({ ...prev, oldPasswordEmail: "Current password is required" }));
      return;
    }

    setChangingEmail(true);

    try {
      const response = await api.put("/settings/change-email", {
        password: oldPassword,
        newEmail: newEmail.trim()
      });

      if (response.data && response.data.success) {
        setEmail(response.data.user.email);
        setNewEmail("");
        setOldPassword("");

        // Update local session token
        const token = response.data.token;
        if (localStorage.getItem('token')) {
          localStorage.setItem('token', token);
        } else {
          sessionStorage.setItem('token', token);
        }

        updateUser({ ...user, ...response.data.user });
        setEmailFeedback({ type: "success", message: "Email Updated Successfully" });
        setTimeout(() => {
          setModalType("none");
          setEmailFeedback({ type: "", message: "" });
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to change email:", error);
      const errMsg = error.response?.data?.message || "Email update failed. Network Error.";
      setEmailFeedback({ type: "error", message: errMsg });
    } finally {
      setChangingEmail(false);
    }
  };

  const handleLogoutEverywhere = async () => {
    setLoggingOutEverywhere(true);
    setPasswordFeedback({ type: "", message: "" });
    try {
      const response = await api.post("/settings/logout-all");
      if (response.data && response.data.success) {
        logout();
        navigate("/login");
      }
    } catch (error) {
      console.error("Failed to logout everywhere:", error);
      const errMsg = error.response?.data?.message || "Logout everywhere failed. Network Error.";
      setPasswordFeedback({ type: "error", message: errMsg });
    } finally {
      setLoggingOutEverywhere(false);
    }
  };

  const handleRemovePhoto = async () => {
    setUploadingPhoto(true);
    setProfileFeedback({ type: "", message: "" });
    try {
      const response = await api.delete('/settings/profile-photo');
      if (response.data && response.data.success) {
        const u = response.data.user;
        updateUser({ ...user, ...u });
        setProfileFeedback({ type: "success", message: "Profile photo removed successfully." });
      }
    } catch (error) {
      console.error("Failed to remove photo:", error);
      const errMsg = error.response?.data?.message || "Failed to remove photo. Network Error.";
      setProfileFeedback({ type: "error", message: errMsg });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleEditPhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfileFeedback({ type: "", message: "" });

    // Validate size and extension
    const allowedExtensions = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedExtensions.includes(file.type)) {
      setProfileFeedback({ type: "error", message: "Unsupported file type. Select JPG, JPEG, PNG or WEBP." });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileFeedback({ type: "error", message: "File size must be less than 5 MB." });
      return;
    }

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      const response = await api.put('/settings/profile-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.success) {
        const u = response.data.user;
        updateUser({ ...user, ...u });
        setProfileFeedback({ type: "success", message: "Profile photo uploaded successfully." });
      }
    } catch (error) {
      console.error("Photo upload failed:", error);
      const errMsg = error.response?.data?.message || "Profile photo upload failed.";
      setProfileFeedback({ type: "error", message: errMsg });
    } finally {
      setUploadingPhoto(false);
      // Reset input
      if (e.target) e.target.value = '';
    }
  };

  const handleExportData = async () => {
    setExportingData(true);
    setDataExportFeedback({ type: "", message: "" });
    try {
      const response = await api.get("/settings/export-data");
      
      // Trigger new PDF account summary generator
      await generateAccountSummaryPDF(response.data, user, { autoSave: true });
      
      setDataExportFeedback({ type: "success", message: "Account Summary PDF downloaded successfully." });
    } catch (error) {
      console.error("Export data failed:", error);
      const errMsg = error.response?.data?.message || "Data export failed. Network Error.";
      setDataExportFeedback({ type: "error", message: errMsg });
    } finally {
      setExportingData(false);
    }
  };

  const handleExportReports = async () => {
    setExportingReports(true);
    setDataExportFeedback({ type: "", message: "" });
    try {
      const response = await api.get("/settings/export-reports");
      const report = response.data.report;
      
      if (!report) {
        setDataExportFeedback({ type: "error", message: "No interview report available." });
        return;
      }

      generateInterviewReportPDF(report, user, { autoSave: true });
      setDataExportFeedback({ type: "success", message: "Report PDF downloaded successfully." });
    } catch (error) {
      console.error("Export reports failed:", error);
      const errMsg = error.response?.data?.message || error.message || "Reports export failed. Network Error.";
      setDataExportFeedback({ type: "error", message: errMsg });
    } finally {
      setExportingReports(false);
    }
  };

  const handleDeleteHistory = async () => {
    if (deleteConfirmText !== "DELETE") return;
    setDeletingHistory(true);
    setDangerZoneFeedback({ type: "", message: "" });

    let endpoint = "";
    if (deleteTarget === "Resume Analyzer") {
      endpoint = "/settings/history/resume";
    } else if (deleteTarget === "Aptitude Practice") {
      endpoint = "/settings/history/aptitude";
    } else if (deleteTarget === "Mock Interview") {
      endpoint = "/settings/history/interviews";
    }

    if (!endpoint) {
      setDangerZoneFeedback({ type: "error", message: "Invalid history deletion target." });
      setDeletingHistory(false);
      return;
    }

    try {
      const response = await api.delete(endpoint);
      if (response.data && response.data.success) {
        window.dispatchEvent(new Event('dashboard-refresh'));
        setDangerZoneFeedback({
          type: "success",
          message: `${deleteTarget} history deleted successfully. Dashboard metrics updated.`
        });
        setTimeout(() => {
          setModalType("none");
          setDeleteConfirmText("");
          setDangerZoneFeedback({ type: "", message: "" });
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to delete history:", error);
      const errMsg = error.response?.data?.message || "History deletion failed. Network Error.";
      setDangerZoneFeedback({ type: "error", message: errMsg });
    } finally {
      setDeletingHistory(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;
    if (hasPassword && !oldPassword) {
      setValidationErrors({ deletePassword: "Password is required" });
      return;
    }

    setDeletingAccount(true);
    setDangerZoneFeedback({ type: "", message: "" });
    setValidationErrors({});

    try {
      await api.delete("/settings/delete-account", {
        data: { password: oldPassword }
      });

      // Clear local states & sessions
      logout();
      localStorage.clear();
      sessionStorage.clear();
      // Remove any cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Show success inline & close modal after a short delay
      setDangerZoneFeedback({ type: "success", message: "Account deleted successfully. Redirecting..." });
      
      // Dispatch refresh events to clear other states
      window.dispatchEvent(new Event("dashboard-refresh"));

      setTimeout(() => {
        setModalType("none");
        navigate("/login");
      }, 2000);

    } catch (error) {
      console.error("Account deletion failed:", error);
      const errMsg = error.response?.data?.message || "Account deletion failed. Network Error.";
      
      if (errMsg.toLowerCase().includes("password")) {
        setValidationErrors({ deletePassword: errMsg });
      } else {
        setDangerZoneFeedback({ type: "error", message: errMsg });
      }
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
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

        {/* Purple and Indigo Glowing spotlights */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-[130px] pointer-events-none" />

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* MAIN DISPLAY CONTAINER */}
        <div className="lg:ml-[280px] flex-1 flex flex-col h-screen overflow-y-auto z-10 relative">
          
          <TopNavbar
            onMenuClick={() => setSidebarOpen(true)}
          />

          {/* MAIN SETTINGS PAGE CONTENT */}
          <main className={`flex-1 space-y-8 max-w-7xl mx-auto w-full ${density === "compact" ? "p-4 space-y-5" : "p-6 space-y-8"}`}>
            
            {/* HERO SECTION */}
            <section className="relative rounded-3xl border border-white/10 bg-slate-950/20 backdrop-blur-xl p-6 overflow-hidden text-left">
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />

              <div className="relative z-10 max-w-2xl space-y-3">
                <div className="inline-flex items-center space-x-1.5 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-xs text-indigo-400 font-bold uppercase tracking-wider">
                  <SettingsIcon className="w-3.5 h-3.5 text-indigo-400 animate-spin [animation-duration:8s]" />
                  <span>Control Center &amp; Customization</span>
                </div>
                
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-inter">
                  Settings
                </h1>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
                  Manage your PrepSphere profile, account preferences, connected platforms, and security.
                </p>
              </div>
            </section>

            {/* TWO-COLUMN GRID LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column (8 cols): Profile, Appearance, Connections, Danger Zone */}
              <div className="lg:col-span-8 space-y-8 text-left">
                
                {/* PROFILE SECTION CARD */}
                <section className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-lg">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                  
                  <h3 className="text-base font-semibold text-white mb-6 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-indigo-400" />
                    Profile Details
                  </h3>

                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    {/* Picture + Edit Row */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/5">
                      <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-[1.5px] relative group overflow-hidden shadow-lg shrink-0">
                        <div className="w-full h-full rounded-3xl bg-[#080E24] flex items-center justify-center text-indigo-400 text-3xl font-extrabold transition-all group-hover:scale-105 duration-300">
                          {loadingProfile || uploadingPhoto ? (
                            <div className="w-full h-full rounded-3xl bg-slate-800 animate-pulse flex items-center justify-center">
                              <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
                            </div>
                          ) : user?.profileImage ? (
                            <img src={user.profileImage} alt="Avatar" className="w-full h-full rounded-3xl object-cover" />
                          ) : (
                            name.charAt(0).toUpperCase()
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 text-center sm:text-left">
                        <h4 className="text-sm font-bold text-white">Profile Photo</h4>
                        <p className="text-xs text-slate-400 font-light max-w-xs">
                          Upload a professional image. Recommended size 400x400px. JPG, JPEG, PNG or WEBP.
                        </p>
                        <div className="flex flex-wrap gap-2.5 justify-center sm:justify-start">
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                            accept="image/png, image/jpeg, image/jpg, image/webp"
                          />
                          <button
                            type="button"
                            onClick={handleEditPhotoClick}
                            disabled={loadingProfile || uploadingPhoto}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-white border border-white/10 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed ${colorTheme.glowBorder}`}
                          >
                            {uploadingPhoto ? "Uploading..." : "Edit Photo"}
                          </button>
                          {user?.profileImage && !loadingProfile && (
                            <button
                              type="button"
                              onClick={handleRemovePhoto}
                              disabled={uploadingPhoto}
                              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Inputs grids */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                      <div className="space-y-1.5">
                        <label className="block font-bold text-slate-400 uppercase tracking-wide">Full Name</label>
                        {loadingProfile ? (
                          <div className="w-full h-[38px] bg-white/5 rounded-xl animate-pulse" />
                        ) : (
                          <>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => {
                                setEditName(e.target.value);
                                if (validationErrors.name) {
                                  setValidationErrors(prev => ({ ...prev, name: "" }));
                                }
                              }}
                              className={`w-full bg-slate-950/40 border ${validationErrors.name ? 'border-red-500' : 'border-white/10'} rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500/60`}
                            />
                            {validationErrors.name && (
                              <p className="text-red-500 text-[10px] mt-1 font-semibold">{validationErrors.name}</p>
                            )}
                          </>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="block font-bold text-slate-400 uppercase tracking-wide">College</label>
                        {loadingProfile ? (
                          <div className="w-full h-[38px] bg-white/5 rounded-xl animate-pulse" />
                        ) : (
                          <>
                            <input
                              type="text"
                              value={editCollege}
                              onChange={(e) => {
                                setEditCollege(e.target.value);
                                if (validationErrors.college) {
                                  setValidationErrors(prev => ({ ...prev, college: "" }));
                                }
                              }}
                              className={`w-full bg-slate-950/40 border ${validationErrors.college ? 'border-red-500' : 'border-white/10'} rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500/60`}
                            />
                            {validationErrors.college && (
                              <p className="text-red-500 text-[10px] mt-1 font-semibold">{validationErrors.college}</p>
                            )}
                          </>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="block font-bold text-slate-400 uppercase tracking-wide">Degree Qualification</label>
                        {loadingProfile ? (
                          <div className="w-full h-[38px] bg-white/5 rounded-xl animate-pulse" />
                        ) : (
                          <input
                            type="text"
                            value={editDegree}
                            onChange={(e) => setEditDegree(e.target.value)}
                            className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500/60"
                          />
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="block font-bold text-slate-400 uppercase tracking-wide">Graduation Year</label>
                        {loadingProfile ? (
                          <div className="w-full h-[38px] bg-white/5 rounded-xl animate-pulse" />
                        ) : (
                          <>
                            <input
                              type="text"
                              value={editGradYear}
                              onChange={(e) => {
                                setEditGradYear(e.target.value);
                                if (validationErrors.gradYear) {
                                  setValidationErrors(prev => ({ ...prev, gradYear: "" }));
                                }
                              }}
                              className={`w-full bg-slate-950/40 border ${validationErrors.gradYear ? 'border-red-500' : 'border-white/10'} rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500/60`}
                            />
                            {validationErrors.gradYear && (
                              <p className="text-red-500 text-[10px] mt-1 font-semibold">{validationErrors.gradYear}</p>
                            )}
                          </>
                        )}
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="block font-bold text-slate-400 uppercase tracking-wide">Branch</label>
                        {loadingProfile ? (
                          <div className="w-full h-[38px] bg-white/5 rounded-xl animate-pulse" />
                        ) : (
                          <>
                            <input
                              type="text"
                              value={editBranch}
                              onChange={(e) => {
                                setEditBranch(e.target.value);
                                if (validationErrors.branch) {
                                  setValidationErrors(prev => ({ ...prev, branch: "" }));
                                }
                              }}
                              className={`w-full bg-slate-950/40 border ${validationErrors.branch ? 'border-red-500' : 'border-white/10'} rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500/60`}
                            />
                            {validationErrors.branch && (
                              <p className="text-red-500 text-[10px] mt-1 font-semibold">{validationErrors.branch}</p>
                            )}
                          </>
                        )}
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="block font-bold text-slate-400 uppercase tracking-wide">Short Bio</label>
                        {loadingProfile ? (
                          <div className="w-full h-[96px] bg-white/5 rounded-xl animate-pulse" />
                        ) : (
                          <textarea
                            value={editBio}
                            onChange={(e) => setEditBio(e.target.value)}
                            className="w-full h-24 bg-slate-950/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500/60 leading-relaxed"
                          />
                        )}
                      </div>
                    </div>

                    {profileFeedback.message && (
                      <div className="pt-2 text-xs font-bold text-left">
                        <span className={profileFeedback.type === "success" ? "text-emerald-400" : "text-red-400"}>
                          {profileFeedback.message}
                        </span>
                      </div>
                    )}

                    {/* Bottom Save/Cancel Actions */}
                    <div className="pt-4 border-t border-white/5 flex gap-3 justify-end text-xs font-bold">
                      <button
                        type="button"
                        onClick={handleCancelProfile}
                        disabled={savingProfile || loadingProfile}
                        className="px-5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingProfile || loadingProfile}
                        className={`px-6 py-2.5 rounded-xl text-white shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 ${colorTheme.btnBg}`}
                      >
                        {savingProfile && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                        {savingProfile ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                </section>

                

                {/* CONNECTED ACCOUNTS INTEGRATION SECTION */}
                <section className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-lg text-left">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                  
                  <h3 className="text-base font-semibold text-white mb-6 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-cyan-400" />
                    Connected Platform Integrations
                  </h3>

                  {connectedCount === 0 ? (
                    <div className="p-8 text-center bg-slate-950/20 border border-white/5 rounded-2xl text-slate-500 text-xs font-semibold">
                      Connect your accounts to unlock future integrations.
                      <div className="mt-4 flex justify-center gap-3">
                        <button onClick={() => setGoogleConnected(true)} className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 cursor-pointer">Link Google</button>
                        <button onClick={() => setGithubConnected(true)} className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 cursor-pointer">Link GitHub</button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Google Connection Card */}
                      <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-indigo-500/20 flex flex-col justify-between h-[130px] transition-all relative group">
                        <div className="flex justify-between items-center">
                          <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center font-bold text-sm">G</div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono ${
                            googleConnected ? "text-emerald-400 bg-emerald-500/10" : "text-slate-500 bg-white/5"
                          }`}>
                            {googleConnected ? "Connected" : "Unlinked"}
                          </span>
                        </div>
                        <div className="mt-2 text-left">
                          <h4 className="text-xs font-bold text-white">Google Identity</h4>
                          <span className="text-[9px] text-slate-400 font-light mt-0.5 block">Federated login validation.</span>
                        </div>
                        <div className="border-t border-white/5 pt-2 mt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setGoogleConnected(!googleConnected);
                            }}
                            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold transition-all cursor-pointer focus:outline-none"
                          >
                            {googleConnected ? "Disconnect" : "Connect"}
                          </button>
                        </div>
                      </div>

                      {/* GitHub Connection Card */}
                      <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-indigo-500/20 flex flex-col justify-between h-[130px] transition-all relative group">
                        <div className="flex justify-between items-center">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-sm">GH</div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono ${
                            githubConnected ? "text-emerald-400 bg-emerald-500/10" : "text-slate-500 bg-white/5"
                          }`}>
                            {githubConnected ? "Connected" : "Unlinked"}
                          </span>
                        </div>
                        <div className="mt-2 text-left">
                          <h4 className="text-xs font-bold text-white">GitHub OAuth</h4>
                          <span className="text-[9px] text-slate-400 font-light mt-0.5 block">Access repository details.</span>
                        </div>
                        <div className="border-t border-white/5 pt-2 mt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setGithubConnected(!githubConnected);
                            }}
                            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold transition-all cursor-pointer focus:outline-none"
                          >
                            {githubConnected ? "Disconnect" : "Connect"}
                          </button>
                        </div>
                      </div>

                      

                      

                    </div>
                  )}
                </section>

                {/* DANGER ZONE GLASS CARD */}
                <section className="bg-red-500/5 border border-red-500/20 rounded-3xl p-6 relative overflow-hidden text-left shadow-md">
                  <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-red-500/30 to-transparent pointer-events-none" />
                  
                  <h3 className="text-base font-semibold text-red-400 mb-6 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Danger Zone Operations
                  </h3>

                  <div className="space-y-4 text-xs sm:text-sm">
                    {/* Delete resume history */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 py-3 border-b border-red-500/10 last:border-0 last:pb-0">
                      <div>
                        <span className="block font-bold text-white uppercase tracking-wide">Delete Resume History</span>
                        <span className="text-xs text-slate-400 font-light mt-0.5 block">Permanently clear ATS scans records.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => openModal("delete-history", "Resume Analyzer")}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 border border-red-500/25 hover:bg-red-500/10 cursor-pointer transition-colors"
                      >
                        Delete Resume History
                      </button>
                    </div>

                    {/* Delete Aptitude History */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 py-3 border-b border-red-500/10 last:border-0 last:pb-0">
                      <div>
                        <span className="block font-bold text-white uppercase tracking-wide">Delete Aptitude History</span>
                        <span className="text-xs text-slate-400 font-light mt-0.5 block">Permanently remove all aptitude quizzes, scores, and progress.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => openModal("delete-history", "Aptitude Practice")}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 border border-red-500/25 hover:bg-red-500/10 cursor-pointer transition-colors"
                      >
                        Delete Aptitude History
                      </button>
                    </div>

                    {/* Delete interview history */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 py-3 border-b border-red-500/10 last:border-0 last:pb-0">
                      <div>
                        <span className="block font-bold text-white uppercase tracking-wide">Delete Interview History</span>
                        <span className="text-xs text-slate-400 font-light mt-0.5 block">Clear all mock interview records and score metrics.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => openModal("delete-history", "Mock Interview")}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 border border-red-500/25 hover:bg-red-500/10 cursor-pointer transition-colors"
                      >
                        Delete Interview History
                      </button>
                    </div>

                    {/* Delete Entire Account */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 py-3 border-b border-red-500/10 last:border-0 last:pb-0">
                      <div>
                        <span className="block font-bold text-white uppercase tracking-wide">Delete Entire Account</span>
                        <span className="text-xs text-slate-400 font-light mt-0.5 block">Permanently delete your PrepSphere account credentials.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => openModal("delete-account")}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 shadow-md shadow-red-600/10 cursor-pointer transition-colors"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                </section>

              </div>

              {/* Right Column (4 cols): Account controls, Privacy exports, About metadata */}
              <div className="lg:col-span-4 space-y-8 text-left">
                
                {/* ACCOUNT ACTION SETTINGS */}
                <section className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-lg">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                  
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-indigo-400" />
                    Account Controls
                  </h3>

                  <div className="space-y-4">
                    {/* Password Trigger */}
                    <div className="p-3 bg-white/[0.01] border border-white/5 rounded-2xl flex flex-col justify-between gap-3 text-xs">
                      <div>
                        <h4 className="font-bold text-white flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-indigo-400" />
                          Change Password
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Update your account password securely.</p>
                      </div>
                      <button
                        onClick={() => openModal("password")}
                        className="w-full py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-[10px] font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
                      >
                        Change Password
                      </button>
                    </div>

                    {/* Email Trigger */}
                    <div className="p-3 bg-white/[0.01] border border-white/5 rounded-2xl flex flex-col justify-between gap-3 text-xs">
                      <div>
                        <h4 className="font-bold text-white flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-indigo-400" />
                          Change Email
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Update your registered email address.</p>
                      </div>
                      <button
                        onClick={() => openModal("email")}
                        className="w-full py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-[10px] font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
                      >
                        Change Email
                      </button>
                    </div>

                    {/* Logout Everywhere */}
                    <div className="p-3 bg-white/[0.01] border border-white/5 rounded-2xl flex flex-col justify-between gap-3 text-xs">
                      <div>
                        <h4 className="font-bold text-white flex items-center gap-1.5">
                          <Monitor className="w-3.5 h-3.5 text-indigo-400" />
                          Logout Everywhere
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Securely sign out from every logged-in device.</p>
                      </div>
                      <button
                        onClick={handleLogoutEverywhere}
                        disabled={loggingOutEverywhere}
                        className="w-full py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-[10px] font-bold text-slate-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                      >
                        {loggingOutEverywhere && <RefreshCw className="w-3 h-3 animate-spin" />}
                        {loggingOutEverywhere ? "Signing out everywhere..." : "Logout Everywhere"}
                      </button>
                    </div>
                  </div>
                </section>

                {/* PRIVACY & SECURITY EXPORTS */}
                <section className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-lg">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
                  
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FileSearch className="w-4 h-4 text-purple-400" />
                    Privacy &amp; Data Exports
                  </h3>

                  <div className="space-y-4 text-xs font-semibold">
                    {/* Download Data */}
                    <div className="py-2.5 border-b border-white/5 last:border-0 flex justify-between items-center gap-2">
                      <div>
                        <span className="block text-white">Download My Data</span>
                        <span className="text-[10px] text-slate-500 font-light mt-0.5 block">Fetch all reports as archive.</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleExportData}
                        disabled={exportingData || exportingReports}
                        className="p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Download Data"
                      >
                        {exportingData ? <RefreshCw className="w-4 h-4 animate-spin text-purple-400" /> : <Download className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Export Reports */}
                    <div className="py-2.5 border-b border-white/5 last:border-0 flex justify-between items-center gap-2">
                      <div>
                        <span className="block text-white">Export Reports</span>
                        <span className="text-[10px] text-slate-500 font-light mt-0.5 block">Save interview files.</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleExportReports}
                        disabled={exportingData || exportingReports}
                        className="p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Export Reports"
                      >
                        {exportingReports ? <RefreshCw className="w-4 h-4 animate-spin text-purple-400" /> : <ExternalLink className="w-4 h-4" />}
                      </button>
                    </div>

                    {dataExportFeedback.message && (
                      <div className="pt-2 text-[10px] font-bold text-left">
                        <span className={
                          dataExportFeedback.type === "success" 
                            ? "text-emerald-400" 
                            : dataExportFeedback.type === "info" 
                              ? "text-indigo-400" 
                              : "text-red-400"
                        }>
                          {dataExportFeedback.message}
                        </span>
                      </div>
                    )}

                    {/* Legal Policies */}
                    <div className="pt-2 flex flex-wrap gap-2 text-[10px] font-bold text-slate-500">
                      <button onClick={() => alert("Privacy Policy Page Link")} className="hover:text-indigo-400 transition-colors cursor-pointer">Privacy Policy</button>
                      <span>&bull;</span>
                      <button onClick={() => alert("Terms of Service Link")} className="hover:text-indigo-400 transition-colors cursor-pointer">Terms &amp; Conditions</button>
                    </div>
                  </div>
                </section>

                {/* ABOUT PREPSPHERE */}
                <section className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-lg">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                  
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Info className="w-4 h-4 text-cyan-400" />
                    About PrepSphere AI
                  </h3>

                  <div className="space-y-4 text-xs">
                    {/* App details details */}
                    <div className="space-y-2 border-b border-white/5 pb-4 font-mono font-semibold">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Application Name:</span>
                        <span className="text-white">PrepSphere AI</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Version:</span>
                        <span className="text-indigo-400">v1.0.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Developer:</span>
                        <span className="text-white">PrepSphere Team</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Build Channel:</span>
                        <span className="text-purple-400">Production</span>
                      </div>
                    </div>

                    {/* About Actions Links */}
                    <div className="space-y-2 font-bold">
                      
                      <a href="mailto:support@prepsphere.ai?subject=PrepSphere%20Support%20Request&body=Hello%20PrepSphere%20Team%2C%0A%0AI%20need%20assistance%20regarding...%0A%0ARegards%2C" className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer">
                        <span>Contact Support</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </section>

              </div>
            </div>

          </main>
        </div>



        {/* ACCOUNT MODALS OVERLAYS */}
        <AnimatePresence>
          {modalType !== "none" && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  if (!deletingAccount && !deletingHistory) setModalType("none");
                }}
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
              />

              {/* Form Content container */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative w-full max-w-md bg-[#080E24]/90 border border-white/10 rounded-3xl p-6 shadow-[0_0_50px_rgba(99,102,241,0.15)] backdrop-blur-xl overflow-hidden text-left"
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent pointer-events-none" />

                {/* MODAL 1: CHANGE PASSWORD */}
                {modalType === "password" && (
                  <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs sm:text-sm">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                        <Lock className="w-4.5 h-4.5 text-indigo-400" />
                        Update Password
                      </h3>
                      <button type="button" onClick={() => setModalType("none")} className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
                    </div>

                    <div className="space-y-3.5">
                      <div className="space-y-1.5">
                        <label className="block font-bold text-slate-400 uppercase tracking-wide">Current Password</label>
                        <input
                          type="password"
                          required
                          value={oldPassword}
                          onChange={(e) => {
                            setOldPassword(e.target.value);
                            if (validationErrors.oldPassword) setValidationErrors(prev => ({ ...prev, oldPassword: "" }));
                          }}
                          className={`w-full bg-slate-950/40 border ${validationErrors.oldPassword ? 'border-red-500' : 'border-white/10'} rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500/60`}
                        />
                        {validationErrors.oldPassword && (
                          <p className="text-red-500 text-[10px] mt-1 font-semibold">{validationErrors.oldPassword}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <label className="block font-bold text-slate-400 uppercase tracking-wide">New Password</label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            if (validationErrors.newPassword) setValidationErrors(prev => ({ ...prev, newPassword: "" }));
                          }}
                          className={`w-full bg-slate-950/40 border ${validationErrors.newPassword ? 'border-red-500' : 'border-white/10'} rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500/60`}
                        />
                        {validationErrors.newPassword && (
                          <p className="text-red-500 text-[10px] mt-1 font-semibold">{validationErrors.newPassword}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <label className="block font-bold text-slate-400 uppercase tracking-wide">Confirm New Password</label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (validationErrors.confirmPassword) setValidationErrors(prev => ({ ...prev, confirmPassword: "" }));
                          }}
                          className={`w-full bg-slate-950/40 border ${validationErrors.confirmPassword ? 'border-red-500' : 'border-white/10'} rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500/60`}
                        />
                        {validationErrors.confirmPassword && (
                          <p className="text-red-500 text-[10px] mt-1 font-semibold">{validationErrors.confirmPassword}</p>
                        )}
                      </div>
                    </div>

                    {passwordFeedback.message && (
                      <div className="pt-2 text-xs font-bold text-left">
                        <span className={passwordFeedback.type === "success" ? "text-emerald-400" : "text-red-400"}>
                          {passwordFeedback.message}
                        </span>
                      </div>
                    )}

                    <div className="flex space-x-3 pt-4 justify-end font-bold">
                      <button
                        type="button"
                        onClick={() => {
                          setModalType("none");
                          setValidationErrors({});
                        }}
                        disabled={changingPassword}
                        className="px-5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={changingPassword}
                        className={`px-5 py-2.5 rounded-xl text-white shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 ${colorTheme.btnBg}`}
                      >
                        {changingPassword && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                        {changingPassword ? "Updating..." : "Save Password"}
                      </button>
                    </div>
                  </form>
                )}

                {/* MODAL 2: CHANGE EMAIL */}
                {modalType === "email" && (
                  <form onSubmit={handleEmailSubmit} className="space-y-4 text-xs sm:text-sm">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                        <Mail className="w-4.5 h-4.5 text-indigo-400" />
                        Update Registered Email
                      </h3>
                      <button type="button" onClick={() => setModalType("none")} className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
                    </div>

                    <div className="space-y-3.5">
                      <div className="space-y-1.5">
                        <label className="block font-bold text-slate-400 uppercase tracking-wide">Current Email</label>
                        <input
                          type="email"
                          disabled
                          value={email}
                          className="w-full bg-slate-950/40 border border-white/5 rounded-xl px-3 py-2 text-slate-500 cursor-not-allowed font-mono"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block font-bold text-slate-400 uppercase tracking-wide">New Email Address</label>
                        <input
                          type="email"
                          required
                          value={newEmail}
                          onChange={(e) => {
                            setNewEmail(e.target.value);
                            if (validationErrors.newEmail) setValidationErrors(prev => ({ ...prev, newEmail: "" }));
                          }}
                          placeholder="e.g. name@company.com"
                          className={`w-full bg-slate-950/40 border ${validationErrors.newEmail ? 'border-red-500' : 'border-white/10'} rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500/60 font-mono`}
                        />
                        {validationErrors.newEmail && (
                          <p className="text-red-500 text-[10px] mt-1 font-semibold">{validationErrors.newEmail}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <label className="block font-bold text-slate-400 uppercase tracking-wide">Current Password</label>
                        <input
                          type="password"
                          required
                          value={oldPassword}
                          onChange={(e) => {
                            setOldPassword(e.target.value);
                            if (validationErrors.oldPasswordEmail) setValidationErrors(prev => ({ ...prev, oldPasswordEmail: "" }));
                          }}
                          className={`w-full bg-slate-950/40 border ${validationErrors.oldPasswordEmail ? 'border-red-500' : 'border-white/10'} rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500/60`}
                        />
                        {validationErrors.oldPasswordEmail && (
                          <p className="text-red-500 text-[10px] mt-1 font-semibold">{validationErrors.oldPasswordEmail}</p>
                        )}
                      </div>
                    </div>

                    {emailFeedback.message && (
                      <div className="pt-2 text-xs font-bold text-left">
                        <span className={emailFeedback.type === "success" ? "text-emerald-400" : "text-red-400"}>
                          {emailFeedback.message}
                        </span>
                      </div>
                    )}

                    <div className="flex space-x-3 pt-4 justify-end font-bold">
                      <button
                        type="button"
                        onClick={() => {
                          setModalType("none");
                          setValidationErrors({});
                        }}
                        disabled={changingEmail}
                        className="px-5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={changingEmail}
                        className={`px-5 py-2.5 rounded-xl text-white shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 ${colorTheme.btnBg}`}
                      >
                        {changingEmail && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                        {changingEmail ? "Updating..." : "Update Email"}
                      </button>
                    </div>
                  </form>
                )}

                {/* MODAL 3: DELETE HISTORY */}
                {modalType === "delete-history" && (
                  <div className="space-y-4 text-xs sm:text-sm">
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-red-500 pointer-events-none" />
                    
                    <div className="flex items-start space-x-4">
                      <div className="p-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 shrink-0">
                        <AlertTriangle className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">Delete {deleteTarget} Data?</h3>
                        <p className="text-slate-400 font-light mt-1.5 leading-relaxed">
                          Are you sure you want to permanently clear all data and analytics history records for **{deleteTarget}**? This action cannot be undone, and your statistics dashboards metrics will be reset instantly.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mt-4">
                      <label className="block text-slate-400 font-bold uppercase tracking-wide">
                        Type <span className="text-red-400 font-mono">DELETE</span> to confirm
                      </label>
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="Type DELETE"
                        className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500/60 font-mono text-center"
                      />
                    </div>

                    {dangerZoneFeedback.message && (
                      <div className="pt-2 text-xs font-bold text-left">
                        <span className={dangerZoneFeedback.type === "success" ? "text-emerald-400" : "text-red-400"}>
                          {dangerZoneFeedback.message}
                        </span>
                      </div>
                    )}

                    <div className="flex space-x-3 pt-4 justify-end font-bold">
                      <button
                        type="button"
                        onClick={() => {
                          setModalType("none");
                          setDeleteConfirmText("");
                          setDangerZoneFeedback({ type: "", message: "" });
                        }}
                        disabled={deletingHistory}
                        className="px-5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteHistory}
                        disabled={deleteConfirmText !== "DELETE" || deletingHistory}
                        className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-red-900/50 disabled:text-slate-500 text-white shadow-md shadow-red-600/15 cursor-pointer disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
                      >
                        {deletingHistory && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                        {deletingHistory ? "Deleting..." : "Delete History Data"}
                      </button>
                    </div>
                  </div>
                )}

                {/* MODAL 4: DELETE ACCOUNT */}
                {modalType === "delete-account" && (
                  <div className="space-y-4 text-xs sm:text-sm">
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-red-600 pointer-events-none" />
                    
                    <div className="flex items-start space-x-4">
                      <div className="p-3 rounded-xl bg-red-600/10 text-red-500 border border-red-600/20 shrink-0">
                        <Trash2 className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">Delete Entire PrepSphere Account?</h3>
                        <p className="text-slate-400 font-light mt-1.5 leading-relaxed">
                          This is a high-risk operational request. You are about to permanently delete your entire PrepSphere AI account profile, login credentials, connected platforms logs, resume analysis scans, mock interviews logs, and dsa progression trackers. All data will be irreversibly wiped from active databases.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mt-4">
                      <label className="block text-slate-400 font-bold uppercase tracking-wide">
                        Type <span className="text-red-400 font-mono">DELETE</span> to confirm
                      </label>
                      <input
                        type="text"
                        disabled={deletingAccount}
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="Type DELETE"
                        className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500/60 font-mono text-center disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    {hasPassword && (
                      <div className="space-y-2">
                        <label className="block text-slate-400 font-bold uppercase tracking-wide">
                          Confirm Current Password
                        </label>
                        <input
                          type="password"
                          disabled={deletingAccount}
                          value={oldPassword}
                          onChange={(e) => {
                            setOldPassword(e.target.value);
                            if (validationErrors.deletePassword) {
                              setValidationErrors(prev => ({ ...prev, deletePassword: "" }));
                            }
                          }}
                          placeholder="Enter your password"
                          className={`w-full bg-slate-950/60 border ${validationErrors.deletePassword ? 'border-red-500' : 'border-white/10'} rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500/60 disabled:opacity-50 disabled:cursor-not-allowed`}
                        />
                        {validationErrors.deletePassword && (
                          <p className="text-red-500 text-[10px] mt-1 font-semibold">{validationErrors.deletePassword}</p>
                        )}
                      </div>
                    )}

                    {dangerZoneFeedback.message && (
                      <div className="pt-2 text-xs font-bold text-left">
                        <span className={dangerZoneFeedback.type === "success" ? "text-emerald-400" : "text-red-400"}>
                          {dangerZoneFeedback.message}
                        </span>
                      </div>
                    )}

                    <div className="flex space-x-3 pt-4 justify-end font-bold">
                      <button
                        type="button"
                        onClick={() => {
                          setModalType("none");
                          setDeleteConfirmText("");
                          setOldPassword("");
                          setDangerZoneFeedback({ type: "", message: "" });
                          setValidationErrors({});
                        }}
                        disabled={deletingAccount}
                        className="px-5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteAccount}
                        disabled={deleteConfirmText !== "DELETE" || (hasPassword && !oldPassword) || deletingAccount}
                        className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-red-900/50 disabled:text-slate-500 text-white shadow-md shadow-red-600/15 cursor-pointer disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
                      >
                        {deletingAccount && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                        {deletingAccount ? "Deleting..." : "Confirm Account Deletion"}
                      </button>
                    </div>
                  </div>
                )}

              </motion.div>
            </div>
          )}
        </AnimatePresence>



      </div>
    </>
  );
};

export default Settings;
