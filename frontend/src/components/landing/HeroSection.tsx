import { Link } from 'react-router-dom';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, Database, Zap } from 'lucide-react';

export default function HeroSection() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden bg-bg text-text-primary transition-colors duration-300">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto flex flex-col items-center"
        >
          {/* Badge Tag */}
          <motion.div variants={itemVariants} className="mb-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-subtle border border-border text-primary-main text-xs font-semibold tracking-wide shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-primary-main animate-pulse" />
            <span>Next-Generation Natural Language to SQL Engine</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-text-primary"
          >
            Ask your database questions in{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              plain English.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="mt-6 text-lg sm:text-xl text-text-secondary max-w-2xl font-normal leading-relaxed"
          >
            QueryGenie instantly converts your natural language prompts into precise SQL queries and executes them safely against your connected databases.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Link
              to="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] transition-all duration-200 active:scale-95"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-text-primary bg-surface border border-border rounded-xl hover:bg-surface-secondary hover:text-primary-main transition-all duration-150 shadow-sm"
            >
              <span>Sign In</span>
            </Link>
          </motion.div>

          {/* Feature Badges Grid */}
          <motion.div
            variants={itemVariants}
            className="mt-14 pt-10 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl text-left"
          >
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-surface border border-border shadow-sm backdrop-blur-sm">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-primary-main">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-text-primary">Zero SQL Needed</h4>
                <p className="text-xs text-text-secondary">No complex JOINs required</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-surface border border-border shadow-sm backdrop-blur-sm">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-text-primary">Read-Only Safety</h4>
                <p className="text-xs text-text-secondary">Strict SELECT-only protection</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-surface border border-border shadow-sm backdrop-blur-sm">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-text-primary">Multi-Database</h4>
                <p className="text-xs text-text-secondary">PostgreSQL, MySQL & more</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
