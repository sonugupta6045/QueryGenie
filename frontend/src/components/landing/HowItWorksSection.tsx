import { motion, useReducedMotion, Variants } from 'framer-motion';
import { Plug, MessageSquareCode, CheckCircle2, ArrowRight } from 'lucide-react';

export default function HowItWorksSection() {
  const shouldReduceMotion = useReducedMotion();

  const steps = [
    {
      number: '01',
      title: 'Connect Your Database',
      description:
        'Securely connect your PostgreSQL, MySQL, or SQL Server. QueryGenie safely introspects the schema without copying your actual data.',
      icon: Plug,
      color: 'from-indigo-500 to-blue-500',
    },
    {
      number: '02',
      title: 'Ask in Plain English',
      description:
        'Type your data question naturally—like "Which customers placed more than 5 orders this month?"—no SQL syntax memory required.',
      icon: MessageSquareCode,
      color: 'from-purple-500 to-indigo-500',
    },
    {
      number: '03',
      title: 'Get SQL & Results Instantly',
      description:
        'Review the generated, read-only SQL query, edit if desired, and inspect structured data tables and visualization charts immediately.',
      icon: CheckCircle2,
      color: 'from-emerald-500 to-teal-500',
    },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0.1 : 0.25,
      },
    },
  };

  const stepVariants: Variants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <section id="how-it-works" className="py-24 bg-bg text-text-primary relative overflow-hidden transition-colors duration-300">
      {/* Background Subtle Lines */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-primary-main mb-3">
            Simple 3-Step Workflow
          </h2>
          <p className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
            How QueryGenie Works
          </p>
          <p className="mt-4 text-text-secondary text-base sm:text-lg">
            From raw database connection to business insights in three effortless steps.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
        >
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                variants={stepVariants}
                className="relative bg-surface border border-border rounded-2xl p-8 hover:border-primary-main hover:bg-surface-secondary shadow-sm transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${step.color} p-0.5 shadow-lg`}>
                      <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <span className="text-3xl font-black text-text-secondary group-hover:text-primary-main transition-colors">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-text-primary mb-3 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-slate-700">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
