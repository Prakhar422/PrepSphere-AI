import React from "react";
import { Users, Briefcase, TrendingUp, Cpu } from "lucide-react";

const Stats = () => {
  const statsData = [
    {
      id: 1,
      number: "50K+",
      label: "Active Students",
      icon: Users,
      gradient: "from-blue-500 via-indigo-400 to-cyan-400",
      glowColor: "group-hover:shadow-[0_0_30px_rgba(59,130,246,0.25)]",
      iconBg: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    {
      id: 2,
      number: "10K+",
      label: "Interview Experiences",
      icon: Briefcase,
      gradient: "from-indigo-500 via-purple-400 to-blue-400",
      glowColor: "group-hover:shadow-[0_0_30px_rgba(99,102,241,0.25)]",
      iconBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    },
    {
      id: 3,
      number: "95%",
      label: "Placement Success",
      icon: TrendingUp,
      gradient: "from-purple-500 via-pink-400 to-indigo-400",
      glowColor: "group-hover:shadow-[0_0_30px_rgba(168,85,247,0.25)]",
      iconBg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    },
    {
      id: 4,
      number: "1M+",
      label: "Questions Solved",
      icon: Cpu,
      gradient: "from-pink-500 via-rose-400 to-purple-400",
      glowColor: "group-hover:shadow-[0_0_30px_rgba(244,63,94,0.25)]",
      iconBg: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    },
  ];

  return (
    <>
      <style>{`
        .stats-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>

      <section className="relative bg-[#050B1F] py-16 sm:py-24 border-y border-white/5 overflow-hidden font-inter">
        {/* Subtle Background Effects */}
        <div className="absolute inset-0 stats-grid-pattern opacity-60 pointer-events-none" />
        
        {/* Soft Ambient Glows */}
        <div className="absolute -top-24 left-1/4 w-80 h-80 rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 right-1/4 w-96 h-96 rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Centered Container Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {statsData.map((item) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.id}
                  className={`group relative rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md p-6 sm:p-8 flex flex-col justify-between transition-all duration-550 ease-out hover:-translate-y-2 hover:bg-white/[0.04] hover:border-white/20 ${item.glowColor}`}
                >
                  {/* Subtle inner radial gradient for depth */}
                  <div className="absolute inset-0 bg-radial-gradient from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  {/* Top content row: Icon + accent spark */}
                  <div className="flex items-center justify-between mb-6">
                    {/* Glowing rounded shield for icon */}
                    <div className={`flex items-center justify-center w-10 h-10 rounded-xl border ${item.iconBg} transition-all duration-300 group-hover:scale-110 shadow-inner`}>
                      <IconComponent className="w-5 h-5 transition-transform duration-500 group-hover:rotate-12" />
                    </div>
                    
                    {/* Decorative technical dot indicator */}
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-indigo-400 group-hover:animate-ping transition-all duration-300" />
                  </div>

                  {/* Center content: Large number */}
                  <div className="mb-2">
                    <h3 className={`text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r ${item.gradient} transition-all duration-300 group-hover:scale-[1.02] origin-left drop-shadow-[0_0_15px_rgba(99,102,241,0.15)]`}>
                      {item.number}
                    </h3>
                  </div>

                  {/* Descriptive text */}
                  <div>
                    <p className="text-sm sm:text-base text-slate-400 font-medium group-hover:text-slate-200 transition-colors duration-300">
                      {item.label}
                    </p>
                  </div>

                  {/* Custom bottom animated gradient line */}
                  <div className={`absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r ${item.gradient} rounded-b-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center`} />
                </div>
              );
            })}
          </div>

        </div>
      </section>
    </>
  );
};

export default Stats;
