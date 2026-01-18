import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { CandlestickChart } from '../visuals/CandlestickChart';
import { MOCK_CHART_DATA } from '../constants';
import { MessageSquare, ArrowRight, TrendingUp, ShieldCheck } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-20 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

        {/* Left: Content */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-emerald-400 uppercase tracking-wide">Live Learning Beta</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6">
            Learn trading from <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-indigo-400">
              real market moves
            </span>
          </h1>

          <p className="text-lg text-slate-400 mb-8 leading-relaxed max-w-lg">
            Understand why prices move, not just how. Learn directly from real charts, historical events, and get instant guidance from your personal AI tutor.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <Button size="lg" className="group">
              Start Learning for Free
              <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="secondary" size="lg">
              <MessageSquare size={18} className="mr-2 text-brand-400" />
              Chat with AI Advisor
            </Button>
          </div>

          <div className="flex items-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} />
              <span>Real Market Data</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} />
              <span>No Financial Advice</span>
            </div>
          </div>
        </motion.div>

        {/* Right: Visual */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          {/* Main Chart Card */}
          <div className="relative z-10 bg-slate-900/80 backdrop-blur-xl rounded-2xl p-2 border border-slate-700/50 shadow-2xl">
            <div className="absolute -top-4 -right-4 bg-brand-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-brand-500/30 animate-bounce">
              Live Analysis
            </div>

            <div className="bg-slate-950 rounded-xl p-4 mb-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">TSLA</div>
                <div>
                  <div className="text-sm font-bold text-white">Tesla Inc.</div>
                  <div className="text-xs text-slate-500">NASDAQ</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-emerald-400">+2.4%</div>
                <div className="text-xs text-slate-500">Past hour</div>
              </div>
            </div>

            <CandlestickChart data={MOCK_CHART_DATA} />

            <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <div className="shrink-0 bg-slate-800/50 border border-slate-700 rounded-lg p-3 w-48 hover:border-brand-500/50 transition-colors cursor-pointer">
                <div className="text-xs text-brand-400 mb-1 font-mono">LESSON 1</div>
                <div className="text-sm text-white font-medium">Spotting Breakouts</div>
              </div>
              <div className="shrink-0 bg-slate-800/50 border border-slate-700 rounded-lg p-3 w-48 hover:border-brand-500/50 transition-colors cursor-pointer">
                <div className="text-xs text-indigo-400 mb-1 font-mono">LESSON 2</div>
                <div className="text-sm text-white font-medium">Volume Analysis</div>
              </div>
            </div>
          </div>

          {/* Floating AI Bubble */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-6 -left-6 z-20 max-w-[260px]"
          >
            <div className="bg-white text-slate-900 p-4 rounded-2xl rounded-bl-none shadow-2xl shadow-brand-500/10 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></div>
                <span className="text-xs font-bold text-brand-600 uppercase">AI Tutor</span>
              </div>
              <p className="text-sm font-medium leading-snug">
                Notice the long wick on this candle? It indicates sellers pushed the price down, but buyers stepped back in.
              </p>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};
