type StockErrorStateProps = {
  error: string;
  onRetry: () => Promise<void> | void;
  onBack: () => void;
};

export default function StockErrorState({ error, onRetry, onBack }: StockErrorStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md">
          <strong className="font-bold">Lỗi!</strong>
          <span className="block sm:inline"> {error}</span>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
            <button
              onClick={onRetry}
              className="bg-error text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Thử lại
            </button>
            <button
              onClick={onBack}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              Quay lại thị trường
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

