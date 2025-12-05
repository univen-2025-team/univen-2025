export function PortfolioLoading() {
    return (
        <div className="px-6 py-12 text-center">
            <div
                className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
                style={{ borderColor: 'var(--primary)' }}
            ></div>
            <p style={{ color: 'var(--muted-foreground)' }}>Đang tải danh mục...</p>
        </div>
    );
}
