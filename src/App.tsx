import { LazyMotion, MotionConfig } from 'framer-motion'
import { Booking } from './components/Booking'
import { Doneness } from './components/Doneness'
import { FindUs } from './components/FindUs'
import { FireStory } from './components/FireStory'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { LateNight } from './components/LateNight'
import { Menu } from './components/Menu'
import { MobileBar } from './components/MobileBar'

// Animation features load after first paint to keep the initial bundle small.
const features = () => import('./lib/motion-features').then((mod) => mod.default)

export function App() {
  return (
    <LazyMotion features={features} strict>
      <MotionConfig reducedMotion="user">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header />
        <main id="main">
          <Hero />
          <FireStory />
          <Menu />
          <Doneness />
          <LateNight />
          <FindUs />
          <Booking />
        </main>
        <Footer />
        <MobileBar />
      </MotionConfig>
    </LazyMotion>
  )
}
