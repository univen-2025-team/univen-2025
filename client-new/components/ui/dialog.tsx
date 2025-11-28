'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

export interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function Dialog({ open = true, onOpenChange, children }: DialogProps) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            role="dialog"
            aria-modal="true"
        >
            <div
                className="absolute inset-0"
                onClick={() => {
                    onOpenChange?.(false);
                }}
            />
            {children}
        </div>
    );
}

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> { }

export function DialogContent({ className, children, ...props }: DialogContentProps) {
    return (
        <div
            className={cn(
                'relative z-10 w-full max-w-2xl rounded-3xl bg-white shadow-2xl ring-2 ring-white/90 border-2 border-white/90',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> { }

export function DialogHeader({ className, ...props }: DialogHeaderProps) {
    return <div className={cn('p-6 pb-0 space-y-1', className)} {...props} />;
}

export interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> { }

export function DialogTitle({ className, ...props }: DialogTitleProps) {
    return <h3 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />;
}

