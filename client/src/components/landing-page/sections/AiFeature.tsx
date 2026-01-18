import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { AI_SUGGESTIONS } from '../constants';

export const AiFeature = () => {
    const [messages, setMessages] = useState([
        { role: 'ai', text: "Hi! I see you're looking at the AAPL breakout in 2023. What would you like to know about this move?" }
    ]);

    const handleSuggestionClick = (text: string) => {
        setMessages(prev => [...prev, { role: 'user', text }]);
        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'ai', text: "Great question! At 11:00, volume spiked 200% above average. This confirms the price jump wasn't just noise—institutions were likely buying heavily." }]);
        }, 1000);
    };

    return (
        <section className="py-24 bg-fintech-card relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left: Text */}
                    <div>
                        <div className="inline-block p-3 rounded-2xl bg-brand-500/10 mb-6">
                            <Bot className="text-brand-400 w-8 h-8" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Your personal AI learning assistant</h2>
                        <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                            Don't just stare at charts. Ask questions. Get explanations in plain English. Our AI analyzes the exact market event you're looking at and breaks it down based on your experience level.
                        </p>

                        <ul className="space-y-4">
                            {[
                                "Ask 'Why did price move?' on any chart",
                                "Get definitions for complex jargon instantly",
                                "News correlation explained simply",
                                "Adjusts depth: 'Explain like I'm 5' mode"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-300">
                                    <div className="w-5 h-5 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400">
                                        <Sparkles size={12} />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Right: Interactive Mock Interface */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-brand-500/5 blur-3xl rounded-full" />

                        <div className="relative bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl h-[500px] flex flex-col">
                            {/* Chat Header */}
                            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-500 flex items-center justify-center shadow-lg">
                                        <Bot size={16} className="text-white" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">MarketMind AI</div>
                                        <div className="text-xs text-brand-400 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                                            Online
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Chat Area */}
                            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                                <AnimatePresence>
                                    {messages.map((msg, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[85%] rounded-2xl p-4 ${msg.role === 'user'
                                                    ? 'bg-brand-600 text-white rounded-tr-none'
                                                    : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                                                }`}>
                                                <p className="text-sm leading-relaxed">{msg.text}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* Suggestions & Input */}
                            <div className="p-4 bg-slate-900 border-t border-slate-800">
                                <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-2">
                                    {AI_SUGGESTIONS.map((sug, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSuggestionClick(sug)}
                                            className="whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:border-brand-500 hover:text-brand-400 transition-colors"
                                        >
                                            {sug}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Ask about this chart..."
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                                    />
                                    <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-brand-500 text-white rounded-lg hover:bg-brand-400 transition-colors">
                                        <Send size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};
