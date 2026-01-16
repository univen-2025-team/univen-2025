import React from 'react';
import { Search, BarChart2, Zap, BookOpen } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: "Select a Real Scenario",
    desc: "Choose from our library of historical market events (earnings, crashes, rallies)."
  },
  {
    icon: BarChart2,
    title: "Analyze the Data",
    desc: "See the chart unfold candle-by-candle as if it were live."
  },
  {
    icon: Zap,
    title: "Identify the Spark",
    desc: "Our system overlays relevant news and volume data at key moments."
  },
  {
    icon: BookOpen,
    title: "Learn the Lesson",
    desc: "AI summarizes the key takeaway so you can apply it to future trades."
  }
];

export const HowItWorks = () => {
  return (
    <section className="py-24 bg-fintech-bg border-t border-fintech-border" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">How it works</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            We don't use simulations or fake money. We use history. Learn by re-living the most important moments in market history.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-slate-800 via-brand-500/50 to-slate-800" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="relative pt-8 lg:pt-0 group">
                <div className="lg:absolute lg:-top-6 lg:left-1/2 lg:-translate-x-1/2 w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center z-10 group-hover:border-brand-500 group-hover:shadow-[0_0_15px_rgba(14,165,233,0.3)] transition-all duration-300">
                  <step.icon className="text-slate-400 group-hover:text-brand-400 transition-colors" size={24} />
                </div>
                
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl h-full mt-4 lg:mt-12 group-hover:bg-slate-800/50 transition-colors">
                  <div className="text-brand-500 font-mono text-xs mb-2">STEP 0{idx + 1}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
