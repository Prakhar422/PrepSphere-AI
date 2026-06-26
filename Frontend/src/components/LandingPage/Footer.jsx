import React from "react";
import { Linkedin, Github, Twitter, Instagram, Heart, Sparkles } from "lucide-react";

const Footer = () => {
  const productLinks = [
    { label: "Features", href: "#" },
    { label: "Resume Analyzer", href: "#" },
    { label: "AI Interview Coach", href: "#" },
    { label: "Coding Arena", href: "#" },
    { label: "Career Analytics", href: "#" },
  ];

  const resourceLinks = [
    { label: "Interview Experiences", href: "#" },
    { label: "Placement Guides", href: "#" },
    { label: "Blog", href: "#" },
    { label: "FAQs", href: "#" },
    { label: "Documentation", href: "#" },
  ];

  const companyLinks = [
    { label: "About Us", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ];

  const socialLinks = [
    { icon: Linkedin, href: "#", label: "LinkedIn", color: "hover:text-[#0A66C2] hover:shadow-[0_0_20px_rgba(10,102,194,0.45)] hover:border-[#0A66C2]/30" },
    { icon: Github, href: "#", label: "GitHub", color: "hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:border-white/20" },
    { icon: Twitter, href: "#", label: "Twitter", color: "hover:text-[#1DA1F2] hover:shadow-[0_0_20px_rgba(29,161,242,0.45)] hover:border-[#1DA1F2]/30" },
    { icon: Instagram, href: "#", label: "Instagram", color: "hover:text-[#E1306C] hover:shadow-[0_0_20px_rgba(225,48,108,0.45)] hover:border-[#E1306C]/30" }
  ];

  return (
    <>
      {/* Premium custom background grid pattern with very low opacity */}
      <style>{`
        .footer-grid-subtle {
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.007) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.007) 1px, transparent 1px);
          background-size: 60px 60px;
        }
      `}</style>

      <footer className="relative bg-[#050B1F] pt-20 pb-10 overflow-hidden font-inter border-t border-white/5">
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 footer-grid-subtle opacity-70 pointer-events-none" />
        
        {/* Top border glowing highlight */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent pointer-events-none" />
        
        {/* Ambient Purple and Blue Glows */}
        <div className="absolute bottom-0 left-10 w-96 h-96 rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* 4 Balanced columns layout on desktop, 2 on tablet, stacked on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 mb-16">
            
            {/* Column 1: Brand details (occupies 4 spans out of 12 for balance) */}
            <div className="lg:col-span-4 space-y-5">
              
              {/* Brand Logo - Matches Navbar */}
              <div className="flex items-center group cursor-pointer self-start">
                <div className="relative mr-3 flex items-center justify-center w-9 h-9 rounded-full bg-slate-950/80 border border-white/10 overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                  <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" fill="currentColor" className="text-indigo-500 animate-pulse" />
                    <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41M19.07 19.07l-1.41-1.41M6.34 6.34l-1.41-1.41" />
                  </svg>
                </div>
                <span className="text-lg font-bold tracking-tight text-white font-inter">
                  PrepSphere <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">AI</span>
                </span>
              </div>

              {/* Tagline & Short Description */}
              <div className="space-y-3 max-w-sm">
                <p className="text-sm font-semibold text-slate-200">
                  Your AI-powered career preparation platform.
                </p>
                <p className="text-[13px] text-slate-400 font-light leading-relaxed">
                  Helping students prepare smarter through AI-driven interviews, resume analysis, coding practice, aptitude training, and career analytics.
                </p>
              </div>

              {/* Modern Glassmorphic Circular Social Icons */}
              <div className="flex space-x-3 pt-2">
                {socialLinks.map((social, idx) => {
                  const SocialIcon = social.icon;
                  return (
                    <a
                      key={idx}
                      href={social.href}
                      aria-label={social.label}
                      className={`flex items-center justify-center w-9 h-9 rounded-full bg-white/[0.02] border border-white/5 text-slate-400 transition-all duration-300 hover:scale-110 ${social.color}`}
                    >
                      <SocialIcon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>

            </div>

            {/* Column 2: Product (occupies 2 spans out of 12) */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Product</h4>
              <ul className="space-y-3">
                {productLinks.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link.href}
                      className="text-[13px] font-light text-slate-400 hover:text-indigo-400 transition-colors duration-200 hover:pl-0.5"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Resources (occupies 3 spans out of 12) */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Resources</h4>
              <ul className="space-y-3">
                {resourceLinks.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link.href}
                      className="text-[13px] font-light text-slate-400 hover:text-indigo-400 transition-colors duration-200 hover:pl-0.5"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Company (occupies 3 spans out of 12) */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Company</h4>
              <ul className="space-y-3">
                {companyLinks.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link.href}
                      className="text-[13px] font-light text-slate-400 hover:text-indigo-400 transition-colors duration-200 hover:pl-0.5"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Bottom Bar Section */}
          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <div>
              <p>© 2026 PrepSphere AI. All rights reserved.</p>
            </div>
            
            <div className="flex items-center space-x-1.5 font-light">
              
              
              <span>Built for students and future professionals.</span>
            </div>
          </div>

        </div>
      </footer>
    </>
  );
};

export default Footer;
