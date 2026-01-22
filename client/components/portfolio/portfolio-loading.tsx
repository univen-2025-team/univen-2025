export function PortfolioLoading() {
    return (
        <div className="px-6 py-12 text-center">
            <div
                className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-border border-t-primary"
                role="status"
                aria-label="Đang tải"
            />
            <p className="text-muted-foreground">Đang tải danh mục...</p>
        </div>
    );
}
