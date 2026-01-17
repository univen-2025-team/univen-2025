import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Activity, Menu, X } from 'lucide-react';

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-fintech-bg/90 backdrop-blur-md border-b border-fintech-border py-4' : 'bg-transparent py-6'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white">
                        <Activity size={20} />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">TradeTutor</span>
                </div>

                <div className="hidden md:flex items-center gap-8">
                    <a href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Features</a>
                    <a href="#how-it-works" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">How it Works</a>
                    <a href="#pricing" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Pricing</a>
                    <div className="flex items-center gap-4 ml-4">
                        <a href="#" className="text-sm font-medium text-slate-300 hover:text-white">Log in</a>
                        <Button variant="primary" size="sm">Start Learning Free</Button>
                    </div>
                </div>

                <div className="md:hidden">
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-300 hover:text-white">
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-fintech-bg border-b border-fintech-border p-4 md:hidden flex flex-col gap-4">
                    <a href="#features" className="text-slate-300 hover:text-white">Features</a>
                    <a href="#how-it-works" className="text-slate-300 hover:text-white">How it Works</a>
                    <a href="#" className="text-slate-300 hover:text-white">Log in</a>
                    <Button variant="primary" className="w-full">Start Learning Free</Button>
                </div>
            )}
        </nav>
    );
};
