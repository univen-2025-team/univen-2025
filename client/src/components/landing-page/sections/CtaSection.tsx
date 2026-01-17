import React from 'react';
import { Button } from '../../ui/button';

export const CtaSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-brand-900/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-900/40 via-fintech-bg to-fintech-bg" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-8 tracking-tight">
            Understand the market <br/>before trading it.
        </h2>
        <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Join thousands of students mastering price action with the help of AI. No risk, just learning.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto px-8">Start Learning Free</Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">View Demo Lesson</Button>
        </div>
        <p className="mt-6 text-sm text-slate-500">No credit card required • Free tier available</p>
      </div>
    </section>
  );
};
