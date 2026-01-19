import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                'file:text-white placeholder:text-gray-500 selection:bg-violet-500 selection:text-white bg-white/5 border-white/10 h-9 w-full min-w-0 rounded-lg border px-3 py-1 text-base text-white shadow-xs transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                'focus-visible:border-violet-500 focus-visible:ring-violet-500/20 focus-visible:ring-[3px]',
                'aria-invalid:ring-red-500/20 aria-invalid:border-red-500',
                className
            )}
            {...props}
        />
    );
}

export { Input };
