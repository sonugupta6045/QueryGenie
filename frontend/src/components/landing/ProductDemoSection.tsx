import { useState } from 'react';
import { Play, Sparkles, Database, Terminal, Shield } from 'lucide-react';
import DemoModal from './DemoModal';

export default function ProductDemoSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section id="demo" className="relative py-20 bg-surface-secondary border-t border-b border-border transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-primary-main mb-3">
            Interactive Product Preview
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
            See QueryGenie in action.
          </p>
          <p className="mt-4 text-text-secondary text-base">
            From natural language question to executable, verified SQL in seconds.
          </p>
        </div>

        {/* Browser Frame Mockup */}
        <div className="relative rounded-2xl border border-slate-700/80 bg-slate-950 shadow-2xl shadow-indigo-950/50 overflow-hidden group">
          {/* Top Window Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>

            <div className="flex items-center gap-2 px-4 py-1 rounded-md bg-slate-950 border border-slate-800 text-xs text-slate-400 font-mono">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>querygenie.app/chat</span>
            </div>

            <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30">
              <Shield className="w-3 h-3" />
              <span className="hidden sm:inline">Read-Only Guard Active</span>
            </div>
          </div>

          {/* Video Demonstration Canvas */}
          <div className="relative aspect-[16/9] w-full bg-slate-950 flex items-center justify-center overflow-hidden">
            <video
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              poster="/assets/demo-poster.jpg"
            >
              <source src="/assets/demo-loop.mp4" type="video/mp4" />
              <source src="/assets/demo-loop.webm" type="video/webm" />
              {/* Fallback mock UI overlay when video file isn't loaded */}
              <div className="p-8 text-center">
                <p className="text-slate-400 text-sm">QueryGenie Live Interface Demo</p>
              </div>
            </video>

            {/* Floating Play Full Video Trigger Overlay */}
            <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-3 px-6 py-3.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/40 hover:scale-105 transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                </div>
                <span>Watch Full Demo</span>
              </button>
            </div>
          </div>

          {/* Bottom Bar Indicator */}
          <div className="px-6 py-3 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Prompt: "Show total sales grouped by region for Q3 2026"</span>
            </div>
            <div className="flex items-center gap-2 text-indigo-300 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Generated SQL in 142ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full Demo Modal */}
      <DemoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
