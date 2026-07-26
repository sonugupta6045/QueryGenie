import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CTASection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="py-24 bg-bg text-text-primary relative overflow-hidden transition-colors duration-300">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-surface border border-border rounded-3xl p-10 sm:p-16 shadow-xl shadow-indigo-500/10 relative overflow-hidden"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-subtle border border-border text-primary-main text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-primary-main" />
            <span>Ready to transform data exploration?</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
            Stop writing queries manually.
          </h2>
          <p className="mt-4 text-text-secondary text-base sm:text-lg max-w-2xl mx-auto">
            Connect your data sources in seconds and start asking questions in plain English.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] transition-all duration-200"
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
          </div>
        </motion.div>
      </div>
    </section>
  );
}
