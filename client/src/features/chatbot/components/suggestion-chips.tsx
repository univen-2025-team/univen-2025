'use client';

import { Button } from '@/components/ui/button';
import { SuggestionMessage } from './types';

type SuggestionChipsProps = {
    suggestions?: string[] | SuggestionMessage[];
    onClick?: (value: string) => void;
};

const DEFAULT_SUGGESTIONS: SuggestionMessage[] = [
    { text: 'Show market news', icon: '📰' },
    { text: 'Buy HPG', icon: '💹' },
    { text: 'Explain P/E ratio', icon: '📊' },
    { text: 'Top gainers today', icon: '📈' }
];

export function SuggestionChips({ suggestions, onClick }: SuggestionChipsProps) {
    // Convert string[] to SuggestionMessage[] nếu cần
    const chips: SuggestionMessage[] = suggestions
        ? suggestions.map((s) => (typeof s === 'string' ? { text: s } : s))
        : DEFAULT_SUGGESTIONS;

    return (
        <div className="mb-3 space-y-2">
            <p className="text-xs text-[#718096] font-medium tracking-wide pl-1">Quick actions:</p>
            <div className="flex flex-wrap gap-2">
                {chips.map((chip, index) => (
                    <Button
                        key={chip.text || index}
                        variant={undefined}
                        size="sm"
                        className="text-xs font-semibold text-[#2D3748] bg-gray-100 hover:bg-[#2D5BDE] hover:text-white border border-gray-200 shadow-sm rounded-xl px-3 py-1.5 transition-all duration-200"
                        onClick={() => onClick?.(chip.text)}
                    >
                        {chip.icon && (
                            <span className="mr-1 text-lg align-middle">{chip.icon}</span>
                        )}
                        {chip.text}
                    </Button>
                ))}
            </div>
        </div>
    );
}
