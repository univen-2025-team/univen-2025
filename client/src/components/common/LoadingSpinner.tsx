import { Loader2 } from 'lucide-react';

type LoadingSpinnerProps = {
    message?: string;
    className?: string;
};

export default function LoadingSpinner({
    message = 'Đang tải thông tin...',
    className = ''
}: LoadingSpinnerProps) {
    return (
        <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                {message && <p className="text-gray-400">{message}</p>}
            </div>
        </div>
    );
}
