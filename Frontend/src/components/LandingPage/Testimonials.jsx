import React from "react";
import { Star, Quote, Award, Sparkles } from "lucide-react";

const Testimonials = () => {
  const testimonialsData = [
    {
      id: 1,
      name: "Rahul Sharma",
      role: "Software Engineer at Amazon",
      initials: "RS",
      avatarGradient: "from-blue-500 to-indigo-600",
      company: "Amazon",
      companyStyle: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      review: "PrepSphere completely transformed my interview preparation. The AI Interview Coach helped me gain confidence and improve my communication skills.",
      rating: 5,
      delay: "0",
    },
    {
      id: 2,
      name: "Priya Gupta",
      role: "SDE at Microsoft",
      initials: "PG",
      avatarGradient: "from-indigo-500 to-purple-600",
      company: "Microsoft",
      companyStyle: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      review: "The Resume Analyzer and Coding Arena were game changers. I improved my ATS score and landed multiple interview calls.",
      rating: 5,
      delay: "100",
    },
    {
      id: 3,
      name: "Arjun Verma",
      role: "Data Analyst at Deloitte",
      initials: "AV",
      avatarGradient: "from-purple-500 to-pink-600",
      company: "Deloitte",
      companyStyle: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      review: "The platform gave me a clear roadmap. The analytics dashboard helped me identify weak areas and improve consistently.",
      rating: 5,
      delay: "200",
    },
  ];

  return (
    <>
      <style>{`
        .testi-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.015) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>

      <section id="experiences" className="relative bg-[#050B1F] py-20 sm:py-28 overflow-hidden font-inter border-b border-white/5">
        {/* Background Grid Overlay */}
        <div className="absolute inset-0 testi-grid-pattern opacity-60 pointer-events-none" />
        
        {/* Soft Ambient Radial Lights */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Section Header */}
          <div className="max-w-3xl mx-auto mb-16 sm:mb-20 space-y-4">
            
            {/* Header Badge */}
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.15)]">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span className="text-xs font-semibold text-indigo-200 tracking-wider uppercase">
                Success Stories
              </span>
            </div>

            {/* Main Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Trusted by{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.3)]">
                Future Achievers
              </span>
            </h2>

            {/* Subheading */}
            <p className="text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
              Thousands of students are using PrepSphere AI to improve resumes, crack interviews, and secure placements at top companies.
            </p>
          </div>

          {/* Testimonial Cards Layout (3-col Desktop, 2-col Tablet, 1-col Mobile) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {testimonialsData.map((testi) => (
              <div
                key={testi.id}
                className="group relative rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md p-6 sm:p-8 flex flex-col justify-between text-left transition-all duration-500 ease-out hover:-translate-y-2 hover:bg-white/[0.04] hover:border-white/20 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]"
                style={{ transitionDelay: `${testi.delay}ms` }}
              >
                {/* Subtle inner radial gradient for texture */}
                <div className="absolute inset-0 bg-radial-gradient from-white/[0.015] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                {/* Floating quote icon background */}
                <div className="absolute top-6 right-6 text-white/5 group-hover:text-indigo-500/10 transition-colors duration-500 pointer-events-none">
                  <Quote className="w-12 h-12 stroke-[1.5]" />
                </div>

                <div>
                  {/* Rating Stars */}
                  <div className="flex items-center space-x-1.5 mb-6">
                    {[...Array(testi.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-sm sm:text-[15px] text-slate-300 font-light leading-relaxed mb-8 relative z-10 italic">
                    "{testi.review}"
                  </p>
                </div>

                {/* Footer Section: Profile & Company Badge */}
                <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-auto">
                  <div className="flex items-center space-x-3.5">
                    
                    {/* Glowing Avatar Initials */}
                    <div className={`flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-br ${testi.avatarGradient} p-[1px] shadow-[0_0_15px_rgba(99,102,241,0.25)] group-hover:scale-105 transition-transform duration-300`}>
                      <div className="flex items-center justify-center w-full h-full rounded-full bg-slate-950">
                        <span className="text-xs font-bold text-white font-mono tracking-wider">
                          {testi.initials}
                        </span>
                      </div>
                    </div>

                    {/* Name & Role */}
                    <div className="text-left">
                      <h4 className="text-sm font-bold text-white tracking-tight group-hover:text-indigo-200 transition-colors duration-300">
                        {testi.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                        {testi.role}
                      </p>
                    </div>

                  </div>

                  {/* Company Badge */}
                  <span className={`text-[10px] font-semibold tracking-wider px-2.5 py-1 rounded-md border ${testi.companyStyle}`}>
                    {testi.company}
                  </span>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  );
};

export default Testimonials;
