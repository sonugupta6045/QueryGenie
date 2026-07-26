import { Navigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

import LandingNavbar from '../../components/landing/LandingNavbar';
import HeroSection from '../../components/landing/HeroSection';
import ProductDemoSection from '../../components/landing/ProductDemoSection';
import HowItWorksSection from '../../components/landing/HowItWorksSection';
import FeaturesGrid from '../../components/landing/FeaturesGrid';
import CTASection from '../../components/landing/CTASection';
import Footer from '../../components/landing/Footer';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
}

function AnimatedSection({ children, className = '' }: AnimatedSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  // If already authenticated, redirect straight to /chat without showing marketing content
  if (isAuthenticated) {
    return <Navigate to="/chat" replace />;
  }

  return (
    <div className="min-h-screen bg-bg font-sans text-text-primary selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      <LandingNavbar />
      <main>
        <HeroSection />
        <AnimatedSection>
          <ProductDemoSection />
        </AnimatedSection>
        <AnimatedSection>
          <HowItWorksSection />
        </AnimatedSection>
        <AnimatedSection>
          <FeaturesGrid />
        </AnimatedSection>
        <AnimatedSection>
          <CTASection />
        </AnimatedSection>
      </main>
      <Footer />
    </div>
  );
}
