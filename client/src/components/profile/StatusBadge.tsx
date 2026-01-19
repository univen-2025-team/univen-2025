type StatusBadgeProps = {
    status: string;
    className?: string;
};

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
    const isActive = status === 'ACTIVE';
    const label = isActive ? 'Hoạt động' : 'Không hoạt động';

    return (
        <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
            } ${className}`}
        >
            {label}
        </span>
    );
}
