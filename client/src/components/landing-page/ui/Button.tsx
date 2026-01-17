import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0F19]";

    const variants = {
        primary: "bg-brand-500 hover:bg-brand-400 text-white shadow-lg shadow-brand-500/20 focus:ring-brand-500",
        secondary: "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700",
        outline: "border border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white",
        ghost: "text-slate-400 hover:text-white hover:bg-slate-800/50",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-5 py-2.5 text-base",
        lg: "px-8 py-3.5 text-lg",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
