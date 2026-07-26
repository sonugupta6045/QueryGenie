import { motion, useReducedMotion, Variants } from 'framer-motion';
import { Table, Code2, Database, ShieldCheck, Cpu, Layers } from 'lucide-react';

export default function FeaturesGrid() {
  const shouldReduceMotion = useReducedMotion();

  const features = [
    {
      icon: Table,
      title: 'Automatic Schema Introspection',
      description:
        'QueryGenie automatically inspects table schemas, foreign key relationships, and column types live from your database instance.',
    },
    {
      icon: Code2,
      title: 'Editable Generated SQL',
      description:
        'Never trust black-box queries. Review the generated SQL code, make manual adjustments if needed, and run with full transparency.',
    },
    {
      icon: Database,
      title: 'Multi-Database Architecture',
      description:
        'Connect PostgreSQL, MySQL, SQL Server, and Oracle databases. Each connection maintains isolated credentials and pools.',
    },
    {
      icon: ShieldCheck,
      title: 'Strict Read-Only Enforcement',
      description:
        'Built-in AST static analysis blocks any non-SELECT queries (DROP, DELETE, UPDATE) alongside strict database-role level restrictions.',
    },
    {
      icon: Cpu,
      title: 'Powered by Gemini AI',
      description:
        'Leverages state-of-the-art Large Language Models fine-tuned for dialect-aware, context-conscious SQL query generation.',
    },
    {
      icon: Layers,
      title: 'Role-Based Access Isolation',
      description:
        'Granular user management with SUPER_ADMIN, DATA_SOURCE_ADMIN, and ANALYST permissions to manage access safely.',
    },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.12,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 25,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  return (
    <section id="features" className="py-24 bg-surface-secondary text-text-primary border-t border-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-primary-main mb-3">
            Enterprise Feature Suite
          </h2>
          <p className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
            Built for security & speed.
          </p>
          <p className="mt-4 text-text-secondary text-base sm:text-lg">
            Everything your team needs to safely democratize data insights across the organization.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                variants={cardVariants}
                className="bg-surface border border-border rounded-2xl p-7 hover:border-primary-main hover:bg-surface-secondary shadow-sm transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-primary-main mb-5 group-hover:scale-110 group-hover:bg-primary-main group-hover:text-white transition-all duration-200">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary mb-2 tracking-tight group-hover:text-primary-main transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
