'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/utils';

export interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function Dialog({ open = false, onOpenChange, children }: DialogProps) {
    const [mounted, setMounted] = React.useState(false);
    const [isVisible, setIsVisible] = React.useState(false);
    const [isAnimating, setIsAnimating] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    React.useEffect(() => {
        if (open) {
            setIsVisible(true);
            // Trigger animation after mount
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setIsAnimating(true);
                });
            });
        } else {
            setIsAnimating(false);
            // Wait for animation to complete before hiding
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [open]);

    // Prevent body scroll when dialog is open
    React.useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    if (!mounted || !isVisible) return null;

    const dialogContent = (
        <div
            className={cn(
                'fixed inset-0 z-[9999] flex items-center justify-center p-4',
                'transition-opacity duration-200 ease-out',
                isAnimating ? 'opacity-100' : 'opacity-0'
            )}
            role="dialog"
            aria-modal="true"
        >
            {/* Backdrop */}
            <div
                className={cn(
                    'absolute inset-0 bg-black/60 backdrop-blur-sm',
                    'transition-opacity duration-200 ease-out',
                    isAnimating ? 'opacity-100' : 'opacity-0'
                )}
                onClick={() => {
                    onOpenChange?.(false);
                }}
            />
            {/* Content wrapper with animation */}
            <div
                className={cn(
                    'relative z-10 transition-all duration-200 ease-out',
                    isAnimating
                        ? 'opacity-100 scale-100 translate-y-0'
                        : 'opacity-0 scale-95 translate-y-4'
                )}
            >
                {children}
            </div>
        </div>
    );

    return createPortal(dialogContent, document.body);
}

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DialogContent({ className, children, ...props }: DialogContentProps) {
    return (
        <div
            className={cn('w-full max-w-2xl rounded-2xl bg-white shadow-2xl', className)}
            onClick={(e) => e.stopPropagation()}
            {...props}
        >
            {children}
        </div>
    );
}

export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DialogHeader({ className, ...props }: DialogHeaderProps) {
    return <div className={cn('p-6 pb-0 space-y-1', className)} {...props} />;
}

export interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function DialogTitle({ className, ...props }: DialogTitleProps) {
    return (
        <h3
            className={cn('text-lg font-semibold leading-none tracking-tight', className)}
            {...props}
        />
    );
}
