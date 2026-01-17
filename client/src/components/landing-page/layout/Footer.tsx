import React from 'react';
import { Activity, Twitter, Github, Linkedin } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="bg-slate-950 border-t border-slate-800 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-200">
                                <Activity size={20} />
                            </div>
                            <span className="text-xl font-bold text-white">TradeTutor</span>
                        </div>
                        <p className="text-slate-400 max-w-sm mb-6">
                            Democratizing financial literacy through AI-powered, interactive learning on real market data.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-slate-500 hover:text-white transition-colors"><Twitter size={20} /></a>
                            <a href="#" className="text-slate-500 hover:text-white transition-colors"><Github size={20} /></a>
                            <a href="#" className="text-slate-500 hover:text-white transition-colors"><Linkedin size={20} /></a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6">Platform</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li><a href="#" className="hover:text-brand-400 transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-brand-400 transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-brand-400 transition-colors">Success Stories</a></li>
                            <li><a href="#" className="hover:text-brand-400 transition-colors">For Educators</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6">Legal</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li><a href="#" className="hover:text-brand-400 transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-brand-400 transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-brand-400 transition-colors">Disclaimer</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-900 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-slate-600">
                        © {new Date().getFullYear()} TradeTutor AI. All rights reserved.
                    </p>
                    <p className="text-xs text-slate-600 max-w-md text-center md:text-right">
                        TradeTutor is an educational platform. We do not provide financial advice, signals, or recommendations to buy or sell securities.
                    </p>
                </div>
            </div>
        </footer>
    );
};
