import React, { useState } from "react";
import { Plus, Minus, HelpCircle, Sparkles } from "lucide-react";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqData = [
    {
      id: 1,
      question: "How does the AI Resume Analyzer work?",
      answer: "Simply upload your resume in PDF or Word format. The AI parser runs an instant audit against industry-specific ATS algorithms, reviews keyword density, identifies formatting issues, and returns a detailed dashboard score with clear, actionable recommendations.",
    },
    {
      id: 2,
      question: "Can I practice company-specific interviews?",
      answer: "Yes. PrepSphere AI hosts a rich repository of templates matching key evaluation criteria for top companies (like Google, Amazon, Meta, Deloitte). The AI adaptively asks technical, system design, or behavioral questions based on actual historical placement logs.",
    },
    {
      id: 3,
      question: "Does PrepSphere help with coding interviews?",
      answer: "Absolutely. Our Coding Arena features interactive compilers, a rich library of Data Structures & Algorithms problems, custom test-cases, and automated code analysis to help you optimize time and space complexity.",
    },
    {
      id: 4,
      question: "Can I track my preparation progress?",
      answer: "Yes, the Career Analytics console tracks all your submissions, mock results, and resume adjustments. It provides a real-time 'Placement Readiness Score' out of 100% to let you know when you are fully prepared to apply.",
    },
    {
      id: 5,
      question: "Is PrepSphere suitable for freshers?",
      answer: "Definitely. Whether you are looking for your first engineering internship or preparing for off-campus core developer roles, PrepSphere guides you from fundamental building blocks to advanced professional loops.",
    },
    {
      id: 6,
      question: "Will there be a free plan?",
      answer: "Yes, PrepSphere AI offers a generous free tier that gives you full access to core features, daily mock interview runs, resume audits, and practice arenas. Premium plans unlock deep coaching tools and unlimited custom mocks.",
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <style>{`
        .faq-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.015) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>

      <section id="resources" className="relative bg-[#050B1F] py-20 sm:py-28 overflow-hidden font-inter border-b border-white/5">
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 faq-grid-pattern opacity-60 pointer-events-none" />
        
        {/* Soft Ambient Radial Lights */}
        <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Section Header */}
          <div className="max-w-3xl mx-auto mb-16 sm:mb-20 space-y-4">
            
            {/* Header Badge */}
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.15)]">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span className="text-xs font-semibold text-indigo-200 tracking-wider uppercase">
                Frequently Asked Questions
              </span>
            </div>

            {/* Main Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Everything You{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.3)]">
                Need to Know
              </span>
            </h2>

            {/* Subheading */}
            <p className="text-sm sm:text-base md:text-lg text-slate-400 max-w-xl mx-auto font-light leading-relaxed">
              Get answers to the most common questions about PrepSphere AI and how it helps students prepare for placements.
            </p>
          </div>

          {/* Accordion Layout Container */}
          <div className="max-w-3xl mx-auto w-full space-y-4">
            {faqData.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={item.id}
                  className={`group rounded-2xl border backdrop-blur-md transition-all duration-350 ease-out overflow-hidden ${
                    isOpen 
                      ? "border-indigo-500/35 bg-white/[0.03] shadow-[0_4px_25px_rgba(99,102,241,0.15)]" 
                      : "border-white/10 bg-white/[0.015] hover:border-white/15 hover:bg-white/[0.025] hover:shadow-[0_0_20px_rgba(255,255,255,0.02)]"
                  }`}
                >
                  {/* Accordion Trigger Header */}
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="flex items-center justify-between w-full p-5 text-left focus:outline-none cursor-pointer group/btn"
                  >
                    <div className="flex items-center space-x-3.5 pr-4">
                      {/* Left HelpCircle indicator */}
                      <HelpCircle className={`w-5 h-5 shrink-0 transition-colors duration-300 ${
                        isOpen ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-300"
                      }`} />
                      <span className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug group-hover/btn:text-indigo-200 transition-colors duration-250">
                        {item.question}
                      </span>
                    </div>

                    {/* Right Toggle Icon */}
                    <div className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-white/5 border border-white/5 transition-all duration-300 group-hover/btn:scale-105 ${
                      isOpen ? "border-indigo-500/30 text-indigo-400 bg-indigo-500/10 rotate-180" : "text-slate-400 group-hover:text-white"
                    }`}>
                      {isOpen ? (
                        <Minus className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </div>
                  </button>

                  {/* Accordion Smooth Height Drawer Container */}
                  <div className={`grid transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}>
                    <div className="overflow-hidden">
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-400 font-light leading-relaxed pl-[42px] pr-8">
                        {item.answer}
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </section>
    </>
  );
};

export default FAQ;
