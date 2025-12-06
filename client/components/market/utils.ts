export const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('vi-VN').format(num);
};

export const formatPrice = (price: number): string => {
    // Stock prices in Vietnam are quoted in thousands VND (nghìn đồng)
    // Example: 142.8 means 142,800 VND or 142.8 nghìn đồng
    return formatNumber(price) + ' nghìn đồng';
};

export const formatLargeNumber = (num: number): string => {
    if (num >= 1_000_000_000_000) {
        return (num / 1_000_000_000_000).toFixed(2) + ' T';
    }
    if (num >= 1_000_000_000) {
        return (num / 1_000_000_000).toFixed(2) + ' B';
    }
    if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(2) + ' M';
    }
    return formatNumber(num);
};

export const getChangeColor = (change: number): string => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-yellow-600';
};

export const getChangeBgColor = (change: number): string => {
    if (change > 0) return 'bg-green-50 border-green-200';
    if (change < 0) return 'bg-red-50 border-red-200';
    return 'bg-yellow-50 border-yellow-200';
};
