import React from 'react'
import Navbar from '../components/LandingPage/Navbar'
import Hero from '../components/LandingPage/Hero'
import Stats from '../components/LandingPage/Stats'
import Features from '../components/LandingPage/Features'
import DashboardPreview from '../components/LandingPage/DashboardPreview'
import Testimonials from '../components/LandingPage/Testimonials'
import FAQ from '../components/LandingPage/FAQ'
import CTA from '../components/LandingPage/CTA'
import Footer from '../components/LandingPage/Footer'

function LandingPage() {
  return (
    <div className="bg-[#050B1F] min-h-screen text-white">

      <Navbar />

      <main>

        <Hero />
        <Stats />
        <Features />
        <DashboardPreview />
        <Testimonials />
        <FAQ />
        <CTA />

      </main>

      <Footer />  

    </div>
  )
}

export default LandingPage
