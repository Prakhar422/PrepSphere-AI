import React, { useState, useEffect } from "react";
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
  const { user } = useAuth();
  const navigate = useNavigate();

  // Sidebar Layout Responsive Controls
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Success Notification Toast state
  const [successToast, setSuccessToast] = useState("");

  // Appearance preferences state
  const [accentColor, setAccentColor] = useState("purple"); // 'purple' | 'blue' | 'cyan' | 'emerald'
  const [density, setDensity] = useState("comfortable"); // 'comfortable' | 'compact'
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  // Profile data state (defaults to auth context data if available)
  const [name, setName] = useState(user?.name || "Prakhar Sharma");
  const [email, setEmail] = useState(user?.email || "prakhar@prepsphere.ai");
  const [college, setCollege] = useState(user?.college || "BITS Pilani");
  const [degree, setDegree] = useState("Bachelor of Technology");
  const [gradYear, setGradYear] = useState("2027");
  const [branch, setBranch] = useState("Computer Science");
  const [bio, setBio] = useState("DSA enthusiast, solving hard problems on graphs and learning scalable system architectures.");
  const [profilePic, setProfilePic] = useState(""); // empty string represents default avatar

  // Temporary Edit inputs (holds editing state before save)
  const [editName, setEditName] = useState(name);
  const [editCollege, setEditCollege] = useState(college);
  const [editDegree, setEditDegree] = useState(degree);
  const [editGradYear, setEditGradYear] = useState(gradYear);
  const [editBranch, setEditBranch] = useState(branch);
  const [editBio, setEditBio] = useState(bio);

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



  // Trigger Toast Notification
  const triggerToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(""), 3000);
  };

  // Profile save updates
  const handleSaveProfile = (e) => {
    e.preventDefault();
    setName(editName);
    setCollege(editCollege);
    setDegree(editDegree);
    setGradYear(editGradYear);
    setBranch(editBranch);
    setBio(editBio);
    
    // Simulating updates saved in context/store
    if (user) {
      user.name = editName;
      user.college = editCollege;
    }
    triggerToast("Profile changes saved successfully.");
  };

  const handleCancelProfile = () => {
    setEditName(name);
    setEditCollege(college);
    setEditDegree(degree);
    setEditGradYear(gradYear);
    setEditBranch(branch);
    setEditBio(bio);
    triggerToast("Profile edit discarded.");
  };

  // Connected accounts count check
  const connectedCount = [googleConnected, githubConnected, linkedinConnected, leetcodeConnected, gfgConnected, codeforcesConnected].filter(Boolean).length;

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert("Please fill all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setModalType("none");
    triggerToast("Password updated securely.");
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!newEmail) return;
    setEmail(newEmail);
    setNewEmail("");
    setModalType("none");
    triggerToast(`Verification link sent to: ${newEmail}`);
  };

  const handleDeleteHistory = () => {
    setModalType("none");
    triggerToast(`${deleteTarget} history deleted successfully.`);
  };

  const handleDeleteAccount = () => {
    setModalType("none");
    logout();
    navigate("/login");
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
            userName={name}
            userCollege={college}
            profilePic={profilePic}
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
                          {profilePic ? (
                            <img src={profilePic} alt="Avatar" className="w-full h-full rounded-3xl object-cover" />
                          ) : (
                            name.charAt(0).toUpperCase()
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 text-center sm:text-left">
                        <h4 className="text-sm font-bold text-white">Profile Photo</h4>
                        <p className="text-xs text-slate-400 font-light max-w-xs">
                          Upload a professional image. Recommended size 400x400px. JPG or PNG.
                        </p>
                        <div className="flex flex-wrap gap-2.5 justify-center sm:justify-start">
                          <button
                            type="button"
                            onClick={() => {
                              // Simulate Photo Upload
                              setProfilePic("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80");
                              triggerToast("Profile photo uploaded.");
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-white border border-white/10 hover:bg-white/5 ${colorTheme.glowBorder}`}
                          >
                            Edit Photo
                          </button>
                          {profilePic && (
                            <button
                              type="button"
                              onClick={() => {
                                setProfilePic("");
                                triggerToast("Photo removed.");
                              }}
                              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 transition-all cursor-pointer"
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
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500/60"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block font-bold text-slate-400 uppercase tracking-wide">College</label>
                        <input
                          type="text"
                          value={editCollege}
                          onChange={(e) => setEditCollege(e.target.value)}
                          className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500/60"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block font-bold text-slate-400 uppercase tracking-wide">Degree Qualification</label>
                        <input
                          type="text"
                          value={editDegree}
                          onChange={(e) => setEditDegree(e.target.value)}
                          className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500/60"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block font-bold text-slate-400 uppercase tracking-wide">Graduation Year</label>
                        <input
                          type="text"
                          value={editGradYear}
                          onChange={(e) => setEditGradYear(e.target.value)}
                          className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500/60"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="block font-bold text-slate-400 uppercase tracking-wide">Branch</label>
                        <input
                          type="text"
                          value={editBranch}
                          onChange={(e) => setEditBranch(e.target.value)}
                          className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500/60"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="block font-bold text-slate-400 uppercase tracking-wide">Short Bio</label>
                        <textarea
                          value={editBio}
                          onChange={(e) => setEditBio(e.target.value)}
                          className="w-full h-24 bg-slate-950/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500/60 leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* Bottom Save/Cancel Actions */}
                    <div className="pt-4 border-t border-white/5 flex gap-3 justify-end text-xs font-bold">
                      <button
                        type="button"
                        onClick={handleCancelProfile}
                        className="px-5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] text-slate-300 hover:text-white transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className={`px-6 py-2.5 rounded-xl text-white shadow-lg cursor-pointer ${colorTheme.btnBg}`}
                      >
                        Save Changes
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
                              triggerToast(googleConnected ? "Google identity disconnected." : "Google linked successfully.");
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
                              triggerToast(githubConnected ? "GitHub OAuth disconnected." : "GitHub linked successfully.");
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
                        onClick={() => {
                          setDeleteTarget("Resume Analyzer");
                          setModalType("delete-history");
                        }}
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
                        onClick={() => {
                          setDeleteTarget("Aptitude Practice");
                          setModalType("delete-history");
                        }}
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
                        onClick={() => {
                          setDeleteTarget("Mock Interview");
                          setModalType("delete-history");
                        }}
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
                        onClick={() => setModalType("delete-account")}
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
                        onClick={() => setModalType("password")}
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
                        onClick={() => setModalType("email")}
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
                        onClick={() => {
                          logout();
                          navigate("/login");
                        }}
                        className="w-full py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-[10px] font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
                      >
                        Logout Everywhere
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
                        onClick={() => triggerToast("Your data export has started.")}
                        className="p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer"
                        title="Download Data"
                      >
                        <Download className="w-4 h-4" />
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
                        onClick={() => triggerToast("Interview reports exported.")}
                        className="p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer"
                        title="Export Reports"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>

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
                      
                      <button onClick={() => alert("Contact support@prepsphere.ai")} className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer">
                        <span>Contact Support</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </section>

              </div>
            </div>

          </main>
        </div>

        {/* TOAST SUCCESS NOTIFICATION BANNER */}
        <AnimatePresence>
          {successToast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/30 rounded-2xl px-5 py-3 shadow-[0_0_20px_rgba(16,185,129,0.15)] flex items-center space-x-3 text-left"
            >
              <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white">{successToast}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ACCOUNT MODALS OVERLAYS */}
        <AnimatePresence>
          {modalType !== "none" && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setModalType("none")}
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
                          onChange={(e) => setOldPassword(e.target.value)}
                          className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500/60"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block font-bold text-slate-400 uppercase tracking-wide">New Password</label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500/60"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block font-bold text-slate-400 uppercase tracking-wide">Confirm New Password</label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500/60"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-4 justify-end font-bold">
                      <button
                        type="button"
                        onClick={() => setModalType("none")}
                        className="px-5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] text-slate-300 hover:text-white transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className={`px-5 py-2.5 rounded-xl text-white shadow-lg cursor-pointer ${colorTheme.btnBg}`}
                      >
                        Save Password
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
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="e.g. name@company.com"
                          className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500/60 font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-4 justify-end font-bold">
                      <button
                        type="button"
                        onClick={() => setModalType("none")}
                        className="px-5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] text-slate-300 hover:text-white transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className={`px-5 py-2.5 rounded-xl text-white shadow-lg cursor-pointer ${colorTheme.btnBg}`}
                      >
                        Send Verification
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

                    <div className="flex space-x-3 pt-4 justify-end font-bold">
                      <button
                        type="button"
                        onClick={() => setModalType("none")}
                        className="px-5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] text-slate-300 hover:text-white transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteHistory}
                        className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/15 cursor-pointer transition-colors"
                      >
                        Delete History Data
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

                    <div className="flex space-x-3 pt-4 justify-end font-bold">
                      <button
                        type="button"
                        onClick={() => setModalType("none")}
                        className="px-5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] text-slate-300 hover:text-white transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteAccount}
                        className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/25 cursor-pointer transition-colors"
                      >
                        Confirm Account Deletion
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
