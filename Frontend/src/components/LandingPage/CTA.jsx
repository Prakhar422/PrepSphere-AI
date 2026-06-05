import React from "react";
import { ArrowRight, PlayCircle, Users, Trophy, Briefcase, Sparkles } from "lucide-react";
import {useNavigate} from "react-router-dom";
import signup from "../../pages/SignUp";

const CTA = () => {

    const navigate = useNavigate();

  return (
    <>
      <style>{`
        .cta-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.015) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        @keyframes float-particle-1 {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.2; }
          50% { transform: translateY(-15px) translateX(10px); opacity: 0.6; }
        }

        @keyframes float-particle-2 {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
          50% { transform: translateY(-20px) translateX(-15px); opacity: 0.7; }
        }

        @keyframes float-particle-3 {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.15; }
          50% { transform: translateY(-10px) translateX(8px); opacity: 0.5; }
        }

        .cta-particle-1 {
          animation: float-particle-1 6s ease-in-out infinite;
        }

        .cta-particle-2 {
          animation: float-particle-2 8s ease-in-out infinite 1.5s;
        }

        .cta-particle-3 {
          animation: float-particle-3 7s ease-in-out infinite 3s;
        }
      `}</style>

      <section className="relative bg-[#050B1F] py-20 sm:py-28 overflow-hidden font-inter border-b border-white/5">
        {/* Subtle Background Grid */}
        <div className="absolute inset-0 cta-grid-pattern opacity-50 pointer-events-none" />
        
        {/* Soft Ambient glows outside the main card */}
        <div className="absolute top-1/2 left-1/4 w-96 h-96 rounded-full bg-blue-500/5 blur-[120px] pointer-events-none -translate-y-1/2" />
        <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[130px] pointer-events-none -translate-y-1/2" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Main Glassmorphic CTA Wrapper */}
          <div className="relative rounded-3xl border border-white/10 bg-slate-950/45 backdrop-blur-xl p-8 sm:p-14 lg:p-20 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-center group">
            
            {/* Top glowing ambient gradient overlay */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent pointer-events-none" />
            
            {/* Glowing Accent Orbs inside the card */}
            <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-indigo-500/10 blur-[90px] pointer-events-none group-hover:bg-indigo-500/15 transition-all duration-700" />
            <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-purple-500/10 blur-[90px] pointer-events-none group-hover:bg-purple-500/15 transition-all duration-700" />

            {/* Floating particles inside card */}
            <div className="absolute top-1/4 left-1/6 w-1.5 h-1.5 bg-cyan-400 rounded-full blur-[0.5px] cta-particle-1 pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/5 w-2 h-2 bg-indigo-400 rounded-full blur-[1px] cta-particle-2 pointer-events-none" />
            <div className="absolute top-2/3 left-1/3 w-1.5 h-1.5 bg-purple-400 rounded-full blur-[0.5px] cta-particle-3 pointer-events-none" />
            <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-white rounded-full blur-[0.2px] cta-particle-1 pointer-events-none" style={{ animationDelay: '4s' }} />

            <div className="relative z-10 max-w-3xl mx-auto space-y-6">
              
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.15)] mb-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span className="text-xs font-semibold text-indigo-200 tracking-wider uppercase">
                  Start Your Journey
                </span>
              </div>

              {/* Main Heading */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Ready to Secure Your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                  Dream Placement?
                </span>
              </h2>

              {/* Description */}
              <p className="text-sm sm:text-base md:text-lg text-slate-400 font-light leading-relaxed max-w-2xl mx-auto">
                Join thousands of students using PrepSphere AI to improve their resumes, master coding interviews, practice aptitude tests, and land offers from top companies.
              </p>

              {/* Buttons Row */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                
                {/* Primary CTA: Get Started Free */}
                <button
                onClick={() => navigate("/signup")}  
                className="relative group w-full sm:w-auto inline-flex items-center justify-center p-[1px] rounded-full overflow-hidden text-sm sm:text-base font-semibold text-white cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] focus:outline-none">
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 rounded-full" />
                  <span className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full blur opacity-45 group-hover:opacity-85 transition duration-500 group-hover:duration-200" />
                  
                  <span className="relative w-full sm:w-auto px-8 py-3.5 bg-[#050B1F] rounded-full transition-all duration-300 group-hover:bg-transparent flex items-center justify-center gap-2">
                    Get Started
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
                  </span>
                </button>

                {/* Secondary CTA: Watch Demo */}
                <button className="relative group w-full sm:w-auto inline-flex items-center justify-center p-[1px] rounded-full overflow-hidden text-sm sm:text-base font-medium text-slate-200 cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] focus:outline-none">
                  <span className="absolute inset-0 bg-white/10 rounded-full group-hover:bg-white/20 transition-all duration-300" />
                  <span className="relative w-full sm:w-auto px-8 py-3.5 bg-[#050B1F]/60 rounded-full backdrop-blur-md border border-white/5 transition-all duration-300 flex items-center justify-center gap-2">
                    <PlayCircle className="w-5 h-5 text-indigo-400 group-hover:text-white transition-colors duration-300" />
                    Watch Demo
                  </span>
                </button>

              </div>

              {/* Additional Trust Indicators Badges */}
              <div className="flex flex-wrap justify-center gap-3 pt-10 border-t border-white/5 mt-10">
                <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white/[0.02] border border-white/5 backdrop-blur-sm shadow-[0_4px_15px_rgba(0,0,0,0.2)]">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs font-semibold text-white">50K+</span>
                  <span className="text-[10px] text-slate-400 font-light">Students</span>
                </div>
                
                <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white/[0.02] border border-white/5 backdrop-blur-sm shadow-[0_4px_15px_rgba(0,0,0,0.2)]">
                  <Trophy className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-xs font-semibold text-white">95%</span>
                  <span className="text-[10px] text-slate-400 font-light">Success Rate</span>
                </div>

                <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white/[0.02] border border-white/5 backdrop-blur-sm shadow-[0_4px_15px_rgba(0,0,0,0.2)]">
                  <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-xs font-semibold text-white">10K+</span>
                  <span className="text-[10px] text-slate-400 font-light">Experiences</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>
    </>
  );
};

export default CTA;
