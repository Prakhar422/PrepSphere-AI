import React from "react";
import { 
  FileText, 
  MessageSquare, 
  Brain, 
  Code2, 
  Users, 
  BarChart3, 
  ArrowRight,
  Sparkles
} from "lucide-react";

const Features = () => {
  const featuresData = [
    {
      id: 1,
      title: "AI Resume Analyzer",
      description: "Get instant ATS scores, improvement suggestions, and recruiter-focused feedback to stand out.",
      icon: FileText,
      gradient: "from-blue-500 to-cyan-400",
      glowColor: "hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]",
      delay: "0",
    },
    {
      id: 2,
      title: "AI Interview Coach",
      description: "Practice HR, technical, and behavioral interviews with mock setups and real-time AI feedback.",
      icon: MessageSquare,
      gradient: "from-indigo-500 to-purple-400",
      glowColor: "hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]",
      delay: "100",
    },
    {
      id: 3,
      title: "Aptitude Practice",
      description: "Master quantitative aptitude, logical reasoning, and verbal ability with smart progress trackers.",
      icon: Brain,
      gradient: "from-purple-500 to-pink-400",
      glowColor: "hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]",
      delay: "200",
    },
    {
      id: 4,
      title: "Coding Arena",
      description: "Solve hand-picked coding problems, practice data structures, and prepare for tech tests.",
      icon: Code2,
      gradient: "from-cyan-500 to-blue-400",
      glowColor: "hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]",
      delay: "300",
    },
    {
      id: 5,
      title: "Experience Hub",
      description: "Explore real company-specific interview experiences shared by successful professionals.",
      icon: Users,
      gradient: "from-blue-500 to-indigo-400",
      glowColor: "hover:shadow-[0_0_30px_rgba(37,99,235,0.2)]",
      delay: "400",
    },
    {
      id: 6,
      title: "Career Analytics",
      description: "Deep-dive into your strengths, identify performance gaps, and view overall placement readiness.",
      icon: BarChart3,
      gradient: "from-violet-500 to-fuchsia-400",
      glowColor: "hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]",
      delay: "500",
    },
  ];

  return (
    <>
      <style>{`
        .features-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          background-size: 60px 60px;
        }
      `}</style>

      <section id="features" className="relative bg-[#050B1F] py-20 sm:py-28 overflow-hidden font-inter border-b border-white/5">
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 features-grid-pattern opacity-50 pointer-events-none" />
        
        {/* Background Glowing Lights */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Section Header */}
          <div className="max-w-3xl mx-auto mb-16 sm:mb-20 space-y-4">
            
            {/* Header Badge */}
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.15)]">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span className="text-xs font-semibold text-indigo-200 tracking-wider uppercase">
                Platform Features
              </span>
            </div>

            {/* Main Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Elite Tools for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.3)]">
                Elite Careers
              </span>
            </h2>

            {/* Subheading */}
            <p className="text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
              Everything you need to prepare for placements, internships, coding rounds, aptitude tests, and interviews in one AI-powered platform.
            </p>
          </div>

          {/* Feature Cards Grid (3-col Desktop, 2-col Tablet, 1-col Mobile) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {featuresData.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={feature.id}
                  className={`group relative rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md p-6 sm:p-8 flex flex-col justify-between text-left transition-all duration-500 ease-out hover:-translate-y-2 hover:bg-white/[0.04] hover:border-white/20 ${feature.glowColor}`}
                  style={{ transitionDelay: `${feature.delay}ms` }}
                >
                  {/* Subtle inner radial gradient highlight inside card */}
                  <div className="absolute inset-0 bg-radial-gradient from-white/[0.015] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  <div>
                    {/* Glowing circular/rounded-square Icon Container */}
                    <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} p-[1px] shadow-[0_0_15px_rgba(99,102,241,0.25)] mb-6 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]`}>
                      <div className="flex items-center justify-center w-full h-full rounded-xl bg-[#050B1F]">
                        <IconComponent className="w-5 h-5 text-indigo-300 group-hover:text-white transition-colors duration-300" />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2 tracking-tight group-hover:text-indigo-200 transition-colors duration-300">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-slate-400 font-light leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>

                  {/* Micro-interaction: Action link */}
                  {/* <div className="flex items-center text-xs font-semibold text-indigo-400 mt-6 group-hover:text-indigo-300 transition-colors duration-300 cursor-pointer">
                    <span>Explore tool</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 transform group-hover:translate-x-1.5 transition-transform duration-300" />
                  </div> */}

                  {/* Custom bottom animated gradient line */}
                  <div className={`absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r ${feature.gradient} rounded-b-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center`} />
                </div>
              );
            })}
          </div>

        </div>
      </section>
    </>
  );
};

export default Features;
