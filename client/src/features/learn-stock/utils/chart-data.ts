type IntradayPoint = {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
    date?: string;
};

export type CandleDataPoint = {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
};

/**
 * Aggregate intraday (1m) bars into daily OHLC candles.
 * Groups by date; uses first open, last close, max high, min low per day.
 */
export function aggregateIntradayToDaily(history: IntradayPoint[]): CandleDataPoint[] {
    if (!history.length) return [];

    const byDate = new Map<string, IntradayPoint[]>();

    for (const p of history) {
        const date = p.date ?? (p.time && p.time.includes(' ') ? p.time.split(' ')[0] : p.time?.slice(0, 10));
        if (!date) continue;
        if (!byDate.has(date)) byDate.set(date, []);
        byDate.get(date)!.push(p);
    }

    const result: CandleDataPoint[] = [];

    for (const [date, points] of byDate) {
        const sorted = [...points].sort(
            (a, b) => (a.time || '').localeCompare(b.time || '')
        );
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        const highs = sorted.map((x) => x.high);
        const lows = sorted.map((x) => x.low).filter((x) => x > 0);

        result.push({
            time: date,
            open: first.open,
            close: last.close,
            high: Math.max(...highs),
            low: lows.length ? Math.min(...lows) : first.low
        });
    }

    result.sort((a, b) => a.time.localeCompare(b.time));
    return result;
}
