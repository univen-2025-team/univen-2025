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
        <div className="flex gap-2 border-t border-white/10 pt-3 bg-[#18192a]/80 rounded-b-2xl backdrop-blur-md">
            <Input
                placeholder={isLoading ? 'Đang xử lý...' : 'Ask your AI advisor…'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1 text-sm bg-[#23243a]/80 text-white placeholder:text-white/50 border-none focus:ring-2 focus:ring-violet-400/40 rounded-xl shadow-inner"
            />
            <Button
                size="sm"
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="px-3 bg-gradient-to-r from-violet-900 to-fuchsia-900 text-white shadow-md hover:from-violet-700 hover:to-fuchsia-700 border-none"
            >
                <Send className="h-4 w-4" />
            </Button>
        </div>
    );
}
