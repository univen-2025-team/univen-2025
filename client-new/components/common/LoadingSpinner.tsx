type LoadingSpinnerProps = {
  message?: string;
  className?: string;
};

export default function LoadingSpinner({ 
  message = "Đang tải thông tin...", 
  className = "" 
}: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

