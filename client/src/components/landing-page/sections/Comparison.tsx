import React from 'react';
import { Check, X } from 'lucide-react';

export const Comparison = () => {
  return (
    <section className="py-24 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 rounded-3xl overflow-hidden border border-slate-800">
            
            {/* The Old Way */}
            <div className="p-8 md:p-12 bg-slate-950/50">
                <h3 className="text-2xl font-bold text-slate-400 mb-8">Most "Gurus" & Courses</h3>
                <ul className="space-y-6">
                    <li className="flex items-start gap-4 text-slate-500">
                        <div className="p-1 rounded bg-rose-500/10 text-rose-500 mt-1"><X size={16} /></div>
                        <div>
                            <span className="block font-medium text-slate-400">Signals & Alerts</span>
                            <span className="text-sm">Telling you what to buy without explaining why.</span>
                        </div>
                    </li>
                    <li className="flex items-start gap-4 text-slate-500">
                        <div className="p-1 rounded bg-rose-500/10 text-rose-500 mt-1"><X size={16} /></div>
                        <div>
                            <span className="block font-medium text-slate-400">Technical Jargon Overload</span>
                            <span className="text-sm">Confusing words like "stochastics" with no context.</span>
                        </div>
                    </li>
                    <li className="flex items-start gap-4 text-slate-500">
                        <div className="p-1 rounded bg-rose-500/10 text-rose-500 mt-1"><X size={16} /></div>
                        <div>
                            <span className="block font-medium text-slate-400">Static PDFs & Videos</span>
                            <span className="text-sm">Passive learning that is easily forgotten.</span>
                        </div>
                    </li>
                </ul>
            </div>

            {/* The TradeTutor Way */}
            <div className="p-8 md:p-12 bg-brand-900/10 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent pointer-events-none" />
                <h3 className="text-2xl font-bold text-white mb-8">The TradeTutor Method</h3>
                <ul className="space-y-6 relative z-10">
                    <li className="flex items-start gap-4 text-slate-200">
                        <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 mt-1"><Check size={16} /></div>
                        <div>
                            <span className="block font-medium text-white">Real Market Data</span>
                            <span className="text-sm text-slate-300">Learn from actual historical events that moved markets.</span>
                        </div>
                    </li>
                    <li className="flex items-start gap-4 text-slate-200">
                        <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 mt-1"><Check size={16} /></div>
                        <div>
                            <span className="block font-medium text-white">AI-Guided Understanding</span>
                            <span className="text-sm text-slate-300">Ask "Why?" at any point and get an instant answer.</span>
                        </div>
                    </li>
                    <li className="flex items-start gap-4 text-slate-200">
                        <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 mt-1"><Check size={16} /></div>
                        <div>
                            <span className="block font-medium text-white">Active Learning</span>
                            <span className="text-sm text-slate-300">Interact with the chart to uncover insights yourself.</span>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
      </div>
    </section>
  );
};
