import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import Hero from '../components/landing/Hero.jsx'
import Services from '../components/landing/Services.jsx'
import Problem from '../components/landing/Problem.jsx'
import Stats from '../components/landing/Stats.jsx'
import Timeline from '../components/landing/Timeline.jsx'
import Tools from '../components/landing/Tools.jsx'
import Contact from '../components/landing/Contact.jsx'

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Problem />
        <Stats />
        <Timeline />
        <Tools />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
