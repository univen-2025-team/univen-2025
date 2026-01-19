'use client';

import { CheckCircle2 } from 'lucide-react';

type HelpCardWidgetProps = {
    title: string;
    description: string;
    tips?: string[];
};

export function HelpCardWidget({ title, description, tips }: HelpCardWidgetProps) {
    return (
        <div className="rounded-2xl border border-white/10 bg-[#0F111A]/80 backdrop-blur-xl p-3 space-y-2 ring-1 ring-white/5">
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            <p className="text-sm text-slate-300">{description}</p>

            {tips && tips.length > 0 && (
                <ul className="space-y-1 pt-2">
                    {tips.map((tip, index) => (
                        <li key={index} className="flex gap-2 text-xs text-slate-400">
                            <CheckCircle2 className="h-3 w-3 flex-shrink-0 mt-0.5 text-violet-400" />
                            <span>{tip}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
