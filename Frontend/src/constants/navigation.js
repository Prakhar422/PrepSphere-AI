import {
  LayoutDashboard,
  Brain,
  FileSearch,
  MessageSquareCode,
  Code2,
  BookOpen,
  LineChart,
  Settings
} from "lucide-react";

export const sidebarNavigation = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard
  },
  {
    id: "aptitude",
    label: "Aptitude Practice",
    path: "/aptitude-practice",
    icon: Brain
  },
  {
    id: "resume",
    label: "Resume Analyzer",
    path: "/resume-analyzer",
    icon: FileSearch
  },
  {
    id: "mockInterview",
    label: "Mock Interview",
    path: "/mock-interview",
    icon: MessageSquareCode
  },
  {
    id: "codingJourney",
    label: "Coding Journey",
    path: "/coding-journey",
    icon: Code2
  },
  {
    id: "interviewExperiences",
    label: "Interview Experiences",
    path: "/interview-experiences",
    icon: BookOpen
  },
  // {
  //   id: "careerAnalytics",
  //   label: "Career Analytics",
  //   path: "/career-analytics",
  //   icon: LineChart
  // },
  {
    id: "settings",
    label: "Settings",
    path: "/settings",
    icon: Settings
  }
];
