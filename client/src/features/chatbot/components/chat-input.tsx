'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

type ChatInputProps = {
    onSend: (value: string) => void;
    isLoading?: boolean;
};

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim() || isLoading) return;
        onSend(input);
        setInput('');
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !isLoading) {
            handleSend();
        }
    };

    return (
        <div className="flex gap-2 border-t border-gray-200 pt-3 bg-white">
            <Input
                placeholder={isLoading ? 'Đang xử lý...' : 'Ask your AI advisor…'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1 text-sm bg-gray-100 text-[#2D3748] placeholder:text-[#718096] border border-gray-200 focus:ring-2 focus:ring-[#2D5BDE]/40 focus:border-[#2D5BDE] rounded-xl"
            />
            <Button
                size="sm"
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="px-3 bg-[#2D5BDE] text-white shadow-md hover:bg-[#1E3A8A] border-none"
            >
                <Send className="h-4 w-4" />
            </Button>
        </div>
    );
}
